import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { stripTerminalSequences, visibleWidth } from "@earendil-works/pi-tui";
import { afterEach, describe, expect, it, vi } from "vitest";
import sakuraCyberdeckHeader from "../extensions/header/index.ts";

type Handler = (event: unknown, context: unknown) => unknown;
type HeaderComponent = {
  render(width: number): string[];
  invalidate(): void;
  dispose?(): void;
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

function fakeTui(rows = 24) {
  return { terminal: { rows }, requestRender: vi.fn() };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Sakura cyberdeck header extension", () => {
  it("registers the header when a Pi TUI session starts", async () => {
    vi.useFakeTimers();
    const { start, shutdown } = setupExtension();
    const setHeader = vi.fn();
    const context = { mode: "tui", hasUI: true, ui: { setHeader } };

    await start({}, context);

    expect(setHeader).toHaveBeenCalledOnce();
    const createHeader = setHeader.mock.calls[0]![0] as HeaderFactory;
    const header = createHeader(fakeTui());
    const lines = header.render(80);

    expect(lines.length).toBeGreaterThan(9);
    expect(stripTerminalSequences(lines.join("\n"))).toContain("SAKURA CYBERDECK");

    await shutdown({}, context);
    expect(setHeader).toHaveBeenLastCalledWith(undefined);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does nothing outside TUI mode", async () => {
    for (const mode of ["rpc", "json", "print"]) {
      const { start, shutdown } = setupExtension();
      const setHeader = vi.fn();
      // RPC reports hasUI: true, but setHeader() is a no-op there.
      const context = { mode, hasUI: true, ui: { setHeader } };

      await start({}, context);
      await shutdown({}, context);

      expect(setHeader).not.toHaveBeenCalled();
    }
  });

  it("does nothing when a TUI session has no UI", async () => {
    const { start, shutdown } = setupExtension();
    const setHeader = vi.fn();
    const context = { mode: "tui", hasUI: false, ui: { setHeader } };

    await start({}, context);
    await shutdown({}, context);

    expect(setHeader).not.toHaveBeenCalled();
  });

  it("keeps every line within the requested width", async () => {
    vi.useFakeTimers();
    const { start } = setupExtension();
    const setHeader = vi.fn();
    await start({}, { mode: "tui", hasUI: true, ui: { setHeader } });
    const header = (setHeader.mock.calls[0]![0] as HeaderFactory)(fakeTui());

    // Narrow widths exercise cell-based clipping of the wide glyphs in the artwork.
    for (const width of [1, 8, 17, 40, 80, 200]) {
      for (const line of header.render(width)) {
        expect(visibleWidth(line)).toBeLessThanOrEqual(width);
      }
    }
  });

  it("returns no lines for a zero-width viewport", async () => {
    vi.useFakeTimers();
    const { start } = setupExtension();
    const setHeader = vi.fn();
    await start({}, { mode: "tui", hasUI: true, ui: { setHeader } });
    const header = (setHeader.mock.calls[0]![0] as HeaderFactory)(fakeTui());

    expect(header.render(0)).toEqual([]);
  });

  it("emits 24-bit color on a truecolor terminal", async () => {
    vi.useFakeTimers();
    const { start } = setupExtension();
    const setHeader = vi.fn();
    await start({}, { mode: "tui", hasUI: true, ui: { setHeader } });
    const header = (setHeader.mock.calls[0]![0] as HeaderFactory)(fakeTui());

    expect(header.render(80).join("\n")).toContain("\x1b[38;2;");
  });

  it("advances the blink animation and stops on its final frame", async () => {
    vi.useFakeTimers();
    const { start } = setupExtension();
    const setHeader = vi.fn();
    const context = { mode: "tui", hasUI: true, ui: { setHeader } };
    await start({}, context);
    const tui = fakeTui();
    const header = (setHeader.mock.calls[0]![0] as HeaderFactory)(tui);

    const firstFrame = header.render(80).filter((line) => line !== "").length;
    await vi.advanceTimersByTimeAsync(10_000);
    const lastFrame = header.render(80).filter((line) => line !== "").length;

    // The eye opens, so the final frame shows more artwork rows than the first.
    expect(lastFrame).toBeGreaterThan(firstFrame);
    expect(tui.requestRender).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears its timer when the component is disposed", async () => {
    vi.useFakeTimers();
    const { start } = setupExtension();
    const setHeader = vi.fn();
    await start({}, { mode: "tui", hasUI: true, ui: { setHeader } });
    const header = (setHeader.mock.calls[0]![0] as HeaderFactory)(fakeTui());

    expect(vi.getTimerCount()).toBeGreaterThan(0);
    header.dispose?.();
    expect(vi.getTimerCount()).toBe(0);
  });
});
