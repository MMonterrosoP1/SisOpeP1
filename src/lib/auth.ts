import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, createAccessControl } from "better-auth/plugins";
import { prisma } from "./prisma";

const statement = {
  user: ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "set-email", "get", "update"],
  session: ["list", "revoke", "delete"]
};
const ac = createAccessControl(statement);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
    // Permite sign-up si la variable ALLOW_SIGNUP está en "true" (útil para el seeder)
    disableSignUp: process.env.ALLOW_SIGNUP === "true" ? false : true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      // Mock for now
      console.log(`[Mock Email] Password reset requested for ${user.email}. URL: ${url}`);
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/api/auth/sign-in/email": { window: 60, max: 5 },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 5,    // 5 days
    disableSessionRefresh: true,
    cookieCache: {
      enabled: true,
      maxAge: 300,                    // 5 min cache
      strategy: "compact",
    },
  },
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS 
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",") 
    : ["http://localhost:3000"],
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
      trustedProxyHeaders: process.env.TRUSTED_PROXIES === "true" || process.env.NODE_ENV === "production",
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          const sessionData = session as { id: string; userId: string; ipAddress?: string | null; userAgent?: string | null; };
          if (!sessionData) return;
          // Audit: LOGIN
          try {
            await prisma.auditLog.create({
              data: {
                userId: sessionData.userId,
                action: "LOGIN",
                entityType: "session",
                entityId: sessionData.id,
                ipAddress: sessionData.ipAddress || null,
                userAgent: sessionData.userAgent || null,
              }
            });
          } catch (e) {
            console.error("Failed to write audit log for login", e);
          }
        },
      },
    },
  },
  plugins: [
    admin({
      adminRoles: ["ADMIN"],
      defaultRole: "VIEWER",
      roles: {
        ADMIN: ac.newRole({
          user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "set-email", "get", "update"],
          session: ["list", "revoke", "delete"]
        }),
        DOCTOR: ac.newRole({
          user: [],
          session: []
        }),
        VIEWER: ac.newRole({
          user: [],
          session: []
        }),
      },
    }),
  ],
});
