# REQUIREMENT FRONTEND
## Sistem Informasi Travel MULTI-PURPOSE

---

## 1. TECH STACK

```
Framework:      Next.js 14 (App Router)
Language:       TypeScript
Styling:        Tailwind CSS + shadcn/ui
Icons:          Lucide React
State:          Zustand + TanStack Query
Forms:          React Hook Form + Zod
Tables:         TanStack Table
Charts:         Recharts / Tremor
Date:           date-fns / date-fns-tz
i18n:           next-intl
Currency:       Intl.NumberFormat + custom
Maps:           Google Maps / Mapbox
Real-time:      Socket.io-client
Editor:         TipTap
Page Builder:   Custom / GrapesJS
PDF:            react-pdf / jspdf
```

---

## 2. MULTI-LANGUAGE & MULTI-CURRENCY

### 2.1 i18n Setup
```typescript
// Supported languages
const languages = ['id', 'en', 'ar', 'jp', 'kr', 'zh'];

// Locale routing
/id/dashboard     // Indonesian
/en/dashboard     // English
/ar/dashboard     // Arabic (RTL)

// Translation structure
{
  "common": {
    "customer": "Pelanggan",
    "booking": "Pemesanan",
    "payment": "Pembayaran"
  },
  "umroh": {
    "customer": "Jamaah",
    "leader": "Muthawwif"
  },
  "tour": {
    "customer": "Peserta",
    "leader": "Tour Leader"
  }
}
```

### 2.2 Multi-Currency
```typescript
// Currency formatter hook
const useCurrency = () => {
  const { currency, locale } = useSettings();
  
  const format = (amount: number, cur?: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cur || currency,
    }).format(amount);
  };
  
  return { format, currency };
};

// Usage
const { format } = useCurrency();
format(25000000);        // Rp 25.000.000
format(1000, 'USD');     // $1,000.00
format(3500, 'SAR');     // SAR 3,500
```

---

## 3. FOLDER STRUCTURE

```
src/
├── app/
│   ├── [locale]/                    # i18n routing
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── customers/           # Universal (was jamaah)
│   │   │   ├── bookings/
│   │   │   ├── packages/
│   │   │   ├── schedules/
│   │   │   ├── destinations/        # NEW: Destination management
│   │   │   ├── payments/
│   │   │   ├── documents/
│   │   │   ├── manifests/
│   │   │   ├── inventory/
│   │   │   ├── hr/
│   │   │   ├── agents/
│   │   │   ├── marketing/
│   │   │   ├── tracking/
│   │   │   ├── reports/
│   │   │   ├── cms/
│   │   │   ├── settings/
│   │   │   │   ├── general/
│   │   │   │   ├── business-types/  # NEW
│   │   │   │   ├── currencies/      # NEW
│   │   │   │   ├── languages/       # NEW
│   │   │   │   └── features/        # NEW
│   │   │   └── layout.tsx
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── packages/
│   │   │   │   ├── umroh/           # Umroh packages
│   │   │   │   ├── haji/            # Haji packages
│   │   │   │   ├── tour/            # Tour packages
│   │   │   │   └── [slug]/
│   │   │   └── destinations/        # Browse destinations
│   │   ├── (portal)/
│   │   └── (agent)/
│   └── api/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── cards/
│   ├── maps/
│   ├── tracking/
│   ├── business-type/               # Business-type specific
│   │   ├── umroh/
│   │   ├── tour/
│   │   └── mice/
│   └── shared/
├── hooks/
│   ├── useAuth.ts
│   ├── useBusinessType.ts           # NEW
│   ├── useFeatureFlag.ts            # NEW
│   ├── useCurrency.ts               # NEW
│   ├── useLocale.ts
│   └── ...
├── lib/
│   ├── i18n.ts
│   ├── currency.ts
│   ├── feature-flags.ts
│   └── ...
├── stores/
│   ├── authStore.ts
│   ├── settingsStore.ts             # Business settings
│   └── ...
├── messages/                        # i18n messages
│   ├── id.json
│   ├── en.json
│   ├── ar.json
│   └── ...
└── types/
```

