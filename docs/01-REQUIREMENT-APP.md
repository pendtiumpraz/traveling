# REQUIREMENT APLIKASI
## Sistem Informasi Travel MULTI-PURPOSE (Umroh, Haji, Tour, MICE)

---

## 1. OVERVIEW

### 1.1 Deskripsi Sistem
Sistem informasi terintegrasi untuk mengelola seluruh operasional **multi-purpose travel agency**, mencakup:
- **Umroh & Haji** - Perjalanan ibadah ke Tanah Suci
- **Outbound Tour** - Wisata ke luar negeri (Korea, Jepang, Eropa, dll)
- **Inbound Tour** - Melayani turis asing ke Indonesia
- **Domestic Tour** - Wisata dalam negeri
- **MICE** - Meeting, Incentive, Convention, Exhibition

### 1.2 Tujuan
- Digitalisasi seluruh proses bisnis travel multi-purpose
- Satu sistem untuk semua jenis perjalanan
- Konfigurasi fleksibel per tipe bisnis
- Monitoring real-time dengan AI & IoT
- Efisiensi operasional dan keuangan

### 1.3 Business Types
```typescript
enum BusinessType {
  UMROH = 'umroh',           // Perjalanan Umroh
  HAJI = 'haji',             // Perjalanan Haji
  OUTBOUND = 'outbound',     // Tour luar negeri
  INBOUND = 'inbound',       // Turis asing ke Indonesia
  DOMESTIC = 'domestic',     // Tour dalam negeri
  MICE = 'mice',             // Corporate events
  CRUISE = 'cruise',         // Cruise trip
  CUSTOM = 'custom',         // Custom/Private tour
}
```

### 1.4 Target User
| Role | Deskripsi |
|------|-----------|
| Super Admin | Full access, konfigurasi sistem |
| Admin | Manajemen data customer, booking |
| Finance | Keuangan, pembayaran, laporan |
| Operasional | Manifest, jadwal, akomodasi |
| Marketing | Lead, promo, follow-up, digital marketing |
| HRD | Karyawan, payroll, absensi |
| Inventory | Stok barang, pembelian |
| Tour Leader | Pemimpin perjalanan di lapangan |
| Agen | Partner penjualan (dengan website sendiri) |
| Sales | Tim penjualan internal |
| Customer | End user (Jamaah/Peserta/Traveler) |

---

## 2. KONFIGURASI BISNIS

### 2.1 Feature Toggle per Business Type
```
┌─────────────────────────────────────────────────────────────────────┐
│ Feature              │ Umroh │ Haji │ Outbound │ Domestic │ MICE   │
├─────────────────────────────────────────────────────────────────────┤
│ Booking & Payment    │   ✓   │  ✓   │    ✓     │    ✓     │   ✓    │
│ Dokumen & Visa       │   ✓   │  ✓   │    ✓     │    ○     │   ○    │
│ Manifest & Rooming   │   ✓   │  ✓   │    ✓     │    ✓     │   ✓    │
│ GPS Tracking         │   ✓   │  ✓   │    ✓     │    ○     │   ○    │
│ Tour Guide System    │   ✓   │  ✓   │    ✓     │    ✓     │   ○    │
│ Jadwal Sholat        │   ✓   │  ✓   │    ○     │    ○     │   ○    │
│ Manasik/Ibadah Guide │   ✓   │  ✓   │    ✗     │    ✗     │   ✗    │
│ Mahram Validation    │   ✓   │  ✓   │    ✗     │    ✗     │   ✗    │
│ Destinasi Dinamis    │   ✗   │  ✗   │    ✓     │    ✓     │   ✓    │
│ Multi-Currency       │   ✓   │  ✓   │    ✓     │    ✗     │   ✓    │
│ Corporate Billing    │   ○   │  ○   │    ○     │    ○     │   ✓    │
└─────────────────────────────────────────────────────────────────────┘
✓ = Default ON | ○ = Optional | ✗ = Not applicable
```

### 2.2 Terminology Mapping
```typescript
const terminology = {
  umroh_haji: {
    customer: 'Jamaah',
    leader: 'Muthawwif',
    package: 'Paket Umroh/Haji',
    trip: 'Keberangkatan',
  },
  outbound: {
    customer: 'Peserta',
    leader: 'Tour Leader',
    package: 'Paket Tour',
    trip: 'Departure',
  },
  inbound: {
    customer: 'Guest',
    leader: 'Tour Guide',
    package: 'Tour Package',
    trip: 'Arrival',
  },
  mice: {
    customer: 'Delegate',
    leader: 'Event Coordinator',
    package: 'Event Package',
    trip: 'Event',
  },
};
```

