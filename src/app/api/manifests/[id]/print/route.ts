import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface ManifestData {
  id: string;
  code: string;
  name: string;
  status: string;
  businessType: string;
  departureDate: Date;
  returnDate: Date;
  leaderName: string | null;
  localGuideName: string | null;
  notes: string | null;
  schedule: {
    package: {
      name: unknown;
      type: string;
      duration: number;
    };
  } | null;
  participants: Array<{
    orderNo: number;
    customer: {
      fullName: string;
      idNumber: string | null;
      passportNumber: string | null;
      birthPlace: string | null;
      birthDate: Date | null;
      gender: string | null;
      phone: string;
      address: string | null;
      city: string | null;
    };
  }>;
}

// GET - Print manifest as HTML
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
    })) as ManifestData | null;

    if (!manifest) {
      return NextResponse.json(
        { success: false, error: "Manifest not found" },
        { status: 404 },
      );
    }

    const formatDate = (date: Date | null) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const formatShortDate = (date: Date | null) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("id-ID");
    };

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manifest ${manifest.code}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
    .header h1 { font-size: 18px; margin-bottom: 5px; }
    .header h2 { font-size: 14px; font-weight: normal; color: #666; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .info-box { width: 48%; }
    .info-box h3 { font-size: 12px; background: #f0f0f0; padding: 5px; margin-bottom: 8px; }
    .info-row { display: flex; margin-bottom: 4px; }
    .info-label { width: 120px; font-weight: bold; }
    .info-value { flex: 1; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
    th { background: #333; color: white; font-size: 11px; }
    td { font-size: 11px; }
    tr:nth-child(even) { background: #f9f9f9; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .badge-draft { background: #fef3c7; color: #92400e; }
    .badge-confirmed { background: #d1fae5; color: #065f46; }
    .badge-departed { background: #dbeafe; color: #1e40af; }
    .badge-completed { background: #e0e7ff; color: #3730a3; }
    .summary { margin-bottom: 20px; padding: 10px; background: #f8f8f8; border-radius: 5px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MANIFEST JAMAAH</h1>
    <h2>${String(manifest.schedule?.package.name || manifest.name)}</h2>
    <p style="margin-top: 5px;">
      <span class="badge badge-${manifest.status.toLowerCase()}">${manifest.status}</span>
    </p>
  </div>

  <div class="info-section">
    <div class="info-box">
      <h3>INFORMASI MANIFEST</h3>
      <div class="info-row">
        <span class="info-label">Kode Manifest</span>
        <span class="info-value">: ${manifest.code}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Jenis</span>
        <span class="info-value">: ${manifest.businessType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Durasi</span>
        <span class="info-value">: ${manifest.schedule?.package.duration || "-"} Hari</span>
      </div>
    </div>
    <div class="info-box">
      <h3>JADWAL PERJALANAN</h3>
      <div class="info-row">
        <span class="info-label">Keberangkatan</span>
        <span class="info-value">: ${formatDate(manifest.departureDate)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Kepulangan</span>
        <span class="info-value">: ${formatDate(manifest.returnDate)}</span>
      </div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-box">
      <h3>PETUGAS</h3>
      <div class="info-row">
        <span class="info-label">Tour Leader</span>
        <span class="info-value">: ${manifest.leaderName || "-"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Local Guide</span>
        <span class="info-value">: ${manifest.localGuideName || "-"}</span>
      </div>
    </div>
    <div class="info-box">
      <h3>RINGKASAN</h3>
      <div class="info-row">
        <span class="info-label">Total Jamaah</span>
        <span class="info-value">: ${manifest.participants.length} orang</span>
      </div>
      <div class="info-row">
        <span class="info-label">Laki-laki</span>
        <span class="info-value">: ${manifest.participants.filter((p) => p.customer.gender === "M").length} orang</span>
      </div>
      <div class="info-row">
        <span class="info-label">Perempuan</span>
        <span class="info-value">: ${manifest.participants.filter((p) => p.customer.gender === "F").length} orang</span>
      </div>
    </div>
  </div>

  <h3 style="margin-bottom: 10px; font-size: 13px;">DAFTAR JAMAAH</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 30px;">No</th>
        <th>Nama Lengkap</th>
        <th>NIK</th>
        <th>No. Paspor</th>
        <th>TTL</th>
        <th>L/P</th>
        <th>No. HP</th>
        <th>Alamat</th>
      </tr>
    </thead>
    <tbody>
      ${manifest.participants
        .map(
          (p, i) => `
        <tr>
          <td style="text-align: center;">${i + 1}</td>
          <td><strong>${p.customer.fullName}</strong></td>
          <td>${p.customer.idNumber || "-"}</td>
          <td>${p.customer.passportNumber || "-"}</td>
          <td>${p.customer.birthPlace || "-"}, ${formatShortDate(p.customer.birthDate)}</td>
          <td style="text-align: center;">${p.customer.gender === "M" ? "L" : p.customer.gender === "F" ? "P" : "-"}</td>
          <td>${p.customer.phone}</td>
          <td>${p.customer.address || "-"}${p.customer.city ? ", " + p.customer.city : ""}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  ${
    manifest.notes
      ? `
  <div style="margin-top: 20px;">
    <h3 style="font-size: 12px; margin-bottom: 5px;">CATATAN</h3>
    <p style="padding: 10px; background: #fff3cd; border-radius: 5px;">${manifest.notes}</p>
  </div>
  `
      : ""
  }

  <div class="footer">
    <p>Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
    <p style="margin-top: 5px;">Dokumen ini digenerate secara otomatis oleh Travel ERP System</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Print manifest error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate print view" },
      { status: 500 },
    );
  }
}
