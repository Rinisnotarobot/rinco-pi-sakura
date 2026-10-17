import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  foregroundAnsi,
  getTerminalColorMode,
  rgbColor,
  sliceByColumn,
  visibleWidth,
  type TUI,
} from "@earendil-works/pi-tui";

type RGB = readonly [number, number, number];

// Split on grapheme clusters so combining marks stay attached to their base character.
const segmenter = new Intl.Segmenter();

/** Paint one grapheme per character, interpolating `from` → `to` across the text. */
function gradient(text: string, from: RGB, to: RGB, bold = false): string {
  const mode = getTerminalColorMode();
  const graphemes = [...segmenter.segment(text)].map((part) => part.segment);
  const span = Math.max(1, graphemes.length - 1);
  const prefix = bold ? "\x1b[1m" : "";
  return graphemes
    .map((glyph, index) => {
      // Blank glyphs have nothing to color; skip the escapes so rows stay short.
      if (glyph.trim() === "") return glyph;
      const t = index / span;
      const color = rgbColor(
        Math.round(from[0] + (to[0] - from[0]) * t),
        Math.round(from[1] + (to[1] - from[1]) * t),
        Math.round(from[2] + (to[2] - from[2]) * t),
      );
      return `${prefix}${foregroundAnsi(color, mode)}${glyph}\x1b[0m`;
    })
    .join("");
}

const ANIME_ART = [
  "⠀⠀⠂⠈⣿⣷⣿⣿⣿⡅⡹⢿⠆⠙⠋⠉⠻⠿⣿⣿⣿⣿⣿⣿⣮⠻⣦⡙⢷⡑⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣌⠡⠌⠂⣙⠻⣛⠻⠷⠐⠈⠛⢱⣮⠁⠐⠀",
  "⠀⠂⠈⣿⡇⢿⢹⣿⣶⠐⠁⠀⣀⣠⣤⠄⠀⠀⠈⠙⠻⣿⣿⣿⣦⣵⣌⠻⣷⢝⠦⠚⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣻⣿⣊⡃⠀⣙⠿⣿⣿⣿⣎⢮⡀⢮⣽⠁⠐",
  "⠂⠈⣿⣿⣧⡸⡎⡛⡩⠖⠀⣴⣿⣿⣿⠀⠀⠀⠀⠸⠇⠀⠙⢿⣿⣿⣿⣷⣌⢷⣑⢷⣄⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣫⠶⠛⠉⠀⠁⠀⠈⠈⠀⠠⠜⠻⣿⣆⢿⣼⣿⣿⠁",
  " ⠈⣿⣿⣿⣧⢧⣧⢻⣦⢀⣹⣿⣿⣿⣇⠀⠄⠀⠀⠀⡀⠀⠈⢻⣿⣿⣿⣿⣷⣝⢦⡹⠷⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⠈⠁⠀⠀⠀⠁⠀⠀⠀⠱⣶⣄⡀⠀⠈⠛⠜⣿⣿⣿⣿",
  "⠀⠊⢫⣿⣏⣿⡌⣼⣄⢫⡌⣿⣿⣿⣿⣿⣦⡈⠲⣄⣤⣤⡡⢀⣠⣿⣿⣿⣿⣿⣿⣷⣼⣍⢬⣦⡙⣿⣿⣿⣿⣿⣯⢁⡄⠀⡀⡀⠀⠄⢈⣠⢪⠀⣿⣿⣿⣦⠀⢉⢂⠹⡿⣿⣿",
  "⠀⠀⠄⢹⢃⢻⣟⠙⣿⣦⠱⢻⣿⣿⣿⣿⣿⣿⣷⣬⣍⣭⣥⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⡙⢿⣼⡿⣿⣿⣿⣿⣿⣷⣄⠘⣱⢦⣤⡴⡿⢈⣼⣿⣿⣿⣇⣴⣶⣮⣅⢻⣿⡏",
  "⠀⠀⠈⠹⣇⢡⢿⡆⠻⣿⣷⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣍⡻⣿⣟⣻⣿⣿⣿⣿⣷⣦⣥⣬⣤⣴⣾⣿⣿⣿⣿⣷⣿⣿⣿⣿⣷⡜⠃",
  "⠀⠀⠀⢀⣘⠈⢂⠃⣧⡹⣿⣷⡄⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⣅⡙⢿⣟⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠋⡕⠂",
  "⠀⠀⠀⠀⠀⠀⠛⢷⣜⢷⡌⠻⣿⣿⣦⣝⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣹⣷⣦⣹⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠉⠃⠀",
] as const;

const ART_HEIGHT = ANIME_ART.length;
const ART_WIDTH = Math.max(...ANIME_ART.map((line) => visibleWidth(line)));

const SAKURA: RGB = [242, 167, 198];
const PEACH: RGB = [252, 201, 185];
const LAVENDER: RGB = [199, 184, 245];
const SKY: RGB = [159, 211, 242];

const TELEMETRY = "◈  SAKURA CYBERDECK  ◈";

/**
 * Read the terminal height, used to roughly center the header vertically.
 *
 * The TUI is inspected structurally so a component built outside a live terminal still renders
 * instead of throwing.
 */
function getAvailableRows(tui: unknown): number {
  try {
    const terminal = (tui as { terminal?: { rows?: unknown } }).terminal;
    const rows = terminal?.rows;
    return typeof rows === "number" && Number.isFinite(rows) ? Math.max(0, Math.floor(rows)) : 0;
  } catch {
    return 0;
  }
}

