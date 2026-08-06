import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));

describe("Pi package manifest", () => {
  it("declares the extension and theme resources", () => {
    expect(manifest.name).toBe("rinco-pi-sakura");
    expect(manifest.keywords).toContain("pi-package");
    expect(manifest.pi.extensions).toEqual(["./extensions/header/index.ts"]);
    expect(manifest.pi.themes).toEqual(["./themes/sakura-macaron.json"]);
  });

  it("points to resources that exist", async () => {
    for (const path of [...manifest.pi.extensions, ...manifest.pi.themes]) {
      await expect(access(resolve(root, path))).resolves.toBeUndefined();
    }
  });
});

describe("Sakura Macaron theme", () => {
  it("defines every color required by Pi", async () => {
    const theme = JSON.parse(
      await readFile(resolve(root, manifest.pi.themes[0]), "utf8"),
    );
    const requiredColors = [
      "accent", "border", "borderAccent", "borderMuted", "success", "error", "warning",
      "muted", "dim", "text", "thinkingText", "selectedBg", "userMessageBg",
      "userMessageText", "customMessageBg", "customMessageText", "customMessageLabel",
      "toolPendingBg", "toolSuccessBg", "toolErrorBg", "toolTitle", "toolOutput", "mdHeading",
      "mdLink", "mdLinkUrl", "mdCode", "mdCodeBlock", "mdCodeBlockBorder", "mdQuote",
      "mdQuoteBorder", "mdHr", "mdListBullet", "toolDiffAdded", "toolDiffRemoved",
      "toolDiffContext", "syntaxComment", "syntaxKeyword", "syntaxFunction", "syntaxVariable",
      "syntaxString", "syntaxNumber", "syntaxType", "syntaxOperator", "syntaxPunctuation",
      "thinkingOff", "thinkingMinimal", "thinkingLow", "thinkingMedium", "thinkingHigh",
      "thinkingXhigh", "bashMode",
    ];

    expect(theme.name).toBe("sakura-macaron");
    expect(Object.keys(theme.colors)).toEqual(expect.arrayContaining(requiredColors));
  });
});
