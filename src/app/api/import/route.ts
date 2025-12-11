import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import * as XLSX from "xlsx";

// Supported models for import
const IMPORT_MODELS = [
  "customer",
  "product",
  "hotel",
  "airline",
  "bank",
  "supplier",
  "employee",
  "agent",
] as const;

type ImportModel = (typeof IMPORT_MODELS)[number];

// POST - Import data from Excel/CSV
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const model = formData.get("model") as string;

    if (!file) {
      return errorResponse("File is required", 400);
    }

    if (!model || !IMPORT_MODELS.includes(model as ImportModel)) {
      return errorResponse(
        `Model '${model}' is not supported for import. Supported: ${IMPORT_MODELS.join(", ")}`,
        400,
      );
    }

    const tenantId =
      (session.user as { tenantId?: string }).tenantId || "default";

    // Read file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return errorResponse("File is empty or invalid format", 400);
    }

    // Import data based on model
    const result = await importData(
      model as ImportModel,
      data as Record<string, unknown>[],
      tenantId,
    );

    return successResponse(
      {
        importedCount: result.success,
        failedCount: result.failed,
        errors: result.errors.slice(0, 10), // Return first 10 errors
        model,
      },
      `Imported ${result.success} ${model}(s), ${result.failed} failed`,
    );
  } catch (error) {
    console.error("Import error:", error);
    return errorResponse("Failed to import data", 500);
  }
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

async function importData(
  model: ImportModel,
  data: Record<string, unknown>[],
  tenantId: string,
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, failed: 0, errors: [] };

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2; // Excel rows start from 1, plus header

    try {
      switch (model) {
        case "customer":
          await importCustomer(row, tenantId);
          break;
        case "product":
          await importProduct(row, tenantId);
          break;
        case "hotel":
          await importHotel(row);
          break;
        case "airline":
          await importAirline(row);
          break;
        case "bank":
          await importBank(row, tenantId);
          break;
        case "supplier":
          await importSupplier(row, tenantId);
          break;
        case "employee":
          await importEmployee(row, tenantId);
          break;
        case "agent":
          await importAgent(row, tenantId);
          break;
      }
      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        row: rowNum,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return result;
}

// Import functions for each model
async function importCustomer(row: Record<string, unknown>, tenantId: string) {
  const code = String(
    row.code || `CUST-${Date.now().toString(36).toUpperCase()}`,
  );

  await prisma.customer.upsert({
    where: { tenantId_code: { tenantId, code } },
    update: {
      fullName: String(row.fullName || row.full_name || ""),
      phone: String(row.phone || ""),
      email: row.email ? String(row.email) : null,
      address: row.address ? String(row.address) : null,
      city: row.city ? String(row.city) : null,
      province: row.province ? String(row.province) : null,
      birthPlace:
        row.birthPlace || row.birth_place
          ? String(row.birthPlace || row.birth_place)
          : null,
      birthDate:
        row.birthDate || row.birth_date
          ? new Date(String(row.birthDate || row.birth_date))
          : null,
      gender: row.gender === "M" || row.gender === "F" ? row.gender : null,
      passportNumber:
        row.passportNumber || row.passport_number
          ? String(row.passportNumber || row.passport_number)
          : null,
      passportExpiry:
        row.passportExpiry || row.passport_expiry
          ? new Date(String(row.passportExpiry || row.passport_expiry))
          : null,
      occupation: row.occupation ? String(row.occupation) : null,
    },
    create: {
      tenantId,
      code,
      fullName: String(row.fullName || row.full_name || "Unknown"),
      phone: String(row.phone || ""),
      email: row.email ? String(row.email) : null,
      address: row.address ? String(row.address) : null,
      city: row.city ? String(row.city) : null,
      province: row.province ? String(row.province) : null,
      birthPlace:
        row.birthPlace || row.birth_place
          ? String(row.birthPlace || row.birth_place)
          : null,
      birthDate:
        row.birthDate || row.birth_date
          ? new Date(String(row.birthDate || row.birth_date))
          : null,
      gender: row.gender === "M" || row.gender === "F" ? row.gender : null,
      nationality: String(row.nationality || "ID"),
      passportNumber:
        row.passportNumber || row.passport_number
          ? String(row.passportNumber || row.passport_number)
          : null,
      passportExpiry:
        row.passportExpiry || row.passport_expiry
          ? new Date(String(row.passportExpiry || row.passport_expiry))
          : null,
      occupation: row.occupation ? String(row.occupation) : null,
      customerType: "PROSPECT",
    },
  });
}

