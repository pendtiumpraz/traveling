import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";

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

// Helper to generate Prisma query from AI response
async function executeQuery(
  queryType: string,
  params: Record<string, unknown>,
) {
  const tenantFilter = { isDeleted: false };

  switch (queryType) {
    case "customer_list":
      return prisma.customer.findMany({
        where: {
          ...tenantFilter,
          ...(params.where as Record<string, unknown>),
        },
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
        orderBy: (params.orderBy as Record<string, string>) || {
          createdAt: "desc",
        },
        take: (params.take as number) || 10,
      });

    case "customer_count":
      return prisma.customer.count({
        where: {
          ...tenantFilter,
          ...(params.where as Record<string, unknown>),
        },
      });

    case "booking_list":
      return prisma.booking.findMany({
        where: {
          ...tenantFilter,
          ...(params.where as Record<string, unknown>),
        },
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
        orderBy: (params.orderBy as Record<string, string>) || {
          createdAt: "desc",
        },
        take: (params.take as number) || 10,
      });

    case "booking_count":
      return prisma.booking.count({
        where: {
          ...tenantFilter,
          ...(params.where as Record<string, unknown>),
        },
      });

    case "booking_stats":
      const groupByField = (params.groupBy as string) || "status";
      const bookingStats = await prisma.booking.groupBy({
        by: [groupByField] as ["status"] | ["businessType"] | ["paymentStatus"],
        where: {
          ...tenantFilter,
          ...(params.where as Record<string, unknown>),
        },
        _count: true,
        _sum: { totalPrice: true },
      });
      return bookingStats;

    case "revenue_total":
      return prisma.payment.aggregate({
        where: {
          isDeleted: false,
          status: "SUCCESS",
          ...(params.where as Record<string, unknown>),
        },
        _sum: { amountInBase: true },
      });

    case "package_list":
      return prisma.package.findMany({
        where: {
          ...tenantFilter,
          isActive: true,
          ...(params.where as Record<string, unknown>),
        },
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
        orderBy: (params.orderBy as Record<string, string>) || {
          createdAt: "desc",
        },
        take: (params.take as number) || 10,
      });

    case "schedule_list":
      return prisma.schedule.findMany({
        where: {
          ...tenantFilter,
          ...(params.where as Record<string, unknown>),
        },
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
        orderBy: (params.orderBy as Record<string, string>) || {
          departureDate: "asc",
        },
        take: (params.take as number) || 10,
      });

    case "employee_list":
      return prisma.employee.findMany({
        where: {
          ...tenantFilter,
          ...(params.where as Record<string, unknown>),
        },
        select: {
          id: true,
          nip: true,
          name: true,
          position: true,
          department: true,
          status: true,
          isTourLeader: true,
          baseSalary: true,
        },
        orderBy: (params.orderBy as Record<string, string>) || { name: "asc" },
        take: (params.take as number) || 10,
      });

    case "agent_list":
      return prisma.agent.findMany({
        where: {
          ...tenantFilter,
          ...(params.where as Record<string, unknown>),
        },
        select: {
          id: true,
          code: true,
          name: true,
          tier: true,
          commissionRate: true,
          phone: true,
          _count: { select: { bookings: true } },
        },
        orderBy: (params.orderBy as Record<string, string>) || { name: "asc" },
        take: (params.take as number) || 10,
      });

    case "ticket_list":
      return prisma.ticket.findMany({
        where: {
          ...tenantFilter,
          ...(params.where as Record<string, unknown>),
        },
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
        orderBy: (params.orderBy as Record<string, string>) || {
          createdAt: "desc",
        },
        take: (params.take as number) || 10,
      });

    case "product_list":
      return prisma.product.findMany({
        where: {
          ...tenantFilter,
          ...(params.where as Record<string, unknown>),
        },
        select: {
          id: true,
          code: true,
          name: true,
          category: true,
          buyPrice: true,
          sellPrice: true,
          minStock: true,
          stocks: { select: { quantity: true } },
        },
        orderBy: (params.orderBy as Record<string, string>) || { name: "asc" },
        take: (params.take as number) || 10,
      });

    case "summary_dashboard":
      const [customers, bookings, revenue, schedules] = await Promise.all([
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
        customers,
        bookings,
        revenue: revenue._sum.amountInBase,
        upcomingSchedules: schedules,
      };

    default:
      throw new Error(`Unknown query type: ${queryType}`);
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

    if (!GEMINI_API_KEY) {
      return errorResponse(
        "AI service not configured. Please set GEMINI_API_KEY.",
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
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
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
