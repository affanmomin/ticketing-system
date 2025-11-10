import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "../useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  let handler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    handler = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls handler on key press", () => {
    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: "n",
          handler,
        },
      ])
    );

    const event = new KeyboardEvent("keydown", { key: "n" });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call handler when typing in input", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: "n",
          handler,
        },
      ])
    );

    const event = new KeyboardEvent("keydown", { key: "n" });
    input.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it("handles modifier keys", () => {
    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: "k",
          metaKey: true,
          handler,
        },
      ])
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
    });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call handler for wrong key", () => {
    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: "n",
          handler,
        },
      ])
    );

    const event = new KeyboardEvent("keydown", { key: "m" });
    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it("cleans up event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([
        {
          key: "n",
          handler,
        },
      ])
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
    removeEventListenerSpy.mockRestore();
  });
});

