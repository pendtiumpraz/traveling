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

const createEmployeeSchema = z.object({
  name: z.string().min(2),
  gender: z.enum(["M", "F"]).optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  position: z.string().min(1),
  department: z.string().min(1),
  joinDate: z.string(),
  baseSalary: z.number().min(0),
  branchId: z.string().optional(),
  isTourLeader: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const isTourLeader = searchParams.get("isTourLeader");

    const where = {
      isDeleted: false,
      ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(department && { department }),
      ...(isTourLeader !== null &&
        isTourLeader !== "" && { isTourLeader: isTourLeader === "true" }),
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
        include: {
          branch: { select: { name: true } },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return paginatedResponse(employees, page, pageSize, total);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch employees", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const validation = createEmployeeSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const data = validation.data;
    const tenantId = session.user.tenantId || "default";

    const employee = await prisma.employee.create({
      data: {
        tenantId,
        nip: generateCode("EMP", 6),
        name: data.name,
        gender: data.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        phone: data.phone,
        email: data.email,
        address: data.address,
        position: data.position,
        department: data.department,
        joinDate: new Date(data.joinDate),
        baseSalary: data.baseSalary,
        branchId: data.branchId,
        isTourLeader: data.isTourLeader,
        status: "ACTIVE",
      },
    });

    return successResponse(employee, "Employee created");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to create employee", 500);
  }
}
