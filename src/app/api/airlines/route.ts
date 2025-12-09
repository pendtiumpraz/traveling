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

const createAirlineSchema = z.object({
  code: z.string().min(2).max(3),
  name: z.string().min(2),
  logo: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");

    const where = { isDeleted: false };

    const [airlines, total] = await Promise.all([
      prisma.airline.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
      }),
      prisma.airline.count({ where }),
    ]);

    return paginatedResponse(airlines, page, pageSize, total);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch airlines", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const validation = createAirlineSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const data = validation.data;

    const existing = await prisma.airline.findFirst({
      where: { code: data.code.toUpperCase(), isDeleted: false },
    });
    if (existing) return errorResponse("Airline code already exists", 409);

    const airline = await prisma.airline.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        logo: data.logo,
        isActive: true,
      },
    });

    return successResponse(airline, "Airline created");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to create airline", 500);
  }
}
