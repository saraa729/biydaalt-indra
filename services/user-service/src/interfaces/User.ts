export interface UserRecord {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: number;
    name: string;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  roleId: number;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  roleId?: number;
  isActive?: boolean;
}
