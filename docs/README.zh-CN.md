<div align="center">

# Rinco Pi Sakura

**为 [Pi](https://github.com/earendil-works/pi) 打造的 Sakura Macaron 主题与动态 CyberDeck Header。**

[![Pi package](https://img.shields.io/badge/Pi-package-F2A7C6?style=flat-square)](https://github.com/earendil-works/pi) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tests](https://img.shields.io/badge/tests-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/) [![License](https://img.shields.io/badge/license-MIT-C7B8F5?style=flat-square)](../LICENSE)

[功能](#功能) · [安装](#安装) · [使用](#使用) · [定制](#定制) · [开发](#开发)

[English](../README.md)

</div>

Rinco Pi Sakura 是一个轻量的 Pi 外观包，将柔和的深色 Sakura Macaron 配色与带眨眼动画的真彩 Unicode Header 组合在一起。Pi 可直接加载包内的 TypeScript 扩展，无需构建步骤。

## 功能

- **完整主题**：覆盖消息、Markdown、工具、Diff、语法高亮、Thinking 等级和导出页面。
- **动态 Header**：使用 Sakura → Sky 的逐字素渐变渲染 Unicode 图案。
- **启动动画**：会话启动时播放一次眨眼动画，随后保持静态显示。
- **响应式布局**：按终端单元格宽度裁剪，并按可用高度调整顶部留白。
- **安全降级**：仅在 TUI 模式下安装 Header；终端不支持 Truecolor 时回退到 256 色。
- **可独立组合**：主题与 Header 可分别使用，也可搭配不占用 Header 区域的其他扩展。

## 安装

### 从 npm 安装（推荐）

```bash
pi install npm:rinco-pi-sakura
```

该包已发布至 [npm](https://www.npmjs.com/package/rinco-pi-sakura)。

### 从 GitHub 安装

```bash
pi install git:github.com/Rinisnotarobot/rinco-pi-sakura
```

### 从本地目录安装

```bash
git clone https://github.com/Rinisnotarobot/rinco-pi-sakura.git
cd rinco-pi-sakura
pi install "$PWD"
```

> [!IMPORTANT]
> Pi 扩展以当前用户权限运行。安装任何第三方扩展前，请先审查其源码。

## 使用

安装后重启 Pi，或执行：

```text
/reload
```

然后打开 `/settings`，将主题切换为：

```text
sakura-macaron
```

Header 会在 TUI 会话启动时自动启用，无需额外配置。

> [!NOTE]
> 最佳显示效果需要支持 Truecolor 的终端，以及包含所用 Unicode 字符的字体。窄终端会自动裁剪图案。

## 包含内容

| 路径 | 说明 |
| --- | --- |
| [`extensions/header/index.ts`](../extensions/header/index.ts) | Header 渲染、响应式布局和眨眼动画 |
| [`themes/sakura-macaron.json`](../themes/sakura-macaron.json) | Sakura Macaron 主题与完整 Pi 色板 |
| [`docs/theme-and-header.md`](theme-and-header.md) | 色板、生命周期和品牌定制说明 |
| [`docs/CONTRIBUTING.md`](CONTRIBUTING.md) | 本地开发、测试规范和 PR 检查清单 |
| [`tests/header.test.ts`](../tests/header.test.ts) | Header 生命周期和渲染测试 |
| [`tests/package.test.ts`](../tests/package.test.ts) | Pi 包清单、资源和主题 Schema 测试 |

## 定制

常用定制项都位于两个文件中：

- 在 `themes/sakura-macaron.json` 的 `vars` 中调整主题基础色。
- 在 `extensions/header/index.ts` 中修改 `ANIME_ART`、标题文字和 RGB 渐变。

修改主题时请保留 Pi Theme Schema 要求的颜色键；Pi 会拒绝未知的顶层字段和颜色键，可复用的颜色请放到 `vars` 中。修改图案后建议同时在窄终端和宽终端中验证裁剪效果。完整说明见[主题与 Header 文档](theme-and-header.md)。

## 开发

### 环境要求

- [Node.js](https://nodejs.org/) 22.19 或更高版本
- [Pi](https://github.com/earendil-works/pi)

安装开发依赖：

```bash
npm install
```

### 可用命令

<!-- AUTO-GENERATED: package-scripts:start -->
<!-- Source: package.json#scripts. Do not edit manually. -->

| 命令 | 说明 |
| --- | --- |
| `npm test` | 使用 Vitest 运行一次完整测试套件。 |
| `npm run test:watch` | 以监听模式运行 Vitest，并在文件变化后重新测试。 |
| `npm run typecheck` | 使用 `tsc --noEmit` 对扩展和测试做类型检查。 |
| `npm run check` | 先做类型检查，再运行完整 Vitest 测试。 |
| `npm run pack:check` | 使用 `npm pack --dry-run` 检查发布包内容，不生成正式发布。 |

<!-- AUTO-GENERATED: package-scripts:end -->

运行测试：

```bash
npm test
```

监听文件变化：

```bash
npm run test:watch
```

类型检查：

```bash
npm run typecheck
```

验证类型、测试与发布内容：

```bash
npm run check
npm run pack:check
```

本项目使用 Vitest 测试扩展生命周期、Header 输出、包资源路径和主题色板。Pi 运行时会直接加载 TypeScript 源码，因此没有单独的构建命令。

## 常见问题

### Header 没有显示

1. 确认当前运行在 Pi TUI 模式，而不是 Headless、JSON 或 Print 模式。
2. 执行 `/reload` 或重启 Pi。
3. 使用 `pi list` 确认包已安装。

### 颜色显示异常

确认终端已启用 Truecolor。Header 会向 Pi 查询终端色彩模式：Truecolor 终端输出 `38;2;r;g;b`，否则退回到最接近的 256 色索引。主题同样以 24-bit 色彩支持为最佳。

### Unicode 图案错位

不同字体对 Unicode 字符宽度的处理可能不同。请更换覆盖范围更完整的等宽字体，或按[定制文档](theme-and-header.md#changing-the-artwork)替换图案。
