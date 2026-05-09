import { create } from 'zustand';
import * as componentsApi from '../api/components';
import type { Component, ComponentListParams } from '../types/component';

interface ComponentState {
  items: Component[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  currentItem: Component | null;
  fetchList: (params?: ComponentListParams) => Promise<void>;
  fetchDetail: (id: number) => Promise<void>;
  clearCurrentItem: () => void;
  setPage: (page: number) => void;
}

export const useComponentStore = create<ComponentState>((set) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  currentItem: null,

  fetchList: async (params) => {
    set({ isLoading: true });
    const result = await componentsApi.fetchList(params);
    set({
      items: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      isLoading: false,
    });
  },

  fetchDetail: async (id) => {
    const comp = await componentsApi.fetchById(id);
    set({ currentItem: comp });
  },

  clearCurrentItem: () => set({ currentItem: null }),

  setPage: (page) => set({ page }),
}));
