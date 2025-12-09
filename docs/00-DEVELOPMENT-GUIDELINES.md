# DEVELOPMENT GUIDELINES & REQUIREMENTS
## Sistem Informasi Travel Multi-Purpose

---

## 1. PROJECT SETUP

### 1.1 Tech Stack (Latest Versions)
```
Next.js:        15.x (latest)
React:          19.x (latest)
TypeScript:     5.x (latest)
Prisma:         6.x (latest)
Node.js:        20.x LTS

Database:       PostgreSQL 16+
Cache:          Redis 7+
Storage:        Google Drive API + Cloudinary
Auth:           NextAuth.js v5 (Auth.js)
```

### 1.2 Package Manager
```bash
# Use pnpm for faster installs
pnpm create next-app@latest travel --typescript --tailwind --eslint --app --src-dir
```

### 1.3 Essential Dependencies
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^6.0.0",
    "next-auth": "^5.0.0",
    "zod": "^3.23.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "next-intl": "^3.0.0",
    "date-fns": "^3.0.0",
    "googleapis": "^140.0.0",
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "prisma": "^6.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0"
  }
}
```

---

## 2. GIT WORKFLOW & HUSKY

### 2.1 Husky Setup
```bash
# Install husky
pnpm add -D husky lint-staged

# Initialize husky
pnpm exec husky init
```

### 2.2 Pre-commit Hook (.husky/pre-commit)
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Type check - WAJIB PASS sebelum commit
echo "🔍 Running TypeScript check..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
  echo "❌ TypeScript check failed! Fix errors before committing."
  exit 1
fi

# Lint check
echo "🔍 Running ESLint..."
npx lint-staged

echo "✅ All checks passed!"
```