---

## 4. ROUTES / HALAMAN

### 4.1 Public Pages
```
/                                 - Homepage (dynamic per business type)
/packages                         - All packages
/packages/umroh                   - Umroh packages
/packages/haji                    - Haji packages  
/packages/tour                    - Tour packages
/packages/tour/[destination]      - By destination (korea, japan, etc)
/packages/[slug]                  - Package detail
/destinations                     - Browse destinations
/destinations/[country]           - Country detail
/schedules                        - Upcoming schedules
/about                           - About us
/contact                         - Contact
/blog                            - Blog
```

### 4.2 Dashboard - Universal
```
/dashboard                        - Overview
/dashboard/analytics              - Analytics

# Customers (terminology changes based on business type)
/customers                        - List
/customers/add                    - Add new
/customers/[id]                   - Detail
/customers/[id]/edit              - Edit
/customers/[id]/documents         - Documents
/customers/import                 - Import

# Bookings
/bookings                         - List
/bookings/add                     - New booking wizard
/bookings/add/umroh               - Umroh booking
/bookings/add/tour                - Tour booking
/bookings/add/mice                - MICE booking
/bookings/[id]                    - Detail

# Packages
/packages-admin                   - List packages
/packages-admin/add               - Add package
/packages-admin/[id]/edit         - Edit
/packages-admin/[id]/itinerary    - Itinerary builder

# Destinations (NEW)
/destinations-admin               - List
/destinations-admin/countries     - Countries
/destinations-admin/cities        - Cities
/destinations-admin/pois          - Points of interest
/destinations-admin/visa          - Visa requirements

# Schedules
/schedules-admin                  - List
/schedules-admin/add              - Add
/schedules-admin/calendar         - Calendar view

# Payments & Finance
/payments                         - List
/payments/verify                  - Verify manual
/invoices                         - Invoices
/finance/journal                  - Journal
/finance/reports                  - Reports

# Documents & Visa
/documents                        - List
/documents/pending                - Pending
/visa                             - Visa applications

# Operations
/manifests                        - List
/manifests/add                    - Create
/manifests/[id]                   - Detail
/manifests/[id]/participants      - Participants
/manifests/[id]/rooming          - Rooming

# Inventory
/inventory/products               - Products
/inventory/stock                  - Stock
/inventory/purchase               - PO

# HR
/hr/employees                     - Employees
/hr/tour-leaders                  - Tour leaders (NEW)
/hr/attendance                    - Attendance
/hr/payroll                       - Payroll

# Agents & Sales
/agents                           - Agents
/sales                            - Sales
/commissions                      - Commissions

# Marketing
/marketing/campaigns              - Campaigns
/marketing/vouchers               - Vouchers
/marketing/leads                  - Leads

# Tracking
/tracking                         - Live map
/tracking/alerts                  - Alerts
/tracking/devices                 - Devices

# CMS
/cms/pages                        - Pages
/cms/articles                     - Articles
/cms/media                        - Media

# Settings (NEW options)
/settings/general                 - General
/settings/business-types          - Business types config
/settings/features                - Feature toggles
/settings/currencies              - Currency settings
/settings/languages               - Language settings
/settings/users                   - Users
/settings/roles                   - Roles
```

### 4.3 Business-Type Specific Routes
```
# Umroh/Haji specific (only when feature enabled)
/umroh/manasik                    - Manasik content
/umroh/dua                        - Dua & dzikir
/umroh/prayer-times               - Prayer times config

# MICE specific (only when feature enabled)
/mice/events                      - Events
/mice/events/[id]/delegates       - Delegates
/mice/events/[id]/sessions        - Sessions
/mice/events/[id]/badges          - Badge printing
```

---

## 5. KOMPONEN UTAMA

