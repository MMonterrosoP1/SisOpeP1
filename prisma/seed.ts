import { Sex } from "../src/generated/prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import * as iconv from "iconv-lite";
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// Helper para leer CSV asegurando que si está en ANSI/Latin1, mantenga las tildes y Ñ
function readCSV(filename: string, delimiter: string = ','): any[] {
  const filePath = path.join(__dirname, "../input_Catalog", filename);
  const buffer = fs.readFileSync(filePath);

  // Detect if it's UTF-8 or Latin1 by looking for invalid UTF-8 bytes (simple heuristic for this case)
  // or just decode as latin1/windows-1252 to be safe for spanish accents if not purely ascii
  let content = "";
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    content = iconv.decode(buffer, "utf16-le");
  } else if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    content = iconv.decode(buffer, "utf16-be");
  } else {
    // Attempt utf-8, if fails use latin1
    try {
      const utf8Str = buffer.toString('utf8');
      if (utf8Str.includes('\uFFFD')) {
        content = iconv.decode(buffer, "win1252");
      } else {
        content = utf8Str;
      }
    } catch {
      content = iconv.decode(buffer, "win1252");
    }
  }

  const records = parse(content, {
    delimiter,
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
  });

  return records;
}

async function main() {
  console.log("Iniciando seeder...");

  // 1. Empresas
  console.log("Cargando Empresas...");
  const empresas = readCSV("empresas.csv");
  for (const emp of empresas) {
    // CSV headers: Acrónimo, Nombre
    const name = emp["Nombre"] || emp["Acrónimo"];
    const acronym = emp["Acrónimo"] || null;
    if (name) {
      await prisma.company.upsert({
        where: { name },
        update: { acronym },
        create: { name, acronym },
      });
    }
  }

  // 2. Lugar de Trabajo
  console.log("Cargando Lugares de Trabajo...");
  const lugares = readCSV("Lugar de Trabajo.csv");
  for (const lugar of lugares) {
    // Nombre, Estado
    const name = lugar["Nombre"];
    if (name) {
      const active = lugar["Estado"] === "ACTIVO";
      const tipoRaw = lugar["TIPO"]?.toUpperCase()?.trim();
      let type: any = "OFICINA";
      if (tipoRaw === "OBRA") type = "OBRA";
      if (tipoRaw === "PLANTA") type = "PLANTA";
      if (tipoRaw === "PLANTA_ADMINISTRATIVO" || tipoRaw === "PLANTA ADMINISTRATIVO") type = "PLANTA_ADMINISTRATIVO";
      
      await prisma.workplace.upsert({
        where: { name },
        update: { active, type },
        create: { name, active, type },
      });
    }
  }

  // 3. Área de Trabajo
  console.log("Cargando Áreas de Trabajo...");
  const areas = readCSV("area-detrabajo.csv");
  for (const area of areas) {
    const name = area["Nombre"];
    if (name) {
      const active = area["Estado"] === "ACTIVO";
      const tipoRaw = area["TIPO"]?.toUpperCase()?.trim();
      let type: any = null; // WorkAreas can be universal, so null is allowed
      if (tipoRaw === "OBRA") type = "OBRA";
      if (tipoRaw === "OFICINA") type = "OFICINA";
      if (tipoRaw === "PLANTA") type = "PLANTA";
      if (tipoRaw === "PLANTA_ADMINISTRATIVO" || tipoRaw === "PLANTA ADMINISTRATIVO") type = "PLANTA_ADMINISTRATIVO";

      const existing = await prisma.workArea.findFirst({ where: { name, type } });
      if (existing) {
        await prisma.workArea.update({
          where: { id: existing.id },
          data: { active, type },
        });
      } else {
        await prisma.workArea.create({
          data: { name, active, type },
        });
      }
    }
  }

  // 4. Puesto Laboral
  console.log("Cargando Puestos Laborales...");
  const puestos = readCSV("puesto laboral.csv");
  for (const puesto of puestos) {
    const name = puesto["Nombre"];
    if (name) {
      const tipoRaw = puesto["TIPO"]?.toUpperCase()?.trim();
      let type: any = null; // Puestos can be universal, so null is allowed
      if (tipoRaw === "OBRA") type = "OBRA";
      if (tipoRaw === "OFICINA") type = "OFICINA";
      if (tipoRaw === "PLANTA") type = "PLANTA";
      if (tipoRaw === "PLANTA_ADMINISTRATIVO" || tipoRaw === "PLANTA ADMINISTRATIVO") type = "PLANTA_ADMINISTRATIVO";

      const existing = await prisma.jobPosition.findFirst({ where: { name, type } });
      if (existing) {
        await prisma.jobPosition.update({
          where: { id: existing.id },
          data: { type },
        });
      } else {
        await prisma.jobPosition.create({
          data: { name, type },
        });
      }
    }
  }

  // 5. Parentesco
  console.log("Cargando Parentescos...");
  const parentescos = readCSV("Parentesco.csv");
  for (const p of parentescos) {
    const name = p["Nombre"];
    if (name) {
      await prisma.relationshipType.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
  }

  // 6. Tipo de sangre
  console.log("Cargando Tipos de Sangre...");
  const sangres = readCSV("Tipo de sangre.csv");
  for (const s of sangres) {
    const name = s["Nombre"];
    if (name) {
      await prisma.bloodTypeCatalog.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
  }

  // 7. Estado Civil
  console.log("Cargando Estado Civil...");
  const estados = readCSV("Estado Civil.csv");
  // Some state don't have sex (like "NO INDICA"), or just create them without sex restriction if null
  for (const estado of estados) {
    const name = estado["Nombre"];
    const sexStr = estado["Sexo"]?.toUpperCase();
    let sex: Sex | null = null;
    if (sexStr === "MASCULINO") sex = "MALE";
    else if (sexStr === "FEMENINO") sex = "FEMALE";

    if (name) {
      const existing = await prisma.maritalStatusCatalog.findFirst({
        where: { name, sex }
      });
      if (!existing) {
        await prisma.maritalStatusCatalog.create({
          data: { name, sex }
        });
      }
    }
  }

  // 8. CIE-10
  console.log("Cargando Catálogo CIE-10 (esto tomará unos minutos)...");
  const cie10 = readCSV("catalogo_cie10.csv");

  // Use createMany for performance
  const chunks = [];
  const chunkSize = 2000;
  for (let i = 0; i < cie10.length; i += chunkSize) {
    chunks.push(cie10.slice(i, i + chunkSize));
  }

  let count = 0;
  for (const chunk of chunks) {
    const dataToInsert = [];
    for (const row of chunk) {
      const code = row["CATALOG_KEY"];
      const description = row["NOMBRE"];
      if (code && description) {
        dataToInsert.push({ code, description });
      }
    }

    await prisma.icd10Code.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    count += dataToInsert.length;
    console.log(`Insertados ${count}/${cie10.length} registros CIE-10...`);
  }

  // --- CONSULTA CATALOGS ---
  console.log("Cargando Catálogos de Consultas...");

  // 1. Tipo de consulta
  const tipoConsulta = readCSV("consulta/tipo consulta.csv");
  for (const tc of tipoConsulta) {
    const name = tc["Nombre"] || tc["nombre"];
    if (name) {
      const code = name.toUpperCase().replace(/\s+/g, "_");
      const existing = await prisma.encounterType.findFirst({ where: { name } });
      if (!existing) {
        await prisma.encounterType.create({ data: { name, code } });
      }
    }
  }

  // 2. Aptitud médica
  const aptitudes = readCSV("consulta/AptitudMedica.csv");
  for (const ap of aptitudes) {
    const name = ap["Nombre"];
    if (name) {
      const existing = await prisma.medicalAptitude.findFirst({ where: { name } });
      if (!existing) {
        await prisma.medicalAptitude.create({ data: { name } });
      }
    }
  }

  // 3. Cirugía
  const cirugias = readCSV("consulta/cirugia.csv");
  for (const c of cirugias) {
    const name = c["Nombre"];
    if (name) {
      const existing = await prisma.surgicalProcedureCatalog.findFirst({ where: { name } });
      if (!existing) {
        await prisma.surgicalProcedureCatalog.create({ data: { name } });
      }
    }
  }

  // 4. Exposición
  const exposiciones = readCSV("consulta/exposicion.csv");
  for (const e of exposiciones) {
    const name = e["Nombre"];
    if (name) {
      await prisma.occupationalExposure.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
  }

  // 5. Incapacidad
  const incapacidades = readCSV("consulta/incapacidad.csv");
  for (const i of incapacidades) {
    const name = i["Nombre"];
    if (name) {
      await prisma.workDisability.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
  }

  // 6. Referencia
  const referencias = readCSV("consulta/Referencia.csv");
  for (const r of referencias) {
    const name = r["Nombre"];
    if (name) {
      await prisma.referralLevel.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
  }

  // 7. Tipo enfermedad
  const tipoEnfermedad = readCSV("consulta/tipo enfermedad.csv");
  for (const te of tipoEnfermedad) {
    const name = te["Nombre"];
    if (name) {
      await prisma.diseaseTypeCatalog.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
  }

  // 8. Alergia
  const alergias = readCSV("consulta/alergia.csv", " ");
  for (const a of alergias) {
    const catName = a["Categoría"] || a["Categora"]; // handle malformed UTF-8 fallback if any
    const name = a["Nombre"];

    if (catName && name) {
      // find or create category
      const category = await prisma.allergyCategory.upsert({
        where: { name: catName },
        update: {},
        create: { name: catName }
      });

      // find or create allergen
      const existingAllergen = await prisma.allergenCatalog.findFirst({
        where: { name, allergyCategoryId: category.id }
      });
      if (!existingAllergen) {
        await prisma.allergenCatalog.create({
          data: { name, allergyCategoryId: category.id }
        });
      }
    }
  }

  // 9. Hábitos
  console.log("Cargando Hábitos...");
  const habitos = readCSV("habitos.csv");
  for (const h of habitos) {
    const name = h["Nombre"];
    if (name) {
      await prisma.habitCatalog.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
  }

  // 10. DocumentTypeCatalog (Catálogo Base)
  console.log("Cargando Tipos de Documentos...");
  const documentTypes = [
    { code: 'MEDICAL_CERTIFICATE', name: 'Constancia Médica' },
    { code: 'ILLNESS_CERTIFICATE', name: 'Constancia de Enfermedad' }
  ];
  for (const doc of documentTypes) {
    await prisma.documentTypeCatalog.upsert({
      where: { code: doc.code },
      update: { name: doc.name },
      create: { code: doc.code, name: doc.name }
    });
  }

  // 17. Exercise Catalog
  console.log("Cargando Catálogo de Ejercicios...");
  const exerciseCount = await prisma.exerciseCatalog.count();
  if (exerciseCount > 0) {
    console.log("El catálogo de ejercicios ya tiene datos, omitiendo carga.");
  } else {
    try {
      const exerciseRecords = readCSV("ejercicios.csv", ",");
      for (const record of exerciseRecords) {
        if (record["Nombre"]) {
          const name = record["Nombre"].trim();
          const code = name.toUpperCase().replace(/\s+/g, "_");
          await prisma.exerciseCatalog.upsert({
            where: { code },
            update: { name },
            create: { code, name }
          });
        }
      }
    } catch (e) {
      console.log("No se pudo cargar ejercicios.csv:", e);
    }
  }

  // 18. Seed Admin User
  console.log("Creando usuario administrador...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@clinica.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  const personAdmin = await prisma.person.upsert({
    where: { identityDocument: "0000000000000" },
    update: {},
    create: {
      givenNames: "Administrador",
      familyNames: "del Sistema",
      identityDocument: "0000000000000",
      birthDate: new Date("1980-01-01"),
      sex: "FEMALE"
    }
  });

  if (!existingAdmin) {
    // Temporalmente permitimos sign-up para poder crear la cuenta desde el API
    process.env.ALLOW_SIGNUP = "true";
    const { auth } = require("../src/lib/auth");

    await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "Administrador del Sistema"
      }
    });

    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: "ADMIN",
        personId: personAdmin.id,
        preamble: "La infrascrita Médica y Cirujana egresada de la Facultad de Ciencias Médicas de la Universidad de San Carlos de Guatemala, colegiada activa número veintiún mil ochocientos treinta y tres."
      }
    });

    console.log(`✅ Usuario administrador creado: ${adminEmail}`);
  } else {
    // Si ya existe, nos aseguramos que tenga rol de ADMIN y personId
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: "ADMIN",
        personId: personAdmin.id,
        preamble: "La infrascrita Médica y Cirujana egresada de la Facultad de Ciencias Médicas de la Universidad de San Carlos de Guatemala, colegiada activa número veintiún mil ochocientos treinta y tres."
      }
    });
    console.log(`✅ El usuario administrador ${adminEmail} ya existe y tiene rol ADMIN y Person vinculado.`);
  }

  console.log("🚀 Seeding completado con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
