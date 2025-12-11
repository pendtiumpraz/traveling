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

const flightSchema = z.object({
  airlineId: z.string().min(1, "Airline is required"),
  flightNumber: z.string().min(1, "Flight number is required"),
  originCity: z.string().min(1, "Origin city is required"),
  originAirport: z.string().min(1, "Origin airport is required"),
  destCity: z.string().min(1, "Destination city is required"),
  destAirport: z.string().min(1, "Destination airport is required"),
  date: z.string().min(1, "Date is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
});

// GET - List flights
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
    const airlineId = searchParams.get("airlineId") || "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = { isDeleted: false };

    if (search) {
      where.OR = [
        { flightNumber: { contains: search, mode: "insensitive" } },
        { originCity: { contains: search, mode: "insensitive" } },
        { destCity: { contains: search, mode: "insensitive" } },
      ];
    }

    if (airlineId) where.airlineId = airlineId;

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom)
        (where.date as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, Date>).lte = new Date(dateTo);
    }

    const [flights, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        include: {
          airline: { select: { id: true, code: true, name: true, logo: true } },
          _count: {
            select: { outboundManifests: true, returnManifests: true },
          },
        },
        orderBy: { date: "asc" },
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.flight.count({ where }),
    ]);

    return paginatedResponse(flights, page, pageSize, total);
  } catch (error) {
    console.error("Get flights error:", error);
    return errorResponse("Failed to fetch flights", 500);
  }
}

// POST - Create flight
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = flightSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const data = validation.data;

    const flight = await prisma.flight.create({
      data: {
        airlineId: data.airlineId,
        flightNumber: data.flightNumber,
        originCity: data.originCity,
        originAirport: data.originAirport,
        destCity: data.destCity,
        destAirport: data.destAirport,
        date: new Date(data.date),
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
      },
      include: {
        airline: { select: { id: true, code: true, name: true } },
      },
    });

    return successResponse(flight, "Flight created successfully");
  } catch (error) {
    console.error("Create flight error:", error);
    return errorResponse("Failed to create flight", 500);
  }
}

// PUT - Update flight
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return errorResponse("Flight ID is required", 400);
    }

    const flight = await prisma.flight.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.date && { date: new Date(updateData.date) }),
      },
      include: {
        airline: { select: { id: true, code: true, name: true } },
      },
    });

    return successResponse(flight, "Flight updated successfully");
  } catch (error) {
    console.error("Update flight error:", error);
    return errorResponse("Failed to update flight", 500);
  }
}

// DELETE - Soft delete flight
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Flight ID is required", 400);
    }

    await prisma.flight.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return successResponse(null, "Flight deleted successfully");
  } catch (error) {
    console.error("Delete flight error:", error);
    return errorResponse("Failed to delete flight", 500);
  }
}
