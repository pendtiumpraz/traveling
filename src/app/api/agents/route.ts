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

const createAgentSchema = z.object({
  name: z.string().min(2),
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  tier: z.enum(["REGULAR", "SILVER", "GOLD", "PLATINUM"]).default("REGULAR"),
  commissionRate: z.number().min(0).max(100),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const tier = searchParams.get("tier") || "";

    const where = {
      isDeleted: false,
      ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { companyName: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(tier && { tier: tier as "REGULAR" | "SILVER" | "GOLD" | "PLATINUM" }),
    };

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
        include: {
          _count: { select: { bookings: true, commissions: true } },
        },
      }),
      prisma.agent.count({ where }),
    ]);

    return paginatedResponse(agents, page, pageSize, total);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch agents", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const validation = createAgentSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const data = validation.data;
    const tenantId = session.user.tenantId || "default";

    const agent = await prisma.agent.create({
      data: {
        tenantId,
        code: generateCode("AGT", 6),
        name: data.name,
        companyName: data.companyName,
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
        tier: data.tier,
        commissionRate: data.commissionRate,
        isActive: true,
      },
    });

    return successResponse(agent, "Agent created");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to create agent", 500);
  }
}
