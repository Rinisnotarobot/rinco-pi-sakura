# Contributing

Thank you for helping improve Rinco Pi Sakura. This guide describes the local development, testing, and submission workflow.

## Development environment

Before you begin, install:

- Node.js 22.19 or later
- npm
- Pi, for validating the theme and header in a real TUI

Clone the project and install its dependencies:

```bash
git clone https://github.com/Rinisnotarobot/rinco-pi-sakura.git
cd rinco-pi-sakura
npm install
```

Pi loads the TypeScript extension directly, so this project has no separate build step.

## Available commands

<!-- AUTO-GENERATED: package-scripts:start -->
<!-- Source: package.json#scripts. Do not edit manually. -->

| Command | Description |
| --- | --- |
| `npm test` | Run the complete Vitest suite once. |
| `npm run test:watch` | Run Vitest in watch mode and retest when files change. |
| `npm run typecheck` | Type-check the extension and tests with `tsc --noEmit`. |
| `npm run check` | Run the typecheck and then the full Vitest suite. |
| `npm run pack:check` | Inspect the publishable package with `npm pack --dry-run` without publishing it. |

<!-- AUTO-GENERATED: package-scripts:end -->

## Testing

Before submitting a change, run:

```bash
npm run check
npm run pack:check
```

Tests live in `tests/`:

- `header.test.ts` verifies extension registration, TUI-mode gating, width clipping, the blink animation, and session cleanup.
- `package.test.ts` verifies the Pi package manifest, peer declarations, resource paths, and the theme against the schema shipped with the installed Pi version.

When adding tests:

1. Use Vitest's `describe`, `it`, and `expect` APIs.
2. Name files `*.test.ts` and place them in `tests/`.
3. Prefer user-observable behavior over internal implementation details.
4. Use Vitest fake timers for timer-dependent behavior and restore them after each test.
5. Keep tests isolated from one another and independent of a real terminal.

In addition to automated tests, validate theme changes in a real Pi TUI across messages, Markdown, tool output, diffs, and all thinking levels. Test header changes in wide and narrow terminals as well as non-UI modes.

## Code style

The project currently has no configured linter, formatter, or pre-commit hook. Follow the existing conventions:

- Use TypeScript ESM and explicit types.
- Use two-space indentation, double quotes, and semicolons.
- Keep extension lifecycle handling clear and release timers and UI state during `session_shutdown`.
- Do not edit content enclosed by `AUTO-GENERATED` markers manually; regenerate it from the source identified in the marker.

Do not add ignore rules, skip tests, or weaken types merely to bypass a check.

## Pull request checklist

Before opening a pull request, confirm that:

- [ ] The change has a focused scope and contains no unrelated files.
- [ ] New behavior or bug fixes include appropriate tests.
- [ ] `npm run check` passes.
- [ ] `npm run pack:check` passes and the package contains the expected files.
- [ ] Affected theme or header behavior was verified in a real Pi TUI.
- [ ] Related documentation was synchronized from its source of truth.
- [ ] No `node_modules/`, `.tgz` archives, or sensitive data were committed.
