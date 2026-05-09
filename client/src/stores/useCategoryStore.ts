import { create } from 'zustand';
import * as categoriesApi from '../api/categories';
import type { CategoryNode } from '../types/category';

interface CategoryState {
  tree: CategoryNode[];
  selectedKey: string | null;
  isLoading: boolean;
  fetchTree: () => Promise<void>;
  selectCategory: (key: string) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  tree: [],
  selectedKey: null,
  isLoading: false,

  fetchTree: async () => {
    set({ isLoading: true });
    const tree = await categoriesApi.fetchCategoryTree();
    set({ tree, isLoading: false });
  },

  selectCategory: (key) => {
    set({ selectedKey: key });
  },
}));
