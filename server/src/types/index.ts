export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface Component {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  tags: string;
  pptx_path: string;
  thumbnail_path: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: { id: number; username: string };
}

export interface ComponentListParams {
  category?: string;
  subcategory?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ImportComponentDto {
  name: string;
  category: string;
  subcategory: string;
  tags?: string;
}

export interface UpdateComponentDto {
  name?: string;
  category?: string;
  subcategory?: string;
  tags?: string;
}

export interface CategoryNode {
  key: string;
  title: string;
  children?: CategoryNode[];
  count?: number;
}

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}
