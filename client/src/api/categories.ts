import apiClient from './client';
import type { CategoryNode } from '../types/category';

export async function fetchCategoryTree(): Promise<CategoryNode[]> {
  const { data } = await apiClient.get<CategoryNode[]>('/categories');
  return data;
}
