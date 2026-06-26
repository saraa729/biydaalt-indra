export interface Admission {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  programId: number;
  message?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  reviewedById?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}
