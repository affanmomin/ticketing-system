import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSearch } from "../useSearch";

describe("useSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty results for short queries", async () => {
    const { result } = renderHook(() => useSearch("a"));
    
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("searches after debounce delay", async () => {
    const { result } = renderHook(() => useSearch("test"));
    
    // Initially should not be loading (debounce hasn't fired)
    expect(result.current.loading).toBe(false);
    
    // Advance timers to trigger search
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });
  }, 5000);

  it("returns empty results for empty query", () => {
    const { result } = renderHook(() => useSearch(""));
    
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("clears results when query is cleared", async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useSearch(query),
      { initialProps: { query: "test" } }
    );
    
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });
    
    rerender({ query: "" });
    
    // Results should be cleared immediately for empty query
    expect(result.current.results).toEqual([]);
  }, 5000);
});

