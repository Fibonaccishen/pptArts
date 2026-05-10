export interface Component {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  tags: string;
  pptx_path: string;
  thumbnail_path: string;
  file_type: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface ComponentListParams {
  category?: string;
  subcategory?: string;
  search?: string;
  sort?: 'name' | 'download_count';
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

export interface ImportFormData {
  files: File[];
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