### 5.1 Business Type Switcher
```typescript
// Quick switch between business contexts
<BusinessTypeSwitcher
  current={businessType}
  available={['umroh', 'outbound', 'domestic']}
  onChange={setBusinessType}
/>

// Renders as tabs or dropdown
┌─────────────────────────────────┐
│ [Umroh] [Tour] [Domestic]       │
└─────────────────────────────────┘
```

### 5.2 Dynamic Terminology
```typescript
// Hook for dynamic labels
const useTerminology = () => {
  const { businessType, terminology } = useSettings();
  
  const t = (key: string) => {
    return terminology[businessType]?.[key] || terminology.default[key];
  };
  
  return { t };
};

// Usage
const { t } = useTerminology();
<h1>{t('customer')} List</h1>  // "Jamaah List" or "Peserta List"
```

### 5.3 Feature-Gated Components
```typescript
// Only render if feature is enabled
<FeatureGate feature="umrohModule">
  <PrayerTimesWidget />
  <QiblaDirection />
</FeatureGate>

<FeatureGate feature="iotTracking">
  <LiveTrackingMap />
</FeatureGate>

// Implementation
const FeatureGate = ({ feature, children }) => {
  const { isEnabled } = useFeatureFlag(feature);
  if (!isEnabled) return null;
  return children;
};
```

### 5.4 Package Card (Multi-Type)
```typescript
<PackageCard
  package={pkg}
  type={pkg.type}  // umroh, tour, mice
  currency={currency}
  locale={locale}
/>

// Renders differently based on type
// Umroh: Shows hotel distance to Masjid
// Tour: Shows destination highlights
// MICE: Shows venue info
```

### 5.5 Destination Picker
```typescript
<DestinationPicker
  type="multi"  // single or multi
  value={selectedDestinations}
  onChange={setDestinations}
  filter={{ continent: 'asia' }}
/>

// Shows country/city hierarchy with search
┌─────────────────────────────────┐
│ 🔍 Search destinations...       │
├─────────────────────────────────┤
│ ▼ Asia                          │
│   ├─ 🇯🇵 Japan                  │
│   │   ├─ Tokyo                  │
│   │   └─ Osaka                  │
│   ├─ 🇰🇷 South Korea            │
│   │   └─ Seoul                  │
│   └─ 🇹🇭 Thailand               │
│       └─ Bangkok                │
│ ▼ Europe                        │
│   └─ ...                        │
└─────────────────────────────────┘
```

### 5.6 Itinerary Builder
```typescript
<ItineraryBuilder
  days={package.duration}
  itinerary={itinerary}
  destinations={package.destinations}
  onChange={setItinerary}
/>

// Drag & drop day-by-day builder
┌─────────────────────────────────────────────┐
│ Day 1 - Arrival Tokyo                       │
│ ┌─────────────────────────────────────────┐ │
│ │ ✈️ Arrival at Narita Airport            │ │
│ │ 🚌 Transfer to Hotel                    │ │
│ │ 🏨 Check-in Hotel Shinjuku              │ │
│ │ 🍽️ Dinner at local restaurant          │ │
│ │ [+ Add Activity]                        │ │
│ └─────────────────────────────────────────┘ │
│ Day 2 - Tokyo Exploration                   │
│ ...                                         │
└─────────────────────────────────────────────┘
```

### 5.7 Multi-Currency Price Display
```typescript
<PriceDisplay
  amount={25000000}
  baseCurrency="IDR"
  showOther={['USD', 'SAR']}
/>

// Renders:
// Rp 25.000.000
// ≈ $1,562.50 | SAR 5,859.38
```

### 5.8 Booking Wizard (Universal)
```typescript
<BookingWizard
  type={bookingType}  // umroh, tour, mice
  steps={getStepsForType(bookingType)}
  onComplete={handleComplete}
/>

// Steps vary by type:
// Umroh: Customer → Mahram → Package → Schedule → Room → Payment
// Tour:  Customer → Package → Schedule → Room → Addons → Payment
// MICE:  Company → Delegates → Event → Requirements → Payment
```

---

## 6. STATE MANAGEMENT

