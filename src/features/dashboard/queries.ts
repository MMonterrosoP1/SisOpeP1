import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, addMonths, subMonths, format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  DashboardAdminStats, 
  PendingFollowUp, 
  RecentPatient, 
  TodayEncounter, 
  TopDiagnosis,
  PatientsByWorkplace,
  EncountersByTypeChartData,
  RecentEncounterItem
} from "./types";

export async function getEncountersByDate(date: Date): Promise<TodayEncounter[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("encounters");

  const start = startOfDay(date);
  const end = endOfDay(date);

  const encounters = await prisma.encounter.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      patient: {
        include: {
          person: true,
        },
      },
      practitioner: true,
      encounterType: true,
      medicalAptitude: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return encounters.map(e => ({
    id: e.id,
    createdAt: e.createdAt,
    patientId: e.patient.id,
    patientName: `${e.patient.person.givenNames} ${e.patient.person.familyNames}`,
    patientDocument: e.patient.person.identityDocument || 'Sin DPI',
    encounterTypeName: e.encounterType.name,
    practitionerName: e.practitioner.name || 'Sin asignar',
    medicalAptitudeName: e.medicalAptitude?.name || null,
  }));
}

export async function getPendingFollowUps(): Promise<PendingFollowUp[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("encounters");

  const today = new Date();
  const start = startOfDay(today);

  const encounters = await prisma.encounter.findMany({
    where: {
      followUpDate: {
        gte: start,
      },
    },
    include: {
      patient: {
        include: {
          person: true,
        },
      },
      encounterType: true,
    },
    orderBy: {
      followUpDate: 'asc',
    },
    take: 10,
  });

  return encounters.map(e => ({
    id: e.id,
    followUpDate: e.followUpDate!,
    patientId: e.patient.id,
    patientName: `${e.patient.person.givenNames} ${e.patient.person.familyNames}`,
    encounterTypeName: e.encounterType.name,
  }));
}

export async function getDashboardAdminStats(): Promise<DashboardAdminStats> {
  "use cache";
  cacheLife("minutes");
  cacheTag("encounters", "patients");

  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);
  
  const prevMonthStart = startOfMonth(subMonths(today, 1));
  const prevMonthEnd = endOfMonth(subMonths(today, 1));

  // 1. Total Encounters
  const encountersCurrent = await prisma.encounter.count({ where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } } });
  const encountersPrev = await prisma.encounter.count({ where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } });
  
  // 2. New Patients
  const newPatientsCurrent = await prisma.patient.count({ where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } } });
  const newPatientsPrev = await prisma.patient.count({ where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } });

  // 3. Active Disabilities
  const activeDisabilitiesCurrent = await prisma.workDisabilityEntry.count({
    where: { encounter: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } } }
  });
  const activeDisabilitiesPrev = await prisma.workDisabilityEntry.count({
    where: { encounter: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }
  });

  // 4. Pending Follow Ups (for the month)
  const pendingFollowUpsCurrent = await prisma.encounter.count({
    where: { followUpDate: { gte: currentMonthStart, lte: currentMonthEnd } }
  });
  const pendingFollowUpsPrev = await prisma.encounter.count({
    where: { followUpDate: { gte: prevMonthStart, lte: prevMonthEnd } }
  });

  const calcChange = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Number((((current - prev) / prev) * 100).toFixed(1));
  };

  return {
    totalEncounters: { current: encountersCurrent, previous: encountersPrev, percentageChange: calcChange(encountersCurrent, encountersPrev) },
    newPatients: { current: newPatientsCurrent, previous: newPatientsPrev, percentageChange: calcChange(newPatientsCurrent, newPatientsPrev) },
    activeDisabilities: { current: activeDisabilitiesCurrent, previous: activeDisabilitiesPrev, percentageChange: calcChange(activeDisabilitiesCurrent, activeDisabilitiesPrev) },
    pendingFollowUpsMonth: { current: pendingFollowUpsCurrent, previous: pendingFollowUpsPrev, percentageChange: calcChange(pendingFollowUpsCurrent, pendingFollowUpsPrev) }
  };
}

