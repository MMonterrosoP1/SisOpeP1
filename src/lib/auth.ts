import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, admin } from "better-auth/plugins";
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
  plugins: [
    organization(),
    admin({
      adminRole: "ADMIN",
      defaultRole: "VIEWER",
    }),
  ],
});
