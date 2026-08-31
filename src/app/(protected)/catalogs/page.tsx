import { getCatalogs } from "@/features/catalog/queries";
import { CatalogsClient } from "@/features/catalog/components/catalogs-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogos",
  description: "Administración de catálogos del sistema",
};

export default async function CatalogsPage() {
  // Load all catalogs in parallel. False means we fetch both active and inactive.
  const [
    company,
    workplace,
    workArea,
    jobPosition,
    encounterType,
    occupationalExposure,
    workDisability,
    surgicalProcedure,
    referralLevel,
    medicalAptitude,
    allergyCategory,
    allergenCatalog,
    diseaseType,
    affectedSystem,
    maritalStatus,
    bloodType,
    habitCatalog,
    suspensionHour,
    exerciseCatalog,
    relationshipType,
  ] = await Promise.all([
    getCatalogs("company", false),
    getCatalogs("workplace", false),
    getCatalogs("workArea", false),
    getCatalogs("jobPosition", false),
    getCatalogs("encounterType", false),
    getCatalogs("occupationalExposure", false),
    getCatalogs("workDisability", false),
    getCatalogs("surgicalProcedure", false),
    getCatalogs("referralLevel", false),
    getCatalogs("medicalAptitude", false),
    getCatalogs("allergyCategory", false),
    getCatalogs("allergenCatalog", false),
    getCatalogs("diseaseType", false),
    getCatalogs("affectedSystem", false),
    getCatalogs("maritalStatus", false),
    getCatalogs("bloodType", false),
    getCatalogs("habitCatalog", false),
    getCatalogs("suspensionHour", false),
    getCatalogs("exerciseCatalog", false),
    getCatalogs("relationshipType", false),
  ]);

  const initialData = {
    company,
    workplace,
    workArea,
    jobPosition,
    encounterType,
    occupationalExposure,
    workDisability,
    surgicalProcedure,
    referralLevel,
    medicalAptitude,
    allergyCategory,
    allergenCatalog,
    diseaseType,
    affectedSystem,
    maritalStatus,
    bloodType,
    habitCatalog,
    suspensionHour,
    exerciseCatalog,
    relationshipType,
  };

  return <CatalogsClient initialData={initialData} />;
}
