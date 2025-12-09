# ERD - Entity Relationship Diagram
## Sistem Informasi Travel MULTI-PURPOSE

---

## 1. OVERVIEW

Total Tables: **80+ tables** organized into modules:
- Tenant & Configuration (5 tables)
- Auth & User (5 tables)
- Destination & Package (12 tables)
- Customer & CRM (10 tables)
- Booking & Transaction (8 tables)
- Payment & Finance (10 tables)
- Operasional (8 tables)
- Inventory (6 tables)
- HRIS (8 tables)
- Agent & Sales (5 tables)
- Marketing (5 tables)
- IoT & Tracking (8 tables)
- Umroh/Haji Specific (4 tables)
- MICE Specific (4 tables)
- CMS (4 tables)
- System (3 tables)

---

## 2. PRISMA SCHEMA

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// TENANT & CONFIGURATION (Multi-tenant support)
// ============================================================

model Tenant {
  id              String   @id @default(cuid())
  name            String
  subdomain       String   @unique
  domain          String?  @unique
  logo            String?
  
  // Business Configuration
  businessTypes   BusinessType[]
  defaultCurrency String   @default("IDR")
  currencies      Json     // Supported currencies
  defaultLanguage String   @default("id")
  languages       Json     // Supported languages
  timezone        String   @default("Asia/Jakarta")
  
  // Feature Flags
  features        Json     // FeatureFlags object
  
  // Terminology customization
  terminology     Json?    // Custom terminology mapping
  
  // Theme
  theme           Json?    // Theme configuration
  
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  users           User[]
  customers       Customer[]
  packages        Package[]
  bookings        Booking[]
  settings        Setting[]
  
  @@map("tenants")
}

enum BusinessType {
  UMROH
  HAJI
  OUTBOUND
  INBOUND
  DOMESTIC
  MICE
  CRUISE
  CUSTOM
}

model FeatureConfig {
  id          String   @id @default(cuid())
  tenantId    String
  feature     String   // Feature name
  enabled     Boolean  @default(false)
  config      Json?    // Additional config
  
  @@unique([tenantId, feature])
  @@map("feature_configs")
}

model Currency {
  id          String   @id @default(cuid())
  code        String   @unique  // USD, IDR, SAR, etc
  name        String
  symbol      String
  rate        Decimal  @db.Decimal(15, 6)  // Rate to base (IDR)
  isBase      Boolean  @default(false)
  isActive    Boolean  @default(true)
  
  updatedAt   DateTime @updatedAt
  
  @@map("currencies")
}

model Language {
  id          String   @id @default(cuid())
  code        String   @unique  // id, en, ar, jp, kr
  name        String
  nativeName  String
  direction   String   @default("ltr")  // ltr, rtl
  isActive    Boolean  @default(true)
  
  @@map("languages")
}

// ============================================================
// AUTH & USER
// ============================================================

model User {
  id              String    @id @default(cuid())
  tenantId        String
  email           String
  password        String
  nama            String
  avatar          String?
  phone           String?
  preferredLanguage String?
  preferredCurrency String?
  isActive        Boolean   @default(true)
  emailVerified   DateTime?
  twoFactorEnabled Boolean  @default(false)
  twoFactorSecret String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLoginAt     DateTime?
  
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  roles           UserRole[]
  logs            AuditLog[]
  customer        Customer?
  employee        Employee?
  agent           Agent?
  sales           Sales?
  notifications   Notification[]
  
  @@unique([tenantId, email])
  @@map("users")
}

model Role {
  id          String     @id @default(cuid())
  tenantId    String?    // null = system role
  name        String
  displayName Json       // Localized display name
  description Json?      // Localized description
  permissions Json
  isSystem    Boolean    @default(false)
  
  users       UserRole[]
  
  @@unique([tenantId, name])
  @@map("roles")
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@unique([userId, roleId])
  @@map("user_roles")
}

// ============================================================
// DESTINATION & PACKAGE
// ============================================================

model Country {
  id              String   @id @default(cuid())
  code            String   @unique  // ISO code
  name            Json     // Localized name
  continent       String
  currency        String
  timezone        String
  visaRequired    Boolean  @default(true)
  visaOnArrival   Boolean  @default(false)
  flagUrl         String?
  isActive        Boolean  @default(true)
  
  cities          City[]
  visaRequirements VisaRequirement[]
  
  @@map("countries")
}

model City {
  id          String   @id @default(cuid())
  countryCode String
  name        Json     // Localized name
  timezone    String?
  airports    Json?    // Array of airport codes
  isPopular   Boolean  @default(false)
  imageUrl    String?
  
  country     Country  @relation(fields: [countryCode], references: [code])
  pois        PointOfInterest[]
  hotels      Hotel[]
  
  @@map("cities")
}

model PointOfInterest {
  id          String   @id @default(cuid())
  cityId      String
  type        POIType
  name        Json     // Localized
  description Json?    // Localized
  address     String?
  latitude    Float?
  longitude   Float?
  images      Json?
  rating      Float?
  priceRange  String?  // $, $$, $$$
  openingHours Json?
  tags        Json?
  isActive    Boolean  @default(true)
  
  city        City     @relation(fields: [cityId], references: [id])
  
  @@map("points_of_interest")
}

