export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
