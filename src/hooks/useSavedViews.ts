import { useState, useEffect, useCallback } from "react";

export type SavedView = {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
};

const STORAGE_KEY = "tickets_saved_views";
const FILTERS_STORAGE_KEY = "tickets_filters";

export function useSavedViews() {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedViews(JSON.parse(stored));
      } catch (error) {
        console.warn("Failed to load saved views", error);
      }
    }
  }, []);

  const saveView = useCallback((name: string, filters: Record<string, any>) => {
    const newView: SavedView = {
      id: `view_${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedViews, newView];
    setSavedViews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newView;
  }, [savedViews]);

  const deleteView = useCallback((id: string) => {
    const updated = savedViews.filter((v) => v.id !== id);
    setSavedViews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [savedViews]);

  const loadView = useCallback((id: string): SavedView | undefined => {
    return savedViews.find((v) => v.id === id);
  }, [savedViews]);

  return {
    savedViews,
    saveView,
    deleteView,
    loadView,
  };
}

export function useFilterPersistence() {
  const saveFilters = useCallback((filters: Record<string, any>) => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, []);

  const loadFilters = useCallback((): Record<string, any> | null => {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn("Failed to load filters", error);
      }
    }
    return null;
  }, []);

  const clearFilters = useCallback(() => {
    localStorage.removeItem(FILTERS_STORAGE_KEY);
  }, []);

  return {
    saveFilters,
    loadFilters,
    clearFilters,
  };
}

