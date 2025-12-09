# REQUIREMENT AI & IoT TRACKING SYSTEM
## Sistem Deteksi & Monitoring Lokasi Jamaah Real-Time

---

## 1. OVERVIEW

### 1.1 Tujuan
Sistem tracking berbasis AI dan IoT untuk mendeteksi dan memonitor lokasi jamaah umroh/haji secara real-time, memastikan keamanan dan kemudahan koordinasi selama perjalanan ibadah.

### 1.2 Problem yang Diselesaikan
- Jamaah hilang/terpisah dari rombongan
- Kesulitan koordinasi di tempat ramai (Masjidil Haram, Masjid Nabawi)
- Absensi manual yang tidak akurat
- Keterlambatan respon saat darurat
- Kesulitan tracking jamaah lansia/sakit

### 1.3 Benefit
- Real-time location tracking semua jamaah
- Alert otomatis jika jamaah terpisah
- Absensi otomatis berbasis lokasi/face recognition
- Response time lebih cepat saat darurat
- Data analytics untuk optimasi operasional

---

## 2. ARSITEKTUR SISTEM

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUD PLATFORM                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   AI/ML     │  │  Real-time  │  │    Database & Storage   │ │
│  │  Services   │  │  Messaging  │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Location   │  │   Alert     │  │    Analytics Engine     │ │
│  │  Service    │  │   Service   │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────────────┐
│ Mobile App  │      │  Dashboard  │      │    IoT Devices      │
│  (Jamaah)   │      │  (Admin)    │      │                     │
└─────────────┘      └─────────────┘      └─────────────────────┘
                                                   │
                     ┌─────────────────────────────┼─────────────┐
                     │                             │             │
                     ▼                             ▼             ▼
              ┌───────────┐               ┌───────────┐  ┌───────────┐
              │ Wearable  │               │  Beacon   │  │  Gateway  │
              │  Device   │               │  Sensors  │  │  Device   │
              └───────────┘               └───────────┘  └───────────┘
```

---

## 3. KOMPONEN IoT

### 3.1 Wearable Device (Untuk Jamaah)

#### Option A: Smart ID Card / Lanyard
```
Spesifikasi:
- Ukuran: 85 x 54 mm (ukuran kartu standar)
- Teknologi: BLE 5.0 + GPS (optional)
- Baterai: 500mAh rechargeable
- Daya tahan: 7-14 hari
- Tombol SOS: Ya
- Water resistant: IP67
- Harga estimasi: $15-30/unit

Fitur:
- Broadcast BLE signal setiap 1-5 detik
- Tombol SOS untuk darurat
- LED indicator status
- Buzzer untuk locator
- QR Code untuk scan manual
```

#### Option B: Smart Wristband
```
Spesifikasi:
- Teknologi: BLE 5.0 + GPS
- Baterai: 200mAh
- Daya tahan: 5-7 hari
- Heart rate sensor: Optional
- Tombol SOS: Ya
- Water resistant: IP68
- Harga estimasi: $20-40/unit

Fitur:
- Real-time GPS tracking (outdoor)
- BLE tracking (indoor)
- Health monitoring (optional)
- Vibration alert
- SOS button
```

#### Option C: Smart Tag (Attachment)
```
Spesifikasi:
- Ukuran: 40 x 40 x 8 mm
- Teknologi: BLE 5.0
- Baterai: CR2032 (replaceable)
- Daya tahan: 6-12 bulan
- Harga estimasi: $5-15/unit

Fitur:
- Passive BLE beacon
- Attach ke tas/koper
- Ultra low power
- Find my device compatible
```

### 3.2 Beacon Sensors (Fixed Location)

```
Lokasi Pemasangan:
- Hotel lobby & setiap lantai
- Bus (setiap unit)
- Meeting point
- Area strategis di Masjid (jika diizinkan)

Spesifikasi:
- Teknologi: BLE 5.0 Long Range
- Range: 50-100 meter
- Power: AC adapter / Battery backup
- Connectivity: WiFi + 4G fallback

