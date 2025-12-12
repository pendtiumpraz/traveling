# User Guide - Super Admin

## Daftar Isi
1. [Login & Dashboard](#1-login--dashboard)
2. [Manajemen User](#2-manajemen-user)
3. [Manajemen Role](#3-manajemen-role)
4. [Multi-Tenant SaaS Mode](#4-multi-tenant-saas-mode)
5. [Pengaturan Sistem](#5-pengaturan-sistem)
6. [Audit Log](#6-audit-log)

---

## 1. Login & Dashboard

### Login
- URL: `/login`
- Email: `superadmin@demo.com`
- Password: `superadmin123`

### Dashboard
Setelah login, Super Admin memiliki akses penuh ke seluruh fitur:
- Overview statistik (booking, revenue, customer)
- Quick actions
- Recent activities
- System alerts

---

## 2. Manajemen User

### Path: `/dashboard/users`

#### Fitur:
- **List Users**: Lihat semua user dengan filter dan search
- **Create User**: Tambah user baru dengan assign role
- **Edit User**: Update informasi dan role user
- **Deactivate/Activate**: Non-aktifkan atau aktifkan user
- **Reset Password**: Reset password user

#### Cara Tambah User:
1. Klik tombol "Tambah User"
2. Isi form: Nama, Email, Password, Role
3. Pilih Tenant (jika multi-tenant mode)
4. Klik "Simpan"

---

## 3. Manajemen Role

### Path: `/dashboard/roles`

#### 11 Role Tersedia:
| Role | Akses |
|------|-------|
| SUPER_ADMIN | Full akses semua fitur |
| ADMIN | Full akses (kecuali tenant management) |
| FINANCE | Keuangan, Payment, Invoice, Komisi |
| OPERASIONAL | Operasional, Schedule, Manifest, Tracking |
| MARKETING | Customer, Campaign, Voucher |
| HRD | Employee, Attendance, Payroll |
| INVENTORY | Product, Stock, Warehouse |
| TOUR_LEADER | Manifest, Tracking, Attendance |
| AGENT | Booking, Package, Customer (limited) |
| SALES | Booking, Package, Customer, Payment |
| CUSTOMER | Portal customer saja |

---

## 4. Multi-Tenant SaaS Mode

### Apa itu Multi-Tenant?
Multi-tenant memungkinkan satu instalasi aplikasi digunakan oleh banyak perusahaan (tenant) yang terisolasi datanya.

### Arsitektur

```
SINGLE TENANT (Default):
┌─────────────────────────────────┐
│     traveling-ebon.vercel.app   │
│     Semua user dalam 1 tenant   │
└─────────────────────────────────┘

MULTI-TENANT:
┌─────────────────────────────────┐
│   yourdomain.com                │  ← Landing page + Tenant registration
├─────────────────────────────────┤
│   tenant1.yourdomain.com        │  ← Tenant 1 (data terisolasi)
├─────────────────────────────────┤
│   tenant2.yourdomain.com        │  ← Tenant 2 (data terisolasi)
├─────────────────────────────────┤
│   tenant3.yourdomain.com        │  ← Tenant 3 (data terisolasi)
└─────────────────────────────────┘
```

### Mengaktifkan Multi-Tenant Mode

#### Step 1: Set Environment Variables
```env
# .env atau Vercel Environment Variables
TENANT_MODE=multi
TENANT_BASE_DOMAIN=yourdomain.com
TENANT_REGISTRATION_ENABLED=true
```

#### Step 2: Setup DNS (Wildcard Subdomain)
Di DNS provider (Cloudflare, Namecheap, dll):
```
Type: CNAME
Name: *
Target: cname.vercel-dns.com (atau IP server)
```

#### Step 3: Setup Vercel Domain
1. Buka Vercel Dashboard → Project → Settings → Domains
2. Add domain: `yourdomain.com`
3. Add domain: `*.yourdomain.com` (wildcard)

### Manajemen Tenant

#### Path: `/dashboard/tenants` (Super Admin only)

#### Fitur:
- **List Tenants**: Lihat semua tenant dengan statistik
- **Create Tenant**: Buat tenant baru
- **Edit Tenant**: Update pengaturan tenant
- **View Stats**: Lihat statistik per tenant
- **Suspend/Activate**: Suspend atau aktifkan tenant

#### Cara Buat Tenant Baru:
1. Klik "Tambah Tenant"
2. Isi form:
   - **Nama Perusahaan**: Nama travel agency
   - **Subdomain**: URL tenant (misal: `abc` → `abc.yourdomain.com`)
   - **Admin Email**: Email admin tenant
   - **Admin Password**: Password admin tenant
3. Klik "Simpan"

Sistem akan otomatis:
- Membuat tenant record
- Membuat user admin untuk tenant tersebut
- Assign role ADMIN ke user

#### Tenant Settings
Setiap tenant bisa customize:
- **Company Info**: Nama, logo, alamat
- **Business Types**: Umroh, Haji, Tour, Ticketing
- **Currency**: IDR, USD, SAR
- **Language**: Indonesian, English, Arabic
- **Theme Colors**: Primary & secondary color
- **Features**: Enable/disable fitur tertentu

### Registrasi Tenant (Self-Service)

#### Path: `https://yourdomain.com/register`

Jika `TENANT_REGISTRATION_ENABLED=true`, user bisa daftar tenant sendiri:

1. Buka main domain (bukan subdomain)
2. Klik "Register" atau "Daftar"
3. Isi form:
   - Nama Perusahaan
   - Subdomain yang diinginkan
   - Email Admin
   - Password
4. Klik "Daftar"

Setelah registrasi:
- Tenant langsung aktif
- User diarahkan ke `subdomain.yourdomain.com/login`
- Login dengan email & password yang didaftarkan

### Registrasi User dalam Tenant

#### Path: `https://tenant1.yourdomain.com/register`

Jika akses dari subdomain tenant, form registrasi akan mendaftarkan user dalam tenant tersebut (bukan buat tenant baru).

### Isolasi Data

Setiap tenant memiliki data terisolasi:
- ✅ Users (hanya bisa lihat user tenant sendiri)
- ✅ Customers
- ✅ Bookings
- ✅ Packages
- ✅ Payments
- ✅ Invoices
- ✅ Employees
- ✅ Settings

Super Admin bisa melihat semua tenant dan data lintas tenant.

### API Tenant Isolation

Semua API otomatis ter-filter berdasarkan tenant:

```typescript
// Contoh: GET /api/customers
// Jika user dari tenant "abc", hanya return customer tenant "abc"
const customers = await prisma.customer.findMany({
  where: { tenantId: session.user.tenantId }
});
```

### Tenant API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/tenant` | GET | List semua tenant (Super Admin) |
| `/api/tenant` | POST | Create tenant baru |
| `/api/tenant/[id]` | GET | Detail tenant |
| `/api/tenant/[id]` | PUT | Update tenant |
| `/api/tenant/[id]` | DELETE | Delete tenant |
| `/api/tenant/check` | GET | Cek ketersediaan subdomain |
| `/api/tenant/register` | POST | Self-register tenant |

---

## 5. Pengaturan Sistem

### Path: `/dashboard/settings`

#### General Settings
- Nama aplikasi
- Logo
- Timezone
- Currency default
- Language default

#### Landing Page
- Hero section
- Features
- Testimonials
- Contact info

#### Email Settings
- SMTP configuration
- Email templates

#### Payment Gateway
- Bank accounts
- Virtual account settings
- Payment gateway integration

---

## 6. Audit Log

### Path: `/dashboard/audit-logs`

Semua aktivitas tercatat:
- Login/logout
- CRUD operations
- Setting changes
- Payment activities

#### Filter:
- By user
- By action type
- By date range
- By entity

---

## Quick Reference

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=your-secret-key-min-32-chars
AUTH_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com

# Multi-Tenant (optional)
TENANT_MODE=single|multi
TENANT_BASE_DOMAIN=yourdomain.com
TENANT_REGISTRATION_ENABLED=true|false
DEFAULT_TENANT_ID=default

# AI (optional)
GEMINI_API_KEY=your-gemini-key

# Google OAuth (optional)
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | superadmin@demo.com | superadmin123 |
| ADMIN | admin@demo.com | admin123 |
| FINANCE | finance@demo.com | finance123 |
| OPERASIONAL | operasional@demo.com | operasional123 |
| MARKETING | marketing@demo.com | marketing123 |
| HRD | hrd@demo.com | hrd123 |
| INVENTORY | inventory@demo.com | inventory123 |
| TOUR_LEADER | tourleader@demo.com | tourleader123 |
| AGENT | agent@demo.com | agent123 |
| SALES | sales@demo.com | sales123 |
| CUSTOMER | customer@demo.com | customer123 |

### Debug Endpoints

```
# Reset all demo passwords
/api/debug/reset-passwords?key=resetdemo123

# Check user credentials
/api/debug/check-user?key=resetdemo123&email=xxx&password=xxx

# Check session status
/api/debug/session
```

---

## Troubleshooting

### Login Gagal
1. Reset password: `/api/debug/reset-passwords?key=resetdemo123`
2. Cek session: `/api/debug/session`
3. Pastikan AUTH_SECRET sama di semua environment

### Multi-Tenant Tidak Bekerja
1. Pastikan `TENANT_MODE=multi`
2. Pastikan DNS wildcard sudah setup
3. Pastikan domain di Vercel sudah ada wildcard (`*.domain.com`)

### Redirect Loop
1. Clear cookies browser
2. Cek AUTH_URL dan NEXTAUTH_URL sudah benar
3. Pastikan tidak ada trailing slash di URL

---

## Support

Jika ada kendala, hubungi:
- Email: support@travelerpz.com
- WhatsApp: +62 xxx-xxxx-xxxx
