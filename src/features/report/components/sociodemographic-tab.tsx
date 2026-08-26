import { SociodemographicReport } from "../types";
import { AttendedByWorkplaceChart } from "./charts/attended-by-workplace-chart";
import { AgeGroupChart } from "./charts/age-group-chart";
import { EncountersByTypeChart } from "./charts/encounters-by-type-chart";
import { SexDistributionKpi } from "./charts/sex-distribution-kpi";

interface SociodemographicTabProps {
  data: SociodemographicReport;
  isAnnual: boolean;
}

export function SociodemographicTab({ data, isAnnual }: SociodemographicTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Asymmetric 1/3 and 2/3 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SexDistributionKpi data={data.attendedBySex} />
        </div>
        <div className="lg:col-span-2">
          <AgeGroupChart data={data.attendedByAgeGroup} />
        </div>
      </div>

      {/* Bottom Row: Asymmetric 3/5 and 2/5 */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AttendedByWorkplaceChart data={data.attendedByWorkplace} />
        </div>
        <div className="lg:col-span-2">
          <EncountersByTypeChart data={data.encountersByType} />
        </div>
      </div>
    </div>
  );
}