// Eyelid blink animation: `rows` is how many artwork rows are visible around the vertical center
// (odd numbers keep the slit symmetric). Hidden rows stay as blank lines so the header height
// never changes mid-animation.
type BlinkFrame = { readonly rows: number; readonly delay: number };

const BLINK_FRAMES: readonly BlinkFrame[] = [
  { rows: 1, delay: 90 },
  { rows: 3, delay: 70 },
  { rows: 5, delay: 70 },
  { rows: 7, delay: 70 },
  { rows: 9, delay: 260 },
  { rows: 7, delay: 60 },
  { rows: 3, delay: 55 },
  { rows: 1, delay: 70 },
  { rows: 3, delay: 55 },
  { rows: 7, delay: 60 },
  { rows: 9, delay: 0 },
];

function isRowVisible(index: number, total: number, visibleRows: number): boolean {
  if (visibleRows >= total) return true;
  const middle = Math.floor((total - 1) / 2);
  const half = Math.floor((visibleRows - 1) / 2);
  return Math.abs(index - middle) <= half;
}

/** Center already-painted text inside `width`, clipping it first so it cannot overflow. */
function center(text: string, width: number, bias = 0): string {
  const clipped = sliceByColumn(text, 0, width);
  const textWidth = visibleWidth(clipped);
  const pad = Math.max(0, Math.min(width - textWidth, Math.floor((width - textWidth) / 2) + bias));
  return " ".repeat(pad) + clipped;
}

/**
 * Paint the header for one width. The result depends only on the width, so the caller can cache it
 * and reuse it across blink frames; a frame then just blanks the rows it hides.
 */
function paintHeader(width: number): { art: readonly string[]; divider: string; label: string } {
  const clippedWidth = Math.min(width, ART_WIDTH);
  // Inset the divider so it stays visually subordinate to the artwork.
  const railInset = clippedWidth >= 8 ? Math.max(2, Math.round(clippedWidth * 0.15)) : 0;
  const rail = "━".repeat(Math.max(1, clippedWidth - railInset * 2));
  const artPad = " ".repeat(Math.max(0, Math.floor((width - clippedWidth) / 2)));

  return {
    // Clip by terminal cells, not code points, so wide glyphs cannot overflow the line width.
    art: ANIME_ART.map((line) => artPad + gradient(sliceByColumn(line, 0, clippedWidth), SAKURA, SKY)),
    divider: center(gradient(rail, SAKURA, SKY), width, 1),
    label: center(gradient(TELEMETRY, LAVENDER, PEACH, true), width, 1),
  };
}

function renderHeader(
  painted: ReturnType<typeof paintHeader>,
  width: number,
  availableRows: number,
  visibleRows: number,
): string[] {
  if (width <= 0) return [];

  const art = painted.art.map((line, index) =>
    isRowVisible(index, ART_HEIGHT, visibleRows) ? line : "",
  );

  const visualHeight = ART_HEIGHT + 3; // artwork + gap + divider + label
  const extraTopPadding = Math.max(0, Math.floor((availableRows - visualHeight) / 2) - 1);

  return [
    ...Array<string>(extraTopPadding).fill(""),
    "",
    ...art,
    "",
    painted.divider,
    painted.label,
    "",
  ];
}

export default function sakuraCyberdeckHeader(pi: ExtensionAPI): void {
  let blinkTimer: ReturnType<typeof setTimeout> | undefined;
  let headerInstalled = false;

  const stopBlink = (): void => {
    if (blinkTimer) clearTimeout(blinkTimer);
    blinkTimer = undefined;
  };

  pi.on("session_start", (_event, ctx) => {
    // `hasUI` is also true in RPC mode, where setHeader() is a no-op: only the TUI can host this.
    if (ctx.mode !== "tui" || !ctx.hasUI) return;

    ctx.ui.setHeader((tui: TUI) => {
      let frame = 0;
      let cache: { width: number; painted: ReturnType<typeof paintHeader> } | undefined;

      const currentRows = (): number => BLINK_FRAMES[frame]?.rows ?? ART_HEIGHT;

      const advance = (): void => {
        const current = BLINK_FRAMES[frame];
        // The last frame is the fully open artwork: leave it static.
        if (!current || current.delay <= 0 || frame >= BLINK_FRAMES.length - 1) {
          stopBlink();
          return;
        }
        blinkTimer = setTimeout(() => {
          frame += 1;
          tui.requestRender();
          advance();
        }, current.delay);
        blinkTimer.unref?.();
      };

      stopBlink();
      advance();

      return {
        render: (width: number) => {
          if (width <= 0) return [];
          if (cache?.width !== width) cache = { width, painted: paintHeader(width) };
          return renderHeader(cache.painted, width, getAvailableRows(tui), currentRows());
        },
        invalidate() {
          cache = undefined;
        },
        dispose() {
          stopBlink();
          cache = undefined;
        },
      };
    });

    headerInstalled = true;
  });

  pi.on("session_shutdown", (_event, ctx) => {
    stopBlink();
    if (headerInstalled && ctx.mode === "tui" && ctx.hasUI) ctx.ui.setHeader(undefined);
    headerInstalled = false;
  });
}