---

## 3. MODUL SISTEM (LENGKAP)

### 3.1 Modul Master Data
- [x] Data Perusahaan (profile, logo, kontak, lisensi)
- [x] **Master Destinasi** (Negara, Kota, Tempat Wisata)
- [x] Master Paket (multi-type)
- [x] Master Hotel (worldwide)
- [x] Master Airlines
- [x] Master Transportation (Bus, Kereta, Kapal)
- [x] Master Restaurant/Meal
- [x] Master Attraction/Activity
- [x] Master Bank
- [x] Master Cabang/Kantor
- [x] Master Role & Permission
- [x] Master User
- [x] Master Supplier/Vendor (DMC, Ground Handler, dll)
- [x] Master Gudang/Warehouse

### 3.2 Modul Destinasi & Produk
- [x] **Destination Management**
  - Negara (visa requirement, currency, timezone)
  - Kota (airport, attractions)
  - Point of Interest (wisata, hotel, restaurant)
- [x] **Package Builder**
  - Drag & drop itinerary builder
  - Multi-day scheduling
  - Include/exclude items
  - Price tiers (budget, standard, premium)
  - Seasonal pricing
- [x] **Itinerary Templates**
  - Reusable templates
  - Day-by-day activities
  - Meal plans
  - Transportation schedule

### 3.3 Modul CRM & Customer
- [x] Lead Management
- [x] Lead Scoring & Qualification
- [x] Follow-up Automation
- [x] Customer Registration
- [x] Data Customer Lengkap
  - Biodata (KTP/Passport)
  - Travel preferences
  - Dietary requirements
  - Special needs
  - Emergency contact
- [x] **Conditional Fields**
  - Mahram (untuk Umroh wanita)
  - Visa history (untuk tour)
  - Corporate info (untuk MICE)
- [x] Travel History
- [x] Family/Group Management
- [x] Loyalty Program & Points
- [x] Referral System

### 3.4 Modul Booking & Transaksi

#### A. Paket Perjalanan (All Types)
```
UMROH & HAJI:
- Umroh Reguler / Plus / VIP
- Haji Reguler / Plus / Furoda
- Umroh + Turkey / Dubai / Mesir

OUTBOUND TOUR:
- Asia: Korea, Jepang, China, Thailand, Vietnam, dll
- Eropa: Western, Eastern, Scandinavian
- Amerika: USA, Canada
- Australia & New Zealand
- Middle East: Dubai, Turkey, Jordan

DOMESTIC TOUR:
- Bali, Lombok, Raja Ampat
- Yogyakarta, Bromo
- Labuan Bajo, Toraja

MICE:
- Company Outing
- Incentive Trip
- Conference Package
- Exhibition Support
```

#### B. Transaksi Satuan
- [x] Land Arrangement Only
- [x] Hotel Only
- [x] Visa Only
- [x] Tiket Pesawat Only
- [x] Travel Insurance
- [x] Airport Transfer
- [x] Car Rental
- [x] Activity/Attraction Ticket

#### C. Booking Features
- [x] Pilih Jadwal Keberangkatan
- [x] Add-on Services
- [x] Upgrade/Downgrade
- [x] Pembatalan & Refund
- [x] Waiting List
- [x] Group Booking
- [x] Corporate Booking (MICE)
- [x] **FIT Booking** (Free Independent Traveler)

### 3.5 Modul Keuangan & Akuntansi
- [x] Chart of Account (CoA)
- [x] **Multi-Currency Support**
  - Base currency (IDR)
  - Foreign currencies (USD, SAR, JPY, KRW, EUR, dll)
  - Auto exchange rate update
- [x] Invoice & Billing
- [x] Payment Gateway Integration (VA)
- [x] Cicilan/Installment
- [x] **Corporate Invoice** (untuk MICE)
- [x] Refund Management
- [x] Komisi Agen & Sales
- [x] Accounts Receivable/Payable
- [x] Bank Reconciliation
- [x] Laporan Keuangan (SAK ETAP)
- [x] Tax Management

### 3.6 Modul Dokumen & Visa
- [x] **Visa Requirement Database**
  - Per negara & passport type
  - Document checklist
  - Processing time
