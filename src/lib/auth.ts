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
    disableSignUp: true,
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
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          const sessionData = session as any;
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
      adminRole: "ADMIN",
      defaultRole: "VIEWER",
    }),
  ],
});
