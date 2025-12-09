# REQUIREMENT BACKEND
## Sistem Informasi Travel MULTI-PURPOSE

---

## 1. ARSITEKTUR

### 1.1 Stack
```
Runtime:       Node.js 20 LTS
Framework:     Next.js 14 API Routes
Language:      TypeScript
Database:      PostgreSQL 15+ / TimescaleDB
ORM:           Prisma
Cache:         Redis
Queue:         BullMQ
Real-time:     Socket.io
Search:        Meilisearch
AI Service:    Python FastAPI
IoT:           MQTT / AWS IoT Core
i18n:          next-intl
```

### 1.2 Multi-Tenant Architecture
```typescript
// Tenant Configuration
interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  businessTypes: BusinessType[];  // Enabled business types
  features: FeatureFlags;
  terminology: TerminologyMap;
  currencies: Currency[];
  languages: Language[];
  theme: ThemeConfig;
}

// Feature Flags per Tenant
interface FeatureFlags {
  umrohModule: boolean;
  hajiModule: boolean;
  outboundModule: boolean;
  domesticModule: boolean;
  miceModule: boolean;
  iotTracking: boolean;
  aiFeatures: boolean;
  multiCurrency: boolean;
}
```

### 1.3 Folder Structure
```
src/
├── app/
│   └── api/
│       ├── auth/
│       ├── tenant/
│       ├── destination/
│       ├── package/
│       ├── customer/
│       ├── booking/
│       ├── transaction/
│       ├── payment/
│       ├── document/
│       ├── visa/
│       ├── manifest/
│       ├── inventory/
│       ├── hr/
│       ├── agent/
│       ├── marketing/
│       ├── tracking/
│       ├── iot/
│       ├── ai/
│       ├── umroh/          # Umroh-specific
│       ├── mice/           # MICE-specific
│       ├── reports/
│       ├── cms/
│       ├── settings/
│       └── webhook/
├── lib/
│   ├── prisma.ts
│   ├── redis.ts
│   ├── i18n.ts
│   ├── currency.ts
│   ├── feature-flags.ts
│   └── tenant.ts
├── services/
├── jobs/
├── types/
└── middleware/
    ├── auth.ts
    ├── tenant.ts
    └── feature-gate.ts
```

---

## 2. AUTHENTICATION & AUTHORIZATION

### 2.1 Authentication
```typescript
// Multi-method auth
- Credentials (email/password)
- OAuth (Google, Facebook)
- WhatsApp OTP
- Two-Factor Authentication (2FA)

// JWT with tenant context
interface JWTPayload {
  userId: string;
  tenantId: string;
  roles: string[];
  businessTypes: BusinessType[];
}
```

### 2.2 Authorization (RBAC)
```typescript
enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  FINANCE = 'finance',
  OPERASIONAL = 'operasional',
  MARKETING = 'marketing',
  HRD = 'hrd',
  INVENTORY = 'inventory',
  TOUR_LEADER = 'tour_leader',
  MUTHAWWIF = 'muthawwif',      // Umroh-specific
  EVENT_COORD = 'event_coord',  // MICE-specific
  AGEN = 'agen',
  SALES = 'sales',
  CUSTOMER = 'customer',
}
```

---

## 3. API ENDPOINTS

### 3.1 Tenant & Configuration
```
GET    /api/tenant/config           - Get tenant configuration
PUT    /api/tenant/config           - Update configuration
GET    /api/tenant/features         - Get feature flags
PUT    /api/tenant/features         - Update features
GET    /api/tenant/terminology      - Get terminology mapping
PUT    /api/tenant/terminology      - Update terminology
GET    /api/tenant/business-types   - Get enabled business types
```

### 3.2 Destination Management
```
# Countries
GET    /api/destination/countries         - List countries
GET    /api/destination/countries/:code   - Country detail
POST   /api/destination/countries         - Add country
PUT    /api/destination/countries/:code   - Update country

# Cities
GET    /api/destination/cities            - List cities
GET    /api/destination/cities/:id        - City detail
POST   /api/destination/cities            - Add city
PUT    /api/destination/cities/:id        - Update city

# Points of Interest
GET    /api/destination/poi               - List POIs
GET    /api/destination/poi/:id           - POI detail
POST   /api/destination/poi               - Add POI
PUT    /api/destination/poi/:id           - Update POI

# Visa Requirements
GET    /api/destination/visa-requirements - List visa requirements
GET    /api/destination/visa-requirements/:countryCode - By country
POST   /api/destination/visa-requirements - Add requirement
```

