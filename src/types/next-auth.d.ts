import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId?: string;
      roles?: string[];
      customerType?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    tenantId?: string;
    roles?: string[];
    customerType?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    tenantId?: string;
    roles?: string[];
    customerType?: string;
  }
}
