# Graph Report - .  (2026-06-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1038 nodes · 2333 edges · 85 communities (66 shown, 19 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 129 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f0225bbb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Promotion & Rooming API|Promotion & Rooming API]]
- [[_COMMUNITY_Financial Pages|Financial Pages]]
- [[_COMMUNITY_Tenant Management API|Tenant Management API]]
- [[_COMMUNITY_Booking Update Flow|Booking Update Flow]]
- [[_COMMUNITY_Entity Creation API|Entity Creation API]]
- [[_COMMUNITY_Agent & Booking Pages|Agent & Booking Pages]]
- [[_COMMUNITY_Booking & Employee Forms|Booking & Employee Forms]]
- [[_COMMUNITY_Login & Manifest Form|Login & Manifest Form]]
- [[_COMMUNITY_Customer Form|Customer Form]]
- [[_COMMUNITY_Generic CRUD API|Generic CRUD API]]
- [[_COMMUNITY_Auth & User API|Auth & User API]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Huawei Health API|Huawei Health API]]
- [[_COMMUNITY_Root Layout & Providers|Root Layout & Providers]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Dashboard Page|Dashboard Page]]
- [[_COMMUNITY_Dashboard Layout & Theme|Dashboard Layout & Theme]]
- [[_COMMUNITY_Flight & Hotel Pages|Flight & Hotel Pages]]
- [[_COMMUNITY_Inventory Product Pages|Inventory Product Pages]]
- [[_COMMUNITY_Build & Database Scripts|Build & Database Scripts]]
- [[_COMMUNITY_System Architecture & Requirements|System Architecture & Requirements]]
- [[_COMMUNITY_Dev Tooling Config|Dev Tooling Config]]
- [[_COMMUNITY_Data Import API|Data Import API]]
- [[_COMMUNITY_Google Drive Integration|Google Drive Integration]]
- [[_COMMUNITY_Backend Architecture Requirements|Backend Architecture Requirements]]
- [[_COMMUNITY_Manifest API|Manifest API]]
- [[_COMMUNITY_Agent Form|Agent Form]]
- [[_COMMUNITY_Middleware & Subdomain Routing|Middleware & Subdomain Routing]]
- [[_COMMUNITY_AI Assistant & Finance|AI Assistant & Finance]]
- [[_COMMUNITY_Development Guidelines & Design|Development Guidelines & Design]]
- [[_COMMUNITY_AI & IoT Tracking System|AI & IoT Tracking System]]
- [[_COMMUNITY_Bank & Participant API|Bank & Participant API]]
- [[_COMMUNITY_Promotion Listing Page|Promotion Listing Page]]
- [[_COMMUNITY_Settings Page|Settings Page]]
- [[_COMMUNITY_Database Models|Database Models]]
- [[_COMMUNITY_Permissions & Menu Access|Permissions & Menu Access]]
- [[_COMMUNITY_Seed Data Generator|Seed Data Generator]]
- [[_COMMUNITY_Avatar Component|Avatar Component]]
- [[_COMMUNITY_Kanban Booking View|Kanban Booking View]]
- [[_COMMUNITY_Employee Form & HRIS|Employee Form & HRIS]]
- [[_COMMUNITY_Package Configuration|Package Configuration]]
- [[_COMMUNITY_Promotion Detail Page|Promotion Detail Page]]
- [[_COMMUNITY_Button & Empty State|Button & Empty State]]
- [[_COMMUNITY_Mobile App & Business Types|Mobile App & Business Types]]
- [[_COMMUNITY_System Landing Page|System Landing Page]]
- [[_COMMUNITY_Public Booking Page|Public Booking Page]]
- [[_COMMUNITY_Flight API|Flight API]]
- [[_COMMUNITY_Portal Layout|Portal Layout]]
- [[_COMMUNITY_Landing Page|Landing Page]]
- [[_COMMUNITY_Tenant API|Tenant API]]
- [[_COMMUNITY_Skeleton Components|Skeleton Components]]
- [[_COMMUNITY_Tabs Component|Tabs Component]]
- [[_COMMUNITY_Itinerary Page|Itinerary Page]]
- [[_COMMUNITY_Public Packages Page|Public Packages Page]]
- [[_COMMUNITY_Gemini AI Query API|Gemini AI Query API]]
- [[_COMMUNITY_Trash & Restore API|Trash & Restore API]]
- [[_COMMUNITY_Airline API|Airline API]]
- [[_COMMUNITY_Bulk Delete API|Bulk Delete API]]
- [[_COMMUNITY_Portal Documents|Portal Documents]]
- [[_COMMUNITY_Portal E-Tickets|Portal E-Tickets]]
- [[_COMMUNITY_Portal Payments|Portal Payments]]
- [[_COMMUNITY_Public Schedules|Public Schedules]]
- [[_COMMUNITY_Portal Support Tickets|Portal Support Tickets]]
- [[_COMMUNITY_Template API|Template API]]
- [[_COMMUNITY_NextAuth Types|NextAuth Types]]
- [[_COMMUNITY_Badge Component|Badge Component]]
- [[_COMMUNITY_Breadcrumb Component|Breadcrumb Component]]
- [[_COMMUNITY_Dropdown Component|Dropdown Component]]
- [[_COMMUNITY_UX Flow Documentation|UX Flow Documentation]]
- [[_COMMUNITY_My Bookings Page|My Bookings Page]]
- [[_COMMUNITY_Portal Packages|Portal Packages]]
- [[_COMMUNITY_Seed Script|Seed Script]]
- [[_COMMUNITY_Quick Start & Tech Stack|Quick Start & Tech Stack]]
- [[_COMMUNITY_Portal Schedules|Portal Schedules]]
- [[_COMMUNITY_Portal Tracking|Portal Tracking]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Progress Report|Progress Report]]
- [[_COMMUNITY_Simple API Handler|Simple API Handler]]
- [[_COMMUNITY_Schedule & Guide Pages|Schedule & Guide Pages]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 203 edges
2. `successResponse()` - 172 edges
3. `unauthorizedResponse()` - 155 edges
4. `paginatedResponse()` - 58 edges
5. `Button` - 51 edges
6. `cn()` - 39 edges
7. `Badge()` - 38 edges
8. `Card()` - 33 edges
9. `Input` - 28 edges
10. `notFoundResponse()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Device/Location/Alert/Beacon/FaceData Models` --shares_data_with--> `Prisma Schema`  [INFERRED]
  docs/06-REQUIREMENT-AI-IOT-TRACKING.md → docs/03-ERD.md
- `Drag & Drop Itinerary Builder` --shares_data_with--> `Package Model`  [INFERRED]
  docs/04-REQUIREMENT-FRONTEND.md → docs/03-ERD.md
- `Universal Booking Wizard` --shares_data_with--> `Booking Model`  [INFERRED]
  docs/04-REQUIREMENT-FRONTEND.md → docs/03-ERD.md
- `End-to-End Booking Workflow` --shares_data_with--> `Booking Model`  [INFERRED]
  docs/UX-FLOW-DOCUMENTATION.md → docs/03-ERD.md
- `POST()` --calls--> `errorResponse()`  [INFERRED]
  src/app/api/auth/register/route.ts → src/lib/api-response.ts

## Import Cycles
- None detected.

## Communities (85 total, 19 thin omitted)

### Community 0 - "Promotion & Rooming API"
Cohesion: 0.08
Nodes (45): GET(), POST(), PUT(), DELETE(), GET(), POST(), PUT(), GET() (+37 more)

### Community 1 - "Financial Pages"
Cohesion: 0.08
Nodes (17): Commission, statusColors, typeLabels, Invoice, statusColors, Manifest, statusColors, methodLabels (+9 more)

### Community 2 - "Tenant Management API"
Cohesion: 0.08
Nodes (35): GET(), GET(), POST(), registerSchema, buildTenantCreate(), buildTenantWhere(), canAccessTenant(), getSessionTenantId() (+27 more)

### Community 3 - "Booking Update Flow"
Cohesion: 0.08
Nodes (41): updateBookingSchema, updateCustomerSchema, updateManifestSchema, updatePackageSchema, updatePaymentSchema, updateScheduleSchema, notFoundResponse(), addToManifest() (+33 more)

### Community 4 - "Entity Creation API"
Cohesion: 0.07
Nodes (34): createAgentSchema, GET(), POST(), createBookingSchema, createCustomerSchema, GET(), POST(), createEmployeeSchema (+26 more)

### Community 5 - "Agent & Booking Pages"
Cohesion: 0.07
Nodes (41): Agent, AGENT_FILTERS, AGENT_SORT_OPTIONS, AgentsPage(), tierColors, TRASH_COLUMNS, Booking, BOOKING_FILTERS (+33 more)

### Community 6 - "Booking & Employee Forms"
Cohesion: 0.06
Nodes (26): BookingFormProps, bookingSchema, paymentColors, roomOptions, statusColors, BookingForm(), BookingFormData, BookingFormProps (+18 more)

### Community 7 - "Login & Manifest Form"
Cohesion: 0.06
Nodes (23): LoginFormData, loginSchema, ManifestFormProps, Schedule, TenantFormData, tenantRegisterSchema, UserFormData, userRegisterSchema (+15 more)

### Community 8 - "Customer Form"
Cohesion: 0.18
Nodes (9): CustomerFormData, customerSchema, customerTypeColors, customerTypeOptions, genderOptions, sourceOptions, CustomerForm(), CustomerFormData (+1 more)

### Community 9 - "Generic CRUD API"
Cohesion: 0.10
Nodes (29): DELETE(), GET(), POST(), PUT(), DELETE(), GET(), POST(), PUT() (+21 more)

### Community 10 - "Auth & User API"
Cohesion: 0.07
Nodes (16): createHotelSchema, GET(), POST(), { handlers, signIn, signOut, auth }, loginSchema, globalForPrisma, PrismaModelDelegate, SOFT_DELETE_MODELS (+8 more)

### Community 11 - "Project Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, bcryptjs, clsx, date-fns, framer-motion, googleapis, @hookform/resolvers, lucide-react (+16 more)

### Community 12 - "Huawei Health API"
Cohesion: 0.11
Nodes (13): GET(), POST(), Alert, checkForAlerts(), DeviceInfo, getHuaweiService(), HealthData, HuaweiConfig (+5 more)

### Community 13 - "Root Layout & Providers"
Cohesion: 0.11
Nodes (13): inter, metadata, ConfirmContext, ConfirmOptions, ConfirmProvider(), icons, iconStyles, styles (+5 more)

### Community 14 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 15 - "Dashboard Page"
Cohesion: 0.19
Nodes (13): DashboardStats, paymentStatusColors, statusColors, cn(), CardContent(), CardDescription(), CardFooter(), CardHeader() (+5 more)

### Community 16 - "Dashboard Layout & Theme"
Cohesion: 0.21
Nodes (12): DashboardLayout(), Header(), menuItems, ROLE_MENUS, Sidebar(), defaultColors, presets, ThemeColors (+4 more)

### Community 17 - "Flight & Hotel Pages"
Cohesion: 0.15
Nodes (13): Airline, Flight, FlightsPage(), initialFormData, LandingContent, LandingSettingsPage(), GroupedRoom, Hotel (+5 more)

### Community 18 - "Inventory Product Pages"
Cohesion: 0.22
Nodes (7): Product, categoryOptions, Product, ProductForm(), ProductFormData, ProductFormProps, productSchema

### Community 19 - "Build & Database Scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:generate, db:migrate, db:push, db:seed, db:seed:full, db:studio (+8 more)

### Community 20 - "System Architecture & Requirements"
Cohesion: 0.15
Nodes (14): ERD - 80+ tables, Universal Booking Wizard, Feature-Gated Components, Frontend Requirements, i18n Multi-Language (next-intl), Drag & Drop Itinerary Builder, Multi-Currency Display, Admin Dashboard Layouts (+6 more)

### Community 21 - "Dev Tooling Config"
Cohesion: 0.14
Nodes (13): devDependencies, @auth/prisma-adapter, eslint, husky, prettier, prisma, tailwindcss, @tailwindcss/postcss (+5 more)

### Community 22 - "Data Import API"
Cohesion: 0.27
Nodes (12): importAgent(), importAirline(), importBank(), importCustomer(), importData(), importEmployee(), importHotel(), ImportModel (+4 more)

### Community 23 - "Google Drive Integration"
Cohesion: 0.29
Nodes (11): createFolder(), createTenantFolder(), deleteFile(), getAuthClient(), getFile(), listFiles(), moveFile(), SCOPES (+3 more)

### Community 24 - "Backend Architecture Requirements"
Cohesion: 0.18
Nodes (12): API Endpoints (Tenant/Destination/Package/Booking/etc), Backend Requirements, Background Jobs (BullMQ), Tenant + Feature Gate + i18n Middleware, Multi-Tenant Architecture, RBAC with Tenant Roles, Real-time Socket.io Events, Demo Credentials (+4 more)

### Community 26 - "Agent Form"
Cohesion: 0.20
Nodes (8): Agent, AgentFormData, AgentFormProps, agentSchema, tierColors, tierOptions, AgentFormData, AgentFormProps

### Community 27 - "Middleware & Subdomain Routing"
Cohesion: 0.18
Nodes (6): ManifestWithRelations, config, publicPathsExact, publicPathsPrefix, RESERVED_SUBDOMAINS, rolePathAccess

### Community 28 - "AI Assistant & Finance"
Cohesion: 0.07
Nodes (25): Message, TEMPLATE_CATEGORIES, Payment, statusColors, BankOption, BookingOption, methodOptions, Payment (+17 more)

### Community 29 - "Development Guidelines & Design"
Cohesion: 0.22
Nodes (9): NextAuth v5 OAuth + Credentials, Color Presets (emerald/ocean/royal/sunset/forest), Premium UI/UX Design System, Development Guidelines & Requirements, Google Drive Integration, Husky Pre-commit Hook, SidebarModal CRUD Pattern, Soft Delete Implementation (+1 more)

### Community 30 - "AI & IoT Tracking System"
Cohesion: 0.22
Nodes (9): AI & IoT Tracking System, Anomaly Detection (Geofence/Movement), BLE Beacon Sensors, Device/Location/Alert/Beacon/FaceData Models, Face Recognition System, Wearable Devices (Smart Card/Wristband/Tag), Customer Portal Features, Huawei Smartwatch Integration (+1 more)

### Community 31 - "Bank & Participant API"
Cohesion: 0.19
Nodes (7): createBankSchema, GET(), POST(), addParticipantSchema, DELETE(), POST(), RouteParams

### Community 32 - "Promotion Listing Page"
Cohesion: 0.31
Nodes (7): FeaturedPromoCard(), formatCurrency(), formatDate(), PromoCard(), Promotion, promoTypeConfig, promoTypes

### Community 34 - "Database Models"
Cohesion: 0.54
Nodes (8): Booking Model, Customer Model, Country/City/POI/VisaRequirement Models, Package Model, Prisma Schema, Schedule Model, Tenant Model, User Model

### Community 35 - "Permissions & Menu Access"
Cohesion: 0.29
Nodes (5): canAccessPath(), getAllowedMenus(), MENU_ITEMS, ROLE_MENUS, ROLE_PERMISSIONS

### Community 36 - "Seed Data Generator"
Cohesion: 0.43
Nodes (6): generateCode(), main(), prisma, randomDate(), randomInt(), randomItem()

### Community 37 - "Avatar Component"
Cohesion: 0.32
Nodes (7): Avatar(), AvatarGroup(), AvatarProps, colors, getColorFromName(), getInitials(), sizes

### Community 38 - "Kanban Booking View"
Cohesion: 0.33
Nodes (6): Booking, BookingKanbanView(), COLUMNS, getPackageName(), KanbanColumn, paymentColors

### Community 39 - "Employee Form & HRIS"
Cohesion: 0.18
Nodes (8): departmentOptions, Employee, EmployeeFormData, EmployeeFormProps, employeeSchema, statusColors, Employee, statusColors

### Community 40 - "Package Configuration"
Cohesion: 0.29
Nodes (6): lint-staged, *.{json,md,css}, *.{ts,tsx}, name, private, version

### Community 41 - "Promotion Detail Page"
Cohesion: 0.38
Nodes (6): formatCurrency(), formatDate(), Package, PromoDetailPage(), Promotion, promoTypeInfo

### Community 42 - "Button & Empty State"
Cohesion: 0.29
Nodes (5): ButtonProps, sizes, variants, EmptyVariant, variants

### Community 43 - "Mobile App & Business Types"
Cohesion: 0.47
Nodes (6): App Requirements - Multi-Purpose Travel, Business Types (Umroh/Haji/Outbound/Inbound/Domestic/MICE/Cruise), Feature Toggle per Business Type, Mobile Apps (Customer/Tour Leader/Agent), Terminology Mapping per Type, Mobile App for Jamaah

### Community 44 - "System Landing Page"
Cohesion: 0.33
Nodes (4): 20 System Modules, pricingPlans, stats, testimonials

### Community 46 - "Flight API"
Cohesion: 0.33
Nodes (5): DELETE(), flightSchema, GET(), POST(), PUT()

### Community 48 - "Landing Page"
Cohesion: 0.33
Nodes (3): iconMap, LandingContent, Promotion

### Community 49 - "Tenant API"
Cohesion: 0.40
Nodes (5): DELETE(), GET(), PATCH(), updateTenantSchema, listTenants()

### Community 51 - "Tabs Component"
Cohesion: 0.33
Nodes (5): Tab, TabList(), TabListProps, Tabs(), TabsProps

### Community 52 - "Itinerary Page"
Cohesion: 0.40
Nodes (3): initialItinerary, ItineraryDay, tripInfoData

### Community 53 - "Public Packages Page"
Cohesion: 0.40
Nodes (3): sortOptions, Package, BUSINESS_TYPES

### Community 54 - "Gemini AI Query API"
Cohesion: 0.70
Nodes (4): buildWhereClause(), executeQuery(), getGeminiApiKey(), POST()

### Community 55 - "Trash & Restore API"
Cohesion: 0.40
Nodes (4): DELETE(), GET(), POST(), RESTORABLE_MODELS

### Community 56 - "Airline API"
Cohesion: 0.50
Nodes (3): createAirlineSchema, GET(), POST()

### Community 57 - "Bulk Delete API"
Cohesion: 0.67
Nodes (3): AllowedModel, performBulkDelete(), POST()

### Community 64 - "NextAuth Types"
Cohesion: 0.50
Nodes (3): JWT, Session, User

### Community 65 - "Badge Component"
Cohesion: 0.50
Nodes (3): BadgeProps, sizes, variants

### Community 66 - "Breadcrumb Component"
Cohesion: 0.50
Nodes (3): Breadcrumb(), BreadcrumbItem, BreadcrumbProps

### Community 67 - "Dropdown Component"
Cohesion: 0.50
Nodes (3): DropdownButton(), DropdownItem, DropdownProps

### Community 68 - "UX Flow Documentation"
Cohesion: 0.50
Nodes (4): End-to-End Booking Workflow, Payment Verification Flow, Role-Based User Flows, UX Flow Documentation

### Community 73 - "Quick Start & Tech Stack"
Cohesion: 0.67
Nodes (3): Quick Start Commands, Tech Stack (Next.js 15, TypeScript, PostgreSQL+Prisma, Tailwind), Travel ERP

### Community 84 - "Schedule & Guide Pages"
Cohesion: 0.15
Nodes (10): AgendaCalendarView(), BUSINESS_TYPE_COLORS, MONTHS, PackageItinerary, Schedule, DAYS, MONTHS, Schedule (+2 more)

## Knowledge Gaps
- **411 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+406 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `errorResponse()` connect `Promotion & Rooming API` to `Tenant Management API`, `Booking Update Flow`, `Entity Creation API`, `Generic CRUD API`, `Auth & User API`, `Huawei Health API`, `Flight API`, `Tenant API`, `Google Drive Integration`, `Trash & Restore API`, `Data Import API`, `Gemini AI Query API`, `Airline API`, `Bulk Delete API`, `Bank & Participant API`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `Tenant Model` connect `Database Models` to `Backend Architecture Requirements`, `Tenant Management API`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `successResponse()` connect `Promotion & Rooming API` to `Tenant Management API`, `Booking Update Flow`, `Entity Creation API`, `Generic CRUD API`, `Auth & User API`, `Huawei Health API`, `Flight API`, `Tenant API`, `Google Drive Integration`, `Trash & Restore API`, `Data Import API`, `Gemini AI Query API`, `Airline API`, `Bulk Delete API`, `Bank & Participant API`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Are the 29 inferred relationships involving `errorResponse()` (e.g. with `POST()` and `DELETE()`) actually correct?**
  _`errorResponse()` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `successResponse()` (e.g. with `POST()` and `DELETE()`) actually correct?**
  _`successResponse()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `unauthorizedResponse()` (e.g. with `DELETE()` and `GET()`) actually correct?**
  _`unauthorizedResponse()` has 23 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `paginatedResponse()` (e.g. with `GET()` and `GET()`) actually correct?**
  _`paginatedResponse()` has 2 INFERRED edges - model-reasoned connections that need verification._