enum POIType {
  ATTRACTION
  RESTAURANT
  SHOPPING
  MOSQUE
  TEMPLE
  CHURCH
  MUSEUM
  PARK
  BEACH
  OTHER
}

model VisaRequirement {
  id              String   @id @default(cuid())
  countryCode     String
  passportCountry String   // Passport holder country
  visaType        String   // Tourist, Business, Umroh, etc
  required        Boolean
  onArrival       Boolean  @default(false)
  eVisa           Boolean  @default(false)
  duration        Int?     // Max stay in days
  processingDays  Int?
  fee             Decimal? @db.Decimal(15, 2)
  feeCurrency     String?
  documents       Json     // Required documents
  notes           Json?    // Localized notes
  
  country         Country  @relation(fields: [countryCode], references: [code])
  
  @@unique([countryCode, passportCountry, visaType])
  @@map("visa_requirements")
}

model Hotel {
  id          String    @id @default(cuid())
  cityId      String
  name        String
  stars       Int
  address     String?
  latitude    Float?
  longitude   Float?
  distanceToCenter String?
  distanceToMasjid String?  // For Makkah/Madinah
  facilities  Json?
  images      Json?
  isActive    Boolean   @default(true)
  
  city        City      @relation(fields: [cityId], references: [id])
  packageHotels PackageHotel[]
  rooming     Rooming[]
  
  @@map("hotels")
}

model Package {
  id              String      @id @default(cuid())
  tenantId        String
  code            String
  type            BusinessType
  name            Json        // Localized
  description     Json?       // Localized
  
  // Destination
  destinations    Json        // Array of country/city codes
  
  // Duration
  duration        Int         // Days
  nights          Int
  
  // Pricing (base prices in IDR)
  priceQuad       Decimal     @db.Decimal(15, 2)
  priceTriple     Decimal     @db.Decimal(15, 2)
  priceDouble     Decimal     @db.Decimal(15, 2)
  priceSingle     Decimal?    @db.Decimal(15, 2)
  childPrice      Decimal?    @db.Decimal(15, 2)
  infantPrice     Decimal?    @db.Decimal(15, 2)
  
  // Multi-currency prices (pre-calculated)
  pricesMultiCurrency Json?
  
  // Inclusions/Exclusions
  inclusions      Json?       // Localized
  exclusions      Json?       // Localized
  
  // Media
  thumbnail       String?
  images          Json?
  video           String?
  
  // Settings
  minPax          Int         @default(1)
  maxPax          Int?
  isActive        Boolean     @default(true)
  isFeatured      Boolean     @default(false)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  tenant          Tenant      @relation(fields: [tenantId], references: [id])
  hotels          PackageHotel[]
  itinerary       PackageItinerary[]
  schedules       Schedule[]
  bookings        Booking[]
  seasonalPrices  SeasonalPrice[]
  
  @@unique([tenantId, code])
  @@map("packages")
}

model PackageHotel {
  id          String   @id @default(cuid())
  packageId   String
  hotelId     String
  cityId      String
  nights      Int
  order       Int
  
  package     Package  @relation(fields: [packageId], references: [id], onDelete: Cascade)
  hotel       Hotel    @relation(fields: [hotelId], references: [id])
  
  @@map("package_hotels")
}

model PackageItinerary {
  id          String   @id @default(cuid())
  packageId   String
  day         Int
  title       Json     // Localized
  description Json?    // Localized
  activities  Json     // Array of activities (localized)
  meals       Json?    // B, L, D
  hotel       String?
  
  package     Package  @relation(fields: [packageId], references: [id], onDelete: Cascade)
  
  @@unique([packageId, day])
  @@map("package_itineraries")
}

model SeasonalPrice {
  id          String   @id @default(cuid())
  packageId   String
  name        String   // Peak Season, Low Season, etc
  startDate   DateTime
  endDate     DateTime
  adjustment  Decimal  @db.Decimal(15, 2)  // Amount or percentage
  isPercentage Boolean @default(false)
  
  package     Package  @relation(fields: [packageId], references: [id], onDelete: Cascade)
  
  @@map("seasonal_prices")
}

model Airline {
  id        String   @id @default(cuid())
  code      String   @unique
  name      String
  logo      String?
  isActive  Boolean  @default(true)
  
  flights   Flight[]
  
  @@map("airlines")
}

// ============================================================
// CUSTOMER & CRM
// ============================================================

