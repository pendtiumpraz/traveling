import { NextRequest } from "next/server";
import { prisma, softDelete } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { z } from "zod";

const updateCustomerSchema = z.object({
  fullName: z.string().min(2).optional(),
  passportName: z.string().optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  gender: z.enum(["M", "F"]).optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  customerType: z.enum(["PROSPECT", "CLIENT", "VIP", "INACTIVE"]).optional(),
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
  fatherName: z.string().optional(),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .optional(),
  occupation: z.string().optional(),
  bloodType: z.enum(["A", "B", "AB", "O"]).optional(),
  shirtSize: z.string().optional(),
  dietaryRequirements: z.array(z.string()).optional(),
  specialNeeds: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
      include: {
        documents: {
          where: { isDeleted: false },
        },
        emergencyContacts: true,
        family: true,
        bookings: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            package: {
              select: { name: true, type: true },
            },
            schedule: {
              select: { departureDate: true, returnDate: true },
            },
          },
        },
        visaApplications: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            bookings: true,
            documents: true,
          },
        },
      },
    });

    if (!customer) {
      return notFoundResponse("Customer");
    }

    return successResponse(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return errorResponse("Failed to fetch customer", 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateCustomerSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 422);
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
    });

    if (!existingCustomer) {
      return notFoundResponse("Customer");
    }

    const data = validation.data;

    // Check for duplicate phone if phone is being updated
    if (data.phone && data.phone !== existingCustomer.phone) {
      const duplicatePhone = await prisma.customer.findFirst({
        where: {
          tenantId: existingCustomer.tenantId,
          phone: data.phone,
          isDeleted: false,
          id: { not: id },
        },
      });

      if (duplicatePhone) {
        return errorResponse(
          "Customer with this phone number already exists",
          409,
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        passportExpiry: data.passportExpiry
          ? new Date(data.passportExpiry)
          : undefined,
        dietaryRequirements: data.dietaryRequirements,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: existingCustomer.tenantId,
        userId: session.user.id,
        action: "UPDATE",
        entity: "customer",
        entityId: customer.id,
        oldValue: existingCustomer,
        newValue: customer,
      },
    });

    return successResponse(customer, "Customer updated successfully");
  } catch (error) {
    console.error("Error updating customer:", error);
    return errorResponse("Failed to update customer", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
    });

    if (!existingCustomer) {
      return notFoundResponse("Customer");
    }

    // Soft delete
    await softDelete(prisma.customer, id, session.user.id);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: existingCustomer.tenantId,
        userId: session.user.id,
        action: "DELETE",
        entity: "customer",
        entityId: id,
        oldValue: existingCustomer,
      },
    });

    return successResponse(null, "Customer deleted successfully");
  } catch (error) {
    console.error("Error deleting customer:", error);
    return errorResponse("Failed to delete customer", 500);
  }
}
