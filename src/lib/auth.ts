import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      // Mock for now
      console.log(`[Mock Email] Password reset requested for ${user.email}. URL: ${url}`);
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/api/auth/sign-in/email": { window: 60, max: 5 },
      "/api/auth/sign-up/email": { window: 60, max: 3 },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days
    updateAge: 60 * 60 * 24,         // refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 300,                    // 5 min cache
      strategy: "compact",
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async ({ data, ctx }) => {
          const sessionData = data as any;
          // Audit: LOGIN
          try {
            await prisma.auditLog.create({
              data: {
                userId: sessionData.userId,
                action: "LOGIN",
                entityType: "session",
                entityId: sessionData.id,
                ipAddress: sessionData.ipAddress,
                userAgent: sessionData.userAgent,
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
      adminRole: "ADMIN",
      defaultRole: "VIEWER",
    }),
  ],
});
