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

const roomingSchema = z.object({
  manifestId: z.string().min(1, "Manifest is required"),
  hotelId: z.string().min(1, "Hotel is required"),
  customerId: z.string().min(1, "Customer is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  roomType: z.enum(["QUAD", "TRIPLE", "DOUBLE", "TWIN", "SINGLE"]),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
});

// GET - List rooming
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const manifestId = searchParams.get("manifestId") || "";
    const hotelId = searchParams.get("hotelId") || "";

    const where: Record<string, unknown> = {};

    if (manifestId) where.manifestId = manifestId;
    if (hotelId) where.hotelId = hotelId;

    const [roomings, total] = await Promise.all([
      prisma.rooming.findMany({
        where,
        include: {
          manifest: {
            select: { id: true, code: true, name: true },
          },
          hotel: {
            select: {
              id: true,
              name: true,
              stars: true,
              city: { select: { name: true } },
            },
          },
          customer: {
            select: {
              id: true,
              code: true,
              fullName: true,
              phone: true,
              gender: true,
            },
          },
        },
        orderBy: [{ roomNumber: "asc" }],
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.rooming.count({ where }),
    ]);

    // Group by room number for display
    interface GroupedRoom {
      hotelId: string;
      hotelName: string;
      hotelStars: number;
      roomNumber: string;
      roomType: string;
      checkIn: Date | null;
      checkOut: Date | null;
      guests: Array<{
        id: string;
        customerId: string;
        customerCode: string;
        customerName: string;
        phone: string;
        gender: string | null;
      }>;
    }

    const groupedByRoom = roomings.reduce(
      (acc, room) => {
        const key = `${room.hotelId}-${room.roomNumber}`;
        if (!acc[key]) {
          acc[key] = {
            hotelId: room.hotelId,
            hotelName: room.hotel.name,
            hotelStars: room.hotel.stars,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            checkIn: room.checkIn,
            checkOut: room.checkOut,
            guests: [],
          };
        }
        acc[key].guests.push({
          id: room.id,
          customerId: room.customer.id,
          customerCode: room.customer.code,
          customerName: room.customer.fullName,
          phone: room.customer.phone,
          gender: room.customer.gender,
        });
        return acc;
      },
      {} as Record<string, GroupedRoom>,
    );

    return successResponse({
      data: {
        list: roomings,
        grouped: Object.values(groupedByRoom),
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get rooming error:", error);
    return errorResponse("Failed to fetch rooming list", 500);
  }
}

// POST - Create rooming assignment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = roomingSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const data = validation.data;

    // Check if customer already has rooming in this manifest
    const existing = await prisma.rooming.findFirst({
      where: {
        manifestId: data.manifestId,
        customerId: data.customerId,
      },
    });

    if (existing) {
      return errorResponse(
        "Customer already assigned to a room in this manifest",
        400,
      );
    }

    const rooming = await prisma.rooming.create({
      data: {
        manifestId: data.manifestId,
        hotelId: data.hotelId,
        customerId: data.customerId,
        roomNumber: data.roomNumber,
        roomType: data.roomType,
        checkIn: data.checkIn ? new Date(data.checkIn) : null,
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
      },
      include: {
        hotel: { select: { name: true } },
        customer: { select: { fullName: true } },
      },
    });

    return successResponse(rooming, "Room assigned successfully");
  } catch (error) {
    console.error("Create rooming error:", error);
    return errorResponse("Failed to assign room", 500);
  }
}

// PUT - Update rooming
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return errorResponse("Rooming ID is required", 400);
    }

    const rooming = await prisma.rooming.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.checkIn && { checkIn: new Date(updateData.checkIn) }),
        ...(updateData.checkOut && { checkOut: new Date(updateData.checkOut) }),
      },
      include: {
        hotel: { select: { name: true } },
        customer: { select: { fullName: true } },
      },
    });

    return successResponse(rooming, "Rooming updated successfully");
  } catch (error) {
    console.error("Update rooming error:", error);
    return errorResponse("Failed to update rooming", 500);
  }
}

// DELETE - Remove rooming assignment
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Rooming ID is required", 400);
    }

    await prisma.rooming.delete({
      where: { id },
    });

    return successResponse(null, "Room assignment removed successfully");
  } catch (error) {
    console.error("Delete rooming error:", error);
    return errorResponse("Failed to remove room assignment", 500);
  }
}

// POST - Auto-assign rooms
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { manifestId, hotelId, startRoomNumber } = body;

    if (!manifestId || !hotelId) {
      return errorResponse("Manifest ID and Hotel ID are required", 400);
    }

    // Get participants not yet assigned to rooms
    const participants = await prisma.manifestParticipant.findMany({
      where: {
        manifestId,
        customer: {
          roomings: {
            none: { manifestId },
          },
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            gender: true,
            roomPreference: true,
          },
        },
      },
      orderBy: { orderNo: "asc" },
    });

    if (participants.length === 0) {
      return successResponse([], "All participants already assigned to rooms");
    }

    // Simple auto-assignment logic (can be enhanced)
    let currentRoomNumber = startRoomNumber || 101;
    const assignments = [];

    for (const participant of participants) {
      assignments.push({
        manifestId,
        hotelId,
        customerId: participant.customer.id,
        roomNumber: String(currentRoomNumber),
        roomType: "DOUBLE" as const,
      });
      currentRoomNumber++;
    }

    // Create all assignments
    await prisma.rooming.createMany({
      data: assignments,
    });

    return successResponse(
      { assignedCount: assignments.length },
      `${assignments.length} rooms auto-assigned successfully`,
    );
  } catch (error) {
    console.error("Auto-assign rooming error:", error);
    return errorResponse("Failed to auto-assign rooms", 500);
  }
}
