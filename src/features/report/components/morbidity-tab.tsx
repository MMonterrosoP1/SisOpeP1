import { MorbidityReport } from "../types";
import { DiseasePrevalenceChart } from "./charts/disease-prevalence-chart";
import { DiseasePrevalenceList } from "./charts/disease-prevalence-list";
import { TopDiagnosesTable } from "./tables/top-diagnoses-table";
import { MedicalHistoryTable } from "./tables/medical-history-table";
import { ReferralsTable } from "./tables/referrals-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MorbidityTabProps {
  data: MorbidityReport;
  isAnnual: boolean;
}

export function MorbidityTab({ data, isAnnual }: MorbidityTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="chronic" className="w-full">
        <TabsList className="bg-background border shadow-sm w-full sm:w-auto overflow-x-auto flex-nowrap justify-start h-auto p-1 mb-6">
          <TabsTrigger value="chronic" className="whitespace-nowrap px-4 py-2">
            Enf. Crónicas
          </TabsTrigger>
          <TabsTrigger value="occupational" className="whitespace-nowrap px-4 py-2">
            Enf. Laborales / Accidentes
          </TabsTrigger>
          <TabsTrigger value="top10" className="whitespace-nowrap px-4 py-2">
            Top 10 Diagnósticos
          </TabsTrigger>
          <TabsTrigger value="history" className="whitespace-nowrap px-4 py-2">
            Antecedentes e IGSS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chronic" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DiseasePrevalenceChart 
                title="Prevalencia de Enfermedad Común/Crónica" 
                description="Pacientes atendidos por enfermedad crónica"
                data={data.chronicPrevalence} 
                colorVar="var(--color-chart-1)"
              />
            </div>
            <div className="lg:col-span-1">
              <DiseasePrevalenceList 
                title="Incidencia (Nuevos Casos)" 
                description="Pacientes de primera consulta"
                data={data.chronicIncidence} 
                colorClass="bg-[var(--color-chart-2)]"
                maxItems={6}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="occupational" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DiseasePrevalenceChart 
                title="Enfermedades Laborales" 
                description="Diagnósticos calificados como enfermedad laboral"
                data={data.occupationalDiseasePrevalence} 
                colorVar="var(--color-chart-3)"
              />
            </div>
            <div className="lg:col-span-1">
              <DiseasePrevalenceList 
                title="Accidentes Laborales" 
                description="Calificados como accidente laboral"
                data={data.occupationalAccidentPrevalence} 
                colorClass="bg-[var(--color-chart-4)]"
                maxItems={6}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="top10" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-6 lg:grid-cols-2">
            <TopDiagnosesTable data={data.topDiagnoses} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-6 lg:grid-cols-2">
            <MedicalHistoryTable data={data.medicalHistory} />
            <ReferralsTable data={data.referralsToIGSS} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