### 3.3 Package Management
```
# Packages (Multi-type)
GET    /api/package                       - List packages
GET    /api/package/:id                   - Package detail
POST   /api/package                       - Create package
PUT    /api/package/:id                   - Update package
DELETE /api/package/:id                   - Delete package
POST   /api/package/:id/duplicate         - Duplicate package

# Filter by type
GET    /api/package?type=umroh            - Umroh packages
GET    /api/package?type=outbound         - Outbound packages
GET    /api/package?type=domestic         - Domestic packages
GET    /api/package?type=mice             - MICE packages

# Itinerary
GET    /api/package/:id/itinerary         - Get itinerary
PUT    /api/package/:id/itinerary         - Update itinerary
POST   /api/package/:id/itinerary/day     - Add day
DELETE /api/package/:id/itinerary/day/:dayId - Remove day

# Pricing
GET    /api/package/:id/pricing           - Get pricing
PUT    /api/package/:id/pricing           - Update pricing
POST   /api/package/:id/pricing/seasonal  - Add seasonal price
```

### 3.4 Schedule/Departure Management
```
GET    /api/schedule                      - List schedules
GET    /api/schedule/:id                  - Schedule detail
POST   /api/schedule                      - Create schedule
PUT    /api/schedule/:id                  - Update schedule
DELETE /api/schedule/:id                  - Delete schedule
GET    /api/schedule/:id/availability     - Check availability
GET    /api/schedule/calendar             - Calendar view

# Filter
GET    /api/schedule?type=umroh&month=2024-01
GET    /api/schedule?destination=japan&month=2024-03
```

### 3.5 Customer Management
```
# Universal customer endpoints
GET    /api/customer                      - List customers
GET    /api/customer/:id                  - Customer detail
POST   /api/customer                      - Create customer
PUT    /api/customer/:id                  - Update customer
DELETE /api/customer/:id                  - Delete (soft)
GET    /api/customer/:id/documents        - Customer documents
GET    /api/customer/:id/bookings         - Booking history
GET    /api/customer/:id/travel-history   - Travel history
POST   /api/customer/import               - Import customers
GET    /api/customer/export               - Export customers

# Customer Preferences
GET    /api/customer/:id/preferences      - Get preferences
PUT    /api/customer/:id/preferences      - Update preferences

# Family/Group
GET    /api/customer/:id/family           - Family members
POST   /api/customer/:id/family           - Add family member

# Umroh-specific (conditional)
GET    /api/customer/:id/mahram           - Mahram info
PUT    /api/customer/:id/mahram           - Update mahram
```

### 3.6 Booking (Multi-Type)
```
# Universal booking
GET    /api/booking                       - List bookings
GET    /api/booking/:id                   - Booking detail
POST   /api/booking                       - Create booking
PUT    /api/booking/:id                   - Update booking
PATCH  /api/booking/:id/status            - Update status
POST   /api/booking/:id/cancel            - Cancel booking
GET    /api/booking/:id/invoice           - Get invoice

# Booking by type
POST   /api/booking/umroh                 - Umroh booking
POST   /api/booking/haji                  - Haji booking
POST   /api/booking/tour                  - Tour booking
POST   /api/booking/mice                  - MICE booking
POST   /api/booking/fit                   - FIT booking

# Additional transactions
POST   /api/transaction/hotel-only
POST   /api/transaction/flight-only
POST   /api/transaction/visa-only
POST   /api/transaction/land-arrangement
POST   /api/transaction/transfer
POST   /api/transaction/activity
POST   /api/transaction/insurance
```

### 3.7 Payment & Finance
```
# Payment
GET    /api/payment                       - List payments
POST   /api/payment                       - Create payment
POST   /api/payment/charge                - Charge (gateway)
POST   /api/payment/webhook/:provider     - Webhook handler
GET    /api/payment/:id/receipt           - Get receipt
POST   /api/payment/:id/refund            - Refund

# Multi-currency
GET    /api/currency/rates                - Exchange rates
POST   /api/currency/convert              - Convert amount
GET    /api/currency/supported            - Supported currencies

# Accounting
GET    /api/accounting/coa
POST   /api/accounting/journal
GET    /api/accounting/ledger
GET    /api/accounting/reports/balance-sheet
GET    /api/accounting/reports/income-statement
GET    /api/accounting/reports/cash-flow
```

