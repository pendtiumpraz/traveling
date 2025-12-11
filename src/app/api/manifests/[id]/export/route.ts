import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";

interface ManifestWithRelations {
  id: string;
  code: string;
  name: string;
  status: string;
  departureDate: Date;
  returnDate: Date;
  leaderName: string | null;
  localGuideName: string | null;
  schedule: {
    package: {
      name: unknown;
      type: string;
    };
  } | null;
  participants: Array<{
    customer: {
      fullName: string;
      idNumber: string | null;
      passportNumber: string | null;
      birthPlace: string | null;
      birthDate: Date | null;
      gender: string | null;
      phone: string;
      email: string | null;
      address: string | null;
      city: string | null;
      passportExpiry: Date | null;
      passportIssuePlace: string | null;
      passportIssueDate: Date | null;
    };
  }>;
}

// GET - Export manifest to Excel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Get manifest with schedule and package
    const manifest = (await prisma.manifest.findUnique({
      where: { id, isDeleted: false },
      include: {
        schedule: {
          include: {
            package: true,
          },
        },
        participants: {
          include: {
            customer: true,
          },
          orderBy: { orderNo: "asc" },
        },
      },
    })) as ManifestWithRelations | null;

    if (!manifest) {
      return NextResponse.json(
        { success: false, error: "Manifest not found" },
        { status: 404 },
      );
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Manifest Info
    const manifestInfo = [
      ["MANIFEST JAMAAH"],
      [],
      ["Kode Manifest", manifest.code],
      ["Nama", manifest.name],
      ["Status", manifest.status],
      [],
      ["INFORMASI PAKET"],
      ["Paket", String(manifest.schedule?.package.name || "-")],
      ["Jenis", manifest.schedule?.package.type || "-"],
      [
        "Tanggal Berangkat",
        manifest.departureDate
          ? new Date(manifest.departureDate).toLocaleDateString("id-ID")
          : "-",
      ],
      [
        "Tanggal Pulang",
        manifest.returnDate
          ? new Date(manifest.returnDate).toLocaleDateString("id-ID")
          : "-",
      ],
      [],
      ["PETUGAS"],
      ["Tour Leader", manifest.leaderName || "-"],
      ["Local Guide", manifest.localGuideName || "-"],
      [],
      ["TOTAL JAMAAH", manifest.participants.length],
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(manifestInfo);
    ws1["!cols"] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Info Manifest");

    // Sheet 2: Daftar Jamaah
    const participantHeaders = [
      "No",
      "Nama Lengkap",
      "NIK",
      "No. Paspor",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Jenis Kelamin",
      "No. HP",
      "Email",
      "Alamat",
      "Kota",
    ];

    const participantData = manifest.participants.map((p, index) => [
      index + 1,
      p.customer.fullName,
      p.customer.idNumber || "-",
      p.customer.passportNumber || "-",
      p.customer.birthPlace || "-",
      p.customer.birthDate
        ? new Date(p.customer.birthDate).toLocaleDateString("id-ID")
        : "-",
      p.customer.gender || "-",
      p.customer.phone || "-",
      p.customer.email || "-",
      p.customer.address || "-",
      p.customer.city || "-",
    ]);

    const ws2 = XLSX.utils.aoa_to_sheet([
      participantHeaders,
      ...participantData,
    ]);
    ws2["!cols"] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 25 },
      { wch: 40 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, "Daftar Jamaah");

    // Sheet 3: Data Paspor
    const passportHeaders = [
      "No",
      "Nama",
      "No. Paspor",
      "Tempat Issue",
      "Tanggal Issue",
      "Tanggal Expired",
      "Status",
    ];

    const passportData = manifest.participants.map((p, index) => {
      const expDate = p.customer.passportExpiry
        ? new Date(p.customer.passportExpiry)
        : null;
      const isExpiringSoon =
        expDate &&
        expDate < new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
      const isExpired = expDate && expDate < new Date();

      return [
        index + 1,
        p.customer.fullName,
        p.customer.passportNumber || "-",
        p.customer.passportIssuePlace || "-",
        p.customer.passportIssueDate
          ? new Date(p.customer.passportIssueDate).toLocaleDateString("id-ID")
          : "-",
        expDate ? expDate.toLocaleDateString("id-ID") : "-",
        isExpired ? "EXPIRED" : isExpiringSoon ? "SEGERA EXPIRED" : "AKTIF",
      ];
    });

    const ws3 = XLSX.utils.aoa_to_sheet([passportHeaders, ...passportData]);
    ws3["!cols"] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws3, "Data Paspor");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    // Return as downloadable file
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Manifest_${manifest.code}_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export manifest error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export manifest" },
      { status: 500 },
    );
  }
}