model Customer {
  id              String   @id @default(cuid())
  tenantId        String
  code            String
  
  // Universal fields
  fullName        String
  passportName    String?
  idNumber        String?  // KTP/NIK
  birthPlace      String?
  birthDate       DateTime?
  gender          Gender?
  nationality     String   @default("ID")
  
  // Address
  address         String?
  city            String?
  province        String?
  country         String   @default("ID")
  postalCode      String?
  
  // Contact
  phone           String
  phone2          String?
  email           String?
  whatsapp        String?
  
  // Passport
  passportNumber  String?
  passportIssuePlace String?
  passportIssueDate DateTime?
  passportExpiry  DateTime?
  
  // Preferences
  dietaryRequirements Json?
  specialNeeds    String?
  roomPreference  String?
  seatPreference  String?
  
  // Additional info
  occupation      String?
  bloodType       BloodType?
  shirtSize       String?
  shoeSize        Int?
  
  // Photo
  photo           String?
  
  // Source
  source          LeadSource?
  
  // Umroh-specific (nullable)
  fatherName      String?
  mahramId        String?
  maritalStatus   MaritalStatus?
  
  // Corporate (MICE)
  companyName     String?
  companyPosition String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  userId          String?  @unique
  user            User?    @relation(fields: [userId], references: [id])
  
  documents       Document[]
  emergencyContacts EmergencyContact[]
  family          FamilyMember[]
  bookings        Booking[]
  visaApplications VisaApplication[]
  
  // Tracking
  device          Device?
  locations       Location[]
  attendance      Attendance[]
  alerts          Alert[]
  faceData        FaceData?
  
  // CRM
  activities      LeadActivity[]
  tickets         Ticket[]
  loyaltyPoints   LoyaltyPoint[]
  
  @@unique([tenantId, code])
  @@index([fullName])
  @@index([phone])
  @@index([passportNumber])
  @@map("customers")
}

enum Gender {
  M
  F
}

enum BloodType {
  A
  B
  AB
  O
}

enum MaritalStatus {
  SINGLE
  MARRIED
  DIVORCED
  WIDOWED
}

enum LeadSource {
  WEBSITE
  REFERRAL
  AGENT
  SOCIAL_MEDIA
  WALK_IN
  PHONE
  EVENT
  CORPORATE
  OTHER
}

model EmergencyContact {
  id          String   @id @default(cuid())
  customerId  String
  name        String
  relationship String
  phone       String
  address     String?
  
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@map("emergency_contacts")
}

model FamilyMember {
  id          String   @id @default(cuid())
  customerId  String
  name        String
  relationship String
  phone       String?
  linkedCustomerId String?  // If also a customer
  
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@map("family_members")
}

model Document {
  id            String       @id @default(cuid())
  customerId    String
  type          DocumentType
  fileName      String
  url           String
  status        DocumentStatus @default(PENDING)
  extractedData Json?        // OCR data
  notes         String?
  verifiedAt    DateTime?
  verifiedBy    String?
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  customer      Customer     @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@map("documents")
}

enum DocumentType {
  PASSPORT
  KTP
  KK
  PHOTO_3X4
  PHOTO_4X6
  BIRTH_CERTIFICATE
  MARRIAGE_CERTIFICATE
  MAHRAM_LETTER
  HEALTH_CERTIFICATE
  VACCINATION_CARD
  VISA
  OTHER
}

enum DocumentStatus {
  PENDING
  VERIFIED
  REJECTED
  EXPIRED
}

model VisaApplication {
  id            String   @id @default(cuid())
  customerId    String
  countryCode   String
  visaType      String
  applicationDate DateTime
  appointmentDate DateTime?
  status        VisaStatus @default(PENDING)
  referenceNumber String?
  notes         String?
  
  customer      Customer @relation(fields: [customerId], references: [id])
  
  @@map("visa_applications")
}

enum VisaStatus {
  PENDING
  SUBMITTED
  APPOINTMENT_SCHEDULED
  PROCESSING
  APPROVED
  REJECTED
  COLLECTED
}

// CRM Models (same as before)
model LeadActivity {
  id          String   @id @default(cuid())
  customerId  String
  type        String
  subject     String
  description String?
  dueDate     DateTime?
  completedAt DateTime?
  createdBy   String
  createdAt   DateTime @default(now())
  
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@map("lead_activities")
}

model Ticket {
  id          String       @id @default(cuid())
  ticketNo    String       @unique
  customerId  String
  subject     String
  description String
  category    String
  priority    TicketPriority @default(MEDIUM)
  status      TicketStatus @default(OPEN)
  assignedTo  String?
  resolvedAt  DateTime?
  resolution  String?
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  customer    Customer     @relation(fields: [customerId], references: [id])
  comments    TicketComment[]
  
  @@map("tickets")
}

enum TicketPriority { LOW MEDIUM HIGH URGENT }
enum TicketStatus { OPEN IN_PROGRESS WAITING RESOLVED CLOSED }

model TicketComment {
  id        String   @id @default(cuid())
  ticketId  String
  userId    String
  comment   String
  isInternal Boolean @default(false)
  createdAt DateTime @default(now())
  
  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  
  @@map("ticket_comments")
}

model LoyaltyPoint {
  id          String   @id @default(cuid())
  customerId  String
  points      Int
  type        String
  description String
  referenceId String?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  
  customer    Customer @relation(fields: [customerId], references: [id])
  
  @@map("loyalty_points")
}

// ============================================================
// BOOKING & TRANSACTION
// ============================================================

