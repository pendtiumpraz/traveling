import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { z } from "zod";

const addParticipantSchema = z.object({
  customerId: z.string().min(1),
  groupId: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { id: manifestId } = await params;
    const body = await request.json();
    const validation = addParticipantSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const { customerId, groupId } = validation.data;

    // Check if already exists
    const existing = await prisma.manifestParticipant.findFirst({
      where: { manifestId, customerId },
    });
    if (existing) return errorResponse("Customer already in manifest", 409);

    // Get next order number
    const lastParticipant = await prisma.manifestParticipant.findFirst({
      where: { manifestId },
      orderBy: { orderNo: "desc" },
    });

    const participant = await prisma.manifestParticipant.create({
      data: {
        manifestId,
        customerId,
        groupId,
        orderNo: (lastParticipant?.orderNo || 0) + 1,
      },
      include: {
        customer: {
          select: { fullName: true, phone: true, passportNumber: true },
        },
      },
    });

    return successResponse(participant, "Participant added");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to add participant", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { id: manifestId } = await params;
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) return errorResponse("Customer ID required", 400);

    await prisma.manifestParticipant.deleteMany({
      where: { manifestId, customerId },
    });

    return successResponse(null, "Participant removed");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to remove participant", 500);
  }
}
