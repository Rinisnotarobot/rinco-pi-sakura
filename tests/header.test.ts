import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { stripVTControlCharacters } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import sakuraCyberdeckHeader from "../extensions/header/index.ts";

type Handler = (event: unknown, context: unknown) => unknown;
type HeaderComponent = {
  render(width: number): string[];
  invalidate(): void;
};
type HeaderFactory = (tui: unknown) => HeaderComponent;

function setupExtension() {
  const handlers = new Map<string, Handler>();
  const pi = {
    on(event: string, handler: Handler) {
      handlers.set(event, handler);
    },
  } as unknown as ExtensionAPI;

  sakuraCyberdeckHeader(pi);

  return {
    start: handlers.get("session_start")!,
    shutdown: handlers.get("session_shutdown")!,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Sakura cyberdeck header extension", () => {
  it("registers the header when a Pi UI session starts", async () => {
    vi.useFakeTimers();
    const { start, shutdown } = setupExtension();
    const setHeader = vi.fn();
    const context = { hasUI: true, ui: { setHeader } };

    await start({}, context);

    expect(setHeader).toHaveBeenCalledOnce();
    const createHeader = setHeader.mock.calls[0][0] as HeaderFactory;
    const header = createHeader({
      terminal: { rows: 24 },
      requestRender: vi.fn(),
    });
    const lines = header.render(80);

    expect(lines.length).toBeGreaterThan(9);
    expect(stripVTControlCharacters(lines.join("\n"))).toContain("SAKURA CYBERDECK");

    await shutdown({}, context);
    expect(setHeader).toHaveBeenLastCalledWith(undefined);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does nothing when Pi runs without a UI", async () => {
    const { start, shutdown } = setupExtension();
    const setHeader = vi.fn();
    const context = { hasUI: false, ui: { setHeader } };

    await start({}, context);
    await shutdown({}, context);

    expect(setHeader).not.toHaveBeenCalled();
  });
});