model Schedule {
  id              String       @id @default(cuid())
  packageId       String
  departureDate   DateTime
  returnDate      DateTime
  quota           Int
  availableQuota  Int
  status          ScheduleStatus @default(OPEN)
  notes           String?
  
  // Price override (optional)
  priceOverride   Json?
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  package         Package      @relation(fields: [packageId], references: [id])
  bookings        Booking[]
  manifests       Manifest[]
  
  @@map("schedules")
}

enum ScheduleStatus {
  OPEN
  ALMOST_FULL
  FULL
  CLOSED
  DEPARTED
  COMPLETED
}

model Booking {
  id              String        @id @default(cuid())
  tenantId        String
  bookingCode     String
  customerId      String
  packageId       String
  scheduleId      String
  
  // Booking details
  businessType    BusinessType
  roomType        RoomType
  pax             Int           @default(1)
  
  // Pricing
  basePrice       Decimal       @db.Decimal(15, 2)
  discount        Decimal       @default(0) @db.Decimal(15, 2)
  additionalFees  Decimal       @default(0) @db.Decimal(15, 2)
  totalPrice      Decimal       @db.Decimal(15, 2)
  currency        String        @default("IDR")
  
  // Status
  status          BookingStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  
  // Add-ons
  addOns          Json?
  notes           String?
  
  // Source
  source          String?       // online, offline, agent
  agentId         String?
  salesId         String?
  voucherId       String?
  
  // Corporate (MICE)
  corporateId     String?
  poNumber        String?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  cancelledAt     DateTime?
  cancelReason    String?
  
  tenant          Tenant        @relation(fields: [tenantId], references: [id])
  customer        Customer      @relation(fields: [customerId], references: [id])
  package         Package       @relation(fields: [packageId], references: [id])
  schedule        Schedule      @relation(fields: [scheduleId], references: [id])
  agent           Agent?        @relation(fields: [agentId], references: [id])
  sales           Sales?        @relation(fields: [salesId], references: [id])
  voucher         Voucher?      @relation(fields: [voucherId], references: [id])
  
  payments        Payment[]
  invoices        Invoice[]
  commissions     Commission[]
  
  @@unique([tenantId, bookingCode])
  @@map("bookings")
}

enum RoomType {
  QUAD
  TRIPLE
  DOUBLE
  TWIN
  SINGLE
}

enum BookingStatus {
  PENDING
  CONFIRMED
  PROCESSING
  READY
  DEPARTED
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
  REFUNDED
}

// Additional Transactions (non-package)
model Transaction {
  id            String          @id @default(cuid())
  tenantId      String
  code          String
  type          TransactionType
  customerId    String?
  
  details       Json
  subtotal      Decimal         @db.Decimal(15, 2)
  discount      Decimal         @default(0) @db.Decimal(15, 2)
  tax           Decimal         @default(0) @db.Decimal(15, 2)
  total         Decimal         @db.Decimal(15, 2)
  currency      String          @default("IDR")
  
  status        String          @default("PENDING")
  
  agentId       String?
  salesId       String?
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  @@unique([tenantId, code])
  @@map("transactions")
}

enum TransactionType {
  LAND_ARRANGEMENT
  HOTEL_ONLY
  FLIGHT_ONLY
  VISA_ONLY
  TRANSFER
  ACTIVITY
  INSURANCE
  OTHER
}

// ============================================================
// PAYMENT & FINANCE (Same structure, add multi-currency)
// ============================================================

model Payment {
  id              String         @id @default(cuid())
  paymentCode     String         @unique
  bookingId       String
  
  amount          Decimal        @db.Decimal(15, 2)
  currency        String         @default("IDR")
  amountInBase    Decimal        @db.Decimal(15, 2)  // Converted to base currency
  exchangeRate    Decimal        @default(1) @db.Decimal(15, 6)
  
  method          PaymentMethod
  status          PaymentStatus2 @default(PENDING)
  
  gatewayId       String?
  gatewayResponse Json?
  
  proofUrl        String?
  transferDate    DateTime?
  
  verifiedAt      DateTime?
  verifiedBy      String?
  notes           String?
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  booking         Booking        @relation(fields: [bookingId], references: [id])
  
  @@map("payments")
}

enum PaymentMethod {
  BANK_TRANSFER
  VIRTUAL_ACCOUNT
  CREDIT_CARD
  QRIS
  E_WALLET
  PAYPAL
  CASH
}

enum PaymentStatus2 {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  EXPIRED
  REFUNDED
}

model Invoice {
  id          String   @id @default(cuid())
  invoiceNo   String   @unique
  bookingId   String
  
  subtotal    Decimal  @db.Decimal(15, 2)
  discount    Decimal  @default(0) @db.Decimal(15, 2)
  tax         Decimal  @default(0) @db.Decimal(15, 2)
  total       Decimal  @db.Decimal(15, 2)
  currency    String   @default("IDR")
  
  paidAmount  Decimal  @default(0) @db.Decimal(15, 2)
  balance     Decimal  @db.Decimal(15, 2)
  
  dueDate     DateTime
  items       Json
  notes       String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  booking     Booking  @relation(fields: [bookingId], references: [id])
  
  @@map("invoices")
}

// Bank, ChartOfAccount, JournalEntry - same as before