- [x] Checklist Dokumen per Destinasi
- [x] Upload Dokumen (KTP, Paspor, Foto, dll)
- [x] OCR Auto-extract Data (AI)
- [x] **Visa Application Tracking**
  - Embassy appointment
  - Processing status
  - Approval/rejection
- [x] Notifikasi Dokumen Expired
- [x] E-Signature

### 3.7 Modul Operasional
- [x] **Multi-Destination Manifest**
- [x] Booking Tiket (Pesawat, Kereta, Bus, Ferry)
- [x] Booking Hotel (worldwide)
- [x] Rooming List Management
- [x] Transportation Assignment
- [x] Pembagian Group
- [x] **Tour Leader Assignment**
- [x] **Local Guide Assignment**
- [x] Itinerary/Rundown
- [x] Meal Planning
- [x] Activity Scheduling
- [x] Supplier Coordination

### 3.8 Modul Inventory / Persediaan
- [x] Master Produk
  - Koper, Tas
  - Seragam/Kaos Group
  - Buku Panduan
  - ID Card & Lanyard
  - Travel Kit
  - Merchandise
- [x] Multi-Warehouse
- [x] Purchase Order
- [x] Stock Management
- [x] Distribution to Customer

### 3.9 Modul HRIS / SDM
- [x] Data Karyawan
- [x] Attendance/Absensi
- [x] Leave Management
- [x] Payroll
- [x] Performance (KPI)
- [x] **Tour Leader Database**
  - Certification
  - Language skills
  - Destination expertise
  - Rating & reviews

### 3.10 Modul Cabang, Agen & Sales
- [x] Multi-Cabang Management
- [x] Agent Registration & Portal
- [x] **Agent Website System** (white-label)
- [x] Sales Team Management
- [x] Commission Structure
- [x] Sales Target & Achievement
- [x] Leaderboard

### 3.11 Modul Digital Marketing
- [x] WhatsApp Marketing
- [x] Email Marketing
- [x] SMS Marketing
- [x] Lead Magnet & Landing Pages
- [x] SEO Tools
- [x] Promo & Voucher
- [x] **Seasonal Campaign**
- [x] **Early Bird / Last Minute Deals**

### 3.12 Modul Monitoring & Tracking (AI + IoT)
- [x] Dashboard Real-time
- [x] **GPS Tracking**
  - Live location (opt-in)
  - Location history
  - Geofencing
- [x] IoT Device Management
- [x] Digital Attendance
- [x] Alert System
- [x] **Emergency SOS**
- [x] Analytics & Heatmap

### 3.13 Modul Tour Guide System (TGS)
- [x] **Audio Guide System**
  - Tour leader broadcast
  - Multi-channel
- [x] **Destination Guide**
  - Location-based info
  - Attraction details
  - Local tips
- [x] **Conditional Content**
  - Manasik & Doa (Umroh/Haji)
  - Travel phrases (Outbound)
  - Local customs
- [x] Group Communication

### 3.14 Modul AI Features
- [x] AI Chatbot (multi-language)
- [x] OCR Document Processing
- [x] Face Recognition (attendance)
- [x] **AI Trip Planner**
  - Itinerary suggestion
  - Budget optimization
  - Best time to visit
- [x] **Price Prediction**
- [x] Sentiment Analysis
- [x] Churn Prediction

### 3.15 Modul Komunikasi
- [x] WhatsApp Broadcast
- [x] Email Notification
- [x] Push Notification
- [x] SMS Gateway
- [x] In-app Messaging
- [x] **Multi-language Support**

### 3.16 Modul Reporting & Analytics
- [x] Dashboard Executive
- [x] **Report by Business Type**
- [x] Report by Destination
- [x] Financial Reports
- [x] Operational Reports
- [x] Sales & Marketing Reports
- [x] Custom Report Builder
- [x] Business Intelligence

### 3.17 Modul Khusus Umroh/Haji
*(Hanya aktif jika business type = Umroh/Haji)*
- [x] Jadwal Sholat (per lokasi)
- [x] Arah Kiblat
- [x] Manasik Guide
- [x] Doa & Dzikir
- [x] Mahram Validation
- [x] Masjid Locator
- [x] Ibadah Checklist

### 3.18 Modul Khusus MICE
*(Hanya aktif jika business type = MICE)*
- [x] Event Management
- [x] Delegate Registration
- [x] Badge Printing
- [x] Session Scheduling
- [x] Venue Management
- [x] Corporate Billing
- [x] Sponsor Management

