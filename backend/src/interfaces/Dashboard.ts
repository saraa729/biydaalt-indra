export type DashboardRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "DIRECTOR"
  | "ACADEMIC_OFFICE"
  | "MODERATOR"
  | "TEACHER"
  | "STUDENT";

export type DashboardPayload = {
  role: DashboardRole;
  generatedAt: string;
  summary: Record<string, number>;
  recent: Record<string, unknown[]>;
  focus?: Record<string, unknown>;
};
