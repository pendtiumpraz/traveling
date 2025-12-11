import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Get customer by userId with emergency contacts
    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id, isDeleted: false },
      include: {
        emergencyContacts: { take: 1 },
      },
    });

    if (!customer) {
      return successResponse(null, "Profile not found");
    }

    const emergencyContact = customer.emergencyContacts[0];

    // Map customer data to profile format
    const profile = {
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      address: customer.address,
      city: customer.city,
      province: customer.province,
      postalCode: customer.postalCode,
      birthDate: customer.birthDate?.toISOString().split("T")[0],
      birthPlace: customer.birthPlace,
      gender: customer.gender,
      bloodType: customer.bloodType,
      passportNumber: customer.passportNumber,
      passportExpiry: customer.passportExpiry?.toISOString().split("T")[0],
      passportIssuePlace: customer.passportIssuePlace,
      emergencyName: emergencyContact?.name,
      emergencyPhone: emergencyContact?.phone,
      emergencyRelation: emergencyContact?.relationship,
    };

    return successResponse(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse("Failed to fetch profile", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();

    // Get customer
    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id, isDeleted: false },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    // Update customer
    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        fullName: body.fullName,
        phone: body.phone,
        whatsapp: body.whatsapp,
        address: body.address,
        city: body.city,
        province: body.province,
        postalCode: body.postalCode,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        birthPlace: body.birthPlace,
        gender: body.gender,
        bloodType: body.bloodType,
        passportNumber: body.passportNumber,
        passportExpiry: body.passportExpiry
          ? new Date(body.passportExpiry)
          : undefined,
        passportIssuePlace: body.passportIssuePlace,
        updatedAt: new Date(),
      },
    });

    // Update or create emergency contact
    if (body.emergencyName || body.emergencyPhone) {
      await prisma.emergencyContact.upsert({
        where: { id: customer.id }, // This will fail if no id, triggering create
        create: {
          customerId: customer.id,
          name: body.emergencyName || "",
          phone: body.emergencyPhone || "",
          relationship: body.emergencyRelation,
        },
        update: {
          name: body.emergencyName,
          phone: body.emergencyPhone,
          relationship: body.emergencyRelation,
        },
      });
    }

    // Also update user name if changed
    if (body.fullName) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: body.fullName },
      });
    }

    return successResponse(updated, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    return errorResponse("Failed to update profile", 500);
  }
}