### 3.8 Document & Visa
```
# Documents
GET    /api/document                      - List documents
POST   /api/document/upload               - Upload document
POST   /api/document/ocr                  - OCR extract
PUT    /api/document/:id/verify           - Verify document
GET    /api/document/checklist/:destinationId - Document checklist

# Visa
GET    /api/visa                          - List visa applications
POST   /api/visa                          - Create application
PUT    /api/visa/:id/status               - Update status
POST   /api/visa/:id/appointment          - Set appointment
GET    /api/visa/requirements/:countryCode - Get requirements
```

### 3.9 Operasional
```
# Manifest (Multi-type)
GET    /api/manifest                      - List manifests
POST   /api/manifest                      - Create manifest
GET    /api/manifest/:id                  - Manifest detail
PUT    /api/manifest/:id                  - Update manifest
POST   /api/manifest/:id/assign-customer  - Assign customer
POST   /api/manifest/:id/assign-leader    - Assign tour leader
GET    /api/manifest/:id/rooming          - Rooming list
POST   /api/manifest/:id/rooming/auto     - Auto-assign rooms
GET    /api/manifest/:id/itinerary        - Trip itinerary
GET    /api/manifest/:id/export           - Export manifest

# Transportation
GET    /api/transport/flights             - List flights
POST   /api/transport/flights             - Add flight
GET    /api/transport/transfers           - List transfers
POST   /api/transport/transfers           - Add transfer

# Accommodation
GET    /api/accommodation/hotels          - List hotels
POST   /api/accommodation/rooming         - Create rooming list
```

### 3.10 Inventory
```
GET    /api/inventory/products            - List products
POST   /api/inventory/products            - Add product
GET    /api/inventory/stock               - Stock levels
POST   /api/inventory/stock/purchase      - Purchase order
POST   /api/inventory/stock/transfer      - Stock transfer
POST   /api/inventory/distribution        - Distribute to customers
GET    /api/inventory/reports             - Inventory reports
```

### 3.11 HRIS
```
GET    /api/hr/employees                  - List employees
POST   /api/hr/employees                  - Add employee
GET    /api/hr/attendance                 - Attendance
POST   /api/hr/attendance/clock           - Clock in/out
GET    /api/hr/leave                      - Leave requests
POST   /api/hr/leave                      - Submit leave
GET    /api/hr/payroll                    - Payroll
POST   /api/hr/payroll/generate           - Generate payroll

# Tour Leaders
GET    /api/hr/tour-leaders               - List tour leaders
GET    /api/hr/tour-leaders/:id           - Leader detail
PUT    /api/hr/tour-leaders/:id/assign    - Assign to trip
GET    /api/hr/tour-leaders/:id/schedule  - Leader schedule
GET    /api/hr/tour-leaders/:id/reviews   - Reviews & ratings
```

### 3.12 Agent & Sales
```
GET    /api/agent                         - List agents
POST   /api/agent                         - Register agent
GET    /api/agent/:id/website             - Agent website config
PUT    /api/agent/:id/website             - Update website
GET    /api/agent/:id/commission          - Commission history

GET    /api/sales                         - List sales
GET    /api/sales/leaderboard             - Leaderboard
GET    /api/sales/:id/target              - Sales target

GET    /api/commission                    - List commissions
POST   /api/commission/calculate          - Calculate
POST   /api/commission/:id/pay            - Pay commission
```

### 3.13 Marketing
```
POST   /api/marketing/whatsapp/send       - Send WhatsApp
POST   /api/marketing/whatsapp/broadcast  - Broadcast
POST   /api/marketing/email/campaign      - Email campaign
GET    /api/marketing/voucher             - List vouchers
POST   /api/marketing/voucher             - Create voucher
POST   /api/marketing/voucher/validate    - Validate code
GET    /api/marketing/leads               - List leads
POST   /api/marketing/landing-page        - Create landing page
```

