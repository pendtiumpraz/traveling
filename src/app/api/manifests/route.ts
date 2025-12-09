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

const createManifestSchema = z.object({
  scheduleId: z.string().min(1),
  name: z.string().min(2),
  leaderId: z.string().optional(),
  leaderName: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const scheduleId = searchParams.get("scheduleId") || "";
    const status = searchParams.get("status") || "";

    const where = {
      isDeleted: false,
      ...(scheduleId && { scheduleId }),
      ...(status && {
        status: status as
          | "DRAFT"
          | "CONFIRMED"
          | "DEPARTED"
          | "IN_PROGRESS"
          | "COMPLETED"
          | "CANCELLED",
      }),
    };

    const [manifests, total] = await Promise.all([
      prisma.manifest.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { departureDate: "desc" },
        include: {
          schedule: {
            include: {
              package: { select: { name: true, type: true } },
            },
          },
          _count: { select: { participants: true, rooming: true } },
        },
      }),
      prisma.manifest.count({ where }),
    ]);

    return paginatedResponse(manifests, page, pageSize, total);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch manifests", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const validation = createManifestSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const data = validation.data;

    const schedule = await prisma.schedule.findFirst({
      where: { id: data.scheduleId, isDeleted: false },
      include: { package: { select: { type: true, tenantId: true } } },
    });

    if (!schedule) return errorResponse("Schedule not found", 404);

    const manifest = await prisma.manifest.create({
      data: {
        code: generateCode("MNF", 6),
        scheduleId: data.scheduleId,
        name: data.name,
        businessType: schedule.package.type,
        departureDate: schedule.departureDate,
        returnDate: schedule.returnDate,
        leaderId: data.leaderId,
        leaderName: data.leaderName,
        status: "DRAFT",
        notes: data.notes,
      },
      include: {
        schedule: { include: { package: { select: { name: true } } } },
      },
    });

    return successResponse(manifest, "Manifest created");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to create manifest", 500);
  }
}
