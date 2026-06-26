export interface RoleRecord {
  id: number;
  name: string;
}

export interface CreateRoleRequest {
  name: string;
}

export interface UpdateRoleRequest {
  name?: string;
}
