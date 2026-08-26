import { UserRole, Sex } from "@/shared/schemas/enums";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  banned: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
  emailVerified: boolean;
  createdAt: Date;
  image?: string | null;
  preamble?: string | null;
  sex?: Sex | null;
  givenNames?: string | null;
  familyNames?: string | null;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface UserFilters {
  search?: string;
  role?: UserRole | "ALL";
  status?: "ACTIVE" | "INACTIVE" | "BANNED" | "ALL";
  page?: number;
  limit?: number;
}
