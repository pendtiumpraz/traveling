import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { z } from "zod";
import { generateCode } from "@/lib/utils";

const createCustomerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  passportName: z.string().optional(),
  phone: z.string().min(8, "Phone must be at least 8 characters"),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  gender: z.enum(["M", "F"]).optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  nationality: z.string().default("ID"),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  customerType: z
    .enum(["PROSPECT", "CLIENT", "VIP", "INACTIVE"])
    .default("PROSPECT"),
  source: z
    .enum([
      "WEBSITE",
      "REFERRAL",
      "AGENT",
      "SOCIAL_MEDIA",
      "WALK_IN",
      "PHONE",
      "EVENT",
      "CORPORATE",
      "OTHER",
    ])
    .optional(),
  companyName: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const customerType = searchParams.get("customerType") || "";
    const source = searchParams.get("source") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where = {
      isDeleted: false,
      ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" as const } },
          { passportNumber: { contains: search } },
          { code: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(customerType && {
        customerType: customerType as
          | "PROSPECT"
          | "CLIENT"
          | "VIP"
          | "INACTIVE",
      }),
      ...(source && {
        source: source as
          | "WEBSITE"
          | "REFERRAL"
          | "AGENT"
          | "SOCIAL_MEDIA"
          | "WALK_IN"
          | "PHONE"
          | "EVENT"
          | "CORPORATE"
          | "OTHER",
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return paginatedResponse(customers, page, pageSize, total);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return errorResponse("Failed to fetch customers", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = createCustomerSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 422);
    }

    const data = validation.data;
    const tenantId = session.user.tenantId || "default";

    // Check for duplicate phone
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        tenantId,
        phone: data.phone,
        isDeleted: false,
      },
    });

    if (existingCustomer) {
      return errorResponse(
        "Customer with this phone number already exists",
        409,
      );
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId,
        code: generateCode("CUST", 8),
        fullName: data.fullName,
        passportName: data.passportName,
        phone: data.phone,
        email: data.email || null,
        whatsapp: data.whatsapp,
        gender: data.gender,
        birthPlace: data.birthPlace,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        idNumber: data.idNumber,
        address: data.address,
        city: data.city,
        province: data.province,
        nationality: data.nationality,
        passportNumber: data.passportNumber,
        passportExpiry: data.passportExpiry
          ? new Date(data.passportExpiry)
          : null,
        customerType: data.customerType,
        source: data.source,
        companyName: data.companyName,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "customer",
        entityId: customer.id,
        newValue: customer,
      },
    });

    return successResponse(customer, "Customer created successfully");
  } catch (error) {
    console.error("Error creating customer:", error);
    return errorResponse("Failed to create customer", 500);
  }
}