### 2.3 Lint-Staged Config (package.json)
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 2.4 TypeScript Config (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## 3. UI/UX DESIGN GUIDELINES

### 3.1 Design Philosophy
```
❌ JANGAN: Basic, flat, boring, template-looking
✅ HARUS:  Premium feel, modern, polished, sellable product

Key Principles:
1. DEPTH        - Gunakan shadows, gradients, layering
2. MOTION       - Subtle animations, micro-interactions
3. HIERARCHY    - Clear visual hierarchy dengan spacing
4. CONSISTENCY  - Design system yang konsisten
5. DELIGHT      - Surprise elements yang menyenangkan
```

### 3.2 Color System (Customizable)
```typescript
// Theme configuration - stored in database per tenant
interface ThemeConfig {
  colors: {
    primary: string;      // Main brand color
    primaryLight: string;
    primaryDark: string;
    secondary: string;    // Accent color
    secondaryLight: string;
    secondaryDark: string;
    
    // Neutral palette
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // Semantic
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Gradients
  gradients: {
    primary: string;     // "linear-gradient(135deg, #16a34a 0%, #22d3ee 100%)"
    hero: string;
    card: string;
  };
  
  // Effects
  shadows: {
    sm: string;
    md: string;
    lg: string;
    glow: string;        // Colored glow effect
  };
  
  // Border radius
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
}
```

### 3.3 Pre-built Color Presets
```typescript
const colorPresets = {
  // Islamic Green (Umroh/Haji)
  emerald: {
    primary: '#10b981',
    primaryLight: '#34d399',
    primaryDark: '#059669',
    secondary: '#f59e0b',
    gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
  },
  
  // Ocean Blue (Tour)
  ocean: {
    primary: '#0ea5e9',
    primaryLight: '#38bdf8',
    primaryDark: '#0284c7',
    secondary: '#f97316',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  },
  
  // Royal Purple (Premium)
  royal: {
    primary: '#8b5cf6',
    primaryLight: '#a78bfa',
    primaryDark: '#7c3aed',
    secondary: '#ec4899',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  },
  
  // Sunset Orange (Adventure)
  sunset: {
    primary: '#f97316',
    primaryLight: '#fb923c',
    primaryDark: '#ea580c',
    secondary: '#eab308',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
  },
  
  // Forest Green (Nature)
  forest: {
    primary: '#22c55e',
    primaryLight: '#4ade80',
    primaryDark: '#16a34a',
    secondary: '#84cc16',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)',
  },
};
```

### 3.4 Premium UI Components Style
```css
/* Card with depth */
.card-premium {
  background: linear-gradient(145deg, 
    rgba(255,255,255,0.9) 0%, 
    rgba(255,255,255,0.7) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(var(--primary), 0.1);
}

/* Glassmorphism */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Glow button */
.btn-glow {
  position: relative;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.4);
  transition: all 0.3s ease;
}

.btn-glow:hover {
  box-shadow: 0 0 30px rgba(var(--primary-rgb), 0.6);
  transform: translateY(-2px);
}

/* Animated border */
.animated-border {
  position: relative;
  background: linear-gradient(var(--background), var(--background)) padding-box,
              linear-gradient(135deg, var(--primary), var(--secondary)) border-box;
  border: 2px solid transparent;
  border-radius: 12px;
}
```

### 3.5 Animation Guidelines
```typescript
// Framer Motion variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 }
};

// Page transitions
const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
};
```

---

## 4. CRUD PATTERN (SINGLE PAGE + SIDEBAR MODAL)

### 4.1 Layout Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│ Page Title                                           [+ Add New]    │
├─────────────────────────────────────────────────────────────────────┤
│ [Search...] [Filter ▼] [Sort ▼] [Export ▼]                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                         DATA TABLE                          │   │
│  │  (Click row to open sidebar)                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Pagination                                                         │
└─────────────────────────────────────────────────────────────────────┘

When sidebar open:
┌───────────────────────────────────────────┬─────────────────────────┐
│                                           │                         │
│  Main Content (dimmed)                    │  SIDEBAR MODAL          │
│                                           │  ─────────────────────  │
│                                           │  [✕]                    │
│                                           │                         │
│                                           │  Mode: View/Edit/Create │
│                                           │                         │
│                                           │  ┌─────────────────┐   │
│                                           │  │   Form Fields   │   │
│                                           │  │                 │   │
│                                           │  │                 │   │
│                                           │  └─────────────────┘   │
│                                           │                         │
│                                           │  [Delete] [Save]       │
│                                           │                         │
└───────────────────────────────────────────┴─────────────────────────┘
```

### 4.2 Sidebar Modal Component
```typescript
interface SidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mode: 'view' | 'create' | 'edit';
  width?: 'sm' | 'md' | 'lg' | 'xl';  // 400px, 500px, 600px, 800px
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Usage
<SidebarModal
  isOpen={isOpen}
  onClose={handleClose}
  title={mode === 'create' ? 'Add Customer' : 'Edit Customer'}
  mode={mode}
  width="lg"
  footer={
    <>
      {mode !== 'view' && (
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      )}
      <Button onClick={handleSave}>
        {mode === 'create' ? 'Create' : 'Save Changes'}
      </Button>
    </>
  }
>
  <CustomerForm data={customer} mode={mode} />
</SidebarModal>
```

### 4.3 Animation for Sidebar
```css
/* Sidebar slide in from right */
.sidebar-modal {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: var(--surface);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
}

.sidebar-modal.open {
  transform: translateX(0);
}

/* Backdrop */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 40;
}

.sidebar-backdrop.open {
  opacity: 1;
}
```

---

## 5. SOFT DELETE IMPLEMENTATION

### 5.1 Prisma Schema Pattern
```prisma
model Customer {
  id        String    @id @default(cuid())
  // ... other fields
  
  // Soft delete fields
  isDeleted   Boolean   @default(false)
  deletedAt   DateTime?
  deletedBy   String?
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([isDeleted])  // Index for filtering
  @@map("customers")
}
```

### 5.2 Prisma Middleware (Auto-filter deleted)
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }) {
        // Auto-filter soft deleted records
        args.where = {
          ...args.where,
          isDeleted: false,
        };
        return query(args);
      },
      async findFirst({ model, operation, args, query }) {
        args.where = {
          ...args.where,
          isDeleted: false,
        };
        return query(args);
      },
      async findUnique({ model, operation, args, query }) {
        // For findUnique, we need to check after fetch
        const result = await query(args);
        if (result?.isDeleted) return null;
        return result;
      },
    },
  },
});

export { prisma };
```

