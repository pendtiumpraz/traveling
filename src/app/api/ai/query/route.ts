import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

const GEMINI_MODEL = "gemini-2.5-flash"; // Stable model
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Get Gemini API key (tenant's key first, then fallback to env)
async function getGeminiApiKey(tenantId?: string): Promise<string | null> {
  // Try to get tenant's API key first
  if (tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { geminiApiKey: true },
    });
    if (tenant?.geminiApiKey) {
      return tenant.geminiApiKey;
    }
  }
  // Fallback to environment variable
  return process.env.GEMINI_API_KEY || null;
}

// Database schema info for AI context
const DATABASE_SCHEMA = `
Available tables and their key fields:
- Customer: id, code, fullName, phone, email, customerType (PROSPECT/CLIENT/VIP/INACTIVE), passportNumber, createdAt
- Booking: id, bookingCode, customerId, packageId, scheduleId, status (PENDING/CONFIRMED/PROCESSING/READY/DEPARTED/COMPLETED/CANCELLED), paymentStatus (UNPAID/PARTIAL/PAID), totalPrice, roomType, pax, createdAt
- Package: id, code, name, type (UMROH/HAJI/OUTBOUND/INBOUND/DOMESTIC/MICE), duration, nights, priceDouble, isActive, isFeatured
- Schedule: id, packageId, departureDate, returnDate, quota, availableQuota, status (OPEN/ALMOST_FULL/FULL/CLOSED)
- Payment: id, paymentCode, bookingId, amount, method (BANK_TRANSFER/VIRTUAL_ACCOUNT/CREDIT_CARD/CASH), status (PENDING/SUCCESS/FAILED)
- Invoice: id, invoiceNo, bookingId, total, balance, dueDate
- Manifest: id, code, scheduleId, name, businessType, departureDate, status, leaderName
- Employee: id, nip, name, position, department, status, isTourLeader, baseSalary
- Agent: id, code, name, tier (REGULAR/SILVER/GOLD/PLATINUM), commissionRate
- Product: id, code, name, category, buyPrice, sellPrice, minStock
- Voucher: id, code, name, type (PERCENTAGE/FIXED_AMOUNT), value, quota, used, startDate, endDate
- Ticket: id, ticketNo, customerId, subject, category, priority, status (OPEN/IN_PROGRESS/RESOLVED/CLOSED)
`;

// Safe where clause builder
function buildWhereClause(params: Record<string, unknown>, tenantFilter: Record<string, unknown>) {
  try {
    const where = { ...tenantFilter };
    if (params.where && typeof params.where === 'object') {
      Object.entries(params.where as Record<string, unknown>).forEach(([key, value]) => {
        // Skip invalid values
        if (value === undefined || value === null) return;
        // Handle date strings
        if (typeof value === 'object' && value !== null) {
          const dateObj = value as Record<string, unknown>;
          if (dateObj.gte && typeof dateObj.gte === 'string') {
            dateObj.gte = new Date(dateObj.gte as string);
          }
          if (dateObj.lte && typeof dateObj.lte === 'string') {
            dateObj.lte = new Date(dateObj.lte as string);
          }
        }
        (where as Record<string, unknown>)[key] = value;
      });
    }
    return where;
  } catch {
    return tenantFilter;
  }
}