async function importProduct(row: Record<string, unknown>, tenantId: string) {
  const code = String(
    row.code || `PRD-${Date.now().toString(36).toUpperCase()}`,
  );

  await prisma.product.upsert({
    where: { tenantId_code: { tenantId, code } },
    update: {
      name: String(row.name || ""),
      category: String(row.category || "General"),
      description: row.description ? String(row.description) : null,
      unit: String(row.unit || "pcs"),
      buyPrice: Number(row.buyPrice || row.buy_price || 0),
      sellPrice:
        row.sellPrice || row.sell_price
          ? Number(row.sellPrice || row.sell_price)
          : null,
      minStock: Number(row.minStock || row.min_stock || 0),
    },
    create: {
      tenantId,
      code,
      name: String(row.name || "Unknown Product"),
      category: String(row.category || "General"),
      description: row.description ? String(row.description) : null,
      unit: String(row.unit || "pcs"),
      buyPrice: Number(row.buyPrice || row.buy_price || 0),
      sellPrice:
        row.sellPrice || row.sell_price
          ? Number(row.sellPrice || row.sell_price)
          : null,
      minStock: Number(row.minStock || row.min_stock || 0),
      isActive: true,
    },
  });
}

async function importHotel(row: Record<string, unknown>) {
  // Find city by name
  const cityName = String(row.city || row.cityName || "");
  const city = await prisma.city.findFirst({
    where: {
      OR: [
        { name: { path: ["en"], equals: cityName } },
        { name: { path: ["id"], equals: cityName } },
      ],
    },
  });

  if (!city) {
    throw new Error(`City '${cityName}' not found`);
  }

  await prisma.hotel.create({
    data: {
      cityId: city.id,
      name: String(row.name || "Unknown Hotel"),
      stars: Number(row.stars || 3),
      address: row.address ? String(row.address) : null,
      distanceToMasjid:
        row.distanceToMasjid || row.distance_to_masjid
          ? String(row.distanceToMasjid || row.distance_to_masjid)
          : null,
      facilities: row.facilities
        ? String(row.facilities)
            .split(",")
            .map((f) => f.trim())
        : undefined,
      isActive: true,
    },
  });
}

async function importAirline(row: Record<string, unknown>) {
  const code = String(row.code || "").toUpperCase();
  if (!code) throw new Error("Airline code is required");

  await prisma.airline.upsert({
    where: { code },
    update: {
      name: String(row.name || ""),
      logo: row.logo ? String(row.logo) : null,
    },
    create: {
      code,
      name: String(row.name || "Unknown Airline"),
      logo: row.logo ? String(row.logo) : null,
      isActive: true,
    },
  });
}

async function importBank(row: Record<string, unknown>, tenantId: string) {
  const code = String(row.code || "").toUpperCase();
  if (!code) throw new Error("Bank code is required");

  await prisma.bank.upsert({
    where: { tenantId_code: { tenantId, code } },
    update: {
      name: String(row.name || ""),
      accountNo: String(row.accountNo || row.account_no || ""),
      accountName: String(row.accountName || row.account_name || ""),
    },
    create: {
      tenantId,
      code,
      name: String(row.name || "Unknown Bank"),
      accountNo: String(row.accountNo || row.account_no || ""),
      accountName: String(row.accountName || row.account_name || ""),
      isVA: row.isVA === true || row.is_va === "true",
      vaPrefix:
        row.vaPrefix || row.va_prefix
          ? String(row.vaPrefix || row.va_prefix)
          : null,
      isActive: true,
    },
  });
}