export async function getPatientsByWorkplace(): Promise<PatientsByWorkplace[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("patients");

  const patients = await prisma.patient.findMany({
    where: { workplaceId: { not: undefined } },
    include: { workplace: true }
  });

  const workplaceCounts: Record<string, number> = {};
  for (const p of patients) {
    const name = p.workplace.name;
    workplaceCounts[name] = (workplaceCounts[name] || 0) + 1;
  }

  const colors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
  ];

  const result = Object.entries(workplaceCounts)
    .filter(([_, count]) => count > 0)
    .map(([workplaceName, count], index) => ({
      workplaceName,
      count,
      fill: colors[index % colors.length]
    }))
    .sort((a, b) => b.count - a.count);

  return result;
}

export async function getEncountersByTypeOverTime(): Promise<{ data: EncountersByTypeChartData[], types: string[] }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("encounters");

  const today = new Date();
  const start = startOfMonth(subMonths(today, 5)); // Last 6 months inclusive
  const end = endOfMonth(today);

  const encounters = await prisma.encounter.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { encounterType: true }
  });

  // Group by month and type
  const groupedData: Record<string, EncountersByTypeChartData> = {};
  const typesSet = new Set<string>();

  // Initialize the last 6 months to ensure we have all data points even if 0
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(today, i);
    const monthKey = format(d, 'MMM yyyy', { locale: es });
    groupedData[monthKey] = { month: monthKey };
  }

  for (const e of encounters) {
    const monthKey = format(e.createdAt, 'MMM yyyy', { locale: es });
    const typeName = e.encounterType.name;
    typesSet.add(typeName);

    if (!groupedData[monthKey][typeName]) {
      groupedData[monthKey][typeName] = 0;
    }
    (groupedData[monthKey][typeName] as number)++;
  }

  // Fill in 0 for missing types in each month
  const typesArray = Array.from(typesSet);
  for (const key in groupedData) {
    for (const t of typesArray) {
      if (groupedData[key][t] === undefined) {
        groupedData[key][t] = 0;
      }
    }
  }

  return {
    data: Object.values(groupedData),
    types: typesArray
  };
}

export async function getTopDiagnoses(): Promise<TopDiagnosis[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("encounters");

  const today = new Date();
  const startMonth = startOfMonth(today);
  const endMonth = endOfMonth(today);

  const diagnoses = await prisma.diagnosis.findMany({
    where: {
      encounter: {
        createdAt: { gte: startMonth, lte: endMonth },
      },
    },
    include: { icd10Code: true },
  });

  const diagCounts: Record<string, { code: string, desc: string, count: number }> = {};
  let totalCount = 0;
  for (const d of diagnoses) {
    totalCount++;
    const key = d.icd10Code.code;
    if (!diagCounts[key]) {
      diagCounts[key] = { code: d.icd10Code.code, desc: d.icd10Code.description, count: 0 };
    }
    diagCounts[key].count++;
  }

  const result = Object.values(diagCounts).map(d => ({
    icd10Code: d.code,
    description: d.desc,
    count: d.count,
    percentage: totalCount > 0 ? (d.count / totalCount) * 100 : 0
  }));

  return result.sort((a, b) => b.count - a.count).slice(0, 5); // Top 5
}

export async function getRecentEncounters(): Promise<RecentEncounterItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("encounters");

  const encounters = await prisma.encounter.findMany({
    include: {
      patient: {
        include: { person: true }
      },
      encounterType: true,
      practitioner: true,
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 15
  });

  return encounters.map(e => ({
    id: e.id,
    createdAt: e.createdAt,
    patientId: e.patient.id,
    patientName: `${e.patient.person.givenNames} ${e.patient.person.familyNames}`,
    encounterTypeName: e.encounterType.name,
    practitionerName: e.practitioner.name || 'Sin asignar'
  }));
}