// Helper to generate Prisma query from AI response
async function executeQuery(
  queryType: string,
  params: Record<string, unknown>,
) {
  const tenantFilter = { isDeleted: false };
  const safeWhere = buildWhereClause(params, tenantFilter);
  const safeOrderBy = (params.orderBy as Record<string, string>) || { createdAt: "desc" };
  const safeTake = Math.min((params.take as number) || 10, 50); // Max 50 results

  switch (queryType) {
    case "customer_list":
      return prisma.customer.findMany({
        where: safeWhere,
        select: {
          id: true,
          code: true,
          fullName: true,
          phone: true,
          email: true,
          customerType: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
        orderBy: safeOrderBy,
        take: safeTake,
      });

    case "customer_count":
      return prisma.customer.count({ where: safeWhere });

    case "booking_list":
      return prisma.booking.findMany({
        where: safeWhere,
        select: {
          id: true,
          bookingCode: true,
          status: true,
          paymentStatus: true,
          totalPrice: true,
          roomType: true,
          pax: true,
          createdAt: true,
          customer: { select: { fullName: true, phone: true } },
          package: { select: { name: true, type: true } },
          schedule: { select: { departureDate: true } },
        },
        orderBy: safeOrderBy,
        take: safeTake,
      });

    case "booking_count":
      return prisma.booking.count({ where: safeWhere });

    case "booking_stats":
      // Simplified stats - count by status
      const [pending, confirmed, completed, cancelled] = await Promise.all([
        prisma.booking.count({ where: { ...tenantFilter, status: "PENDING" } }),
        prisma.booking.count({ where: { ...tenantFilter, status: "CONFIRMED" } }),
        prisma.booking.count({ where: { ...tenantFilter, status: "COMPLETED" } }),
        prisma.booking.count({ where: { ...tenantFilter, status: "CANCELLED" } }),
      ]);
      return {
        pending,
        confirmed, 
        completed,
        cancelled,
        total: pending + confirmed + completed + cancelled,
      };

    case "revenue_total":
      const revenueResult = await prisma.payment.aggregate({
        where: {
          isDeleted: false,
          status: "SUCCESS",
        },
        _sum: { amountInBase: true },
      });
      return {
        totalRevenue: revenueResult._sum.amountInBase || 0,
      };

    case "package_list":
      return prisma.package.findMany({
        where: { ...safeWhere, isActive: true },
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          duration: true,
          priceDouble: true,
          isFeatured: true,
          _count: { select: { schedules: true, bookings: true } },
        },
        orderBy: safeOrderBy,
        take: safeTake,
      });

    case "schedule_list":
      return prisma.schedule.findMany({
        where: safeWhere,
        select: {
          id: true,
          departureDate: true,
          returnDate: true,
          quota: true,
          availableQuota: true,
          status: true,
          package: { select: { name: true, type: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { departureDate: "asc" },
        take: safeTake,
      });

    case "employee_list":
      return prisma.employee.findMany({
        where: safeWhere,
        select: {
          id: true,
          nip: true,
          name: true,
          position: true,
          department: true,
          status: true,
          isTourLeader: true,
        },
        orderBy: { name: "asc" },
        take: safeTake,
      });

    case "agent_list":
      return prisma.agent.findMany({
        where: safeWhere,
        select: {
          id: true,
          code: true,
          name: true,
          tier: true,
          commissionRate: true,
          phone: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { name: "asc" },
        take: safeTake,
      });

    case "ticket_list":
      return prisma.ticket.findMany({
        where: safeWhere,
        select: {
          id: true,
          ticketNo: true,
          subject: true,
          category: true,
          priority: true,
          status: true,
          createdAt: true,
          customer: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: safeTake,
      });

    case "product_list":
      return prisma.product.findMany({
        where: safeWhere,
        select: {
          id: true,
          code: true,
          name: true,
          category: true,
          buyPrice: true,
          sellPrice: true,
          minStock: true,
        },
        orderBy: { name: "asc" },
        take: safeTake,
      });

    case "summary_dashboard":
      const [totalCustomers, totalBookings, totalRevenue, upcomingSchedules] = await Promise.all([
        prisma.customer.count({ where: tenantFilter }),
        prisma.booking.count({ where: tenantFilter }),
        prisma.payment.aggregate({
          where: { isDeleted: false, status: "SUCCESS" },
          _sum: { amountInBase: true },
        }),
        prisma.schedule.count({
          where: { ...tenantFilter, departureDate: { gte: new Date() } },
        }),
      ]);
      return {
        totalCustomers,
        totalBookings,
        totalRevenue: totalRevenue._sum.amountInBase || 0,
        upcomingSchedules,
      };

    default:
      return { message: `Query type "${queryType}" tidak dikenali. Silakan coba pertanyaan lain.` };
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Check if user has permission (not customer role)
    const userRoles = session.user.roles || [];
    const isCustomerOnly =
      userRoles.length === 1 && userRoles[0] === "customer";
    if (isCustomerOnly) {
      return errorResponse(
        "AI Assistant is not available for customer accounts",
        403,
      );
    }

    // Get API key (tenant's key or fallback to env)
    const geminiApiKey = await getGeminiApiKey(session.user.tenantId);
    if (!geminiApiKey) {
      return errorResponse(
        "AI service not configured. Please set Gemini API Key in Settings > Tenant Settings.",
        500,
      );
    }

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return errorResponse("Message is required", 400);
    }

    // Build conversation context
    const systemPrompt = `You are an AI assistant for a Travel ERP system. You help admin users query and analyze data.

${DATABASE_SCHEMA}

When user asks a question, analyze it and respond with a JSON object containing:
1. "response": A natural language explanation of what you found
2. "queryType": The type of query to execute (one of: customer_list, customer_count, booking_list, booking_count, booking_stats, revenue_total, package_list, schedule_list, employee_list, agent_list, ticket_list, product_list, summary_dashboard)
3. "params": Query parameters object with optional fields:
   - "where": Prisma where conditions
   - "orderBy": Sort order
   - "take": Limit results
   - "groupBy": For aggregation queries

Example responses:
- For "tampilkan customer terbaru": {"response": "Berikut 10 customer terbaru:", "queryType": "customer_list", "params": {"orderBy": {"createdAt": "desc"}, "take": 10}}
- For "berapa total booking bulan ini": {"response": "Menghitung total booking bulan ini...", "queryType": "booking_count", "params": {"where": {"createdAt": {"gte": "2024-12-01"}}}}
- For "list booking yang belum bayar": {"response": "Berikut booking dengan status pembayaran UNPAID:", "queryType": "booking_list", "params": {"where": {"paymentStatus": "UNPAID"}}}

IMPORTANT: 
- Always respond in the same language as the user's question
- Use Indonesian if the user writes in Indonesian
- For date filters, use ISO format (YYYY-MM-DD)
- Always include queryType and params in your JSON response
- If the question cannot be answered with a database query, set queryType to null and just provide a helpful response`;

    // Build messages for Gemini
    const messages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I will analyze queries and respond with JSON containing the query type and parameters needed to fetch data from the Travel ERP database. I will respond in the same language as the user.",
          },
        ],
      },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    // Call Gemini API
    const geminiResponse = await fetch(
      `${GEMINI_API_URL}?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text();
      console.error("Gemini API error:", error);
      return errorResponse("AI service error", 500);
    }

    const geminiData = await geminiResponse.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Try to parse AI response as JSON
    let aiResponse: {
      response: string;
      queryType: string | null;
      params: Record<string, unknown>;
    };
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        aiResponse = { response: aiText, queryType: null, params: {} };
      }
    } catch {
      aiResponse = { response: aiText, queryType: null, params: {} };
    }

    // Execute query if queryType is provided
    let queryResult = null;
    if (aiResponse.queryType) {
      try {
        queryResult = await executeQuery(
          aiResponse.queryType,
          aiResponse.params || {},
        );
      } catch (queryError) {
        console.error("Query execution error:", queryError);
        aiResponse.response +=
          "\n\n(Error executing query. Please try rephrasing your question.)";
      }
    }

    return successResponse({
      message: aiResponse.response,
      data: queryResult,
      queryType: aiResponse.queryType,
      params: aiResponse.params,
    });
  } catch (error) {
    console.error("AI Query error:", error);
    return errorResponse("Failed to process AI query", 500);
  }
}
