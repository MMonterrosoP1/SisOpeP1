"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CatalogSection, CatalogItem } from "./catalog-section";
import { AllergenQuickAddDialog } from "./allergen-quick-add-dialog";
import { MaritalStatusAddDialog } from "./marital-status-add-dialog";
import { CompanyAddDialog } from "./company-add-dialog";
import { CompanyEditDialog } from "./company-edit-dialog";

interface CatalogsData {
  company: CatalogItem[];
  workplace: CatalogItem[];
  workArea: CatalogItem[];
  jobPosition: CatalogItem[];
  encounterType: CatalogItem[];
  occupationalExposure: CatalogItem[];
  workDisability: CatalogItem[];
  surgicalProcedure: CatalogItem[];
  referralLevel: CatalogItem[];
  medicalAptitude: CatalogItem[];
  allergyCategory: CatalogItem[];
  allergenCatalog: CatalogItem[];
  diseaseType: CatalogItem[];
  maritalStatus: CatalogItem[];
  bloodType: CatalogItem[];
  habitCatalog: CatalogItem[];
  suspensionHour: CatalogItem[];
  exerciseCatalog: CatalogItem[];
  relationshipType: CatalogItem[];
}

interface CatalogsClientProps {
  initialData: CatalogsData;
}

export function CatalogsClient({ initialData }: CatalogsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to filter items locally by name
  const filterItems = (items: CatalogItem[]) => {
    if (!searchTerm.trim()) return items;
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(lowerSearch));
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Catálogos del Sistema</h1>
          <p className="text-muted-foreground text-sm">Gestiona todos los catálogos y listas desplegables de la aplicación.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en catálogos..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-background rounded-xl border shadow-sm">
        <Tabs defaultValue="empresa" className="flex flex-col h-full">
          <div className="border-b px-4 py-2 shrink-0 overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent h-10 w-full justify-start gap-4 p-0">
              <TabsTrigger
                value="empresa"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-full px-4"
              >
                Empresa
              </TabsTrigger>
              <TabsTrigger
                value="consulta"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-full px-4"
              >
                Consulta
              </TabsTrigger>
              <TabsTrigger
                value="paciente"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-full px-4"
              >
                Paciente
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/10">
            <TabsContent value="empresa" className="mt-0 h-full">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <CatalogSection
                  type="company"
                  title="Empresas"
                  description="Empresas del grupo"
                  items={filterItems(initialData.company)}
                  renderAddDialog={(open, onClose) => (
                    <CompanyAddDialog
                      open={open}
                      onOpenChange={(v) => !v && onClose()}
                      onSuccess={() => onClose()}
                    />
                  )}
                  renderEditDialog={(item, onClose) => (
                    <CompanyEditDialog item={item} onClose={onClose} />
                  )}
                />
                <CatalogSection
                  type="workplace"
                  title="Centros de Trabajo"
                  description="Sucursales o sedes"
                  items={filterItems(initialData.workplace)}
                />
                <CatalogSection
                  type="workArea"
                  title="Áreas de Trabajo"
                  description=""
                  items={filterItems(initialData.workArea)}
                />
                <CatalogSection
                  type="jobPosition"
                  title="Puestos de Trabajo"
                  description=""
                  items={filterItems(initialData.jobPosition)}
                />
              </div>
            </TabsContent>

            <TabsContent value="consulta" className="mt-0 h-full">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <CatalogSection
                  type="encounterType"
                  title="Tipos de Consulta"
                  description="Motivos de atención"
                  items={filterItems(initialData.encounterType)}
                  hasActiveField={false}
                />
                <CatalogSection
                  type="occupationalExposure"
                  title="Exposiciones Laborales"
                  description="Riesgos en el trabajo"
                  items={filterItems(initialData.occupationalExposure)}
                />
                <CatalogSection
                  type="workDisability"
                  title="Incapacidades"
                  description="Tipos de incapacidad laboral"
                  items={filterItems(initialData.workDisability)}
                />
                <CatalogSection
                  type="surgicalProcedure"
                  title="Procedimientos Quirúrgicos"
                  description="Catálogo de cirugías"
                  items={filterItems(initialData.surgicalProcedure)}
                />
                <CatalogSection
                  type="referralLevel"
                  title="Niveles de Derivación"
                  description="Opciones para referir pacientes"
                  items={filterItems(initialData.referralLevel)}
                />
                <CatalogSection
                  type="medicalAptitude"
                  title="Aptitudes Médicas"
                  description="Resultados de evaluaciones"
                  items={filterItems(initialData.medicalAptitude)}
                  hasActiveField={false}
                />
                <CatalogSection
                  type="diseaseType"
                  title="Tipos de Enfermedad"
                  description="Clasificación de padecimientos"
                  items={filterItems(initialData.diseaseType)}
                />
                <CatalogSection
                  type="allergyCategory"
                  title="Categorías de Alergia"
                  description="Clasificación de alergias"
                  items={filterItems(initialData.allergyCategory)}
                />
                <CatalogSection
                  type="allergenCatalog"
                  title="Alérgenos"
                  description="Sustancias que causan alergias"
                  items={filterItems(initialData.allergenCatalog)}
                  renderAddDialog={(open, onClose) => (
                    <AllergenQuickAddDialog
                      open={open}
                      allergyCategories={initialData.allergyCategory}
                      onOpenChange={(v) => !v && onClose()}
                      onSuccess={() => onClose()}
                    />
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="paciente" className="mt-0 h-full">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <CatalogSection
                  type="bloodType"
                  title="Tipos de Sangre"
                  description="Grupos sanguíneos"
                  items={filterItems(initialData.bloodType)}
                />
                <CatalogSection
                  type="maritalStatus"
                  title="Estado Civil"
                  description="Situación conyugal"
                  items={filterItems(initialData.maritalStatus)}
                  renderAddDialog={(open, onClose) => (
                    <MaritalStatusAddDialog
                      open={open}
                      onOpenChange={(v) => !v && onClose()}
                      onSuccess={() => onClose()}
                    />
                  )}
                />
                <CatalogSection
                  type="habitCatalog"
                  title="Hábitos"
                  description="Tabaquismo, alcohol, etc."
                  items={filterItems(initialData.habitCatalog)}
                />
                <CatalogSection
                  type="exerciseCatalog"
                  title="Actividad Física"
                  description="Niveles de ejercicio"
                  items={filterItems(initialData.exerciseCatalog)}
                  hasActiveField={false}
                />
                <CatalogSection
                  type="suspensionHour"
                  title="Horas de Suspensión"
                  description="Suspencion laboral"
                  items={filterItems(initialData.suspensionHour)}
                />
                <CatalogSection
                  type="relationshipType"
                  title="Parentescos"
                  description="Para contactos de emergencia"
                  items={filterItems(initialData.relationshipType)}
                  hasActiveField={false}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
