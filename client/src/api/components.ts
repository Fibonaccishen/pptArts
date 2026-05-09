import apiClient from './client';
import type { Component, ComponentListParams, PaginatedResponse, UpdateComponentDto } from '../types/component';

export async function fetchList(params?: ComponentListParams): Promise<PaginatedResponse<Component>> {
  const { data } = await apiClient.get<PaginatedResponse<Component>>('/components', { params });
  return data;
}

export async function fetchById(id: number): Promise<Component> {
  const { data } = await apiClient.get<Component>(`/components/${id}`);
  return data;
}

export async function downloadPptx(id: number): Promise<ArrayBuffer> {
  const { data } = await apiClient.get(`/components/${id}/download`, {
    responseType: 'arraybuffer',
  });
  return data;
}

export async function importComponents(formData: FormData): Promise<{ results: any[] }> {
  const { data } = await apiClient.post('/components/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateComponent(id: number, dto: UpdateComponentDto): Promise<Component> {
  const { data } = await apiClient.put<Component>(`/components/${id}`, dto);
  return data;
}

export async function deleteComponent(id: number): Promise<void> {
  await apiClient.delete(`/components/${id}`);
}

export async function batchDelete(ids: number[]): Promise<{ deleted: number }> {
  const { data } = await apiClient.post('/components/batch-delete', { ids });
  return data;
}