async function importSupplier(row: Record<string, unknown>, tenantId: string) {
  const code = String(
    row.code || `SUP-${Date.now().toString(36).toUpperCase()}`,
  );

  await prisma.supplier.upsert({
    where: { tenantId_code: { tenantId, code } },
    update: {
      name: String(row.name || ""),
      category: row.category ? String(row.category) : null,
      address: row.address ? String(row.address) : null,
      city: row.city ? String(row.city) : null,
      phone: row.phone ? String(row.phone) : null,
      email: row.email ? String(row.email) : null,
      picName:
        row.picName || row.pic_name
          ? String(row.picName || row.pic_name)
          : null,
      picPhone:
        row.picPhone || row.pic_phone
          ? String(row.picPhone || row.pic_phone)
          : null,
    },
    create: {
      tenantId,
      code,
      name: String(row.name || "Unknown Supplier"),
      category: row.category ? String(row.category) : null,
      address: row.address ? String(row.address) : null,
      city: row.city ? String(row.city) : null,
      phone: row.phone ? String(row.phone) : null,
      email: row.email ? String(row.email) : null,
      picName:
        row.picName || row.pic_name
          ? String(row.picName || row.pic_name)
          : null,
      picPhone:
        row.picPhone || row.pic_phone
          ? String(row.picPhone || row.pic_phone)
          : null,
      isActive: true,
    },
  });
}

async function importEmployee(row: Record<string, unknown>, tenantId: string) {
  const nip = String(
    row.nip ||
      row.employeeId ||
      row.employee_id ||
      `EMP-${Date.now().toString(36).toUpperCase()}`,
  );

  await prisma.employee.upsert({
    where: { tenantId_nip: { tenantId, nip } },
    update: {
      name: String(row.name || ""),
      phone: row.phone ? String(row.phone) : null,
      email: row.email ? String(row.email) : null,
      position: String(row.position || "Staff"),
      department: String(row.department || "General"),
      baseSalary: Number(row.baseSalary || row.base_salary || 0),
    },
    create: {
      tenantId,
      nip,
      name: String(row.name || "Unknown Employee"),
      phone: row.phone ? String(row.phone) : null,
      email: row.email ? String(row.email) : null,
      address: row.address ? String(row.address) : null,
      position: String(row.position || "Staff"),
      department: String(row.department || "General"),
      joinDate:
        row.joinDate || row.join_date
          ? new Date(String(row.joinDate || row.join_date))
          : new Date(),
      baseSalary: Number(row.baseSalary || row.base_salary || 0),
      status: "ACTIVE",
      isTourLeader: row.isTourLeader === true || row.is_tour_leader === "true",
    },
  });
}

async function importAgent(row: Record<string, unknown>, tenantId: string) {
  const code = String(
    row.code || `AGT-${Date.now().toString(36).toUpperCase()}`,
  );

  await prisma.agent.upsert({
    where: { tenantId_code: { tenantId, code } },
    update: {
      name: String(row.name || ""),
      companyName:
        row.companyName || row.company_name
          ? String(row.companyName || row.company_name)
          : null,
      phone: String(row.phone || ""),
      email: row.email ? String(row.email) : null,
      address: row.address ? String(row.address) : null,
      city: row.city ? String(row.city) : null,
      commissionRate: Number(row.commissionRate || row.commission_rate || 5),
    },
    create: {
      tenantId,
      code,
      name: String(row.name || "Unknown Agent"),
      companyName:
        row.companyName || row.company_name
          ? String(row.companyName || row.company_name)
          : null,
      phone: String(row.phone || ""),
      email: row.email ? String(row.email) : null,
      address: row.address ? String(row.address) : null,
      city: row.city ? String(row.city) : null,
      tier: "REGULAR",
      commissionRate: Number(row.commissionRate || row.commission_rate || 5),
      isActive: true,
    },
  });
}