### 3.14 Tracking & IoT
```
GET    /api/tracking/live                 - Live locations
GET    /api/tracking/customer/:id         - Customer location
POST   /api/tracking/location             - Report location
GET    /api/tracking/manifest/:id         - Manifest tracking

GET    /api/iot/devices                   - List devices
POST   /api/iot/devices                   - Register device
POST   /api/iot/devices/:id/assign        - Assign to customer

GET    /api/geofence                      - List geofences
POST   /api/geofence                      - Create geofence
GET    /api/alerts                        - List alerts
PUT    /api/alerts/:id/resolve            - Resolve alert

POST   /api/attendance/checkin            - Check-in
POST   /api/attendance/face               - Face recognition
```

### 3.15 AI Services
```
POST   /api/ai/chat                       - Chatbot
POST   /api/ai/ocr/passport               - OCR passport
POST   /api/ai/ocr/ktp                    - OCR KTP
POST   /api/ai/face/enroll                - Enroll face
POST   /api/ai/face/verify                - Verify face
POST   /api/ai/trip-planner               - AI trip suggestion
GET    /api/ai/price-prediction           - Price prediction
POST   /api/ai/translate                  - Translation
```

### 3.16 Umroh/Haji Specific
*(Only available when feature enabled)*
```
GET    /api/umroh/prayer-times            - Prayer times by location
GET    /api/umroh/qibla                   - Qibla direction
GET    /api/umroh/manasik                 - Manasik guide
GET    /api/umroh/dua                     - Dua & dzikir
GET    /api/umroh/masjid-locator          - Masjid locator
POST   /api/umroh/validate-mahram         - Validate mahram
```

### 3.17 MICE Specific
*(Only available when feature enabled)*
```
GET    /api/mice/events                   - List events
POST   /api/mice/events                   - Create event
GET    /api/mice/events/:id/delegates     - Delegates
POST   /api/mice/events/:id/register      - Register delegate
GET    /api/mice/events/:id/sessions      - Sessions
POST   /api/mice/events/:id/badge         - Generate badge
GET    /api/mice/corporate-billing        - Corporate billing
```

### 3.18 CMS
```
GET    /api/cms/pages                     - List pages
POST   /api/cms/pages                     - Create page
GET    /api/cms/articles                  - List articles
POST   /api/cms/articles                  - Create article
GET    /api/cms/media                     - List media
POST   /api/cms/media/upload              - Upload media
GET    /api/cms/theme                     - Theme settings
PUT    /api/cms/theme                     - Update theme
```

### 3.19 Reports
```
GET    /api/reports/dashboard             - Dashboard summary
GET    /api/reports/by-business-type      - Report by type
GET    /api/reports/by-destination        - Report by destination
GET    /api/reports/financial             - Financial reports
GET    /api/reports/operational           - Operational reports
GET    /api/reports/sales                 - Sales reports
POST   /api/reports/custom                - Custom report
POST   /api/reports/export                - Export report
```

### 3.20 Settings
```
GET    /api/settings                      - All settings
PUT    /api/settings                      - Update settings
GET    /api/settings/business-types       - Business type config
PUT    /api/settings/business-types       - Update business types
GET    /api/settings/currencies           - Currency settings
PUT    /api/settings/currencies           - Update currencies
GET    /api/settings/languages            - Language settings
PUT    /api/settings/languages            - Update languages
GET    /api/settings/integrations         - Integration settings
```

---

## 4. MIDDLEWARE

### 4.1 Tenant Middleware
```typescript
// Extract tenant from subdomain/header
export const tenantMiddleware = async (req, res, next) => {
  const tenantId = extractTenantId(req);
  const tenant = await getTenantConfig(tenantId);
  req.tenant = tenant;
  next();
};
```

### 4.2 Feature Gate Middleware
```typescript
// Check if feature is enabled for tenant
export const featureGate = (feature: string) => {
  return async (req, res, next) => {
    if (!req.tenant.features[feature]) {
      return res.status(403).json({
        error: 'Feature not enabled for this tenant'
      });
    }
    next();
  };
};

// Usage
router.get('/umroh/prayer-times', 
  featureGate('umrohModule'),
  prayerTimesHandler
);
```