model Bank {
  id          String   @id @default(cuid())
  tenantId    String?
  code        String
  name        String
  accountNo   String
  accountName String
  logo        String?
  isVA        Boolean  @default(false)
  vaPrefix    String?
  isActive    Boolean  @default(true)
  
  @@unique([tenantId, code])
  @@map("banks")
}

// ============================================================
// OPERASIONAL
// ============================================================

model Manifest {
  id              String         @id @default(cuid())
  code            String         @unique
  scheduleId      String
  name            String
  
  businessType    BusinessType
  departureDate   DateTime
  returnDate      DateTime
  
  // Transportation
  outboundFlightId String?
  returnFlightId   String?
  
  // Leader
  leaderId        String?
  leaderName      String?
  localGuideId    String?
  localGuideName  String?
  
  status          ManifestStatus @default(DRAFT)
  notes           String?
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  schedule        Schedule       @relation(fields: [scheduleId], references: [id])
  outboundFlight  Flight?        @relation("OutboundFlight", fields: [outboundFlightId], references: [id])
  returnFlight    Flight?        @relation("ReturnFlight", fields: [returnFlightId], references: [id])
  
  participants    ManifestParticipant[]
  rooming         Rooming[]
  groups          TripGroup[]
  attendance      Attendance[]
  alerts          Alert[]
  geofences       Geofence[]
  distributions   ItemDistribution[]
  
  @@map("manifests")
}

enum ManifestStatus {
  DRAFT
  CONFIRMED
  DEPARTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model ManifestParticipant {
  id          String     @id @default(cuid())
  manifestId  String
  customerId  String
  orderNo     Int
  groupId     String?
  
  manifest    Manifest   @relation(fields: [manifestId], references: [id], onDelete: Cascade)
  group       TripGroup? @relation(fields: [groupId], references: [id])
  
  @@unique([manifestId, customerId])
  @@map("manifest_participants")
}

model Flight {
  id            String   @id @default(cuid())
  airlineId     String
  flightNumber  String
  
  originCity    String
  originAirport String
  destCity      String
  destAirport   String
  
  date          DateTime
  departureTime String
  arrivalTime   String
  
  airline       Airline  @relation(fields: [airlineId], references: [id])
  outboundManifests Manifest[] @relation("OutboundFlight")
  returnManifests   Manifest[] @relation("ReturnFlight")
  
  @@map("flights")
}

model TripGroup {
  id          String   @id @default(cuid())
  manifestId  String
  name        String   // Group A, B, C atau Bus 1, 2, 3
  leaderId    String?
  vehicleNo   String?
  
  manifest    Manifest @relation(fields: [manifestId], references: [id], onDelete: Cascade)
  participants ManifestParticipant[]
  
  @@map("trip_groups")
}

model Rooming {
  id          String   @id @default(cuid())
  manifestId  String
  hotelId     String
  customerId  String
  roomNumber  String
  roomType    RoomType
  checkIn     DateTime?
  checkOut    DateTime?
  
  manifest    Manifest @relation(fields: [manifestId], references: [id], onDelete: Cascade)
  hotel       Hotel    @relation(fields: [hotelId], references: [id])
  
  @@map("roomings")
}

// ============================================================
// INVENTORY (Same as before)
// ============================================================

model Warehouse {
  id        String   @id @default(cuid())
  tenantId  String
  code      String
  name      String
  address   String?
  isActive  Boolean  @default(true)
  
  stocks    Stock[]
  movements StockMovement[]
  
  @@unique([tenantId, code])
  @@map("warehouses")
}

model Product {
  id          String   @id @default(cuid())
  tenantId    String
  code        String
  name        String
  category    String
  description String?
  unit        String
  buyPrice    Decimal  @db.Decimal(15, 2)
  sellPrice   Decimal? @db.Decimal(15, 2)
  minStock    Int      @default(0)
  image       String?
  isActive    Boolean  @default(true)
  
  stocks      Stock[]
  movements   StockMovement[]
  distributions ItemDistribution[]
  
  @@unique([tenantId, code])
  @@map("products")
}

model Stock {
  id          String    @id @default(cuid())
  productId   String
  warehouseId String
  quantity    Int       @default(0)
  updatedAt   DateTime  @updatedAt
  
  product     Product   @relation(fields: [productId], references: [id])
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id])
  
  @@unique([productId, warehouseId])
  @@map("stocks")
}

model StockMovement {
  id          String       @id @default(cuid())
  productId   String
  warehouseId String
  type        MovementType
  quantity    Int
  reference   String?
  description String?
  createdBy   String
  createdAt   DateTime     @default(now())
  
  product     Product      @relation(fields: [productId], references: [id])
  warehouse   Warehouse    @relation(fields: [warehouseId], references: [id])
  
  @@map("stock_movements")
}

enum MovementType {
  PURCHASE
  TRANSFER_IN
  TRANSFER_OUT
  ADJUSTMENT
  DISTRIBUTION
  RETURN
  DAMAGE
  LOSS
}

