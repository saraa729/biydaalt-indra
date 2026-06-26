export interface SystemLogEntry {
  id: number;
  userId?: number | null;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt?: Date;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}
