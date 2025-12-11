import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Template definitions for each model
const TEMPLATES: Record<
  string,
  { headers: string[]; sampleData: Record<string, unknown>[] }
> = {
  customer: {
    headers: [
      "code",
      "fullName",
      "phone",
      "email",
      "address",
      "city",
      "province",
      "birthPlace",
      "birthDate",
      "gender",
      "nationality",
      "passportNumber",
      "passportExpiry",
      "occupation",
    ],
    sampleData: [
      {
        code: "CUST-001",
        fullName: "Ahmad Hidayat",
        phone: "081234567890",
        email: "ahmad@email.com",
        address: "Jl. Merdeka No. 123",
        city: "Jakarta",
        province: "DKI Jakarta",
        birthPlace: "Jakarta",
        birthDate: "1985-05-15",
        gender: "M",
        nationality: "ID",
        passportNumber: "A1234567",
        passportExpiry: "2028-12-31",
        occupation: "Wiraswasta",
      },
      {
        code: "CUST-002",
        fullName: "Siti Fatimah",
        phone: "081298765432",
        email: "siti@email.com",
        address: "Jl. Sudirman No. 456",
        city: "Surabaya",
        province: "Jawa Timur",
        birthPlace: "Surabaya",
        birthDate: "1990-08-20",
        gender: "F",
        nationality: "ID",
        passportNumber: "B7654321",
        passportExpiry: "2029-06-30",
        occupation: "PNS",
      },
    ],
  },
  product: {
    headers: [
      "code",
      "name",
      "category",
      "description",
      "unit",
      "buyPrice",
      "sellPrice",
      "minStock",
    ],
    sampleData: [
      {
        code: "PRD-001",
        name: "Koper Cabin Umroh",
        category: "Koper",
        description: "Koper cabin ukuran 20 inch",
        unit: "pcs",
        buyPrice: 250000,
        sellPrice: 350000,
        minStock: 50,
      },
      {
        code: "PRD-002",
        name: "Mukena Travel",
        category: "Perlengkapan Ibadah",
        description: "Mukena travel dengan tas",
        unit: "pcs",
        buyPrice: 85000,
        sellPrice: 150000,
        minStock: 100,
      },
    ],
  },
  hotel: {
    headers: [
      "name",
      "city",
      "stars",
      "address",
      "distanceToMasjid",
      "facilities",
    ],
    sampleData: [
      {
        name: "Grand Makkah Hotel",
        city: "Makkah",
        stars: 5,
        address: "King Abdul Aziz Street",
        distanceToMasjid: "100m",
        facilities: "wifi,restaurant,spa,gym",
      },
      {
        name: "Madinah Palace",
        city: "Madinah",
        stars: 4,
        address: "Prophet Mosque District",
        distanceToMasjid: "200m",
        facilities: "wifi,restaurant,shuttle",
      },
    ],
  },
  airline: {
    headers: ["code", "name", "logo"],
    sampleData: [
      {
        code: "GA",
        name: "Garuda Indonesia",
        logo: "/airlines/garuda.png",
      },
      {
        code: "SV",
        name: "Saudia",
        logo: "/airlines/saudia.png",
      },
    ],
  },
  bank: {
    headers: ["code", "name", "accountNo", "accountName", "isVA", "vaPrefix"],
    sampleData: [
      {
        code: "BCA",
        name: "Bank Central Asia",
        accountNo: "1234567890",
        accountName: "PT Travel Agency",
        isVA: "true",
        vaPrefix: "123",
      },
      {
        code: "MANDIRI",
        name: "Bank Mandiri",
        accountNo: "1400012345678",
        accountName: "PT Travel Agency",
        isVA: "true",
        vaPrefix: "88908",
      },
    ],
  },
  supplier: {
    headers: [
      "code",
      "name",
      "category",
      "address",
      "city",
      "phone",
      "email",
      "picName",
      "picPhone",
    ],
    sampleData: [
      {
        code: "SUP-001",
        name: "PT Garuda Indonesia",
        category: "Airline",
        address: "Gedung Management Building",
        city: "Jakarta",
        phone: "021-23519999",
        email: "corporate@garuda.com",
        picName: "Budi Santoso",
        picPhone: "081234567890",
      },
      {
        code: "SUP-002",
        name: "CV Perlengkapan Haji",
        category: "Equipment",
        address: "Jl. Tanah Abang No. 10",
        city: "Jakarta",
        phone: "021-8765432",
        email: "sales@hajiequip.com",
        picName: "Ahmad",
        picPhone: "081298765432",
      },
    ],
  },
  employee: {
    headers: [
      "nip",
      "name",
      "phone",
      "email",
      "address",
      "position",
      "department",
      "joinDate",
      "baseSalary",
      "isTourLeader",
    ],
    sampleData: [
      {
        nip: "EMP-001",
        name: "Budi Setiawan",
        phone: "081234567890",
        email: "budi@company.com",
        address: "Jl. Merdeka No. 1",
        position: "Manager",
        department: "Operations",
        joinDate: "2020-01-15",
        baseSalary: 8000000,
        isTourLeader: "false",
      },
      {
        nip: "EMP-002",
        name: "Dewi Lestari",
        phone: "081298765432",
        email: "dewi@company.com",
        address: "Jl. Sudirman No. 5",
        position: "Tour Leader",
        department: "Operations",
        joinDate: "2021-06-01",
        baseSalary: 6000000,
        isTourLeader: "true",
      },
    ],
  },
  agent: {
    headers: [
      "code",
      "name",
      "companyName",
      "phone",
      "email",
      "address",
      "city",
      "commissionRate",
    ],
    sampleData: [
      {
        code: "AGT-001",
        name: "Ahmad Fauzi",
        companyName: "CV Berkah Tour",
        phone: "081234567890",
        email: "ahmad@berkah.com",
        address: "Jl. Raya No. 10",
        city: "Jakarta",
        commissionRate: 5,
      },
      {
        code: "AGT-002",
        name: "Siti Aminah",
        companyName: "PT Umroh Jaya",
        phone: "081298765432",
        email: "siti@umrohjaya.com",
        address: "Jl. Pahlawan No. 20",
        city: "Surabaya",
        commissionRate: 7,
      },
    ],
  },
};

