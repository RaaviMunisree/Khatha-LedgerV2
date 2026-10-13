export type UserRole =
  | "ADMIN"
  | "SHOP_OWNER"
  | "EMPLOYEE"
  | "CUSTOMER";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export interface AuthUser {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status?: UserStatus;
  customerId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  customerId?: string;
}

export interface LoginResponseData {
  token: string;
  user: AuthUser;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    name: string;
    email?: string;
    phone?: string;
    role: UserRole;
    customerId?: string;
  };
}

export interface StoredAuth {
  token: string;
  user: AuthUser;
}