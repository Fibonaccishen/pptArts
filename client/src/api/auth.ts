import apiClient from './client';
import type { LoginResponse } from '../types/auth';

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { username, password });
  return data;
}
