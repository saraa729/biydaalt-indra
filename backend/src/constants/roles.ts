export const MANAGEMENT_ROLES = [
  "SUPER_ADMIN",
  "OWNER",
  "DIRECTOR",
  "ACADEMIC_OFFICE",
  "MODERATOR",
  "TEACHER",
] as const;

export const ADMIN_ROLES = ["SUPER_ADMIN", "OWNER", "DIRECTOR"] as const;

export const ACADEMIC_ROLES = [
  "SUPER_ADMIN",
  "OWNER",
  "DIRECTOR",
  "ACADEMIC_OFFICE",
] as const;

export const CONTENT_ROLES = [
  "SUPER_ADMIN",
  "OWNER",
  "DIRECTOR",
  "MODERATOR",
] as const;

export const TEACHING_ROLES = [
  "SUPER_ADMIN",
  "OWNER",
  "DIRECTOR",
  "ACADEMIC_OFFICE",
  "TEACHER",
] as const;

export const BACKUP_ROLES = ["SUPER_ADMIN", "OWNER"] as const;