### 6.1 Settings Store
```typescript
interface SettingsState {
  // Tenant config
  tenantId: string;
  businessTypes: BusinessType[];
  activeBusinessType: BusinessType;
  
  // Features
  features: FeatureFlags;
  
  // Localization
  locale: string;
  currency: string;
  timezone: string;
  
  // Terminology
  terminology: TerminologyMap;
  
  // Actions
  setBusinessType: (type: BusinessType) => void;
  setLocale: (locale: string) => void;
  setCurrency: (currency: string) => void;
}
```

### 6.2 Feature Flags Hook
```typescript
const useFeatureFlag = (feature: string) => {
  const { features } = useSettings();
  
  return {
    isEnabled: features[feature] ?? false,
  };
};

// Usage
const { isEnabled: hasTracking } = useFeatureFlag('iotTracking');
const { isEnabled: hasUmroh } = useFeatureFlag('umrohModule');
```

---

## 7. RESPONSIVE & RTL

### 7.1 RTL Support (Arabic)
```css
/* Automatic RTL when locale is 'ar' */
[dir="rtl"] {
  .sidebar { right: 0; left: auto; }
  .text-left { text-align: right; }
  .ml-4 { margin-left: 0; margin-right: 1rem; }
}
```

### 7.2 Responsive Breakpoints
```css
sm: 640px    /* Mobile */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Large */
2xl: 1536px  /* XL */
```

---

## 8. CONDITIONAL UI PER BUSINESS TYPE

### 8.1 Dashboard Widgets
```typescript
// Dashboard shows different widgets per business type
const DashboardWidgets = () => {
  const { activeBusinessType } = useSettings();
  
  return (
    <>
      {/* Universal widgets */}
      <TotalBookingsWidget />
      <RevenueWidget />
      <UpcomingDeparturesWidget />
      
      {/* Umroh-specific */}
      {activeBusinessType === 'umroh' && (
        <>
          <PrayerTimesWidget />
          <MahramPendingWidget />
        </>
      )}
      
      {/* Tour-specific */}
      {activeBusinessType === 'outbound' && (
        <>
          <PopularDestinationsWidget />
          <VisaStatusWidget />
        </>
      )}
      
      {/* MICE-specific */}
      {activeBusinessType === 'mice' && (
        <>
          <UpcomingEventsWidget />
          <DelegateCountWidget />
        </>
      )}
    </>
  );
};
```

### 8.2 Form Fields
```typescript
// Customer form with conditional fields
<CustomerForm>
  {/* Universal fields */}
  <TextField name="fullName" label={t('fullName')} required />
  <TextField name="phone" required />
  <TextField name="email" />
  
  {/* Passport (for international travel) */}
  <FeatureGate feature={['umroh', 'outbound', 'inbound']}>
    <PassportSection />
  </FeatureGate>
  
  {/* Umroh-specific */}
  <FeatureGate feature="umrohModule">
    <MahramSection />
    <TextField name="fatherName" />
  </FeatureGate>
  
  {/* MICE-specific */}
  <FeatureGate feature="miceModule">
    <CompanySection />
  </FeatureGate>
</CustomerForm>
```

---

## 9. REAL-TIME & OFFLINE

### 9.1 Socket Events
```typescript
// Real-time updates
socket.on('booking:new', handleNewBooking);
socket.on('payment:received', handlePayment);
socket.on('location:update', handleLocation);
socket.on('alert:new', handleAlert);

// Business-type specific
socket.on('umroh:prayer-time', handlePrayerTime);
socket.on('mice:delegate-registered', handleDelegate);
```

### 9.2 PWA & Offline
```typescript
// Offline support
- Cache static assets
- Cache API responses
- Queue offline actions
- Sync when online
- Offline maps (downloaded)
```

---

## 10. TESTING

```typescript
// Unit tests
- Component rendering per business type
- Feature flag toggling
- Currency formatting
- i18n translations

// E2E tests
- Booking flow per business type
- Multi-language navigation
- Feature-gated routes
```