### 4.3 i18n Middleware
```typescript
// Set language from header/user preference
export const i18nMiddleware = async (req, res, next) => {
  const lang = req.headers['accept-language'] || 
               req.user?.preferredLanguage || 
               req.tenant.defaultLanguage;
  req.locale = lang;
  next();
};
```

---

## 5. BACKGROUND JOBS

```typescript
// Universal Jobs
- payment.reminder           - Payment reminders
- document.expiry            - Document expiry check
- report.daily               - Daily reports
- report.monthly             - Monthly reports
- marketing.campaign         - Scheduled campaigns
- marketing.birthday         - Birthday greetings

// Inventory Jobs
- inventory.lowstock         - Low stock alerts
- inventory.valuation        - Inventory valuation

// HR Jobs
- hr.attendance.reminder     - Attendance reminder
- hr.payroll.generate        - Generate payroll

// IoT Jobs
- iot.device.health          - Device health check
- iot.location.aggregate     - Aggregate locations
- iot.alert.process          - Process alerts

// Currency Jobs
- currency.rates.update      - Update exchange rates (daily)

// Conditional Jobs (based on features)
- umroh.prayer.notify        - Prayer time notifications
- mice.event.reminder        - Event reminders
```

---

## 6. REAL-TIME EVENTS

```typescript
// Socket.io Namespaces
/tracking      - Location updates
/notification  - User notifications
/dashboard     - Dashboard stats
/chat          - Group chat
/mice          - MICE events (if enabled)

// Events
socket.on('location:update', data)
socket.on('alert:new', data)
socket.on('booking:new', data)
socket.on('payment:received', data)
socket.on('chat:message', data)
```

---

## 7. MULTI-LANGUAGE SUPPORT

```typescript
// API Response with i18n
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;  // Localized message
  meta?: {
    locale: string;
    currency: string;
  };
}

// Localized content
const localizedPackage = {
  id: '...',
  name: {
    id: 'Paket Umroh Plus',
    en: 'Umroh Plus Package',
    ar: 'باقة العمرة بلس'
  },
  description: {
    id: 'Paket umroh 12 hari...',
    en: '12-day umroh package...',
    ar: '...'
  }
};
```

---

## 8. MULTI-CURRENCY

```typescript
// Currency Service
interface CurrencyService {
  getRate(from: string, to: string): Promise<number>;
  convert(amount: number, from: string, to: string): Promise<number>;
  formatAmount(amount: number, currency: string, locale: string): string;
}

// Price with multi-currency
interface Price {
  amount: number;
  currency: string;
  displayAmount?: Record<string, number>;  // Pre-calculated for common currencies
}

// Auto-update rates
const updateRates = async () => {
  const rates = await fetchExchangeRates();  // From API
  await redis.set('exchange_rates', JSON.stringify(rates));
};
```

---

## 9. INTEGRATIONS

### 9.1 Payment Gateways
```typescript
// Multi-gateway support
const paymentGateways = {
  midtrans: MidtransGateway,
  xendit: XenditGateway,
  stripe: StripeGateway,      // International
  paypal: PayPalGateway,      // International
};

// Select based on currency/region
const getGateway = (currency: string, region: string) => {
  if (currency === 'IDR') return paymentGateways.midtrans;
  if (region === 'ASIA') return paymentGateways.xendit;
  return paymentGateways.stripe;
};
```

### 9.2 External APIs
```typescript
// GDS Integration (optional)
- Amadeus API     // Flight booking
- Sabre API       // Flight booking
- Travelport      // Flight booking

// Hotel APIs (optional)
- Agoda API
- Booking.com API
- Expedia API

// Others
- Google Maps API
- OpenWeather API
- Exchange Rate API
- OpenAI API
- WhatsApp Business API
```

---

## 10. SECURITY

```typescript
// Multi-tenant data isolation
const getTenantData = (tenantId: string, model: string) => {
  return prisma[model].findMany({
    where: { tenantId }  // Always filter by tenant
  });
};

// Rate limiting per tenant
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => req.tenant.rateLimit || 100
});

// API Key for integrations
const validateApiKey = async (key: string, tenantId: string) => {
  const apiKey = await prisma.apiKey.findFirst({
    where: { key, tenantId, isActive: true }
  });
  return apiKey !== null;
};
```
