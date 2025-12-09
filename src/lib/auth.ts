import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as ReturnType<typeof PrismaAdapter>,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validation = loginSchema.safeParse(credentials);
        if (!validation.success) {
          throw new Error("Invalid credentials format");
        }

        const { email, password } = validation.data;

        const user = await prisma.user.findFirst({
          where: {
            email,
            isDeleted: false,
          },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
            customer: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
          throw new Error("Account is inactive");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          tenantId: user.tenantId ?? undefined,
          roles: user.roles.map((r: { role: { name: string } }) => r.role.name),
          customerType: user.customer?.customerType ?? undefined,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findFirst({
            where: {
              email: user.email!,
              isDeleted: false,
            },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                provider: account.provider,
                emailVerified: new Date(),
                isActive: true,
              },
            });

            await prisma.customer.create({
              data: {
                tenantId: process.env.DEFAULT_TENANT_ID || "default",
                code: `CUST-${Date.now()}`,
                fullName: user.name || "New User",
                phone: "",
                email: user.email!,
                customerType: "PROSPECT",
                userId: newUser.id,
              },
            });
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.tenantId = (user as { tenantId?: string }).tenantId;
        token.roles = (user as { roles?: string[] }).roles;
        token.customerType = (user as { customerType?: string }).customerType;
      }

      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.tenantId = token.tenantId as string;
        session.user.roles = token.roles as string[];
        session.user.customerType = token.customerType as string;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, account }) {
      if (user.id) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            entity: "user",
            entityId: user.id,
            newValue: {
              provider: account?.provider || "credentials",
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    },
  },
});

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      tenant: true,
      customer: true,
    },
  });

  return user;
}

export async function hasPermission(
  userId: string,
  permission: string,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) return false;

  for (const userRole of user.roles) {
    const permissions = userRole.role.permissions as string[];
    if (permissions.includes(permission) || permissions.includes("*")) {
      return true;
    }
  }

  return false;
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  tenantId?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      tenantId: data.tenantId,
      provider: "credentials",
      isActive: true,
    },
  });

  await prisma.customer.create({
    data: {
      tenantId: data.tenantId || process.env.DEFAULT_TENANT_ID || "default",
      code: `CUST-${Date.now()}`,
      fullName: data.name,
      phone: data.phone || "",
      email: data.email,
      customerType: "PROSPECT",
      userId: user.id,
    },
  });

  return user;
}
