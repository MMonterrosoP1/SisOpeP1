import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@clinica.com" }
  });

  if (!existingAdmin) {
    const { auth } = require("./src/lib/auth");
    
    await auth.api.signUpEmail({
      body: {
        email: "admin@clinica.com",
        password: "AdminPassword123!",
        name: "Administrador del Sistema"
      }
    });

    await prisma.user.update({
      where: { email: "admin@clinica.com" },
      data: { role: "ADMIN" }
    });

    console.log("✅ Usuario administrador creado: admin@clinica.com / AdminPassword123!");
  } else {
    console.log("✅ El usuario administrador ya existe.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