Fungsi:
- Detect jamaah yang masuk area
- Triangulasi posisi indoor
- Automatic check-in/check-out
- Crowd density monitoring
```

### 3.3 Gateway Device (Mobile Hub)

```
Untuk Muthawwif/Pembimbing:
- Smartphone dengan app khusus
- Portable hotspot capability
- Collect data dari wearables nearby
- Sync ke cloud

Untuk Bus:
- Raspberry Pi / Android box
- 4G LTE connection
- BLE scanner
- GPS module
- Auto passenger counting
```

---

## 4. FITUR AI & MACHINE LEARNING

### 4.1 Face Recognition System
```
Use Cases:
1. Absensi otomatis saat boarding bus
2. Check-in/check-out hotel
3. Verifikasi identitas
4. Pencarian jamaah hilang

Tech Stack:
- Model: OpenCV + dlib / AWS Rekognition / Google Vision
- Accuracy target: >99%
- Processing: Edge (on-device) + Cloud backup
- Database: Face embeddings encrypted

Implementation:
- Kamera di pintu bus
- Tablet di hotel reception
- Mobile app muthawwif
```

### 4.2 Anomaly Detection
```
Deteksi Otomatis:
1. Jamaah keluar dari geofence area
2. Jamaah tidak bergerak >2 jam (possible emergency)
3. Device offline >30 menit
4. Pola pergerakan abnormal
5. Jamaah belum kembali setelah jadwal

Algorithm:
- Geofencing dengan polygon area
- Time-based rules
- ML clustering untuk pattern detection
- Statistical anomaly detection
```

### 4.3 Predictive Analytics
```
Prediksi:
1. Estimasi waktu tiba di lokasi
2. Kepadatan lokasi per waktu
3. Rekomendasi waktu ibadah optimal
4. Risk scoring jamaah (lansia, sakit)

Data Input:
- Historical location data
- Weather data
- Event calendar
- Jamaah health profile
```

### 4.4 Smart Notification
```
AI-Powered Alerts:
1. Contextual reminder (waktu sholat, jadwal)
2. Personalized tips berdasarkan lokasi
3. Emergency broadcast
4. Auto-translation (multi-language)

Channels:
- Push notification
- In-app alert
- SMS fallback
- WhatsApp
- Wearable vibration
```

### 4.5 Voice Assistant (Optional)
```
Fitur:
- Tanya jawab seputar ibadah
- Navigasi suara ke lokasi
- Emergency voice call
- Doa dan dzikir audio

Tech:
- Speech-to-text: Whisper API
- LLM: GPT-4 / Claude
- Text-to-speech: ElevenLabs
- Languages: ID, AR, EN
```

---

## 5. MOBILE APP (JAMAAH)

### 5.1 Fitur Utama
```
Location & Tracking:
- Live location sharing (consent-based)
- Find my group/rombongan
- Navigate to meeting point
- Offline maps support

Safety:
- SOS button (prominent)
- Emergency contacts
- Medical info card
- Lost & found

Communication:
- Group chat per rombongan
- Direct message muthawwif
- Announcement broadcast
- Voice message support

Ibadah Support:
- Jadwal sholat real-time
- Arah kiblat
- Doa dan dzikir
- Manasik guide
- Audio guide dari muthawwif
```

### 5.2 Tech Requirements
```
Platform: React Native / Flutter
Min iOS: 13.0
Min Android: 8.0
Permissions:
- Location (always)
- Bluetooth
- Camera (optional)
- Microphone (optional)
- Notifications