model ItemDistribution {
  id          String   @id @default(cuid())
  manifestId  String
  customerId  String
  productId   String
  quantity    Int
  distributedAt DateTime @default(now())
  distributedBy String
  
  manifest    Manifest @relation(fields: [manifestId], references: [id])
  product     Product  @relation(fields: [productId], references: [id])
  
  @@map("item_distributions")
}

// ============================================================
// HRIS (Same + Tour Leader)
// ============================================================

model Employee {
  id            String   @id @default(cuid())
  tenantId      String
  nip           String
  userId        String?  @unique
  
  name          String
  gender        Gender?
  birthDate     DateTime?
  phone         String?
  email         String?
  address       String?
  
  position      String
  department    String
  joinDate      DateTime
  resignDate    DateTime?
  status        EmployeeStatus @default(ACTIVE)
  
  // Tour Leader specific
  isTourLeader  Boolean  @default(false)
  certifications Json?   // Tour leader certifications
  languages     Json?    // Languages spoken
  destinations  Json?    // Destinations expertise
  rating        Float?   // Average rating
  
  baseSalary    Decimal  @db.Decimal(15, 2)
  allowances    Json?
  
  bankName      String?
  bankAccount   String?
  
  user          User?    @relation(fields: [userId], references: [id])
  attendances   EmployeeAttendance[]
  leaves        Leave[]
  payrolls      Payroll[]
  
  @@unique([tenantId, nip])
  @@map("employees")
}

enum EmployeeStatus { ACTIVE INACTIVE RESIGNED TERMINATED }

// Other HR models (Attendance, Leave, Payroll) - same as before

model EmployeeAttendance {
  id          String   @id @default(cuid())
  employeeId  String
  date        DateTime @db.Date
  clockIn     DateTime?
  clockOut    DateTime?
  status      AttendanceStatus @default(PRESENT)
  workHours   Float?
  notes       String?
  
  employee    Employee @relation(fields: [employeeId], references: [id])
  
  @@unique([employeeId, date])
  @@map("employee_attendances")
}

enum AttendanceStatus { PRESENT ABSENT LATE HALF_DAY LEAVE HOLIDAY }

model Leave {
  id          String      @id @default(cuid())
  employeeId  String
  type        LeaveType
  startDate   DateTime
  endDate     DateTime
  days        Int
  reason      String
  status      LeaveStatus @default(PENDING)
  approvedBy  String?
  approvedAt  DateTime?
  
  employee    Employee    @relation(fields: [employeeId], references: [id])
  
  @@map("leaves")
}

enum LeaveType { ANNUAL SICK MATERNITY PATERNITY UNPAID OTHER }
enum LeaveStatus { PENDING APPROVED REJECTED CANCELLED }

model Payroll {
  id            String   @id @default(cuid())
  employeeId    String
  period        String
  baseSalary    Decimal  @db.Decimal(15, 2)
  allowances    Decimal  @default(0) @db.Decimal(15, 2)
  overtime      Decimal  @default(0) @db.Decimal(15, 2)
  deductions    Decimal  @default(0) @db.Decimal(15, 2)
  netSalary     Decimal  @db.Decimal(15, 2)
  status        PayrollStatus @default(DRAFT)
  paidAt        DateTime?
  
  employee      Employee @relation(fields: [employeeId], references: [id])
  
  @@unique([employeeId, period])
  @@map("payrolls")
}

enum PayrollStatus { DRAFT APPROVED PAID }

// ============================================================
// AGENT & SALES (Same as before)
// ============================================================

model Agent {
  id            String    @id @default(cuid())
  tenantId      String
  code          String
  userId        String?   @unique
  
  name          String
  companyName   String?
  address       String?
  city          String?
  phone         String
  email         String?
  
  tier          AgentTier @default(REGULAR)
  commissionRate Decimal  @db.Decimal(5, 2)
  
  isActive      Boolean   @default(true)
  
  subdomain     String?   @unique
  websiteConfig Json?
  
  user          User?     @relation(fields: [userId], references: [id])
  bookings      Booking[]
  commissions   Commission[]
  
  @@unique([tenantId, code])
  @@map("agents")
}

enum AgentTier { REGULAR SILVER GOLD PLATINUM }

model Sales {
  id            String   @id @default(cuid())
  tenantId      String
  code          String
  userId        String?  @unique
  
  name          String
  phone         String
  email         String?
  commissionRate Decimal @db.Decimal(5, 2)
  
  isActive      Boolean  @default(true)
  
  user          User?    @relation(fields: [userId], references: [id])
  bookings      Booking[]
  commissions   Commission[]
  targets       SalesTarget[]
  
  @@unique([tenantId, code])
  @@map("sales_members")
}

model SalesTarget {
  id            String   @id @default(cuid())
  salesId       String
  period        String
  targetAmount  Decimal  @db.Decimal(15, 2)
  achievedAmount Decimal @default(0) @db.Decimal(15, 2)
  
  sales         Sales    @relation(fields: [salesId], references: [id])
  
  @@unique([salesId, period])
  @@map("sales_targets")
}

