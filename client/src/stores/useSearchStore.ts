import { create } from 'zustand';
import * as componentsApi from '../api/components';
import type { Component } from '../types/component';

interface SearchState {
  query: string;
  results: Component[];
  total: number;
  page: number;
  pageSize: number;
  isSearching: boolean;
  setQuery: (q: string) => void;
  search: (query: string, page?: number, sort?: 'name' | 'download_count') => Promise<void>;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  total: 0,
  page: 1,
  pageSize: 20,
  isSearching: false,

  setQuery: (q) => set({ query: q }),

  search: async (query, page = 1, sort = 'name') => {
    set({ isSearching: true, query });
    const result = await componentsApi.fetchList({
      search: query,
      page,
      pageSize: 20,
      sort,
    });
    set({
      results: result.data,
      total: result.total,
      page: result.page,
      isSearching: false,
    });
  },

  clearSearch: () => set({ query: '', results: [], total: 0, page: 1, isSearching: false }),
}));
