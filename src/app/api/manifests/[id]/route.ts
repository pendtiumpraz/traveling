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

const updateManifestSchema = z.object({
  name: z.string().min(2).optional(),
  status: z
    .enum([
      "DRAFT",
      "CONFIRMED",
      "DEPARTED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  leaderId: z.string().optional(),
  leaderName: z.string().optional(),
  localGuideId: z.string().optional(),
  localGuideName: z.string().optional(),
  outboundFlightId: z.string().optional(),
  returnFlightId: z.string().optional(),
  notes: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { id } = await params;

    const manifest = await prisma.manifest.findFirst({
      where: { id, isDeleted: false },
      include: {
        schedule: {
          include: {
            package: {
              select: { id: true, name: true, type: true, duration: true },
            },
          },
        },
        participants: {
          include: {
            customer: {
              select: {
                id: true,
                code: true,
                fullName: true,
                phone: true,
                passportNumber: true,
                gender: true,
              },
            },
            group: true,
          },
          orderBy: { orderNo: "asc" },
        },
        rooming: {
          include: {
            hotel: { select: { name: true, stars: true } },
            customer: { select: { fullName: true } },
          },
        },
        groups: true,
        outboundFlight: { include: { airline: true } },
        returnFlight: { include: { airline: true } },
        _count: { select: { participants: true, attendance: true } },
      },
    });

    if (!manifest) return notFoundResponse("Manifest");
    return successResponse(manifest);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch manifest", 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const validation = updateManifestSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const existing = await prisma.manifest.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) return notFoundResponse("Manifest");

    const manifest = await prisma.manifest.update({
      where: { id },
      data: validation.data,
    });

    return successResponse(manifest, "Manifest updated");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to update manifest", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { id } = await params;
    const existing = await prisma.manifest.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) return notFoundResponse("Manifest");

    await softDelete(prisma.manifest, id, session.user.id);
    return successResponse(null, "Manifest deleted");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to delete manifest", 500);
  }
}
