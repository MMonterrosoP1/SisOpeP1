import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("❌ Faltan las variables de entorno ADMIN_EMAIL y ADMIN_PASSWORD.");
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const { auth } = require("./src/lib/auth");

    await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "Administrador del Sistema"
      }
    });

    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "ADMIN" }
    });

    console.log(`✅ Usuario administrador creado: ${adminEmail}`);
  } else {
    console.log(`✅ El usuario administrador (${adminEmail}) ya existe.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
