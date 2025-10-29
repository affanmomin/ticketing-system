// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "@testing-library/jest-dom";
import { server } from "./server";

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

// Radix UI relies on ResizeObserver in some components
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
window.ResizeObserver = window.ResizeObserver || ResizeObserver;

// Some UI libs rely on matchMedia
if (!window.matchMedia) {
  // @ts-ignore
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Radix UI Select uses Pointer Events capture APIs not implemented in jsdom
// Provide no-op polyfills to avoid runtime errors when clicking selects in tests
// @ts-ignore
if (typeof Element !== "undefined") {
  // @ts-ignore
  Element.prototype.hasPointerCapture =
    Element.prototype.hasPointerCapture || (() => false);
  // @ts-ignore
  Element.prototype.setPointerCapture =
    Element.prototype.setPointerCapture || (() => {});
  // @ts-ignore
  Element.prototype.releasePointerCapture =
    Element.prototype.releasePointerCapture || (() => {});
  // @ts-ignore
  Element.prototype.scrollIntoView =
    Element.prototype.scrollIntoView || (() => {});
}