Offline Capability:
- Cached maps
- Downloaded doa/dzikir
- Local database
- Queue sync when online
```

---

## 6. DASHBOARD MONITORING (ADMIN/MUTHAWWIF)

### 6.1 Real-time Map View
```
┌─────────────────────────────────────────────────────────────┐
│  🗺️ Live Tracking - Rombongan A                    [Filter] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │                                                 │     │
│    │              [Interactive Map]                  │     │
│    │                                                 │     │
│    │    🟢 Ahmad    🟢 Budi    🟢 Cindy              │     │
│    │                                                 │     │
│    │    🟡 Dewi (low battery)                       │     │
│    │                                                 │     │
│    │    🔴 Eko (outside geofence!) ⚠️               │     │
│    │                                                 │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│  Legend: 🟢 Normal  🟡 Warning  🔴 Alert  ⚫ Offline       │
│                                                             │
│  Stats: 45/45 Online | 0 Alerts | Last update: 2s ago      │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Alert Panel
```
┌─────────────────────────────────────────────────────────────┐
│  🚨 Active Alerts (3)                          [Mark All]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔴 HIGH - Eko Prasetyo keluar dari area hotel             │
│     📍 500m dari Hotel Al Safwah                           │
│     ⏰ 5 menit yang lalu                                   │
│     [📞 Call] [📍 Navigate] [✓ Resolve]                    │
│                                                             │
│  🟡 MEDIUM - Siti Aminah device low battery (15%)          │
│     📍 Masjidil Haram, Lantai 2                            │
│     ⏰ 10 menit yang lalu                                  │
│     [📱 Notify] [✓ Resolve]                                │
│                                                             │
│  🟡 MEDIUM - Bus 2 belum check-in di hotel                 │
│     📍 En route, ETA 15 menit                              │
│     ⏰ 30 menit delay                                      │
│     [📞 Call Driver] [✓ Resolve]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Attendance Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  📋 Absensi - Bus Check-in (Departure to Masjid Nabawi)    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Progress: ████████████░░░░ 42/45 (93%)                    │
│                                                             │
│  ✅ Checked In (42)          ❌ Not Yet (3)                │
│  ├── Ahmad Sudirman          ├── Hj. Fatimah (Room 405)   │
│  ├── Budi Santoso            ├── Ust. Mahmud (Room 302)   │
│  ├── Cindy Paramita          └── Pak Karno (Room 501)     │
│  ├── ... (view all)                                        │
│                                                             │
│  [📢 Broadcast Reminder]  [📞 Call Missing]  [⏰ +5 min]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Analytics Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Trip Analytics - Umroh Plus Jan 2024                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ 45          │  │ 2           │  │ 98.5%               │ │
│  │ Total Jamaah│  │ Alert Events│  │ Tracking Uptime     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Location Heatmap - Most Visited Areas              │   │
│  │ [Visual heatmap di area Makkah/Madinah]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Activity Timeline                                   │   │
│  │ 06:00 ████████░░ Subuh di Masjidil Haram           │   │
│  │ 08:00 ██████░░░░ Breakfast di Hotel                │   │
│  │ 10:00 ████████░░ Thawaf                            │   │
│  │ 12:00 ██████████ Dzuhur + Istirahat                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. DATABASE SCHEMA (Additional Tables)

```prisma
// IoT Device Management
model Device {
  id            String   @id @default(cuid())
  deviceType    DeviceType
  serialNumber  String   @unique
  macAddress    String?  @unique
  firmwareVer   String?
  batteryLevel  Int?
  lastSeen      DateTime?
  status        DeviceStatus @default(ACTIVE)
  
  jamaahId      String?  @unique
  jamaah        Jamaah?  @relation(fields: [jamaahId], references: [id])
  manifestId    String?
  manifest      Manifest? @relation(fields: [manifestId], references: [id])
  
  locations     Location[]
  alerts        Alert[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("devices")
}

enum DeviceType {
  SMART_CARD
  WRISTBAND
  SMART_TAG
  BEACON
  GATEWAY
}

enum DeviceStatus {
  ACTIVE
  INACTIVE
  LOST
  DAMAGED
  MAINTENANCE
}

// Location Tracking
model Location {
  id          String   @id @default(cuid())
  deviceId    String
  jamaahId    String?
  
  latitude    Float
  longitude   Float
  altitude    Float?
  accuracy    Float?
  speed       Float?
  heading     Float?
  
  source      LocationSource
  beaconId    String?  // If detected by beacon
  
  timestamp   DateTime @default(now())
  
  device      Device   @relation(fields: [deviceId], references: [id])
  
  @@index([deviceId, timestamp])
  @@index([jamaahId, timestamp])
  @@index([latitude, longitude])
  @@map("locations")
}

enum LocationSource {
  GPS
  BEACON
  WIFI
  CELL_TOWER
  MANUAL
}

// Geofence Areas
model Geofence {
  id          String   @id @default(cuid())
  name        String
  description String?
  type        GeofenceType
  
  // Polygon coordinates as JSON array
  coordinates Json     // [{ lat, lng }, ...]
  radius      Float?   // For circular geofence
  
  isActive    Boolean  @default(true)
  
  manifestId  String?
  manifest    Manifest? @relation(fields: [manifestId], references: [id])
  
  alerts      Alert[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("geofences")
}

enum GeofenceType {
  HOTEL
  MASJID
  BUS_STOP
  MEETING_POINT
  RESTRICTED
  CUSTOM
}

// Alert System
model Alert {
  id          String     @id @default(cuid())
  type        AlertType
  severity    AlertSeverity
  title       String
  message     String
  
  deviceId    String?
  device      Device?    @relation(fields: [deviceId], references: [id])
  
  jamaahId    String?
  jamaah      Jamaah?    @relation(fields: [jamaahId], references: [id])
  
  geofenceId  String?
  geofence    Geofence?  @relation(fields: [geofenceId], references: [id])
  
  manifestId  String?
  manifest    Manifest?  @relation(fields: [manifestId], references: [id])
  
  latitude    Float?
  longitude   Float?
  
  status      AlertStatus @default(ACTIVE)
  resolvedAt  DateTime?
  resolvedBy  String?
  resolution  String?
  
  createdAt   DateTime   @default(now())
  
  @@index([status, createdAt])
  @@map("alerts")
}

enum AlertType {
  GEOFENCE_EXIT
  GEOFENCE_ENTER
  SOS_TRIGGERED
  DEVICE_OFFLINE
  LOW_BATTERY
  NO_MOVEMENT
  MISSED_CHECKIN
  HEALTH_ALERT
  CUSTOM
}

enum AlertSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum AlertStatus {
  ACTIVE
  ACKNOWLEDGED
  RESOLVED
  DISMISSED
}

// Beacon Infrastructure
model Beacon {
  id          String   @id @default(cuid())
  name        String
  uuid        String   @unique
  major       Int
  minor       Int
  
  location    String   // Description
  latitude    Float?
  longitude   Float?
  floor       Int?     // For multi-floor buildings
  
  status      DeviceStatus @default(ACTIVE)
  lastSeen    DateTime?
  batteryLevel Int?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("beacons")
}

// Face Recognition Data
model FaceData {
  id          String   @id @default(cuid())
  jamaahId    String   @unique
  
  embedding   Bytes    // Encrypted face embedding vector
  photoUrl    String   // Reference photo
  
  isVerified  Boolean  @default(false)
  confidence  Float?   // Enrollment confidence score
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  jamaah      Jamaah   @relation(fields: [jamaahId], references: [id])
  
  @@map("face_data")
}

// Attendance Records (Enhanced)
model AttendanceRecord {
  id          String   @id @default(cuid())
  jamaahId    String
  manifestId  String
  
  event       String   // "bus_checkin", "hotel_checkout", etc
  location    String?
  
  method      AttendanceMethod
  deviceId    String?
  confidence  Float?   // For face recognition
  
  photoUrl    String?  // Capture at check-in
  
  timestamp   DateTime @default(now())
  
  @@index([manifestId, event])
  @@map("attendance_records")
}

enum AttendanceMethod {
  MANUAL
  QR_SCAN
  NFC_TAP
  FACE_RECOGNITION
  BEACON_AUTO
  GPS_AUTO
}
```

---

## 8. API ENDPOINTS (Additional)

```
# Device Management
GET    /api/devices                    - List all devices
POST   /api/devices                    - Register new device
GET    /api/devices/:id                - Get device detail
PUT    /api/devices/:id                - Update device
POST   /api/devices/:id/assign         - Assign device to jamaah
POST   /api/devices/:id/unassign       - Unassign device
GET    /api/devices/:id/locations      - Device location history

# Location Tracking
GET    /api/tracking/live              - Get all live locations
GET    /api/tracking/jamaah/:id        - Get jamaah live location
GET    /api/tracking/jamaah/:id/history - Location history
POST   /api/tracking/location          - Report location (from device)
GET    /api/tracking/manifest/:id      - All jamaah in manifest

# Geofencing
GET    /api/geofence                   - List geofences
POST   /api/geofence                   - Create geofence
PUT    /api/geofence/:id               - Update geofence
DELETE /api/geofence/:id               - Delete geofence
GET    /api/geofence/:id/check         - Check who's inside

# Alerts
GET    /api/alerts                     - List alerts
GET    /api/alerts/active              - Active alerts only
POST   /api/alerts                     - Create manual alert
PUT    /api/alerts/:id/acknowledge     - Acknowledge alert
PUT    /api/alerts/:id/resolve         - Resolve alert

# Attendance
GET    /api/attendance/:manifestId     - Get attendance for manifest
POST   /api/attendance/checkin         - Manual check-in
POST   /api/attendance/face            - Face recognition check-in
GET    /api/attendance/report          - Attendance report

# Analytics
GET    /api/analytics/heatmap          - Location heatmap data
GET    /api/analytics/timeline         - Activity timeline
GET    /api/analytics/stats            - Summary statistics
```

---

## 9. SECURITY & PRIVACY

### 9.1 Data Protection
```
- Location data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- Face embeddings stored encrypted
- Automatic data retention policy (delete after trip + 30 days)
- GDPR/Privacy compliant consent flow
```

### 9.2 Consent Management
```
- Explicit opt-in for location tracking
- Granular privacy settings
- Option to pause tracking
- Data export/deletion request
- Clear privacy policy in local language
```

### 9.3 Access Control
```
- Role-based access to location data
- Muthawwif: Own rombongan only
- Admin: All data
- Family: Linked jamaah only (with consent)
- Audit log for all access
```

---

## 10. IMPLEMENTATION PHASES

### Phase 1: MVP (4-6 minggu)
```
- Basic mobile app with GPS tracking
- Simple dashboard with map view
- Manual check-in dengan QR code
- Basic geofencing (hotel area)
- Push notification alerts
```

### Phase 2: IoT Integration (4-6 minggu)
```
- Smart ID card / wristband integration
- Beacon deployment at hotel
- Automatic attendance
- Enhanced indoor tracking
- Battery monitoring
```

### Phase 3: AI Features (4-6 minggu)
```
- Face recognition enrollment & check-in
- Anomaly detection alerts
- Predictive analytics
- Smart notifications
- Voice assistant (basic)
```

### Phase 4: Advanced (Ongoing)
```
- Health monitoring integration
- Crowd density prediction
- Full offline support
- Advanced analytics & reporting
- Third-party integrations
```

---

## 11. HARDWARE COST ESTIMATION

| Item | Qty (per 45 jamaah) | Unit Price | Total |
|------|---------------------|------------|-------|
| Smart ID Card | 50 | $20 | $1,000 |
| Beacon (Hotel) | 10 | $30 | $300 |
| Gateway (Bus) | 2 | $100 | $200 |
| Tablet (Check-in) | 2 | $200 | $400 |
| **Total per trip** | | | **$1,900** |
| **Per jamaah** | | | **~$42** |

*Catatan: Device bisa dipakai berulang untuk multiple trips*

---

## 12. TECH STACK

```
Mobile App:      React Native + Expo
Backend:         Next.js API Routes + tRPC
Database:        PostgreSQL + TimescaleDB (time-series)
Real-time:       Socket.io / Pusher
Maps:            Google Maps / Mapbox
AI/ML:           Python + FastAPI (microservice)
Face Recognition: AWS Rekognition / OpenCV
IoT Platform:    AWS IoT Core / Azure IoT Hub
Message Queue:   Redis Pub/Sub
Analytics:       ClickHouse / BigQuery
```
