<div align="center">

# Rinco Pi Sakura

**A Sakura Macaron theme and animated CyberDeck header for [Pi](https://github.com/earendil-works/pi).**

[![Pi package](https://img.shields.io/badge/Pi-package-F2A7C6?style=flat-square)](https://github.com/earendil-works/pi) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tests](https://img.shields.io/badge/tests-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/) [![License](https://img.shields.io/badge/license-MIT-C7B8F5?style=flat-square)](LICENSE)

[Features](#features) · [Installation](#installation) · [Usage](#usage) · [Customization](#customization) · [Development](#development)

[简体中文](docs/README.zh-CN.md)

</div>

Rinco Pi Sakura is a lightweight appearance package that combines a soft, dark Sakura Macaron palette with a truecolor Unicode header and a one-shot blink animation. Pi loads the TypeScript extension directly, so no build step is required.

## Features

- **Complete theme** — Styles messages, Markdown, tools, diffs, syntax highlighting, thinking levels, and exported pages.
- **Animated header** — Renders Unicode artwork with a per-grapheme Sakura-to-Sky gradient.
- **Startup animation** — Plays a blink sequence when a session starts, then leaves the artwork open and static.
- **Responsive layout** — Clips by terminal cell width and adjusts top spacing to the available height.
- **Safe fallback** — Installs only in TUI mode and falls back to 256 colors when Truecolor is unavailable.
- **Composable resources** — The theme and header can be used independently or alongside extensions that do not replace the header region.

## Installation

### Install from npm (recommended)

```bash
pi install npm:rinco-pi-sakura
```

The published package is available on [npm](https://www.npmjs.com/package/rinco-pi-sakura).

### Install from GitHub

```bash
pi install git:github.com/Rinisnotarobot/rinco-pi-sakura
```

### Install from a local checkout

```bash
git clone https://github.com/Rinisnotarobot/rinco-pi-sakura.git
cd rinco-pi-sakura
pi install "$PWD"
```

> [!IMPORTANT]
> Pi extensions run with your user permissions. Review the source before installing any third-party extension.

## Usage

Restart Pi after installation, or run:

```text
/reload
```

Open `/settings` and select the following theme:

```text
sakura-macaron
```

The header is enabled automatically when a Pi TUI session starts.

> [!NOTE]
> For the best result, use a Truecolor terminal and a font that contains the required Unicode characters. The artwork is clipped automatically in narrow terminals.

## Project contents

| Path | Purpose |
| --- | --- |
| [`extensions/header/index.ts`](extensions/header/index.ts) | Header rendering, responsive layout, and blink animation |
| [`themes/sakura-macaron.json`](themes/sakura-macaron.json) | Sakura Macaron theme and complete Pi color palette |
| [`docs/theme-and-header.md`](docs/theme-and-header.md) | Palette, lifecycle, compatibility, and customization reference |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | Local development, testing guidance, and pull request checklist |
| [`docs/README.zh-CN.md`](docs/README.zh-CN.md) | Simplified Chinese README |
| [`tests/header.test.ts`](tests/header.test.ts) | Header lifecycle and rendering tests |
| [`tests/package.test.ts`](tests/package.test.ts) | Package manifest, resource, and theme schema tests |

## Customization

The two main customization points are:

- Edit `vars` in `themes/sakura-macaron.json` to change the base theme palette.
- Edit `ANIME_ART`, the telemetry label, and RGB gradients in `extensions/header/index.ts` to change the header.

Keep every color key required by the Pi theme schema. After changing the artwork, test clipping in both narrow and wide terminals. See the [theme and header reference](docs/theme-and-header.md) for details.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 22.19 or later
- [Pi](https://github.com/earendil-works/pi)

Install development dependencies:

```bash
npm install
```

### Available commands

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

Run the test suite:

```bash
npm test
```

Watch for changes:

```bash
npm run test:watch
```

Type-check the extension and tests:

```bash
npm run typecheck
```

Verify types, tests, and package contents:

```bash
npm run check
npm run pack:check
```

Vitest covers the extension lifecycle, header output, package resource paths, and theme palette. Pi loads the TypeScript source directly, so this project has no separate build command.

## Publishing to npm

The [publish workflow](.github/workflows/publish.yml) runs when a `v*` tag is pushed. It checks that the tag matches `package.json`, runs typechecks and tests, inspects the package, then publishes to npm. Stable versions use `latest`; prereleases use `next`.

### One-time setup

In the npm package's **Settings → Trusted publishing**, add a GitHub Actions publisher:

- Organization or user: `Rinisnotarobot`
- Repository: `rinco-pi-sakura`
- Workflow filename: `publish.yml` (not the full path)
- Environment: leave empty (the workflow does not use a GitHub environment)
- Allow direct publishing with `npm publish` if this option is shown.

The workflow uses OIDC, so no `NPM_TOKEN` secret is needed. Trusted publishing requires npm 11.5.1+; the workflow uses Node.js 24. For a new package that does not yet exist on npm, first publish it locally with `npm login` and `npm publish --access public`, then configure the trusted publisher. The GitHub repository must be public for automatic provenance generation. See [npm's trusted publishing documentation](https://docs.npmjs.com/trusted-publishers).

### Release a new version

From a clean checkout on your release branch:

```bash
npm version patch
# Use minor/major instead, or: npm version prerelease --preid=beta
git push origin HEAD
git push origin "v$(node -p 'require("./package.json").version')"
```

`npm version` updates both manifests and creates the release commit and tag. Commit this workflow before tagging a release. Each npm version can only be published once; after a local first publish, bump the version before triggering Actions. Monitor **Actions → Publish to npm** for the result.

## Troubleshooting

### The header does not appear

1. Confirm that Pi is running in TUI mode rather than headless, JSON, or print mode.
2. Run `/reload` or restart Pi.
3. Run `pi list` to confirm that the package is installed.

### Colors look incorrect

Make sure your terminal supports Truecolor. The header asks Pi for the detected color mode and emits `38;2;r;g;b` on Truecolor terminals, falling back to the nearest 256-color palette index otherwise. The theme also looks best with 24-bit color support.

### The Unicode artwork is misaligned

Unicode cell widths vary between fonts and terminals. Use a monospaced font with broader Unicode coverage, or replace the artwork as described in the [customization reference](docs/theme-and-header.md#changing-the-artwork).
