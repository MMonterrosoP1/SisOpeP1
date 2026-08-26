import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ReportFilters } from "./types";
import { startOfMonth, endOfMonth, endOfYear, startOfYear } from "date-fns";
import { WorkforceSnapshotInput } from "./schemas";

function getDateFilter(year: number, month?: number | null) {
  if (month) {
    const date = new Date(year, month - 1);
    return {
      gte: startOfMonth(date),
      lte: endOfMonth(date),
    };
  }
  const date = new Date(year, 0, 1);
  return {
    gte: startOfYear(date),
    lte: endOfYear(date),
  };
}

export const reportRepository = {
  // ---------------------------------------------------------
  // 1. SOCIODEMOGRÁFICOS
  // ---------------------------------------------------------

  async getAttendedByWorkplace(filters: ReportFilters) {
    const dateFilter = getDateFilter(filters.year, filters.month);
    
    // Contar pacientes distintos atendidos por lugar de trabajo en el periodo
    const result = await prisma.encounter.findMany({
      where: {
        createdAt: dateFilter,
        ...(filters.workplaceId ? { patient: { workplaceId: filters.workplaceId } } : {}),
      },
      select: {
        patient: {
          select: {
            id: true,
            workplace: { select: { name: true } }
          }
        }
      },
    });

    // Agrupar en JS para contar distintos
    const workplaceCounts: Record<string, Set<number>> = {};
    for (const e of result) {
      const wpName = e.patient.workplace?.name || 'Desconocido';
      if (!workplaceCounts[wpName]) {
        workplaceCounts[wpName] = new Set();
      }
      workplaceCounts[wpName].add(e.patient.id);
    }

    return Object.entries(workplaceCounts).map(([workplaceName, set]) => ({
      workplaceName,
      count: set.size,
      month: filters.month || undefined
    })).sort((a, b) => b.count - a.count);
  },

  async getAttendedBySex(filters: ReportFilters) {
    const dateFilter = getDateFilter(filters.year, filters.month);
    
    const result = await prisma.encounter.findMany({
      where: {
        createdAt: dateFilter,
        ...(filters.workplaceId ? { patient: { workplaceId: filters.workplaceId } } : {}),
      },
      select: {
        patient: {
          select: {
            id: true,
            workplace: { select: { name: true } },
            person: { select: { sex: true } }
          }
        }
      },
    });

    const stats: Record<string, { male: Set<number>, female: Set<number> }> = {};
    for (const e of result) {
      const wpName = e.patient.workplace?.name || 'Desconocido';
      const sex = e.patient.person.sex;
      if (!stats[wpName]) {
        stats[wpName] = { male: new Set(), female: new Set() };
      }
      if (sex === 'MALE') stats[wpName].male.add(e.patient.id);
      else if (sex === 'FEMALE') stats[wpName].female.add(e.patient.id);
    }

    return Object.entries(stats).map(([workplaceName, counts]) => ({
      workplaceName,
      male: counts.male.size,
      female: counts.female.size,
      month: filters.month || undefined
    })).sort((a, b) => (b.male + b.female) - (a.male + a.female));
  },

  async getAttendedByAgeGroup(filters: ReportFilters) {
    const dateFilter = getDateFilter(filters.year, filters.month);
    
    // Get all encounters with patient birth date
    const encounters = await prisma.encounter.findMany({
      where: {
        createdAt: dateFilter,
        ...(filters.workplaceId ? { patient: { workplaceId: filters.workplaceId } } : {}),
      },
      select: {
        createdAt: true,
        patient: {
          select: {
            id: true,
            workplace: { select: { name: true } },
            person: { select: { birthDate: true } }
          }
        }
      }
    });

    // Calculate age at the time of encounter and group
    // We want to count distinct patients per age group per workplace
    // Since a patient's age might change across the year (if annual), we use their age at their first encounter in the period
    const patientFirstEncounter: Record<number, { age: number, workplaceName: string }> = {};

    for (const e of encounters) {
      if (e.patient.person.birthDate) {
        if (!patientFirstEncounter[e.patient.id] || e.createdAt < new Date(0)) { // simplify logic, we just take age at the moment of this encounter for grouping
          const birthDate = new Date(e.patient.person.birthDate);
          let age = e.createdAt.getFullYear() - birthDate.getFullYear();
          const m = e.createdAt.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && e.createdAt.getDate() < birthDate.getDate())) {
            age--;
          }
          const wpName = e.patient.workplace?.name || 'Desconocido';
          patientFirstEncounter[e.patient.id] = { age, workplaceName: wpName };
        }
      }
    }

    const groups = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+", "No definido"];
    const stats: Record<string, Record<string, number>> = {}; // workplace -> ageGroup -> count

    for (const patientId in patientFirstEncounter) {
      const { age, workplaceName } = patientFirstEncounter[patientId];
      let group = "No definido";
      if (age >= 18 && age <= 25) group = "18-25";
      else if (age >= 26 && age <= 35) group = "26-35";
      else if (age >= 36 && age <= 45) group = "36-45";
      else if (age >= 46 && age <= 55) group = "46-55";
      else if (age >= 56 && age <= 65) group = "56-65";
      else if (age > 65) group = "65+";

      if (!stats[workplaceName]) {
        stats[workplaceName] = {};
        for (const g of groups) stats[workplaceName][g] = 0;
      }
      stats[workplaceName][group]++;
    }

    const result = [];
    for (const workplaceName in stats) {
      for (const ageGroup of groups) {
        if (stats[workplaceName][ageGroup] > 0) {
          result.push({
            workplaceName,
            ageGroup,
            count: stats[workplaceName][ageGroup]
          });
        }
      }
    }
    return result;
  },

  async getEncountersByType(filters: ReportFilters) {
    const dateFilter = getDateFilter(filters.year, filters.month);

    const result = await prisma.encounter.groupBy({
      by: ['encounterTypeId'],
      where: {
        createdAt: dateFilter,
        ...(filters.workplaceId ? { patient: { workplaceId: filters.workplaceId } } : {}),
      },
      _count: { id: true },
    });

    const types = await prisma.encounterType.findMany();
    const typeMap = new Map(types.map(t => [t.id, t.name]));

    return result.map(r => ({
      encounterTypeName: typeMap.get(r.encounterTypeId) || 'Desconocido',
      count: r._count.id
    })).sort((a, b) => b.count - a.count);
  },

  // ---------------------------------------------------------
  // 2. MORBILIDAD
  // ---------------------------------------------------------

  async getDiagnosesByDiseaseType(diseaseTypeName: string, filters: ReportFilters, isFirstVisitOnly = false) {
    const dateFilter = getDateFilter(filters.year, filters.month);

    const diagnoses = await prisma.diagnosis.findMany({
      where: {
        diseaseType: { name: diseaseTypeName },
        encounter: {
          createdAt: dateFilter,
          ...(isFirstVisitOnly ? { isFirstVisit: true } : {}),
          ...(filters.workplaceId ? { patient: { workplaceId: filters.workplaceId } } : {}),
        }
      },
      include: {
        icd10Code: true,
        encounter: {
          select: {
            patient: { select: { workplace: { select: { name: true } } } }
          }
        }
      }
    });

    // Group by workplace + icd10Code
    const grouped: Record<string, { code: string, desc: string, count: number, wp: string }> = {};

    for (const d of diagnoses) {
      const wpName = d.encounter.patient.workplace?.name || 'Desconocido';
      const code = d.icd10Code.code;
      const key = `${wpName}_${code}`;

      if (!grouped[key]) {
        grouped[key] = { code, desc: d.icd10Code.description, count: 0, wp: wpName };
      }
      grouped[key].count++;
    }

    return Object.values(grouped).map(v => ({
      icd10Code: v.code,
      description: v.desc,
      count: v.count,
      workplaceName: v.wp
    })).sort((a, b) => b.count - a.count);
  },

  async getTopDiagnoses(filters: ReportFilters, withSuspension = false, limit = 10) {
    const dateFilter = getDateFilter(filters.year, filters.month);

    const diagnoses = await prisma.diagnosis.findMany({
      where: {
        encounter: {
          createdAt: dateFilter,
          ...(withSuspension ? { suspensionHourId: { not: null } } : {}),
          ...(filters.workplaceId ? { patient: { workplaceId: filters.workplaceId } } : {}),
        }
      },
      include: { icd10Code: true }
    });

    const grouped: Record<string, { code: string, desc: string, count: number }> = {};
    for (const d of diagnoses) {
      const code = d.icd10Code.code;
      if (!grouped[code]) {
        grouped[code] = { code, desc: d.icd10Code.description, count: 0 };
      }
      grouped[code].count++;
    }

    const sorted = Object.values(grouped).sort((a, b) => b.count - a.count).slice(0, limit);
    return sorted.map((item, idx) => ({
      rank: idx + 1,
      icd10Code: item.code,
      description: item.desc,
      count: item.count
    }));
  },

  async getMedicalHistoryCount(filters: ReportFilters) {
    const dateFilter = getDateFilter(filters.year, filters.month);

    const history = await prisma.patientMedicalHistory.findMany({
      where: {
        active: true,
        createdAt: dateFilter,
        patient: filters.workplaceId ? { workplaceId: filters.workplaceId } : undefined,
      },
      include: {
        icd10Code: true,
        patient: {
          select: {
            workplace: { select: { name: true } },
            workArea: { select: { name: true } },
          }
        }
      }
    });

    const grouped: Record<string, { code: string, desc: string, wp: string, wa: string, count: number }> = {};
    for (const h of history) {
      const code = h.icd10Code.code;
      const wp = h.patient.workplace?.name || 'Desconocido';
      const wa = h.patient.workArea?.name || 'Sin área';
      const key = `${code}_${wp}_${wa}`;

      if (!grouped[key]) {
        grouped[key] = { code, desc: h.icd10Code.description, wp, wa, count: 0 };
      }
      grouped[key].count++;
    }

    return Object.values(grouped).map(v => ({
      icd10Code: v.code,
      description: v.desc,
      count: v.count,
      workplaceName: v.wp,
      workAreaName: v.wa
    })).sort((a, b) => b.count - a.count);
  },

  async getReferralsToIGSS(filters: ReportFilters) {
    const dateFilter = getDateFilter(filters.year, filters.month);

    const encounters = await prisma.encounter.findMany({
      where: {
        createdAt: dateFilter,
        referralLevel: { name: { contains: "IGSS" } },
        ...(filters.workplaceId ? { patient: { workplaceId: filters.workplaceId } } : {}),
      },
      include: {
        referralLevel: true,
        patient: { select: { workplace: { select: { name: true } } } }
      }
    });

    const grouped: Record<string, { level: string, wp: string, count: number }> = {};
    for (const e of encounters) {
      const level = e.referralLevel!.name;
      const wp = e.patient.workplace?.name || 'Desconocido';
      const key = `${level}_${wp}`;
      if (!grouped[key]) {
        grouped[key] = { level, wp, count: 0 };
      }
      grouped[key].count++;
    }

    return Object.values(grouped).map(v => ({
      referralLevelName: v.level,
      workplaceName: v.wp,
      count: v.count
    })).sort((a, b) => b.count - a.count);
  },

  // ---------------------------------------------------------
  // 3. SUSPENSIONES
  // ---------------------------------------------------------

  async getSuspensionsByDiseaseType(filters: ReportFilters) {
    const dateFilter = getDateFilter(filters.year, filters.month);

    const diagnoses = await prisma.diagnosis.findMany({
      where: {
        encounter: {
          createdAt: dateFilter,
          suspensionHourId: { not: null },
          ...(filters.workplaceId ? { patient: { workplaceId: filters.workplaceId } } : {}),
        }
      },
      include: {
        diseaseType: true,
        encounter: {
          select: {
            suspensionHour: { select: { hours: true } },
            patient: { select: { workplace: { select: { name: true } } } }
          }
        }
      }
    });

    const grouped: Record<string, { type: string, count: Set<number>, hours: number, wp: string }> = {};
    for (const d of diagnoses) {
      const type = d.diseaseType?.name || 'OTRO';
      const wp = d.encounter.patient.workplace?.name || 'Desconocido';
      const key = `${type}_${wp}`;
      
      if (!grouped[key]) {
        grouped[key] = { type, count: new Set(), hours: 0, wp };
      }
      
      // Solo sumamos las horas por encounter una vez
      if (!grouped[key].count.has(d.encounterId)) {
        grouped[key].count.add(d.encounterId);
        grouped[key].hours += (d.encounter.suspensionHour?.hours || 0);
      }
    }

    return Object.values(grouped).map(v => ({
      diseaseType: v.type,
      workplaceName: v.wp,
      count: v.count.size,
      totalHours: v.hours
    })).sort((a, b) => b.count - a.count);
  },

  async getTotalSuspensionHours(filters: ReportFilters) {
    const dateFilter = getDateFilter(filters.year, filters.month);

    const encounters = await prisma.encounter.findMany({
      where: {
        createdAt: dateFilter,
        suspensionHourId: { not: null },
        ...(filters.workplaceId ? { patient: { workplaceId: filters.workplaceId } } : {}),
      },
      include: {
        suspensionHour: true,
        patient: { select: { workplace: { select: { name: true } } } }
      }
    });

    const grouped: Record<string, { wp: string, hours: number }> = {};
    let total = 0;
    
    for (const e of encounters) {
      const wp = e.patient.workplace?.name || 'Desconocido';
      const hrs = e.suspensionHour?.hours || 0;
      
      if (!grouped[wp]) grouped[wp] = { wp, hours: 0 };
      grouped[wp].hours += hrs;
      total += hrs;
    }

    return { total, byWorkplace: Object.values(grouped).map(v => ({ workplaceName: v.wp, totalHours: v.hours })) };
  },

  // ---------------------------------------------------------
  // WORKFORCE SNAPSHOT (Datos manuales)
  // ---------------------------------------------------------

  async getWorkforceSnapshot(workplaceId: number, year: number, month: number) {
    return prisma.workforceSnapshot.findUnique({
      where: {
        workplaceId_year_month: { workplaceId, year, month }
      }
    });
  },

  async upsertWorkforceSnapshot(data: WorkforceSnapshotInput, userId: string) {
    return prisma.workforceSnapshot.upsert({
      where: {
        workplaceId_year_month: {
          workplaceId: data.workplaceId,
          year: data.year,
          month: data.month,
        }
      },
      update: {
        totalWorkers: data.totalWorkers,
        maleWorkers: data.maleWorkers,
        femaleWorkers: data.femaleWorkers,
        scheduledDays: data.scheduledDays,
        observations: data.observations,
        updatedBy: userId,
      },
      create: {
        workplaceId: data.workplaceId,
        year: data.year,
        month: data.month,
        totalWorkers: data.totalWorkers,
        maleWorkers: data.maleWorkers,
        femaleWorkers: data.femaleWorkers,
        scheduledDays: data.scheduledDays,
        observations: data.observations,
        createdBy: userId,
        updatedBy: userId,
      }
    });
  },
  
  async getWorkforceSnapshotTotals(filters: ReportFilters) {
    // Si hay mes específico, sumamos todos los snapshots de ese mes (o del workplace seleccionado)
    // Si es anual, promediamos o devolvemos nulo (es complicado consolidar fuerza laboral anual si no es un promedio)
    if (!filters.month) return null; // Por ahora no soportamos snapshot consolidado anual (requeriría promediar)
    
    const snapshots = await prisma.workforceSnapshot.findMany({
      where: {
        year: filters.year,
        month: filters.month,
        ...(filters.workplaceId ? { workplaceId: filters.workplaceId } : {})
      }
    });

    if (snapshots.length === 0) return null;

    let total = 0, male = 0, female = 0, days = 0;
    for (const s of snapshots) {
      total += s.totalWorkers;
      male += s.maleWorkers;
      female += s.femaleWorkers;
      // Para días programados, si hay varios workplaces tomamos un promedio ponderado o simplemente el máximo
      // Simplificación: tomamos el promedio
      days += s.scheduledDays;
    }

    return {
      totalWorkers: total,
      maleWorkers: male,
      femaleWorkers: female,
      scheduledDays: Math.round(days / snapshots.length)
    };
  }
};
