import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSavedViews, useFilterPersistence } from "../useSavedViews";

describe("useSavedViews", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("initializes with empty saved views", () => {
    const { result } = renderHook(() => useSavedViews());
    
    expect(result.current.savedViews).toEqual([]);
  });

  it("saves a view", () => {
    const { result } = renderHook(() => useSavedViews());
    
    act(() => {
      result.current.saveView("My View", { statusId: "todo" });
    });
    
    expect(result.current.savedViews.length).toBe(1);
    expect(result.current.savedViews[0].name).toBe("My View");
    expect(result.current.savedViews[0].filters).toEqual({ statusId: "todo" });
  });

  it("loads views from localStorage", () => {
    const views = [
      {
        id: "view1",
        name: "Saved View",
        filters: { statusId: "todo" },
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem("tickets_saved_views", JSON.stringify(views));
    
    const { result } = renderHook(() => useSavedViews());
    
    expect(result.current.savedViews.length).toBe(1);
    expect(result.current.savedViews[0].name).toBe("Saved View");
  });

  it("deletes a view", () => {
    const { result } = renderHook(() => useSavedViews());
    
    act(() => {
      const view = result.current.saveView("My View", { statusId: "todo" });
      result.current.deleteView(view.id);
    });
    
    expect(result.current.savedViews.length).toBe(0);
  });

  it("loads a view by id", () => {
    const { result } = renderHook(() => useSavedViews());
    
    let viewId: string;
    act(() => {
      const view = result.current.saveView("My View", { statusId: "todo" });
      viewId = view.id;
    });
    
    act(() => {
      const loaded = result.current.loadView(viewId!);
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe("My View");
    });
  });
});

describe("useFilterPersistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("saves filters to localStorage", () => {
    const { result } = renderHook(() => useFilterPersistence());
    
    act(() => {
      result.current.saveFilters({ statusId: "todo", priorityId: "high" });
    });
    
    const stored = localStorage.getItem("tickets_filters");
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual({ statusId: "todo", priorityId: "high" });
  });

  it("loads filters from localStorage", () => {
    localStorage.setItem("tickets_filters", JSON.stringify({ statusId: "todo" }));
    
    const { result } = renderHook(() => useFilterPersistence());
    
    const loaded = result.current.loadFilters();
    expect(loaded).toEqual({ statusId: "todo" });
  });

  it("returns null when no filters are saved", () => {
    const { result } = renderHook(() => useFilterPersistence());
    
    const loaded = result.current.loadFilters();
    expect(loaded).toBeNull();
  });

  it("clears filters", () => {
    const { result } = renderHook(() => useFilterPersistence());
    
    act(() => {
      result.current.saveFilters({ statusId: "todo" });
      result.current.clearFilters();
    });
    
    const loaded = result.current.loadFilters();
    expect(loaded).toBeNull();
  });
});