// GET - Download template
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get("model");
    const format = searchParams.get("format") || "xlsx";

    if (!model || !TEMPLATES[model]) {
      return NextResponse.json(
        {
          success: false,
          error: `Model '${model}' not supported. Available: ${Object.keys(TEMPLATES).join(", ")}`,
        },
        { status: 400 },
      );
    }

    const template = TEMPLATES[model];

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create data sheet with headers and sample data
    const wsData = [
      template.headers,
      ...template.sampleData.map((row) =>
        template.headers.map((header) => row[header] ?? ""),
      ),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = template.headers.map((header) => ({
      wch: Math.max(header.length, 15),
    }));
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Create instructions sheet
    const instructionsData = [
      ["PETUNJUK PENGISIAN TEMPLATE"],
      [""],
      ["1. Hapus baris contoh (baris 2 dan 3) sebelum mengisi data Anda"],
      ["2. Jangan mengubah header (baris pertama)"],
      ["3. Format tanggal: YYYY-MM-DD (contoh: 2024-12-31)"],
      ["4. Gender: M (Laki-laki) atau F (Perempuan)"],
      ["5. Boolean: true atau false"],
      ["6. Harga/angka tanpa titik/koma (contoh: 250000)"],
      ["7. Facilities dipisah dengan koma (contoh: wifi,restaurant,spa)"],
      [""],
      ["DESKRIPSI KOLOM:"],
      ...template.headers.map((header) => [
        `- ${header}: ${getColumnDescription(model, header)}`,
      ]),
    ];
    const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsWs["!cols"] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(workbook, instructionsWs, "Petunjuk");

    // Generate file
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: format === "csv" ? "csv" : "xlsx",
    });

    const filename = `template_${model}.${format}`;
    const contentType =
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate template" },
      { status: 500 },
    );
  }
}

