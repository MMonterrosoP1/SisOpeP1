import { AuditAction } from "@/shared/schemas/enums";

export interface AuditFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  search?: string; // Search in description
}

export interface AuditLogDto {
  id: number;
  action: AuditAction;
  entityType: string;
  entityId: string;
  previousData: any | null;
  newData: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  description: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface AuditLogPaginatedResponse {
  data: AuditLogDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