### 3.19 Modul Website & CMS
- [x] Landing Page Builder
- [x] **Multi-theme per Business Type**
- [x] Content Management
- [x] Online Booking Widget
- [x] SEO Optimization
- [x] Custom Domain

### 3.20 Modul Settings
- [x] **Business Type Configuration**
- [x] Feature Toggle
- [x] Terminology Customization
- [x] Currency Settings
- [x] Tax Settings
- [x] Notification Templates
- [x] Integration Settings
- [x] Backup & Restore

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance
- Response time < 2 detik
- Support 1000+ concurrent users
- 99.9% uptime
- Real-time sync < 5 detik

### 4.2 Security
- SSL/TLS encryption
- JWT + 2FA Authentication
- Role-based Access Control
- Data encryption (AES-256)
- GDPR Compliance
- PCI DSS (untuk payment)

### 4.3 Scalability
- Horizontal scaling
- Multi-tenant ready
- CDN for global access
- Database sharding

### 4.4 Localization
- **Multi-language UI** (ID, EN, AR, JP, KR, ZH)
- **Multi-currency**
- **Multi-timezone**
- RTL support (Arabic)

### 4.5 Integration
- Payment Gateway (Midtrans, Xendit, Stripe)
- GDS (Amadeus, Sabre, Travelport) - optional
- Hotel API (Agoda, Booking.com) - optional
- WhatsApp Business API
- Google Maps API
- OpenAI API
- AWS IoT

---

## 5. TECH STACK

```
Framework:     Next.js 14 (App Router)
Language:      TypeScript
Styling:       Tailwind CSS + shadcn/ui
State:         Zustand + TanStack Query
Database:      PostgreSQL + TimescaleDB
ORM:           Prisma
Auth:          NextAuth.js + 2FA
Cache:         Redis
Queue:         BullMQ
Real-time:     Socket.io
File Storage:  Cloudinary / AWS S3
Payment:       Midtrans / Xendit / Stripe
Maps:          Google Maps / Mapbox
AI/ML:         Python FastAPI + OpenAI
IoT:           AWS IoT Core / MQTT
Search:        Meilisearch
i18n:          next-intl
Deployment:    Vercel + AWS
```

---

## 6. MOBILE APPS

### 6.1 Customer App (iOS & Android)
```
Universal Features:
- Browse & Book packages
- Document upload
- Payment
- E-Ticket & E-Voucher
- Trip schedule & itinerary
- Live tracking (opt-in)
- Group chat
- SOS Emergency
- Offline mode

Umroh/Haji Mode:
+ Jadwal sholat
+ Arah kiblat
+ Manasik guide
+ Doa & dzikir

Tour Mode:
+ Destination guide
+ Local phrases
+ Currency converter
+ Attraction info
```

### 6.2 Tour Leader App (iOS & Android)
```
- Participant list
- Attendance (QR/Face)
- Live tracking dashboard
- Alert management
- Group broadcast
- Audio guide system
- Checklist operasional
- Expense report
```

### 6.3 Agent/Sales App
```
- Lead management
- Quick booking
- Commission tracking
- Marketing materials
- Target achievement
```

---

## 7. TIMELINE ESTIMASI

| Phase | Scope | Durasi |
|-------|-------|--------|
| Phase 1 - MVP | Auth, Master Data, Multi-type Booking, Payment, Dashboard | 10-12 minggu |
| Phase 2 | Dokumen, Visa, Operasional, Manifest | 6-8 minggu |
| Phase 3 | Inventory, HRIS, Agent/Sales | 6-8 minggu |
| Phase 4 | Mobile App (Customer & Leader) | 8-10 minggu |
| Phase 5 | AI Features, IoT Tracking | 6-8 minggu |
| Phase 6 | Digital Marketing, CMS | 4-6 minggu |
| Phase 7 | MICE Module, Advanced Features | 4-6 minggu |
| Phase 8 | Optimization, Multi-language | 4-6 minggu |

**Total: 12-18 bulan untuk full system**

---

## 8. DELIVERABLES

1. Web Application (Admin Dashboard)
2. Web Application (Customer Portal)
3. Web Application (Agent Portal)
4. Mobile App - Customer (iOS & Android)
5. Mobile App - Tour Leader (iOS & Android)
6. Mobile App - Sales (iOS & Android)
7. API Documentation
8. User Manual (Multi-language)
9. Technical Documentation
10. Training Materials