### 5.3 Soft Delete Service
```typescript
// services/base.service.ts
export class BaseService<T> {
  constructor(private model: any) {}
  
  async softDelete(id: string, deletedBy: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
  
  async restore(id: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    });
  }
  
  async hardDelete(id: string): Promise<T> {
    // Only for super admin - permanent delete
    return this.model.delete({
      where: { id },
    });
  }
  
  async findDeleted(): Promise<T[]> {
    return this.model.findMany({
      where: { isDeleted: true },
    });
  }
}
```

---

## 6. AUTHENTICATION (OAuth + Credentials)

### 6.1 Auth.js (NextAuth v5) Setup
```typescript
// auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // OAuth Providers
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    
    // Credentials (Email/Password)
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (!isValid) {
          throw new Error('Invalid credentials');
        }
        
        return user;
      },
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        // Check if user exists, if not create as PROSPECT
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        
        if (!existingUser) {
          // New OAuth user = Prospect/Lead
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              customerType: 'PROSPECT', // Calon client
              provider: account.provider,
            },
          });
        }
      }
      return true;
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.customerType = user.customerType;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.customerType = token.customerType;
      session.user.tenantId = token.tenantId;
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error',
  },
});
```

### 6.2 Customer Types
```typescript
enum CustomerType {
  PROSPECT = 'prospect',   // Calon client (belum pernah booking)
  CLIENT = 'client',       // Client (sudah pernah booking)
  VIP = 'vip',            // VIP client (repeat customer)
  INACTIVE = 'inactive',   // Tidak aktif > 2 tahun
}

// Auto-upgrade logic
const upgradeCustomerType = async (customerId: string) => {
  const bookingCount = await prisma.booking.count({
    where: {
      customerId,
      status: 'COMPLETED',
    },
  });
  
  let newType: CustomerType;
  if (bookingCount === 0) {
    newType = 'PROSPECT';
  } else if (bookingCount >= 3) {
    newType = 'VIP';
  } else {
    newType = 'CLIENT';
  }
  
  await prisma.customer.update({
    where: { id: customerId },
    data: { customerType: newType },
  });
};
```

---

## 7. GOOGLE DRIVE INTEGRATION

### 7.1 Setup Google Drive API
```typescript
// lib/google-drive.ts
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

export const googleDrive = {
  // Create folder for tenant
  async createTenantFolder(tenantId: string, tenantName: string) {
    const response = await drive.files.create({
      requestBody: {
        name: `Tenant_${tenantName}_${tenantId}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!],
      },
      fields: 'id, webViewLink',
    });
    return response.data;
  },
  
  // Create subfolder structure
  async createFolderStructure(tenantFolderId: string) {
    const folders = [
      'Documents/KTP',
      'Documents/Passport',
      'Documents/Photos',
      'Documents/Visa',
      'Documents/Others',
      'Invoices',
      'Contracts',
      'Reports',
    ];
    
    for (const folderPath of folders) {
      await this.createNestedFolder(tenantFolderId, folderPath);
    }
  },
  
  // Upload file
  async uploadFile(
    folderId: string,
    fileName: string,
    mimeType: string,
    fileBuffer: Buffer
  ) {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: Readable.from(fileBuffer),
      },
      fields: 'id, webViewLink, webContentLink',
    });
    
    // Make file accessible
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    
    return response.data;
  },
  
  // Delete file
  async deleteFile(fileId: string) {
    await drive.files.delete({ fileId });
  },
  
  // Get file
  async getFile(fileId: string) {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, webViewLink, webContentLink',
    });
    return response.data;
  },
  
  // List files in folder
  async listFiles(folderId: string) {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, createdTime)',
    });
    return response.data.files;
  },
};
```

### 7.2 Document Upload Flow
```typescript
// API route: /api/documents/upload
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const customerId = formData.get('customerId') as string;
  const documentType = formData.get('type') as string;
  
  // Get customer's tenant folder
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { tenant: true },
  });
  
  // Get appropriate folder based on document type
  const folderId = await getFolderIdForDocType(
    customer.tenant.driveFolderId,
    documentType
  );
  
  // Upload to Google Drive
  const buffer = Buffer.from(await file.arrayBuffer());
  const driveFile = await googleDrive.uploadFile(
    folderId,
    `${customer.code}_${documentType}_${Date.now()}.${getExtension(file.name)}`,
    file.type,
    buffer
  );
  
  // Save reference to database
  const document = await prisma.document.create({
    data: {
      customerId,
      type: documentType,
      fileName: file.name,
      url: driveFile.webViewLink!,
      driveFileId: driveFile.id!,
      mimeType: file.type,
      size: file.size,
    },
  });
  
  return Response.json({ success: true, document });
}
```

---

## 8. PROJECT STRUCTURE

### 8.1 Folder Structure
```
travel/
├── .husky/
│   └── pre-commit
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   ├── customers/
│   │   │   │   │   └── page.tsx    # Single page with sidebar modal
│   │   │   │   ├── bookings/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── ...
│   │   │   └── (public)/
│   │   │       └── ...
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   ├── customers/
│   │   │   │   ├── route.ts        # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts    # GET, PUT, DELETE (soft)
│   │   │   ├── documents/
│   │   │   │   ├── route.ts
│   │   │   │   └── upload/
│   │   │   │       └── route.ts
│   │   │   └── ...
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── sidebar-modal.tsx   # Custom sidebar modal
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── forms/
│   │   │   ├── customer-form.tsx
│   │   │   ├── booking-form.tsx
│   │   │   └── ...
│   │   ├── tables/
│   │   │   ├── data-table.tsx
│   │   │   ├── columns/
│   │   │   │   ├── customer-columns.tsx
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── google-drive.ts
│   │   ├── utils.ts
│   │   └── validations/
│   ├── hooks/
│   │   ├── use-customers.ts
│   │   ├── use-sidebar-modal.ts
│   │   └── ...
│   ├── stores/
│   │   ├── theme-store.ts
│   │   └── ...
│   ├── types/
│   │   └── index.ts
│   └── messages/
│       ├── id.json
│       ├── en.json
│       └── ar.json
├── public/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 9. API DESIGN PATTERN