model Commission {
  id          String   @id @default(cuid())
  bookingId   String
  agentId     String?
  salesId     String?
  amount      Decimal  @db.Decimal(15, 2)
  rate        Decimal  @db.Decimal(5, 2)
  status      CommissionStatus @default(PENDING)
  paidAt      DateTime?
  
  booking     Booking  @relation(fields: [bookingId], references: [id])
  agent       Agent?   @relation(fields: [agentId], references: [id])
  sales       Sales?   @relation(fields: [salesId], references: [id])
  
  @@map("commissions")
}

enum CommissionStatus { PENDING APPROVED PAID CANCELLED }

// ============================================================
// MARKETING
// ============================================================

model Campaign {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  type        CampaignType
  status      CampaignStatus @default(DRAFT)
  subject     String?
  content     String
  template    String?
  scheduledAt DateTime?
  sentAt      DateTime?
  stats       Json?
  
  createdBy   String
  createdAt   DateTime @default(now())
  
  @@map("campaigns")
}

enum CampaignType { EMAIL WHATSAPP SMS }
enum CampaignStatus { DRAFT SCHEDULED SENDING SENT CANCELLED }

model Voucher {
  id          String   @id @default(cuid())
  tenantId    String
  code        String
  name        String
  type        VoucherType
  value       Decimal  @db.Decimal(15, 2)
  minPurchase Decimal? @db.Decimal(15, 2)
  maxDiscount Decimal? @db.Decimal(15, 2)
  quota       Int?
  used        Int      @default(0)
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(true)
  
  bookings    Booking[]
  
  @@unique([tenantId, code])
  @@map("vouchers")
}

enum VoucherType { PERCENTAGE FIXED_AMOUNT }

model LandingPage {
  id          String   @id @default(cuid())
  tenantId    String
  slug        String
  title       Json     // Localized
  content     Json
  metaTitle   Json?
  metaDescription Json?
  isPublished Boolean  @default(false)
  views       Int      @default(0)
  conversions Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  leads       Lead[]
  
  @@unique([tenantId, slug])
  @@map("landing_pages")
}

model Lead {
  id            String   @id @default(cuid())
  tenantId      String
  landingPageId String?
  name          String
  email         String?
  phone         String
  source        String?
  interest      String?
  notes         String?
  status        LeadStatus2 @default(NEW)
  assignedTo    String?
  convertedAt   DateTime?
  
  createdAt     DateTime @default(now())
  
  landingPage   LandingPage? @relation(fields: [landingPageId], references: [id])
  
  @@map("leads")
}

enum LeadStatus2 { NEW CONTACTED QUALIFIED PROPOSAL NEGOTIATION WON LOST }

// ============================================================
// IoT & TRACKING (Same as before)
// ============================================================

model Device {
  id            String       @id @default(cuid())
  tenantId      String
  type          DeviceType
  serialNumber  String
  macAddress    String?
  firmwareVer   String?
  batteryLevel  Int?
  lastSeen      DateTime?
  status        DeviceStatus @default(ACTIVE)
  
  customerId    String?      @unique
  customer      Customer?    @relation(fields: [customerId], references: [id])
  manifestId    String?
  
  locations     Location[]
  alerts        Alert[]
  telemetry     DeviceTelemetry[]
  
  @@unique([tenantId, serialNumber])
  @@map("devices")
}

enum DeviceType { SMART_CARD WRISTBAND SMART_TAG BEACON GATEWAY }
enum DeviceStatus { ACTIVE INACTIVE LOST DAMAGED MAINTENANCE }

model DeviceTelemetry {
  id          String   @id @default(cuid())
  deviceId    String
  batteryLevel Int?
  signalStrength Int?
  temperature Float?
  timestamp   DateTime @default(now())
  
  device      Device   @relation(fields: [deviceId], references: [id])
  
  @@index([deviceId, timestamp])
  @@map("device_telemetry")
}

model Location {
  id          String         @id @default(cuid())
  deviceId    String?
  customerId  String?
  latitude    Float
  longitude   Float
  altitude    Float?
  accuracy    Float?
  speed       Float?
  source      LocationSource
  beaconId    String?
  timestamp   DateTime       @default(now())
  
  device      Device?        @relation(fields: [deviceId], references: [id])
  customer    Customer?      @relation(fields: [customerId], references: [id])
  
  @@index([deviceId, timestamp])
  @@index([customerId, timestamp])
  @@map("locations")
}

enum LocationSource { GPS BEACON WIFI CELL_TOWER MANUAL }

model Beacon {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  uuid        String
  major       Int
  minor       Int
  location    String
  latitude    Float?
  longitude   Float?
  floor       Int?
  status      DeviceStatus @default(ACTIVE)
  
  @@unique([tenantId, uuid])
  @@map("beacons")
}

model Geofence {
  id          String       @id @default(cuid())
  tenantId    String
  name        String
  description String?
  type        GeofenceType
  coordinates Json
  radius      Float?
  isActive    Boolean      @default(true)
  manifestId  String?
  
  manifest    Manifest?    @relation(fields: [manifestId], references: [id])
  alerts      Alert[]
  
  @@map("geofences")
}

enum GeofenceType { HOTEL ATTRACTION MEETING_POINT AIRPORT STATION RESTRICTED CUSTOM }

