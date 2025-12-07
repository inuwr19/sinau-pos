// src/types/auth.ts
export interface Branch {
  id: number;
  name: string;
  code?: string;
  address?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  branch_id?: number | null;
  branch?: Branch | null;
}