### 9.1 Standard Response Format
```typescript
// Success response
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### 9.2 API Route Pattern
```typescript
// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { customerSchema } from '@/lib/validations/customer';

// GET - List with pagination, filter, search
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    
    const where = {
      tenantId: session.user.tenantId,
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }),
      ...(type && { customerType: type }),
    };
    
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// POST - Create
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const validation = customerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Validation failed',
            details: validation.error.flatten().fieldErrors,
          } 
        },
        { status: 400 }
      );
    }
    
    const customer = await prisma.customer.create({
      data: {
        ...validation.data,
        tenantId: session.user.tenantId,
        code: await generateCustomerCode(session.user.tenantId),
        customerType: 'PROSPECT', // New customer = Prospect
      },
    });
    
    return NextResponse.json(
      { success: true, data: customer, message: 'Customer created successfully' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
```

---

## 10. DEVELOPMENT WORKFLOW

### 10.1 Branch Strategy
```
main            - Production
├── develop     - Development
│   ├── feature/customer-crud
│   ├── feature/booking-flow
│   └── feature/payment-integration
└── hotfix/     - Urgent fixes
```

### 10.2 Commit Convention
```
feat: add customer CRUD with sidebar modal
fix: resolve soft delete not filtering correctly
refactor: optimize database queries
style: update button hover effects
docs: add API documentation
chore: update dependencies
```

### 10.3 Development Commands
```bash
# Start development
pnpm dev

# Type check (runs on pre-commit automatically)
pnpm typecheck  # npx tsc --noEmit

# Lint
pnpm lint

# Format
pnpm format

# Database
pnpm db:push      # Push schema changes
pnpm db:migrate   # Create migration
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio

# Build
pnpm build

# Test
pnpm test
```

---

## 11. ENVIRONMENT VARIABLES

```env
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Travel System"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/travel"

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth - Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OAuth - Facebook
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Google Drive
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_ROOT_FOLDER_ID=

# Redis (optional)
REDIS_URL=

# Cloudinary (backup storage)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 12. SECURITY CHECKLIST

- [ ] All API routes protected with auth middleware
- [ ] Input validation with Zod on all endpoints
- [ ] SQL injection prevented (using Prisma)
- [ ] XSS prevented (React auto-escapes)
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Sensitive data encrypted
- [ ] Environment variables secured
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Soft delete for data recovery
- [ ] Audit logging for sensitive operations
