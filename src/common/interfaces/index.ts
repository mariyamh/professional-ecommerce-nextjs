import { UserRole } from '../enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
