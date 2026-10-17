# Theme and Header Reference

## Sakura Macaron theme

Theme file:

```text
themes/sakura-macaron.json
```

Theme name:

```text
sakura-macaron
```

Select this theme from Pi's `/settings` menu. The file declares `"appearance": "dark"` and points `$schema` at `https://pi.dev/schemas/theme.schema.json`, the schema Pi publishes since 1.2.0.

## Palette

| Variable | Value | Intended use |
| --- | --- | --- |
| `bg` | `#14111A` | Page background |
| `surface` | `#1E1826` | Cards and primary surfaces |
| `surfaceSoft` | `#251D2D` | Soft secondary surfaces |
| `surfaceRaised` | `#2D2438` | Selected and raised regions |
| `text` | `#F7EEF8` | Primary response text |
| `textSoft` | `#D8CADC` | Secondary text |
| `muted` | `#A99BAE` | Muted metadata and model thinking text |
| `dim` | `#716879` | Lowest-emphasis text |
| `sakura` | `#F2A7C6` | Primary accent |
| `sakuraIro` | `#FCC9B9` | Warm Sakura accent |
| `petal` | `#EFC3E6` | Petal accent |
| `peach` | `#F6BC9A` | Types and code accents |
| `lavender` | `#C7B8F5` | Variables and high thinking levels |
| `sky` | `#9FD3F2` | Links, functions, and tool titles |
| `mint` | `#AEE5C5` | Success states and strings |
| `butter` | `#F3D98B` | Warnings and numbers |
| `coral` | `#FF8FA3` | Errors and removed lines |
| `border` | `#6E5878` | Normal borders |
| `borderMuted` | `#493C53` | Subtle borders and the scrollbar track |
| `plum` | `#4A2333` | Transcript search highlight |

Following Pi's built-in `dark` theme, model thinking uses the muted text color while the response body uses the brighter primary text color.

The theme covers Pi's:

- General borders, text, accents, success, warning, and error states
- User and custom messages
- Tool titles, output, and backgrounds
- Markdown headings, links, code, quotes, lists, and horizontal rules
- Added, removed, and context diff lines
- Syntax highlighting
- Thinking levels from off through max
- Fullscreen scrollbar and transcript search colors
- Bash mode
- HTML and page export backgrounds

The theme can be used independently or combined with any Pi UI extension that does not replace the same header region.

## Header

Entry point:

```text
extensions/header/index.ts
```

### Lifecycle

- On `session_start`, the extension calls `ctx.ui.setHeader()` when `ctx.mode === "tui"` and a UI is available.
- On `session_shutdown`, it clears the header and releases the blink timer.
- The extension does not install the header in RPC, JSON, print, or other headless modes. RPC reports `hasUI: true`, but its `setHeader()` is a no-op, so the mode check is what actually guards the header.

### Rendering

The header contains:

1. Nine lines of Unicode artwork.
2. A per-grapheme Sakura-to-Sky gradient.
3. A gradient divider rail.
4. A bold `SAKURA CYBERDECK` label with a Lavender-to-Peach gradient.
5. Cell-aware clipping and horizontal centering.
6. Additional top spacing based on available terminal rows for approximate vertical centering.

The renderer returns no content when `width <= 0`. If terminal row detection fails, it falls back to zero available rows without interrupting the session.

Clipping uses `sliceByColumn()` and `visibleWidth()` from `@earendil-works/pi-tui`, so it measures terminal cells rather than code points. Wide glyphs therefore cannot push a line past the available width, and every rendered line is guaranteed to stay within the requested width.

Colors are emitted through `foregroundAnsi()` with the mode Pi detected for the terminal: `38;2;r;g;b` on Truecolor terminals, and the nearest 256-color palette index otherwise. The painted rows depend only on the terminal width, so they are computed once per width and reused for every blink frame; a frame only blanks the rows it hides.

## Brand customization

### Changing the label

Edit the telemetry string in `extensions/header/index.ts`:

```ts
const TELEMETRY = "◈  SAKURA CYBERDECK  ◈";
```

After replacing the text, verify its appearance with the terminal's actual Unicode glyph widths.

### Changing the gradients

The header uses four RGB values:

```ts
const SAKURA: RGB = [242, 167, 198];
const PEACH: RGB = [252, 201, 185];
const LAVENDER: RGB = [199, 184, 245];
const SKY: RGB = [159, 211, 242];
```

The artwork uses Sakura to Sky, while the label uses Lavender to Peach.

### Changing the artwork

Replace the `ANIME_ART` array. For reliable rendering:

- Keep line widths similar.
- Test clipping in narrow terminals.
- Avoid glyphs that are missing from common terminal fonts.
- Note that `ANIME_ART` must remain a non-empty array: `ART_WIDTH` is derived from it at module load.

### Changing the theme

Edit `themes/sakura-macaron.json`:

1. Prefer changing values in `vars`.
2. Reference variable names from `colors`.
3. Preserve every color key required by the Pi theme schema.
4. Run `npm run check`.
5. Verify messages, Markdown, tools, diffs, and all thinking levels in a real Pi TUI.

Theme objects are strict: Pi rejects unknown top-level fields and unknown color tokens. Define reusable colors under `vars` instead of adding new keys under `colors`.

## Compatibility

Built and tested against the Pi 1.3.0 theme schema and extension API:

- The theme targets the schema published at `https://pi.dev/schemas/theme.schema.json`.
- The extension imports `visibleWidth`, `sliceByColumn`, `foregroundAnsi`, `getTerminalColorMode`, and `rgbColor` from `@earendil-works/pi-tui`, which Pi provides to extensions at runtime.
- Both packages are declared in `peerDependencies` with a `"*"` range and are not bundled; Pi also warns when a host-provided package appears in `dependencies`.

## Truecolor and font compatibility

- The header asks Pi for the detected color mode and emits `38;2;r;g;b` on Truecolor terminals, falling back to the nearest 256-color palette index otherwise.
- Hex colors in the theme also depend on terminal Truecolor support.
- The artwork does not require a Nerd Font, but the selected terminal font must contain its Unicode characters.
