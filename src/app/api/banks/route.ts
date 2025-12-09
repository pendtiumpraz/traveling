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

const createBankSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  accountNo: z.string().min(5),
  accountName: z.string().min(2),
  logo: z.string().optional(),
  isVA: z.boolean().default(false),
  vaPrefix: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");

    const where = {
      isDeleted: false,
      ...(session.user.tenantId && {
        OR: [{ tenantId: session.user.tenantId }, { tenantId: null }],
      }),
    };

    const [banks, total] = await Promise.all([
      prisma.bank.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
      }),
      prisma.bank.count({ where }),
    ]);

    return paginatedResponse(banks, page, pageSize, total);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch banks", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const validation = createBankSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const data = validation.data;
    const tenantId = session.user.tenantId || null;

    const bank = await prisma.bank.create({
      data: {
        tenantId,
        code: data.code.toUpperCase(),
        name: data.name,
        accountNo: data.accountNo,
        accountName: data.accountName,
        logo: data.logo,
        isVA: data.isVA,
        vaPrefix: data.vaPrefix,
        isActive: true,
      },
    });

    return successResponse(bank, "Bank created");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to create bank", 500);
  }
}