function getColumnDescription(model: string, column: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    customer: {
      code: "Kode customer (opsional, akan digenerate otomatis jika kosong)",
      fullName: "Nama lengkap sesuai KTP/Paspor (wajib)",
      phone: "Nomor telepon aktif (wajib)",
      email: "Alamat email (opsional)",
      address: "Alamat lengkap (opsional)",
      city: "Kota (opsional)",
      province: "Provinsi (opsional)",
      birthPlace: "Tempat lahir (opsional)",
      birthDate: "Tanggal lahir format YYYY-MM-DD (opsional)",
      gender: "Jenis kelamin: M atau F (opsional)",
      nationality: "Kode negara 2 huruf, default: ID (opsional)",
      passportNumber: "Nomor paspor (opsional)",
      passportExpiry: "Tanggal expired paspor format YYYY-MM-DD (opsional)",
      occupation: "Pekerjaan (opsional)",
    },
    product: {
      code: "Kode produk unik (opsional)",
      name: "Nama produk (wajib)",
      category: "Kategori produk (wajib)",
      description: "Deskripsi produk (opsional)",
      unit: "Satuan: pcs, box, set, dll (wajib)",
      buyPrice: "Harga beli dalam Rupiah (wajib)",
      sellPrice: "Harga jual dalam Rupiah (opsional)",
      minStock: "Stok minimum untuk alert (opsional)",
    },
    hotel: {
      name: "Nama hotel (wajib)",
      city: "Nama kota dalam bahasa Inggris (wajib)",
      stars: "Bintang hotel: 1-5 (wajib)",
      address: "Alamat hotel (opsional)",
      distanceToMasjid: "Jarak ke masjid, contoh: 100m (opsional)",
      facilities: "Fasilitas dipisah koma (opsional)",
    },
    airline: {
      code: "Kode maskapai 2 huruf IATA (wajib)",
      name: "Nama maskapai (wajib)",
      logo: "URL logo (opsional)",
    },
    bank: {
      code: "Kode bank (wajib)",
      name: "Nama bank (wajib)",
      accountNo: "Nomor rekening (wajib)",
      accountName: "Nama pemilik rekening (wajib)",
      isVA: "Mendukung Virtual Account: true/false (opsional)",
      vaPrefix: "Prefix Virtual Account (opsional)",
    },
    supplier: {
      code: "Kode supplier (opsional)",
      name: "Nama supplier (wajib)",
      category: "Kategori: Airline, Hotel, LA, Equipment, dll (opsional)",
      address: "Alamat (opsional)",
      city: "Kota (opsional)",
      phone: "Telepon (opsional)",
      email: "Email (opsional)",
      picName: "Nama PIC (opsional)",
      picPhone: "Telepon PIC (opsional)",
    },
    employee: {
      nip: "Nomor Induk Pegawai (opsional)",
      name: "Nama lengkap (wajib)",
      phone: "Telepon (opsional)",
      email: "Email (opsional)",
      address: "Alamat (opsional)",
      position: "Jabatan (wajib)",
      department: "Departemen (wajib)",
      joinDate: "Tanggal bergabung YYYY-MM-DD (opsional)",
      baseSalary: "Gaji pokok (wajib)",
      isTourLeader: "Apakah tour leader: true/false (opsional)",
    },
    agent: {
      code: "Kode agent (opsional)",
      name: "Nama agent (wajib)",
      companyName: "Nama perusahaan (opsional)",
      phone: "Telepon (wajib)",
      email: "Email (opsional)",
      address: "Alamat (opsional)",
      city: "Kota (opsional)",
      commissionRate: "Persentase komisi, default: 5 (opsional)",
    },
  };

  return descriptions[model]?.[column] || column;
}
