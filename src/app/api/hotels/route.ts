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

const createHotelSchema = z.object({
  cityId: z.string().min(1),
  name: z.string().min(2),
  stars: z.number().min(1).max(5),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  distanceToCenter: z.string().optional(),
  distanceToMasjid: z.string().optional(),
  facilities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const cityId = searchParams.get("cityId") || "";

    const where = {
      isDeleted: false,
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(cityId && { cityId }),
    };

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
        include: { city: { select: { name: true } } },
      }),
      prisma.hotel.count({ where }),
    ]);

    return paginatedResponse(hotels, page, pageSize, total);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch hotels", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const validation = createHotelSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const data = validation.data;

    const hotel = await prisma.hotel.create({
      data: {
        cityId: data.cityId,
        name: data.name,
        stars: data.stars,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        distanceToCenter: data.distanceToCenter,
        distanceToMasjid: data.distanceToMasjid,
        facilities: data.facilities,
        images: data.images,
        isActive: true,
      },
    });

    return successResponse(hotel, "Hotel created");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to create hotel", 500);
  }
}
