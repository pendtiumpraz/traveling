import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config();

const accelerateUrl = process.env.PRISMA_DATABASE_URL;
if (!accelerateUrl) {
  console.error("❌ PRISMA_DATABASE_URL not found in .env");
  process.exit(1);
}

const prisma = new PrismaClient({ accelerateUrl });

// Helper functions
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomDecimal = (min: number, max: number) =>
  (Math.random() * (max - min) + min).toFixed(2);
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const generateCode = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}${randomInt(100, 999)}`;

async function main() {
  console.log("🌱 Starting comprehensive seed...\n");
  const tenantId = process.env.DEFAULT_TENANT_ID || "default";

  // ============================================================
  // 1. MASTER DATA - Currencies & Languages
  // ============================================================
  console.log("📌 Seeding Currencies & Languages...");

  const currencies = [
    {
      code: "IDR",
      name: "Indonesian Rupiah",
      symbol: "Rp",
      rate: 1,
      isBase: true,
    },
    {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      rate: 0.000064,
      isBase: false,
    },
    {
      code: "SAR",
      name: "Saudi Riyal",
      symbol: "﷼",
      rate: 0.00024,
      isBase: false,
    },
    {
      code: "SGD",
      name: "Singapore Dollar",
      symbol: "S$",
      rate: 0.000086,
      isBase: false,
    },
    {
      code: "MYR",
      name: "Malaysian Ringgit",
      symbol: "RM",
      rate: 0.0003,
      isBase: false,
    },
    { code: "EUR", name: "Euro", symbol: "€", rate: 0.000059, isBase: false },
    {
      code: "JPY",
      name: "Japanese Yen",
      symbol: "¥",
      rate: 0.0096,
      isBase: false,
    },
  ];

  for (const c of currencies) {
    await prisma.currency.upsert({
      where: { code: c.code },
      update: { rate: c.rate },
      create: { ...c, isActive: true },
    });
  }
  console.log(`  ✅ ${currencies.length} currencies seeded`);

  const languages = [
    {
      code: "id",
      name: "Indonesian",
      nativeName: "Bahasa Indonesia",
      direction: "ltr",
    },
    { code: "en", name: "English", nativeName: "English", direction: "ltr" },
    { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl" },
    { code: "zh", name: "Chinese", nativeName: "中文", direction: "ltr" },
    { code: "ja", name: "Japanese", nativeName: "日本語", direction: "ltr" },
  ];

  for (const l of languages) {
    await prisma.language.upsert({
      where: { code: l.code },
      update: {},
      create: { ...l, isActive: true },
    });
  }
  console.log(`  ✅ ${languages.length} languages seeded`);

  // ============================================================
  // 2. MASTER DATA - Countries & Cities
  // ============================================================
  console.log("📌 Seeding Countries & Cities...");

  const countriesData = [
    {
      code: "ID",
      name: { id: "Indonesia", en: "Indonesia" },
      continent: "Asia",
      currency: "IDR",
      timezone: "Asia/Jakarta",
      visaRequired: false,
      visaOnArrival: false,
    },
    {
      code: "SA",
      name: { id: "Arab Saudi", en: "Saudi Arabia" },
      continent: "Asia",
      currency: "SAR",
      timezone: "Asia/Riyadh",
      visaRequired: true,
      visaOnArrival: false,
    },
    {
      code: "SG",
      name: { id: "Singapura", en: "Singapore" },
      continent: "Asia",
      currency: "SGD",
      timezone: "Asia/Singapore",
      visaRequired: false,
      visaOnArrival: false,
    },
    {
      code: "MY",
      name: { id: "Malaysia", en: "Malaysia" },
      continent: "Asia",
      currency: "MYR",
      timezone: "Asia/Kuala_Lumpur",
      visaRequired: false,
      visaOnArrival: false,
    },
    {
      code: "JP",
      name: { id: "Jepang", en: "Japan" },
      continent: "Asia",
      currency: "JPY",
      timezone: "Asia/Tokyo",
      visaRequired: true,
      visaOnArrival: false,
    },
    {
      code: "TH",
      name: { id: "Thailand", en: "Thailand" },
      continent: "Asia",
      currency: "THB",
      timezone: "Asia/Bangkok",
      visaRequired: false,
      visaOnArrival: true,
    },
    {
      code: "TR",
      name: { id: "Turki", en: "Turkey" },
      continent: "Europe",
      currency: "TRY",
      timezone: "Europe/Istanbul",
      visaRequired: true,
      visaOnArrival: true,
    },
    {
      code: "AE",
      name: { id: "Uni Emirat Arab", en: "United Arab Emirates" },
      continent: "Asia",
      currency: "AED",
      timezone: "Asia/Dubai",
      visaRequired: true,
      visaOnArrival: true,
    },
    {
      code: "EG",
      name: { id: "Mesir", en: "Egypt" },
      continent: "Africa",
      currency: "EGP",
      timezone: "Africa/Cairo",
      visaRequired: true,
      visaOnArrival: true,
    },
    {
      code: "KR",
      name: { id: "Korea Selatan", en: "South Korea" },
      continent: "Asia",
      currency: "KRW",
      timezone: "Asia/Seoul",
      visaRequired: true,
      visaOnArrival: false,
    },
  ];

  const createdCountries: string[] = [];
  for (const c of countriesData) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: {},
      create: { ...c, isActive: true },
    });
    createdCountries.push(c.code);
  }
  console.log(`  ✅ ${countriesData.length} countries seeded`);

  const citiesData = [
    // Indonesia
    {
      countryCode: "ID",
      name: { id: "Jakarta", en: "Jakarta" },
      timezone: "Asia/Jakarta",
      airports: ["CGK", "HLP"],
      isPopular: true,
    },
    {
      countryCode: "ID",
      name: { id: "Surabaya", en: "Surabaya" },
      timezone: "Asia/Jakarta",
      airports: ["SUB"],
      isPopular: true,
    },
    {
      countryCode: "ID",
      name: { id: "Denpasar", en: "Denpasar" },
      timezone: "Asia/Makassar",
      airports: ["DPS"],
      isPopular: true,
    },
    {
      countryCode: "ID",
      name: { id: "Yogyakarta", en: "Yogyakarta" },
      timezone: "Asia/Jakarta",
      airports: ["JOG", "YIA"],
      isPopular: true,
    },
    {
      countryCode: "ID",
      name: { id: "Bandung", en: "Bandung" },
      timezone: "Asia/Jakarta",
      airports: ["BDO"],
      isPopular: false,
    },
    // Saudi Arabia
    {
      countryCode: "SA",
      name: { id: "Makkah", en: "Makkah" },
      timezone: "Asia/Riyadh",
      airports: [],
      isPopular: true,
    },
    {
      countryCode: "SA",
      name: { id: "Madinah", en: "Madinah" },
      timezone: "Asia/Riyadh",
      airports: ["MED"],
      isPopular: true,
    },
    {
      countryCode: "SA",
      name: { id: "Jeddah", en: "Jeddah" },
      timezone: "Asia/Riyadh",
      airports: ["JED"],
      isPopular: true,
    },
    // Singapore
    {
      countryCode: "SG",
      name: { id: "Singapura", en: "Singapore" },
      timezone: "Asia/Singapore",
      airports: ["SIN"],
      isPopular: true,
    },
    // Malaysia
    {
      countryCode: "MY",
      name: { id: "Kuala Lumpur", en: "Kuala Lumpur" },
      timezone: "Asia/Kuala_Lumpur",
      airports: ["KUL"],
      isPopular: true,
    },
    {
      countryCode: "MY",
      name: { id: "Penang", en: "Penang" },
      timezone: "Asia/Kuala_Lumpur",
      airports: ["PEN"],
      isPopular: false,
    },
    // Japan
    {
      countryCode: "JP",
      name: { id: "Tokyo", en: "Tokyo" },
      timezone: "Asia/Tokyo",
      airports: ["NRT", "HND"],
      isPopular: true,
    },
    {
      countryCode: "JP",
      name: { id: "Osaka", en: "Osaka" },
      timezone: "Asia/Tokyo",
      airports: ["KIX"],
      isPopular: true,
    },
    {
      countryCode: "JP",
      name: { id: "Kyoto", en: "Kyoto" },
      timezone: "Asia/Tokyo",
      airports: [],
      isPopular: true,
    },
    // Thailand
    {
      countryCode: "TH",
      name: { id: "Bangkok", en: "Bangkok" },
      timezone: "Asia/Bangkok",
      airports: ["BKK", "DMK"],
      isPopular: true,
    },
    {
      countryCode: "TH",
      name: { id: "Phuket", en: "Phuket" },
      timezone: "Asia/Bangkok",
      airports: ["HKT"],
      isPopular: true,
    },
    // Turkey
    {
      countryCode: "TR",
      name: { id: "Istanbul", en: "Istanbul" },
      timezone: "Europe/Istanbul",
      airports: ["IST"],
      isPopular: true,
    },
    // UAE
    {
      countryCode: "AE",
      name: { id: "Dubai", en: "Dubai" },
      timezone: "Asia/Dubai",
      airports: ["DXB"],
      isPopular: true,
    },
    {
      countryCode: "AE",
      name: { id: "Abu Dhabi", en: "Abu Dhabi" },
      timezone: "Asia/Dubai",
      airports: ["AUH"],
      isPopular: false,
    },
    // Egypt
    {
      countryCode: "EG",
      name: { id: "Kairo", en: "Cairo" },
      timezone: "Africa/Cairo",
      airports: ["CAI"],
      isPopular: true,
    },
    // Korea
    {
      countryCode: "KR",
      name: { id: "Seoul", en: "Seoul" },
      timezone: "Asia/Seoul",
      airports: ["ICN", "GMP"],
      isPopular: true,
    },
  ];

  const cityIds: Record<string, string> = {};
  for (const c of citiesData) {
    const city = await prisma.city.create({ data: c });
    cityIds[`${c.countryCode}-${(c.name as { en: string }).en}`] = city.id;
  }
  console.log(`  ✅ ${citiesData.length} cities seeded`);

  // ============================================================
  // 3. MASTER DATA - Airlines
  // ============================================================
  console.log("📌 Seeding Airlines...");

  const airlinesData = [
    { code: "GA", name: "Garuda Indonesia", logo: "/airlines/garuda.png" },
    { code: "SJ", name: "Sriwijaya Air", logo: "/airlines/sriwijaya.png" },
    { code: "JT", name: "Lion Air", logo: "/airlines/lionair.png" },
    { code: "QG", name: "Citilink", logo: "/airlines/citilink.png" },
    { code: "ID", name: "Batik Air", logo: "/airlines/batikair.png" },
    { code: "SV", name: "Saudia", logo: "/airlines/saudia.png" },
    { code: "EK", name: "Emirates", logo: "/airlines/emirates.png" },
    { code: "SQ", name: "Singapore Airlines", logo: "/airlines/singapore.png" },
    { code: "MH", name: "Malaysia Airlines", logo: "/airlines/mas.png" },
    { code: "TG", name: "Thai Airways", logo: "/airlines/thai.png" },
    { code: "TK", name: "Turkish Airlines", logo: "/airlines/turkish.png" },
    { code: "QR", name: "Qatar Airways", logo: "/airlines/qatar.png" },
    { code: "EY", name: "Etihad Airways", logo: "/airlines/etihad.png" },
    { code: "JL", name: "Japan Airlines", logo: "/airlines/jal.png" },
    { code: "NH", name: "ANA", logo: "/airlines/ana.png" },
  ];

  const airlineIds: Record<string, string> = {};
  for (const a of airlinesData) {
    const airline = await prisma.airline.upsert({
      where: { code: a.code },
      update: {},
      create: { ...a, isActive: true },
    });
    airlineIds[a.code] = airline.id;
  }
  console.log(`  ✅ ${airlinesData.length} airlines seeded`);

  // ============================================================
  // 4. MASTER DATA - Hotels
  // ============================================================
  console.log("📌 Seeding Hotels...");

  const hotelsData = [
    // Makkah Hotels
    {
      cityKey: "SA-Makkah",
      name: "Raffles Makkah Palace",
      stars: 5,
      distanceToMasjid: "50m",
      facilities: ["wifi", "restaurant", "spa", "gym", "parking"],
    },
    {
      cityKey: "SA-Makkah",
      name: "Swissotel Makkah",
      stars: 5,
      distanceToMasjid: "100m",
      facilities: ["wifi", "restaurant", "pool", "gym"],
    },
    {
      cityKey: "SA-Makkah",
      name: "Hilton Makkah Convention Hotel",
      stars: 5,
      distanceToMasjid: "150m",
      facilities: ["wifi", "restaurant", "meeting_room"],
    },
    {
      cityKey: "SA-Makkah",
      name: "Movenpick Hotel & Residence Hajar Tower",
      stars: 5,
      distanceToMasjid: "200m",
      facilities: ["wifi", "restaurant", "kitchen"],
    },
    {
      cityKey: "SA-Makkah",
      name: "Pullman ZamZam Makkah",
      stars: 5,
      distanceToMasjid: "80m",
      facilities: ["wifi", "restaurant", "spa"],
    },
    {
      cityKey: "SA-Makkah",
      name: "Al Marwa Rayhaan",
      stars: 4,
      distanceToMasjid: "500m",
      facilities: ["wifi", "restaurant", "shuttle"],
    },
    {
      cityKey: "SA-Makkah",
      name: "Le Meridien Makkah",
      stars: 4,
      distanceToMasjid: "600m",
      facilities: ["wifi", "restaurant", "pool"],
    },
    // Madinah Hotels
    {
      cityKey: "SA-Madinah",
      name: "The Oberoi Madina",
      stars: 5,
      distanceToMasjid: "100m",
      facilities: ["wifi", "restaurant", "spa", "butler"],
    },
    {
      cityKey: "SA-Madinah",
      name: "Dar Al Taqwa Hotel",
      stars: 5,
      distanceToMasjid: "50m",
      facilities: ["wifi", "restaurant"],
    },
    {
      cityKey: "SA-Madinah",
      name: "Anwar Al Madinah Movenpick",
      stars: 5,
      distanceToMasjid: "200m",
      facilities: ["wifi", "restaurant", "spa"],
    },
    {
      cityKey: "SA-Madinah",
      name: "Millennium Al Aqeeq",
      stars: 4,
      distanceToMasjid: "400m",
      facilities: ["wifi", "restaurant", "gym"],
    },
    {
      cityKey: "SA-Madinah",
      name: "Shaza Al Madina",
      stars: 5,
      distanceToMasjid: "150m",
      facilities: ["wifi", "restaurant", "spa"],
    },
    // Singapore Hotels
    {
      cityKey: "SG-Singapore",
      name: "Marina Bay Sands",
      stars: 5,
      facilities: ["wifi", "pool", "casino", "spa", "restaurant"],
    },
    {
      cityKey: "SG-Singapore",
      name: "Raffles Singapore",
      stars: 5,
      facilities: ["wifi", "pool", "spa", "restaurant", "bar"],
    },
    {
      cityKey: "SG-Singapore",
      name: "Fullerton Hotel",
      stars: 5,
      facilities: ["wifi", "pool", "spa", "restaurant"],
    },
    // Tokyo Hotels
    {
      cityKey: "JP-Tokyo",
      name: "Park Hyatt Tokyo",
      stars: 5,
      facilities: ["wifi", "pool", "spa", "restaurant", "gym"],
    },
    {
      cityKey: "JP-Tokyo",
      name: "The Peninsula Tokyo",
      stars: 5,
      facilities: ["wifi", "pool", "spa", "restaurant"],
    },
    {
      cityKey: "JP-Tokyo",
      name: "Mandarin Oriental Tokyo",
      stars: 5,
      facilities: ["wifi", "pool", "spa", "restaurant"],
    },
    // Bangkok Hotels
    {
      cityKey: "TH-Bangkok",
      name: "Mandarin Oriental Bangkok",
      stars: 5,
      facilities: ["wifi", "pool", "spa", "restaurant"],
    },
    {
      cityKey: "TH-Bangkok",
      name: "The Siam",
      stars: 5,
      facilities: ["wifi", "pool", "spa", "restaurant", "gym"],
    },
    // Dubai Hotels
    {
      cityKey: "AE-Dubai",
      name: "Burj Al Arab Jumeirah",
      stars: 5,
      facilities: ["wifi", "pool", "spa", "restaurant", "helipad"],
    },
    {
      cityKey: "AE-Dubai",
      name: "Atlantis The Palm",
      stars: 5,
      facilities: ["wifi", "pool", "waterpark", "aquarium", "restaurant"],
    },
    // Istanbul Hotels
    {
      cityKey: "TR-Istanbul",
      name: "Four Seasons Bosphorus",
      stars: 5,
      facilities: ["wifi", "pool", "spa", "restaurant"],
    },
    {
      cityKey: "TR-Istanbul",
      name: "Ciragan Palace Kempinski",
      stars: 5,
      facilities: ["wifi", "pool", "spa", "restaurant", "palace"],
    },
  ];

  const hotelIds: Record<string, string> = {};
  for (const h of hotelsData) {
    const cityId = cityIds[h.cityKey];
    if (!cityId) continue;
    const hotel = await prisma.hotel.create({
      data: {
        cityId,
        name: h.name,
        stars: h.stars,
        distanceToMasjid: h.distanceToMasjid,
        facilities: h.facilities,
        isActive: true,
      },
    });
    hotelIds[h.name] = hotel.id;
  }
  console.log(`  ✅ ${Object.keys(hotelIds).length} hotels seeded`);

  // ============================================================
  // 5. MASTER DATA - Banks
  // ============================================================
  console.log("📌 Seeding Banks...");

  const banksData = [
    {
      code: "BCA",
      name: "Bank Central Asia",
      accountNo: "1234567890",
      accountName: "PT Travel Agency",
      isVA: true,
      vaPrefix: "123",
    },
    {
      code: "MANDIRI",
      name: "Bank Mandiri",
      accountNo: "1400012345678",
      accountName: "PT Travel Agency",
      isVA: true,
      vaPrefix: "88908",
    },
    {
      code: "BNI",
      name: "Bank Negara Indonesia",
      accountNo: "0123456789",
      accountName: "PT Travel Agency",
      isVA: true,
      vaPrefix: "8808",
    },
    {
      code: "BRI",
      name: "Bank Rakyat Indonesia",
      accountNo: "012345678901234",
      accountName: "PT Travel Agency",
      isVA: true,
      vaPrefix: "88920",
    },
    {
      code: "BSI",
      name: "Bank Syariah Indonesia",
      accountNo: "7012345678",
      accountName: "PT Travel Agency",
      isVA: false,
    },
    {
      code: "PERMATA",
      name: "Bank Permata",
      accountNo: "1234567890123",
      accountName: "PT Travel Agency",
      isVA: true,
      vaPrefix: "013",
    },
    {
      code: "CIMB",
      name: "CIMB Niaga",
      accountNo: "760012345678",
      accountName: "PT Travel Agency",
      isVA: true,
      vaPrefix: "99",
    },
  ];

  const bankIds: Record<string, string> = {};
  for (const b of banksData) {
    const bank = await prisma.bank.upsert({
      where: { tenantId_code: { tenantId, code: b.code } },
      update: {},
      create: { tenantId, ...b, isActive: true },
    });
    bankIds[b.code] = bank.id;
  }
  console.log(`  ✅ ${banksData.length} banks seeded`);

  // ============================================================
  // 6. MASTER DATA - Suppliers
  // ============================================================
  console.log("📌 Seeding Suppliers...");

  const suppliersData = [
    {
      code: "SUP-001",
      name: "PT Garuda Indonesia",
      category: "Airline",
      phone: "021-23519999",
      email: "corporate@garuda-indonesia.com",
    },
    {
      code: "SUP-002",
      name: "Raffles Hotels & Resorts",
      category: "Hotel",
      phone: "+966-12-5719999",
      email: "reservations@raffles.com",
    },
    {
      code: "SUP-003",
      name: "Saudi Ground Services",
      category: "LA",
      phone: "+966-12-6864000",
      email: "info@sgs.com.sa",
    },
    {
      code: "SUP-004",
      name: "Nusantara Tour & Travel",
      category: "LA",
      phone: "021-7884444",
      email: "info@nusantara.co.id",
    },
    {
      code: "SUP-005",
      name: "CV Perlengkapan Haji",
      category: "Equipment",
      phone: "021-8765432",
      email: "sales@hajiequip.com",
    },
    {
      code: "SUP-006",
      name: "PT Catering Berkah",
      category: "Catering",
      phone: "021-5678901",
      email: "order@cateringberkah.com",
    },
    {
      code: "SUP-007",
      name: "Al Hijaz Transport",
      category: "Transport",
      phone: "+966-12-6543210",
      email: "booking@alhijaz.sa",
    },
  ];

  const supplierIds: Record<string, string> = {};
  for (const s of suppliersData) {
    const supplier = await prisma.supplier.upsert({
      where: { tenantId_code: { tenantId, code: s.code } },
      update: {},
      create: { tenantId, ...s, isActive: true },
    });
    supplierIds[s.code] = supplier.id;
  }
  console.log(`  ✅ ${suppliersData.length} suppliers seeded`);

  // ============================================================
  // 7. BRANCHES & WAREHOUSES
  // ============================================================
  console.log("📌 Seeding Branches & Warehouses...");

  const branchesData = [
    {
      code: "HQ",
      name: "Kantor Pusat Jakarta",
      city: "Jakarta",
      province: "DKI Jakarta",
      address: "Jl. Sudirman No. 123",
      phone: "021-12345678",
    },
    {
      code: "SBY",
      name: "Cabang Surabaya",
      city: "Surabaya",
      province: "Jawa Timur",
      address: "Jl. Basuki Rahmat No. 45",
      phone: "031-87654321",
    },
    {
      code: "BDG",
      name: "Cabang Bandung",
      city: "Bandung",
      province: "Jawa Barat",
      address: "Jl. Asia Afrika No. 67",
      phone: "022-23456789",
    },
    {
      code: "MDN",
      name: "Cabang Medan",
      city: "Medan",
      province: "Sumatera Utara",
      address: "Jl. Imam Bonjol No. 89",
      phone: "061-34567890",
    },
    {
      code: "MKS",
      name: "Cabang Makassar",
      city: "Makassar",
      province: "Sulawesi Selatan",
      address: "Jl. Sam Ratulangi No. 12",
      phone: "0411-45678901",
    },
  ];

  const branchIds: Record<string, string> = {};
  for (const b of branchesData) {
    const branch = await prisma.branch.upsert({
      where: { tenantId_code: { tenantId, code: b.code } },
      update: {},
      create: { tenantId, ...b, isActive: true },
    });
    branchIds[b.code] = branch.id;
  }
  console.log(`  ✅ ${branchesData.length} branches seeded`);

  const warehousesData = [
    { code: "WH-JKT", name: "Gudang Jakarta", branchCode: "HQ" },
    { code: "WH-SBY", name: "Gudang Surabaya", branchCode: "SBY" },
    { code: "WH-BDG", name: "Gudang Bandung", branchCode: "BDG" },
  ];

  const warehouseIds: Record<string, string> = {};
  for (const w of warehousesData) {
    const warehouse = await prisma.warehouse.upsert({
      where: { tenantId_code: { tenantId, code: w.code } },
      update: {},
      create: {
        tenantId,
        branchId: branchIds[w.branchCode],
        code: w.code,
        name: w.name,
        isActive: true,
      },
    });
    warehouseIds[w.code] = warehouse.id;
  }
  console.log(`  ✅ ${warehousesData.length} warehouses seeded`);

  // ============================================================
  // 8. PRODUCTS (Inventory Items)
  // ============================================================
  console.log("📌 Seeding Products...");

  const productsData = [
    {
      code: "PRD-001",
      name: "Koper Cabin Umroh",
      category: "Koper",
      unit: "pcs",
      buyPrice: 250000,
      sellPrice: 350000,
      minStock: 50,
    },
    {
      code: "PRD-002",
      name: "Koper Besar 28 inch",
      category: "Koper",
      unit: "pcs",
      buyPrice: 450000,
      sellPrice: 600000,
      minStock: 30,
    },
    {
      code: "PRD-003",
      name: "Tas Sandal",
      category: "Tas",
      unit: "pcs",
      buyPrice: 25000,
      sellPrice: 50000,
      minStock: 100,
    },
    {
      code: "PRD-004",
      name: "Tas Paspor",
      category: "Tas",
      unit: "pcs",
      buyPrice: 35000,
      sellPrice: 75000,
      minStock: 100,
    },
    {
      code: "PRD-005",
      name: "Mukena Travel",
      category: "Perlengkapan Ibadah",
      unit: "pcs",
      buyPrice: 85000,
      sellPrice: 150000,
      minStock: 100,
    },
    {
      code: "PRD-006",
      name: "Sajadah Travel",
      category: "Perlengkapan Ibadah",
      unit: "pcs",
      buyPrice: 45000,
      sellPrice: 85000,
      minStock: 100,
    },
    {
      code: "PRD-007",
      name: "Ihram Pria (Set)",
      category: "Perlengkapan Ibadah",
      unit: "set",
      buyPrice: 120000,
      sellPrice: 200000,
      minStock: 50,
    },
    {
      code: "PRD-008",
      name: "Buku Manasik Umroh",
      category: "Buku",
      unit: "pcs",
      buyPrice: 15000,
      sellPrice: 35000,
      minStock: 200,
    },
    {
      code: "PRD-009",
      name: "Buku Doa Umroh",
      category: "Buku",
      unit: "pcs",
      buyPrice: 12000,
      sellPrice: 25000,
      minStock: 200,
    },
    {
      code: "PRD-010",
      name: "ID Card Holder + Lanyard",
      category: "Aksesoris",
      unit: "pcs",
      buyPrice: 8000,
      sellPrice: 15000,
      minStock: 300,
    },
    {
      code: "PRD-011",
      name: "Pin Jamaah",
      category: "Aksesoris",
      unit: "pcs",
      buyPrice: 3000,
      sellPrice: 10000,
      minStock: 500,
    },
    {
      code: "PRD-012",
      name: "Masker N95",
      category: "Kesehatan",
      unit: "box",
      buyPrice: 85000,
      sellPrice: 120000,
      minStock: 50,
    },
    {
      code: "PRD-013",
      name: "Hand Sanitizer 100ml",
      category: "Kesehatan",
      unit: "pcs",
      buyPrice: 15000,
      sellPrice: 30000,
      minStock: 200,
    },
    {
      code: "PRD-014",
      name: "Air Zam-zam 5L",
      category: "Oleh-oleh",
      unit: "pcs",
      buyPrice: 75000,
      sellPrice: 150000,
      minStock: 100,
    },
    {
      code: "PRD-015",
      name: "Kurma Ajwa 1kg",
      category: "Oleh-oleh",
      unit: "pcs",
      buyPrice: 180000,
      sellPrice: 280000,
      minStock: 50,
    },
  ];

  const productIds: Record<string, string> = {};
  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { tenantId_code: { tenantId, code: p.code } },
      update: {},
      create: { tenantId, ...p, isActive: true },
    });
    productIds[p.code] = product.id;
  }
  console.log(`  ✅ ${productsData.length} products seeded`);

  // Seed initial stock
  for (const [productCode, productId] of Object.entries(productIds)) {
    for (const [warehouseCode, warehouseId] of Object.entries(warehouseIds)) {
      const qty =
        warehouseCode === "WH-JKT" ? randomInt(100, 500) : randomInt(30, 150);
      await prisma.stock.upsert({
        where: { productId_warehouseId: { productId, warehouseId } },
        update: { quantity: qty },
        create: { productId, warehouseId, quantity: qty },
      });
    }
  }
  console.log(`  ✅ Stock initialized for all products`);

  // ============================================================
  // 9. PACKAGES
  // ============================================================
  console.log("📌 Seeding Packages...");

  const packagesData = [
    {
      code: "UMR-9D-REG",
      type: "UMROH" as const,
      name: { id: "Umroh 9 Hari Regular", en: "9 Days Regular Umroh" },
      description: {
        id: "Paket umroh 9 hari dengan penerbangan Garuda Indonesia",
        en: "9 days umroh package with Garuda Indonesia flight",
      },
      destinations: ["SA"],
      duration: 9,
      nights: 8,
      priceQuad: 25000000,
      priceTriple: 27000000,
      priceDouble: 30000000,
      priceSingle: 38000000,
      inclusions: {
        id: [
          "Tiket pesawat PP",
          "Hotel bintang 5",
          "Visa umroh",
          "Makan 3x sehari",
          "Mutawwif",
        ],
        en: [
          "Round trip flight",
          "5-star hotel",
          "Umroh visa",
          "3 meals daily",
          "Guide",
        ],
      },
      exclusions: {
        id: ["Pengeluaran pribadi", "Tips guide", "Kelebihan bagasi"],
        en: ["Personal expenses", "Guide tips", "Excess baggage"],
      },
    },
    {
      code: "UMR-12D-VIP",
      type: "UMROH" as const,
      name: { id: "Umroh 12 Hari VIP Plus", en: "12 Days VIP Plus Umroh" },
      description: {
        id: "Paket umroh 12 hari VIP dengan hotel mewah",
        en: "12 days VIP umroh package with luxury hotel",
      },
      destinations: ["SA"],
      duration: 12,
      nights: 11,
      priceQuad: 45000000,
      priceTriple: 48000000,
      priceDouble: 52000000,
      priceSingle: 65000000,
      inclusions: {
        id: [
          "Tiket pesawat PP Business Class",
          "Hotel Raffles/Oberoi",
          "Visa umroh",
          "Makan 3x sehari",
          "Mutawwif pribadi",
          "City tour",
        ],
        en: [
          "Business class flight",
          "Raffles/Oberoi Hotel",
          "Umroh visa",
          "3 meals daily",
          "Private guide",
          "City tour",
        ],
      },
      exclusions: {
        id: ["Pengeluaran pribadi", "Kelebihan bagasi"],
        en: ["Personal expenses", "Excess baggage"],
      },
    },
    {
      code: "UMR-9D-RAM",
      type: "UMROH" as const,
      name: { id: "Umroh Ramadhan 9 Hari", en: "Ramadhan Umroh 9 Days" },
      description: {
        id: "Paket umroh spesial bulan Ramadhan",
        en: "Special Ramadhan umroh package",
      },
      destinations: ["SA"],
      duration: 9,
      nights: 8,
      priceQuad: 35000000,
      priceTriple: 38000000,
      priceDouble: 42000000,
      priceSingle: 55000000,
      inclusions: {
        id: [
          "Tiket pesawat PP",
          "Hotel bintang 5",
          "Visa umroh",
          "Makan sahur & buka",
          "Mutawwif",
        ],
        en: [
          "Round trip flight",
          "5-star hotel",
          "Umroh visa",
          "Suhoor & Iftar",
          "Guide",
        ],
      },
      exclusions: { id: ["Pengeluaran pribadi"], en: ["Personal expenses"] },
    },
    {
      code: "HAJ-40D-REG",
      type: "HAJI" as const,
      name: { id: "Haji Khusus 40 Hari", en: "40 Days Special Hajj" },
      description: {
        id: "Paket haji khusus dengan pelayanan premium",
        en: "Special hajj package with premium service",
      },
      destinations: ["SA"],
      duration: 40,
      nights: 39,
      priceQuad: 150000000,
      priceTriple: 165000000,
      priceDouble: 180000000,
      priceSingle: 220000000,
      inclusions: {
        id: [
          "Tiket pesawat PP",
          "Hotel mewah",
          "Visa haji",
          "Makan 3x sehari",
          "Mutawwif berpengalaman",
          "Dam & Qurban",
          "Transportasi AC",
        ],
        en: [
          "Round trip flight",
          "Luxury hotel",
          "Hajj visa",
          "3 meals daily",
          "Experienced guide",
          "Dam & Qurban",
          "AC transport",
        ],
      },
      exclusions: {
        id: ["Pengeluaran pribadi", "Oleh-oleh"],
        en: ["Personal expenses", "Souvenirs"],
      },
    },
    {
      code: "OUT-JP-7D",
      type: "OUTBOUND" as const,
      name: { id: "Jepang Sakura 7 Hari", en: "Japan Sakura 7 Days" },
      description: {
        id: "Wisata Jepang saat musim sakura mekar",
        en: "Japan tour during cherry blossom season",
      },
      destinations: ["JP"],
      duration: 7,
      nights: 6,
      priceQuad: 18000000,
      priceTriple: 20000000,
      priceDouble: 23000000,
      priceSingle: 30000000,
      inclusions: {
        id: [
          "Tiket pesawat PP",
          "Hotel bintang 4",
          "Makan pagi",
          "Tour guide",
          "Transportasi",
        ],
        en: [
          "Round trip flight",
          "4-star hotel",
          "Breakfast",
          "Tour guide",
          "Transportation",
        ],
      },
      exclusions: {
        id: ["Visa Jepang", "Pengeluaran pribadi", "Makan siang & malam"],
        en: ["Japan visa", "Personal expenses", "Lunch & dinner"],
      },
    },
    {
      code: "OUT-SG-4D",
      type: "OUTBOUND" as const,
      name: { id: "Singapore 4 Hari 3 Malam", en: "Singapore 4D3N" },
      description: {
        id: "Wisata Singapore lengkap dengan Universal Studios",
        en: "Singapore tour with Universal Studios",
      },
      destinations: ["SG"],
      duration: 4,
      nights: 3,
      priceQuad: 8500000,
      priceTriple: 9500000,
      priceDouble: 11000000,
      priceSingle: 15000000,
      inclusions: {
        id: [
          "Tiket pesawat PP",
          "Hotel bintang 4",
          "Makan pagi",
          "Tiket USS",
          "City tour",
        ],
        en: [
          "Round trip flight",
          "4-star hotel",
          "Breakfast",
          "USS ticket",
          "City tour",
        ],
      },
      exclusions: {
        id: ["Pengeluaran pribadi", "Makan siang & malam"],
        en: ["Personal expenses", "Lunch & dinner"],
      },
    },
    {
      code: "OUT-TH-5D",
      type: "OUTBOUND" as const,
      name: {
        id: "Thailand Bangkok Pattaya 5 Hari",
        en: "Thailand Bangkok Pattaya 5 Days",
      },
      description: {
        id: "Wisata Thailand Bangkok dan Pattaya",
        en: "Thailand tour Bangkok and Pattaya",
      },
      destinations: ["TH"],
      duration: 5,
      nights: 4,
      priceQuad: 7500000,
      priceTriple: 8500000,
      priceDouble: 10000000,
      priceSingle: 14000000,
      inclusions: {
        id: [
          "Tiket pesawat PP",
          "Hotel bintang 4",
          "Makan pagi",
          "City tour",
          "Transportasi",
        ],
        en: [
          "Round trip flight",
          "4-star hotel",
          "Breakfast",
          "City tour",
          "Transportation",
        ],
      },
      exclusions: {
        id: ["Pengeluaran pribadi", "Tiket wisata optional"],
        en: ["Personal expenses", "Optional tour tickets"],
      },
    },
    {
      code: "OUT-TR-10D",
      type: "OUTBOUND" as const,
      name: { id: "Turki 10 Hari Amazing", en: "Turkey 10 Days Amazing" },
      description: {
        id: "Wisata Turki Istanbul, Cappadocia, Pamukkale",
        en: "Turkey tour Istanbul, Cappadocia, Pamukkale",
      },
      destinations: ["TR"],
      duration: 10,
      nights: 9,
      priceQuad: 22000000,
      priceTriple: 25000000,
      priceDouble: 28000000,
      priceSingle: 38000000,
      inclusions: {
        id: [
          "Tiket pesawat PP",
          "Hotel bintang 4-5",
          "Makan 3x sehari",
          "Tour guide lokal",
          "Hot air balloon",
        ],
        en: [
          "Round trip flight",
          "4-5 star hotel",
          "3 meals daily",
          "Local guide",
          "Hot air balloon",
        ],
      },
      exclusions: {
        id: ["Visa Turki", "Pengeluaran pribadi"],
        en: ["Turkey visa", "Personal expenses"],
      },
    },
    {
      code: "DOM-BALI-4D",
      type: "DOMESTIC" as const,
      name: { id: "Bali Paradise 4 Hari", en: "Bali Paradise 4 Days" },
      description: {
        id: "Wisata Bali dengan mengunjungi tempat-tempat ikonik",
        en: "Bali tour visiting iconic places",
      },
      destinations: ["ID"],
      duration: 4,
      nights: 3,
      priceQuad: 4500000,
      priceTriple: 5000000,
      priceDouble: 6000000,
      priceSingle: 8500000,
      inclusions: {
        id: [
          "Tiket pesawat PP",
          "Hotel bintang 4",
          "Makan pagi",
          "Tour guide",
          "Transportasi",
        ],
        en: [
          "Round trip flight",
          "4-star hotel",
          "Breakfast",
          "Tour guide",
          "Transportation",
        ],
      },
      exclusions: {
        id: ["Pengeluaran pribadi", "Tiket wisata"],
        en: ["Personal expenses", "Attraction tickets"],
      },
    },
    {
      code: "DOM-YOG-3D",
      type: "DOMESTIC" as const,
      name: {
        id: "Yogyakarta Heritage 3 Hari",
        en: "Yogyakarta Heritage 3 Days",
      },
      description: {
        id: "Wisata budaya Yogyakarta Borobudur Prambanan",
        en: "Yogyakarta cultural tour Borobudur Prambanan",
      },
      destinations: ["ID"],
      duration: 3,
      nights: 2,
      priceQuad: 3500000,
      priceTriple: 4000000,
      priceDouble: 4800000,
      priceSingle: 6500000,
      inclusions: {
        id: [
          "Tiket pesawat PP",
          "Hotel bintang 3",
          "Makan pagi",
          "Tiket Borobudur & Prambanan",
        ],
        en: [
          "Round trip flight",
          "3-star hotel",
          "Breakfast",
          "Borobudur & Prambanan tickets",
        ],
      },
      exclusions: {
        id: ["Pengeluaran pribadi", "Makan siang & malam"],
        en: ["Personal expenses", "Lunch & dinner"],
      },
    },
  ];

  const packageIds: Record<string, string> = {};
  for (const p of packagesData) {
    const pkg = await prisma.package.upsert({
      where: { tenantId_code: { tenantId, code: p.code } },
      update: {},
      create: {
        tenantId,
        ...p,
        isFeatured: randomInt(0, 1) === 1,
        isActive: true,
      },
    });
    packageIds[p.code] = pkg.id;
  }
  console.log(`  ✅ ${packagesData.length} packages seeded`);

  // ============================================================
  // 10. SCHEDULES
  // ============================================================
  console.log("📌 Seeding Schedules...");

  const today = new Date();
  const schedules: Array<{
    packageCode: string;
    daysFromNow: number;
    quota: number;
  }> = [];

  // Generate schedules for next 6 months
  for (const pkgCode of Object.keys(packageIds)) {
    const numSchedules = randomInt(3, 8);
    for (let i = 0; i < numSchedules; i++) {
      schedules.push({
        packageCode: pkgCode,
        daysFromNow: randomInt(7, 180),
        quota: randomInt(20, 45),
      });
    }
  }

  const scheduleIds: Record<string, string> = {};
  for (const s of schedules) {
    const pkg = await prisma.package.findFirst({
      where: { code: s.packageCode },
    });
    if (!pkg) continue;

    const depDate = new Date(today);
    depDate.setDate(depDate.getDate() + s.daysFromNow);
    const retDate = new Date(depDate);
    retDate.setDate(retDate.getDate() + pkg.duration - 1);

    const booked = randomInt(0, Math.floor(s.quota * 0.8));
    const status =
      booked >= s.quota
        ? "FULL"
        : booked >= s.quota * 0.8
          ? "ALMOST_FULL"
          : "OPEN";

    const schedule = await prisma.schedule.create({
      data: {
        packageId: pkg.id,
        departureDate: depDate,
        returnDate: retDate,
        quota: s.quota,
        availableQuota: s.quota - booked,
        status: status as "OPEN" | "ALMOST_FULL" | "FULL",
      },
    });
    scheduleIds[`${s.packageCode}-${s.daysFromNow}`] = schedule.id;
  }
  console.log(`  ✅ ${schedules.length} schedules seeded`);

  // ============================================================
  // 11. CUSTOMERS
  // ============================================================
  console.log("📌 Seeding Customers...");

  const firstNames = [
    "Ahmad",
    "Muhammad",
    "Budi",
    "Siti",
    "Fatimah",
    "Aisyah",
    "Dewi",
    "Hasan",
    "Ridwan",
    "Yusuf",
    "Ibrahim",
    "Maryam",
    "Khadijah",
    "Zainab",
    "Omar",
    "Ali",
    "Hassan",
    "Husein",
    "Aminah",
    "Hafizah",
  ];
  const lastNames = [
    "Hidayat",
    "Santoso",
    "Wijaya",
    "Kusuma",
    "Pratama",
    "Rahman",
    "Abdullah",
    "Hakim",
    "Putra",
    "Sari",
    "Wibowo",
    "Handoko",
    "Setiawan",
    "Nugroho",
    "Firmansyah",
    "Ramadhan",
    "Hasyim",
    "Zaini",
    "Fauzi",
    "Ismail",
  ];
  const cities = [
    "Jakarta",
    "Surabaya",
    "Bandung",
    "Semarang",
    "Medan",
    "Makassar",
    "Yogyakarta",
    "Palembang",
    "Tangerang",
    "Bekasi",
  ];
  const provinces = [
    "DKI Jakarta",
    "Jawa Timur",
    "Jawa Barat",
    "Jawa Tengah",
    "Sumatera Utara",
    "Sulawesi Selatan",
    "DI Yogyakarta",
    "Sumatera Selatan",
    "Banten",
    "Jawa Barat",
  ];
  const occupations = [
    "Wiraswasta",
    "PNS",
    "Guru",
    "Dokter",
    "Pengacara",
    "Insinyur",
    "Akuntan",
    "Manager",
    "Direktur",
    "Ibu Rumah Tangga",
    "Pensiunan",
    "Pedagang",
    "Karyawan Swasta",
  ];
  const sources: Array<
    | "WEBSITE"
    | "REFERRAL"
    | "AGENT"
    | "SOCIAL_MEDIA"
    | "WALK_IN"
    | "PHONE"
    | "EVENT"
  > = [
    "WEBSITE",
    "REFERRAL",
    "AGENT",
    "SOCIAL_MEDIA",
    "WALK_IN",
    "PHONE",
    "EVENT",
  ];

  const customerIds: string[] = [];
  for (let i = 0; i < 150; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const gender = randomItem(["M", "F"]) as "M" | "F";
    const cityIdx = randomInt(0, cities.length - 1);
    const birthYear = randomInt(1960, 2000);
    const birthMonth = randomInt(1, 12);
    const birthDay = randomInt(1, 28);
    const passportExpiry = new Date();
    passportExpiry.setFullYear(passportExpiry.getFullYear() + randomInt(1, 8));

    const customerType = randomItem([
      "PROSPECT",
      "CLIENT",
      "VIP",
      "INACTIVE",
    ]) as "PROSPECT" | "CLIENT" | "VIP" | "INACTIVE";

    const customer = await prisma.customer.create({
      data: {
        tenantId,
        code: generateCode("CUST"),
        customerType,
        fullName: `${firstName} ${lastName}`,
        passportName: `${firstName.toUpperCase()} ${lastName.toUpperCase()}`,
        idNumber: `32${randomInt(10, 99)}${randomInt(100000, 999999)}${randomInt(1000, 9999)}`,
        birthPlace: cities[cityIdx],
        birthDate: new Date(birthYear, birthMonth - 1, birthDay),
        gender,
        nationality: "ID",
        address: `Jl. ${randomItem(["Merdeka", "Sudirman", "Gatot Subroto", "Ahmad Yani", "Diponegoro"])} No. ${randomInt(1, 200)}`,
        city: cities[cityIdx],
        province: provinces[cityIdx],
        country: "ID",
        postalCode: `${randomInt(10, 99)}${randomInt(100, 999)}`,
        phone: `08${randomInt(11, 99)}${randomInt(1000000, 9999999)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@email.com`,
        whatsapp: `08${randomInt(11, 99)}${randomInt(1000000, 9999999)}`,
        passportNumber: `A${randomInt(1000000, 9999999)}`,
        passportIssuePlace: "Jakarta",
        passportIssueDate: new Date(2020, randomInt(0, 11), randomInt(1, 28)),
        passportExpiry,
        occupation: randomItem(occupations),
        bloodType: randomItem(["A", "B", "AB", "O"]) as "A" | "B" | "AB" | "O",
        shirtSize: randomItem(["S", "M", "L", "XL", "XXL"]),
        shoeSize: randomInt(36, 45),
        maritalStatus: randomItem([
          "SINGLE",
          "MARRIED",
          "DIVORCED",
          "WIDOWED",
        ]) as "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED",
        source: randomItem(sources),
      },
    });
    customerIds.push(customer.id);

    // Add emergency contact
    await prisma.emergencyContact.create({
      data: {
        customerId: customer.id,
        name: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
        relationship: randomItem([
          "Suami",
          "Istri",
          "Anak",
          "Orang Tua",
          "Saudara",
        ]),
        phone: `08${randomInt(11, 99)}${randomInt(1000000, 9999999)}`,
      },
    });
  }
  console.log(
    `  ✅ ${customerIds.length} customers seeded with emergency contacts`,
  );

  // ============================================================
  // 12. BOOKINGS
  // ============================================================
  console.log("📌 Seeding Bookings...");

  const allSchedules = await prisma.schedule.findMany({
    include: { package: true },
    where: { status: { in: ["OPEN", "ALMOST_FULL"] } },
    take: 30,
  });

  const bookingStatuses: Array<
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "READY"
    | "DEPARTED"
    | "COMPLETED"
    | "CANCELLED"
  > = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "READY",
    "DEPARTED",
    "COMPLETED",
    "CANCELLED",
  ];
  const paymentStatuses: Array<"UNPAID" | "PARTIAL" | "PAID" | "REFUNDED"> = [
    "UNPAID",
    "PARTIAL",
    "PAID",
  ];
  const roomTypes: Array<"QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE"> = [
    "QUAD",
    "TRIPLE",
    "DOUBLE",
    "SINGLE",
  ];

  const bookingIds: string[] = [];
  for (let i = 0; i < 100; i++) {
    const schedule = randomItem(allSchedules);
    const customerId = randomItem(customerIds);
    const roomType = randomItem(roomTypes);
    const pax =
      roomType === "QUAD"
        ? 4
        : roomType === "TRIPLE"
          ? 3
          : roomType === "DOUBLE"
            ? 2
            : 1;

    const priceMap = {
      QUAD: Number(schedule.package.priceQuad),
      TRIPLE: Number(schedule.package.priceTriple),
      DOUBLE: Number(schedule.package.priceDouble),
      SINGLE: Number(
        schedule.package.priceSingle || schedule.package.priceDouble,
      ),
    };
    const basePrice = priceMap[roomType] * pax;
    const discount = randomInt(0, 1) === 1 ? randomInt(500000, 2000000) : 0;
    const totalPrice = basePrice - discount;

    const status = randomItem(bookingStatuses);
    const paymentStatus =
      status === "CANCELLED" ? "REFUNDED" : randomItem(paymentStatuses);

    try {
      const booking = await prisma.booking.create({
        data: {
          tenantId,
          bookingCode: generateCode("BK"),
          customerId,
          packageId: schedule.packageId,
          scheduleId: schedule.id,
          businessType: schedule.package.type,
          roomType,
          pax,
          basePrice,
          discount,
          totalPrice,
          status,
          paymentStatus: paymentStatus as
            | "UNPAID"
            | "PARTIAL"
            | "PAID"
            | "REFUNDED",
          source: randomItem(["online", "offline", "agent"]),
          createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        },
      });
      bookingIds.push(booking.id);
    } catch {
      // Skip duplicate bookings
    }
  }
  console.log(`  ✅ ${bookingIds.length} bookings seeded`);

  // ============================================================
  // 13. PAYMENTS
  // ============================================================
  console.log("📌 Seeding Payments...");

  const bookingsWithPayments = await prisma.booking.findMany({
    where: { paymentStatus: { in: ["PARTIAL", "PAID"] } },
    take: 50,
  });

  const paymentMethods: Array<
    "BANK_TRANSFER" | "VIRTUAL_ACCOUNT" | "CREDIT_CARD" | "QRIS" | "CASH"
  > = ["BANK_TRANSFER", "VIRTUAL_ACCOUNT", "CREDIT_CARD", "QRIS", "CASH"];
  const bankCodes = Object.keys(bankIds);

  let paymentCount = 0;
  for (const booking of bookingsWithPayments) {
    const numPayments = booking.paymentStatus === "PAID" ? randomInt(1, 3) : 1;
    const totalPaid =
      booking.paymentStatus === "PAID"
        ? Number(booking.totalPrice)
        : Number(booking.totalPrice) * 0.3;
    const amountPerPayment = totalPaid / numPayments;

    for (let j = 0; j < numPayments; j++) {
      const method = randomItem(paymentMethods);
      const bankCode =
        method === "BANK_TRANSFER" || method === "VIRTUAL_ACCOUNT"
          ? randomItem(bankCodes)
          : null;

      await prisma.payment.create({
        data: {
          paymentCode: generateCode("PAY"),
          bookingId: booking.id,
          bankId: bankCode ? bankIds[bankCode] : null,
          amount: amountPerPayment,
          amountInBase: amountPerPayment,
          method,
          status: "SUCCESS",
          transferDate: randomDate(new Date(2024, 0, 1), new Date()),
          verifiedAt: new Date(),
        },
      });
      paymentCount++;
    }
  }
  console.log(`  ✅ ${paymentCount} payments seeded`);

  // ============================================================
  // 14. INVOICES
  // ============================================================
  console.log("📌 Seeding Invoices...");

  const confirmedBookings = await prisma.booking.findMany({
    where: {
      status: {
        in: ["CONFIRMED", "PROCESSING", "READY", "DEPARTED", "COMPLETED"],
      },
    },
    take: 40,
  });

  for (const booking of confirmedBookings) {
    const dueDate = new Date(booking.createdAt);
    dueDate.setDate(dueDate.getDate() + 7);

    const payments = await prisma.payment.aggregate({
      where: { bookingId: booking.id, status: "SUCCESS" },
      _sum: { amount: true },
    });
    const paidAmount = Number(payments._sum.amount || 0);

    await prisma.invoice.create({
      data: {
        invoiceNo: generateCode("INV"),
        bookingId: booking.id,
        subtotal: booking.totalPrice,
        discount: booking.discount,
        tax: 0,
        total: booking.totalPrice,
        paidAmount,
        balance: Number(booking.totalPrice) - paidAmount,
        dueDate,
        items: [
          {
            description: `Paket ${booking.businessType} - ${booking.roomType}`,
            qty: booking.pax,
            price: Number(booking.basePrice) / booking.pax,
            total: Number(booking.basePrice),
          },
        ],
      },
    });
  }
  console.log(`  ✅ ${confirmedBookings.length} invoices seeded`);

  // ============================================================
  // 15. MANIFESTS & PARTICIPANTS
  // ============================================================
  console.log("📌 Seeding Manifests...");

  const departedSchedules = await prisma.schedule.findMany({
    where: { departureDate: { lte: new Date() } },
    include: { package: true },
    take: 10,
  });

  const manifestStatuses: Array<
    "DRAFT" | "CONFIRMED" | "DEPARTED" | "IN_PROGRESS" | "COMPLETED"
  > = ["DRAFT", "CONFIRMED", "DEPARTED", "IN_PROGRESS", "COMPLETED"];
  const manifestIds: string[] = [];

  for (const schedule of departedSchedules) {
    const manifest = await prisma.manifest.create({
      data: {
        code: generateCode("MNF"),
        scheduleId: schedule.id,
        name: `${schedule.package.type} - ${schedule.departureDate.toLocaleDateString("id-ID")}`,
        businessType: schedule.package.type,
        departureDate: schedule.departureDate,
        returnDate: schedule.returnDate,
        status: randomItem(manifestStatuses),
        leaderName: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
      },
    });
    manifestIds.push(manifest.id);

    // Add participants
    const bookings = await prisma.booking.findMany({
      where: {
        scheduleId: schedule.id,
        status: { in: ["CONFIRMED", "READY", "DEPARTED", "COMPLETED"] },
      },
      include: { customer: true },
      take: randomInt(15, 30),
    });

    let orderNo = 1;
    for (const booking of bookings) {
      await prisma.manifestParticipant.create({
        data: {
          manifestId: manifest.id,
          customerId: booking.customerId,
          orderNo: orderNo++,
        },
      });
    }
  }
  console.log(`  ✅ ${manifestIds.length} manifests seeded with participants`);

  // ============================================================
  // 16. FLIGHTS
  // ============================================================
  console.log("📌 Seeding Flights...");

  const routes = [
    {
      origin: "Jakarta",
      originAirport: "CGK",
      dest: "Jeddah",
      destAirport: "JED",
      airlines: ["GA", "SV", "EK"],
    },
    {
      origin: "Jakarta",
      originAirport: "CGK",
      dest: "Madinah",
      destAirport: "MED",
      airlines: ["GA", "SV"],
    },
    {
      origin: "Surabaya",
      originAirport: "SUB",
      dest: "Jeddah",
      destAirport: "JED",
      airlines: ["GA", "SV"],
    },
    {
      origin: "Jakarta",
      originAirport: "CGK",
      dest: "Singapore",
      destAirport: "SIN",
      airlines: ["GA", "SQ"],
    },
    {
      origin: "Jakarta",
      originAirport: "CGK",
      dest: "Tokyo",
      destAirport: "NRT",
      airlines: ["GA", "JL", "NH"],
    },
    {
      origin: "Jakarta",
      originAirport: "CGK",
      dest: "Bangkok",
      destAirport: "BKK",
      airlines: ["GA", "TG"],
    },
  ];

  let flightCount = 0;
  for (let i = 0; i < 50; i++) {
    const route = randomItem(routes);
    const airlineCode = randomItem(route.airlines);
    const flightDate = randomDate(
      new Date(),
      new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    );

    await prisma.flight.create({
      data: {
        airlineId: airlineIds[airlineCode],
        flightNumber: `${airlineCode}${randomInt(100, 999)}`,
        originCity: route.origin,
        originAirport: route.originAirport,
        destCity: route.dest,
        destAirport: route.destAirport,
        date: flightDate,
        departureTime: `${randomInt(0, 23).toString().padStart(2, "0")}:${randomItem(["00", "15", "30", "45"])}`,
        arrivalTime: `${randomInt(0, 23).toString().padStart(2, "0")}:${randomItem(["00", "15", "30", "45"])}`,
      },
    });
    flightCount++;
  }
  console.log(`  ✅ ${flightCount} flights seeded`);

  // ============================================================
  // 17. ROOMING
  // ============================================================
  console.log("📌 Seeding Rooming...");

  const manifestsWithParticipants = await prisma.manifest.findMany({
    where: { id: { in: manifestIds } },
    include: { participants: { include: { customer: true } } },
  });

  const makkahHotels = Object.entries(hotelIds).filter(
    ([name]) =>
      name.includes("Makkah") ||
      name.includes("Swissotel") ||
      name.includes("Hilton"),
  );
  const madinahHotels = Object.entries(hotelIds).filter(
    ([name]) =>
      name.includes("Madinah") ||
      name.includes("Oberoi") ||
      name.includes("Dar Al"),
  );

  let roomingCount = 0;
  for (const manifest of manifestsWithParticipants) {
    if (manifest.businessType !== "UMROH" && manifest.businessType !== "HAJI")
      continue;

    const makkahHotel = randomItem(makkahHotels);
    const madinahHotel = randomItem(madinahHotels);

    let roomNo = 100;
    for (const participant of manifest.participants) {
      // Makkah room
      await prisma.rooming.create({
        data: {
          manifestId: manifest.id,
          hotelId: makkahHotel[1],
          customerId: participant.customerId,
          roomNumber: String(roomNo),
          roomType: randomItem(["QUAD", "TRIPLE", "DOUBLE"]),
          checkIn: manifest.departureDate,
          checkOut: new Date(
            manifest.departureDate.getTime() + 4 * 24 * 60 * 60 * 1000,
          ),
        },
      });

      // Madinah room
      await prisma.rooming.create({
        data: {
          manifestId: manifest.id,
          hotelId: madinahHotel[1],
          customerId: participant.customerId,
          roomNumber: String(roomNo),
          roomType: randomItem(["QUAD", "TRIPLE", "DOUBLE"]),
          checkIn: new Date(
            manifest.departureDate.getTime() + 4 * 24 * 60 * 60 * 1000,
          ),
          checkOut: manifest.returnDate,
        },
      });

      roomingCount += 2;
      if (roomingCount % 4 === 0) roomNo++;
    }
  }
  console.log(`  ✅ ${roomingCount} rooming entries seeded`);

  // ============================================================
  // 18. VOUCHERS & PROMOTIONS
  // ============================================================
  console.log("📌 Seeding Vouchers & Promotions...");

  const vouchersData = [
    {
      code: "WELCOME10",
      name: "Welcome Discount 10%",
      type: "PERCENTAGE" as const,
      value: 10,
      minPurchase: 10000000,
      maxDiscount: 2000000,
      quota: 100,
    },
    {
      code: "RAMADHAN2024",
      name: "Promo Ramadhan",
      type: "PERCENTAGE" as const,
      value: 15,
      minPurchase: 20000000,
      maxDiscount: 5000000,
      quota: 50,
    },
    {
      code: "EARLYBIRD",
      name: "Early Bird Discount",
      type: "FIXED_AMOUNT" as const,
      value: 1500000,
      minPurchase: 15000000,
      quota: 30,
    },
    {
      code: "VIP500K",
      name: "VIP Member Discount",
      type: "FIXED_AMOUNT" as const,
      value: 500000,
      minPurchase: 5000000,
      quota: 200,
    },
    {
      code: "FLASH50",
      name: "Flash Sale 50%",
      type: "PERCENTAGE" as const,
      value: 50,
      minPurchase: 30000000,
      maxDiscount: 10000000,
      quota: 10,
    },
    {
      code: "REFERRAL1M",
      name: "Referral Bonus",
      type: "FIXED_AMOUNT" as const,
      value: 1000000,
      minPurchase: 20000000,
      quota: 100,
    },
  ];

  for (const v of vouchersData) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    await prisma.voucher.upsert({
      where: { tenantId_code: { tenantId, code: v.code } },
      update: {},
      create: {
        tenantId,
        ...v,
        used: randomInt(0, Math.floor((v.quota || 100) * 0.5)),
        startDate,
        endDate,
        isActive: true,
      },
    });
  }
  console.log(`  ✅ ${vouchersData.length} vouchers seeded`);

  const promotionsData = [
    {
      title: "Umroh Awal Tahun 2024",
      slug: "umroh-awal-tahun-2024",
      type: "EARLY_BIRD" as const,
      discountType: "PERCENTAGE" as const,
      discountValue: 10,
      description: "Diskon spesial untuk pendaftaran umroh awal tahun",
    },
    {
      title: "Flash Sale Akhir Tahun",
      slug: "flash-sale-akhir-tahun",
      type: "FLASH_SALE" as const,
      discountType: "FIXED_AMOUNT" as const,
      discountValue: 3000000,
      description: "Potongan langsung 3 juta untuk semua paket",
    },
    {
      title: "Promo Ramadhan Berkah",
      slug: "promo-ramadhan-berkah",
      type: "SEASONAL" as const,
      discountType: "PERCENTAGE" as const,
      discountValue: 20,
      description: "Promo spesial bulan Ramadhan",
    },
    {
      title: "Paket Keluarga Hemat",
      slug: "paket-keluarga-hemat",
      type: "GROUP_DISCOUNT" as const,
      discountType: "PERCENTAGE" as const,
      discountValue: 15,
      description: "Diskon untuk booking minimal 4 orang",
    },
  ];

  for (const p of promotionsData) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 2);

    await prisma.promotion.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        tenantId,
        ...p,
        startDate,
        endDate,
        quota: randomInt(20, 100),
        showOnHome: true,
        isFeatured: randomInt(0, 1) === 1,
        isActive: true,
      },
    });
  }
  console.log(`  ✅ ${promotionsData.length} promotions seeded`);

  // ============================================================
  // 19. TICKETS (Support)
  // ============================================================
  console.log("📌 Seeding Support Tickets...");

  const ticketCategories = [
    "Booking",
    "Payment",
    "Document",
    "Refund",
    "General",
    "Complaint",
  ];
  const ticketSubjects = [
    "Bagaimana cara mengubah jadwal keberangkatan?",
    "Pembayaran tidak terverifikasi",
    "Dokumen visa ditolak",
    "Request refund pembatalan",
    "Pertanyaan tentang fasilitas hotel",
    "Keluhan pelayanan tour leader",
    "Bagaimana upload foto paspor?",
    "Promo code tidak bisa dipakai",
    "Minta invoice resmi",
    "Pertanyaan tentang asuransi perjalanan",
  ];

  const ticketPriorities: Array<"LOW" | "MEDIUM" | "HIGH" | "URGENT"> = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
  ];
  const ticketStatuses: Array<
    "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED"
  > = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];

  for (let i = 0; i < 30; i++) {
    const customerId = randomItem(customerIds);
    const status = randomItem(ticketStatuses);

    const ticket = await prisma.ticket.create({
      data: {
        ticketNo: generateCode("TKT"),
        customerId,
        subject: randomItem(ticketSubjects),
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        category: randomItem(ticketCategories),
        priority: randomItem(ticketPriorities),
        status,
        resolvedAt:
          status === "RESOLVED" || status === "CLOSED" ? new Date() : null,
        resolution:
          status === "RESOLVED" || status === "CLOSED"
            ? "Masalah telah diselesaikan."
            : null,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      },
    });

    // Add comments
    const numComments = randomInt(1, 5);
    const users = await prisma.user.findMany({ take: 5 });
    for (let j = 0; j < numComments; j++) {
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          userId: randomItem(users).id,
          comment: randomItem([
            "Terima kasih atas pertanyaannya. Kami akan segera memproses.",
            "Mohon tunggu 1-2 hari kerja untuk verifikasi.",
            "Apakah ada informasi tambahan yang bisa diberikan?",
            "Masalah sudah kami eskalasi ke tim terkait.",
            "Terima kasih atas kesabarannya.",
          ]),
          isInternal: randomInt(0, 1) === 1,
        },
      });
    }
  }
  console.log(`  ✅ 30 support tickets seeded with comments`);

  // ============================================================
  // 20. LEADS
  // ============================================================
  console.log("📌 Seeding Leads...");

  const leadStatuses: Array<
    | "NEW"
    | "CONTACTED"
    | "QUALIFIED"
    | "PROPOSAL"
    | "NEGOTIATION"
    | "WON"
    | "LOST"
  > = [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL",
    "NEGOTIATION",
    "WON",
    "LOST",
  ];

  for (let i = 0; i < 50; i++) {
    await prisma.lead.create({
      data: {
        tenantId,
        name: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
        email: `lead${i + 1}@email.com`,
        phone: `08${randomInt(11, 99)}${randomInt(1000000, 9999999)}`,
        source: randomItem([
          "Website",
          "Instagram",
          "Facebook",
          "Referral",
          "Walk-in",
          "Phone",
          "WhatsApp",
        ]),
        interest: randomItem([
          "Umroh Regular",
          "Umroh VIP",
          "Haji Khusus",
          "Tour Jepang",
          "Tour Eropa",
          "Tour Turki",
        ]),
        status: randomItem(leadStatuses),
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      },
    });
  }
  console.log(`  ✅ 50 leads seeded`);

  // ============================================================
  // 21. CAMPAIGNS
  // ============================================================
  console.log("📌 Seeding Campaigns...");

  const campaignsData = [
    {
      name: "Newsletter Januari 2024",
      type: "EMAIL" as const,
      subject: "Promo Umroh Awal Tahun!",
      content: "<h1>Promo Spesial</h1><p>Dapatkan diskon hingga 20%</p>",
    },
    {
      name: "WhatsApp Blast Ramadhan",
      type: "WHATSAPP" as const,
      content:
        "Assalamualaikum, dapatkan promo spesial Ramadhan! Hubungi kami sekarang.",
    },
    {
      name: "SMS Reminder Payment",
      type: "SMS" as const,
      content:
        "Reminder: Pembayaran Anda jatuh tempo dalam 3 hari. Segera lakukan pembayaran.",
    },
    {
      name: "Email Flash Sale",
      type: "EMAIL" as const,
      subject: "FLASH SALE 24 JAM!",
      content: "<h1>Flash Sale!</h1><p>Diskon 50% hanya hari ini!</p>",
    },
  ];

  const campaignStatuses: Array<"DRAFT" | "SCHEDULED" | "SENT"> = [
    "DRAFT",
    "SCHEDULED",
    "SENT",
  ];
  const users = await prisma.user.findMany({ take: 1 });

  for (const c of campaignsData) {
    await prisma.campaign.create({
      data: {
        tenantId,
        ...c,
        status: randomItem(campaignStatuses),
        createdBy: users[0]?.id || "system",
        stats: {
          sent: randomInt(100, 1000),
          opened: randomInt(50, 500),
          clicked: randomInt(10, 100),
        },
      },
    });
  }
  console.log(`  ✅ ${campaignsData.length} campaigns seeded`);

  // ============================================================
  // 22. EXPENSES
  // ============================================================
  console.log("📌 Seeding Expenses...");

  const expenseCategories: Array<
    | "ACCOMMODATION"
    | "TRANSPORTATION"
    | "MEALS"
    | "GUIDE_FEE"
    | "VISA"
    | "INSURANCE"
    | "EQUIPMENT"
    | "MARKETING"
    | "OFFICE"
    | "SALARY"
  > = [
    "ACCOMMODATION",
    "TRANSPORTATION",
    "MEALS",
    "GUIDE_FEE",
    "VISA",
    "INSURANCE",
    "EQUIPMENT",
    "MARKETING",
    "OFFICE",
    "SALARY",
  ];
  const expenseStatuses: Array<"PENDING" | "APPROVED" | "PAID"> = [
    "PENDING",
    "APPROVED",
    "PAID",
  ];

  for (let i = 0; i < 50; i++) {
    await prisma.expense.create({
      data: {
        tenantId,
        description: `${randomItem(["Pembayaran", "Biaya", "Fee", "Tagihan"])} ${randomItem(["hotel", "transportasi", "makan", "guide", "visa", "asuransi"])}`,
        amount: randomInt(500000, 50000000),
        category: randomItem(expenseCategories),
        vendor: randomItem([
          "PT ABC",
          "CV XYZ",
          "Hotel Makkah",
          "Garuda Indonesia",
          "Local Agent",
        ]),
        expenseDate: randomDate(new Date(2024, 0, 1), new Date()),
        status: randomItem(expenseStatuses),
      },
    });
  }
  console.log(`  ✅ 50 expenses seeded`);

  // ============================================================
  // 23. COMMISSIONS
  // ============================================================
  console.log("📌 Seeding Commissions...");

  const agents = await prisma.agent.findMany();
  const salesList = await prisma.sales.findMany();
  const paidBookings = await prisma.booking.findMany({
    where: { paymentStatus: "PAID" },
    take: 30,
  });

  const commissionStatuses: Array<"PENDING" | "APPROVED" | "PAID"> = [
    "PENDING",
    "APPROVED",
    "PAID",
  ];

  for (const booking of paidBookings) {
    const hasAgent = randomInt(0, 1) === 1;
    const agent = hasAgent ? randomItem(agents) : null;
    const sales =
      !hasAgent && salesList.length > 0 ? randomItem(salesList) : null;

    const rate = agent
      ? Number(agent.commissionRate)
      : sales
        ? Number(sales.commissionRate)
        : 3;
    const amount = Number(booking.totalPrice) * (rate / 100);

    await prisma.commission.create({
      data: {
        bookingId: booking.id,
        agentId: agent?.id,
        salesId: sales?.id,
        amount,
        rate,
        status: randomItem(commissionStatuses),
      },
    });
  }
  console.log(`  ✅ ${paidBookings.length} commissions seeded`);

  // ============================================================
  // 24. DEVICES & TRACKING
  // ============================================================
  console.log("📌 Seeding Devices & Tracking...");

  const deviceTypes: Array<"SMART_CARD" | "WRISTBAND" | "SMART_TAG"> = [
    "SMART_CARD",
    "WRISTBAND",
    "SMART_TAG",
  ];
  const deviceStatuses: Array<"ACTIVE" | "INACTIVE"> = ["ACTIVE", "INACTIVE"];

  for (let i = 0; i < 30; i++) {
    const device = await prisma.device.create({
      data: {
        tenantId,
        type: randomItem(deviceTypes),
        serialNumber: `DEV-${Date.now().toString(36).toUpperCase()}${randomInt(1000, 9999)}`,
        macAddress: `${randomInt(10, 99)}:${randomInt(10, 99)}:${randomInt(10, 99)}:${randomInt(10, 99)}:${randomInt(10, 99)}:${randomInt(10, 99)}`,
        batteryLevel: randomInt(20, 100),
        status: randomItem(deviceStatuses),
        lastSeen: new Date(),
      },
    });

    // Add some locations
    for (let j = 0; j < randomInt(5, 20); j++) {
      await prisma.location.create({
        data: {
          deviceId: device.id,
          latitude: 21.4225 + (Math.random() - 0.5) * 0.01, // Around Makkah
          longitude: 39.8262 + (Math.random() - 0.5) * 0.01,
          accuracy: randomInt(5, 50),
          source: randomItem(["GPS", "BEACON", "WIFI"]) as
            | "GPS"
            | "BEACON"
            | "WIFI",
          timestamp: randomDate(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            new Date(),
          ),
        },
      });
    }
  }
  console.log(`  ✅ 30 devices seeded with location history`);

  // ============================================================
  // 25. ALERTS
  // ============================================================
  console.log("📌 Seeding Alerts...");

  const alertTypes: Array<
    "GEOFENCE_EXIT" | "SOS_TRIGGERED" | "LOW_BATTERY" | "NO_MOVEMENT"
  > = ["GEOFENCE_EXIT", "SOS_TRIGGERED", "LOW_BATTERY", "NO_MOVEMENT"];
  const alertSeverities: Array<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"> = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
  ];
  const alertStatuses: Array<"ACTIVE" | "ACKNOWLEDGED" | "RESOLVED"> = [
    "ACTIVE",
    "ACKNOWLEDGED",
    "RESOLVED",
  ];

  for (let i = 0; i < 20; i++) {
    const alertType = randomItem(alertTypes);
    await prisma.alert.create({
      data: {
        tenantId,
        type: alertType,
        severity:
          alertType === "SOS_TRIGGERED"
            ? "CRITICAL"
            : randomItem(alertSeverities),
        title:
          alertType === "GEOFENCE_EXIT"
            ? "Jamaah keluar area"
            : alertType === "SOS_TRIGGERED"
              ? "SOS Emergency!"
              : alertType === "LOW_BATTERY"
                ? "Baterai device rendah"
                : "Tidak ada pergerakan",
        message: "Alert triggered by system monitoring",
        status: randomItem(alertStatuses),
        latitude: 21.4225 + (Math.random() - 0.5) * 0.01,
        longitude: 39.8262 + (Math.random() - 0.5) * 0.01,
        createdAt: randomDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(),
        ),
      },
    });
  }
  console.log(`  ✅ 20 alerts seeded`);

  // ============================================================
  // 26. LOYALTY POINTS
  // ============================================================
  console.log("📌 Seeding Loyalty Points...");

  const vipCustomers = await prisma.customer.findMany({
    where: { customerType: "VIP" },
    take: 20,
  });

  for (const customer of vipCustomers) {
    // Earn points
    for (let i = 0; i < randomInt(2, 5); i++) {
      await prisma.loyaltyPoint.create({
        data: {
          customerId: customer.id,
          points: randomInt(100, 1000),
          type: "EARN",
          description: randomItem([
            "Booking completed",
            "Referral bonus",
            "Birthday bonus",
            "Review bonus",
          ]),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Redeem points (some customers)
    if (randomInt(0, 1) === 1) {
      await prisma.loyaltyPoint.create({
        data: {
          customerId: customer.id,
          points: -randomInt(50, 300),
          type: "REDEEM",
          description: "Redeemed for discount",
        },
      });
    }
  }
  console.log(`  ✅ Loyalty points seeded for VIP customers`);

  // ============================================================
  // 27. REFERRALS
  // ============================================================
  console.log("📌 Seeding Referrals...");

  const referralStatuses: Array<
    "PENDING" | "REGISTERED" | "CONVERTED" | "REWARDED"
  > = ["PENDING", "REGISTERED", "CONVERTED", "REWARDED"];

  for (let i = 0; i < 20; i++) {
    const referrerId = randomItem(customerIds);
    const referredId =
      randomInt(0, 1) === 1
        ? randomItem(customerIds.filter((id) => id !== referrerId))
        : null;

    await prisma.referral.create({
      data: {
        tenantId,
        code: generateCode("REF"),
        referrerId,
        referredId,
        referredName: referredId
          ? null
          : `${randomItem(firstNames)} ${randomItem(lastNames)}`,
        referredPhone: referredId
          ? null
          : `08${randomInt(11, 99)}${randomInt(1000000, 9999999)}`,
        rewardType: "FIXED",
        rewardValue: 500000,
        status: randomItem(referralStatuses),
      },
    });
  }
  console.log(`  ✅ 20 referrals seeded`);

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n============================================================");
  console.log("          🎉 COMPREHENSIVE SEED COMPLETED! 🎉");
  console.log("============================================================\n");
  console.log("Summary of seeded data:");
  console.log("  - Currencies: 7");
  console.log("  - Languages: 5");
  console.log("  - Countries: 10");
  console.log("  - Cities: 21");
  console.log("  - Airlines: 15");
  console.log("  - Hotels: 24");
  console.log("  - Banks: 7");
  console.log("  - Suppliers: 7");
  console.log("  - Branches: 5");
  console.log("  - Warehouses: 3");
  console.log("  - Products: 15 (with stock)");
  console.log("  - Packages: 10");
  console.log("  - Schedules: ~50");
  console.log("  - Customers: 150");
  console.log("  - Bookings: ~100");
  console.log("  - Payments: ~150");
  console.log("  - Invoices: ~40");
  console.log("  - Manifests: ~10 (with participants)");
  console.log("  - Flights: 50");
  console.log("  - Rooming: ~200");
  console.log("  - Vouchers: 6");
  console.log("  - Promotions: 4");
  console.log("  - Tickets: 30");
  console.log("  - Leads: 50");
  console.log("  - Campaigns: 4");
  console.log("  - Expenses: 50");
  console.log("  - Commissions: ~30");
  console.log("  - Devices: 30 (with locations)");
  console.log("  - Alerts: 20");
  console.log("  - Loyalty Points: ~60");
  console.log("  - Referrals: 20");
  console.log("\n============================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