model Alert {
  id          String        @id @default(cuid())
  tenantId    String
  type        AlertType
  severity    AlertSeverity
  title       String
  message     String
  
  deviceId    String?
  device      Device?       @relation(fields: [deviceId], references: [id])
  customerId  String?
  customer    Customer?     @relation(fields: [customerId], references: [id])
  geofenceId  String?
  geofence    Geofence?     @relation(fields: [geofenceId], references: [id])
  manifestId  String?
  manifest    Manifest?     @relation(fields: [manifestId], references: [id])
  
  latitude    Float?
  longitude   Float?
  status      AlertStatus   @default(ACTIVE)
  resolvedAt  DateTime?
  resolvedBy  String?
  resolution  String?
  
  createdAt   DateTime      @default(now())
  
  @@map("alerts")
}

enum AlertType { GEOFENCE_EXIT GEOFENCE_ENTER SOS_TRIGGERED DEVICE_OFFLINE LOW_BATTERY NO_MOVEMENT MISSED_CHECKIN HEALTH_ALERT CUSTOM }
enum AlertSeverity { LOW MEDIUM HIGH CRITICAL }
enum AlertStatus { ACTIVE ACKNOWLEDGED RESOLVED DISMISSED }

model Attendance {
  id          String          @id @default(cuid())
  manifestId  String
  customerId  String
  location    String
  type        AttendanceType
  timestamp   DateTime        @default(now())
  latitude    Float?
  longitude   Float?
  photo       String?
  confidence  Float?
  deviceId    String?
  notes       String?
  
  manifest    Manifest        @relation(fields: [manifestId], references: [id])
  customer    Customer        @relation(fields: [customerId], references: [id])
  
  @@map("attendances")
}

enum AttendanceType { CHECK_IN CHECK_OUT MANUAL QR_SCAN FACE_RECOGNITION BEACON_AUTO }

model FaceData {
  id          String   @id @default(cuid())
  customerId  String   @unique
  embedding   Bytes
  photoUrl    String
  isVerified  Boolean  @default(false)
  confidence  Float?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  customer    Customer @relation(fields: [customerId], references: [id])
  
  @@map("face_data")
}

// ============================================================
// CMS
// ============================================================

model Page {
  id          String   @id @default(cuid())
  tenantId    String
  slug        String
  title       Json     // Localized
  content     Json
  metaTitle   Json?
  metaDescription Json?
  isPublished Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([tenantId, slug])
  @@map("pages")
}

model Article {
  id          String   @id @default(cuid())
  tenantId    String
  slug        String
  title       Json     // Localized
  excerpt     Json?
  content     Json
  thumbnail   String?
  category    String?
  tags        Json?
  authorId    String
  metaTitle   Json?
  metaDescription Json?
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  views       Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([tenantId, slug])
  @@map("articles")
}

model Media {
  id          String   @id @default(cuid())
  tenantId    String
  filename    String
  url         String
  mimeType    String
  size        Int
  alt         String?
  caption     String?
  folder      String?
  uploadedBy  String
  
  createdAt   DateTime @default(now())
  
  @@map("media")
}

model Menu {
  id          String   @id @default(cuid())
  tenantId    String
  location    String
  items       Json
  
  updatedAt   DateTime @updatedAt
  
  @@unique([tenantId, location])
  @@map("menus")
}

// ============================================================
// SYSTEM
// ============================================================

model Notification {
  id          String           @id @default(cuid())
  userId      String
  title       Json             // Localized
  message     Json             // Localized
  type        NotificationType
  isRead      Boolean          @default(false)
  data        Json?
  
  createdAt   DateTime         @default(now())
  readAt      DateTime?
  
  user        User             @relation(fields: [userId], references: [id])
  
  @@map("notifications")
}

enum NotificationType { INFO PAYMENT BOOKING DOCUMENT REMINDER ALERT PROMO SYSTEM }

model AuditLog {
  id          String   @id @default(cuid())
  tenantId    String?
  userId      String
  action      String
  entity      String
  entityId    String?
  oldValue    Json?
  newValue    Json?
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@map("audit_logs")
}

model Setting {
  id          String   @id @default(cuid())
  tenantId    String
  key         String
  value       String
  type        String   @default("string")
  group       String?
  description String?
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  updatedAt   DateTime @updatedAt
  
  @@unique([tenantId, key])
  @@map("settings")
}
```

---

## 3. TABLE SUMMARY

| Module | Tables | New/Updated |
|--------|--------|-------------|
| Tenant & Config | 5 | NEW |
| Auth & User | 4 | Updated |
| Destination | 6 | NEW |
| Package | 6 | Updated |
| Customer & CRM | 12 | Updated |
| Booking | 3 | Updated |
| Payment & Finance | 4 | Updated |
| Operasional | 6 | Updated |
| Inventory | 5 | Same |
| HRIS | 5 | Updated |
| Agent & Sales | 5 | Same |
| Marketing | 5 | Same |
| IoT & Tracking | 10 | Same |
| CMS | 4 | Updated |
| System | 3 | Updated |
| **Total** | **~83 tables** | |
