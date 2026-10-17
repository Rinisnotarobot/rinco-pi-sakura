import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPackageDir } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));

type Schema = {
  properties: {
    colors: {
      required: string[];
      properties: Record<string, unknown>;
      additionalProperties?: boolean;
    };
    [key: string]: unknown;
  };
  additionalProperties?: boolean;
};

async function readJson(path: string) {
  return JSON.parse(await readFile(path, "utf8"));
}

const theme = await readJson(resolve(root, manifest.pi.themes[0]));

/** The schema shipped with the installed Pi version, so these assertions track the real contract. */
async function readThemeSchema(): Promise<Schema> {
  const schemaPath = resolve(getPackageDir(), "schemas", "theme.schema.json");
  return readJson(schemaPath);
}

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

  it("declares the host-provided Pi packages it imports as peers, not dependencies", () => {
    // Pi supplies these at runtime; bundling a copy breaks extension module mapping.
    const dependencies = (manifest.dependencies ?? {}) as Record<string, string>;

    for (const name of ["@earendil-works/pi-coding-agent", "@earendil-works/pi-tui"]) {
      expect(manifest.peerDependencies?.[name]).toBe("*");
      expect(dependencies[name]).toBeUndefined();
    }
  });
});

describe("Sakura Macaron theme", () => {
  it("defines every color required by the installed Pi version", async () => {
    const schema = await readThemeSchema();

    expect(theme.name).toBe("sakura-macaron");
    expect(theme.colors).toEqual(
      expect.objectContaining(Object.fromEntries(schema.properties.colors.required.map((key) => [key, expect.anything()]))),
    );
  });

  it("uses only color tokens the schema accepts", async () => {
    const schema = await readThemeSchema();
    const allowed = new Set(Object.keys(schema.properties.colors.properties));

    expect(Object.keys(theme.colors).filter((key) => !allowed.has(key))).toEqual([]);
    expect(Object.keys(theme).filter((key) => !(key in schema.properties))).toEqual([]);
  });

  it("points $schema at the published schema and declares its appearance", async () => {
    expect(theme.$schema).toBe("https://pi.dev/schemas/theme.schema.json");
    expect(theme.appearance).toBe("dark");
  });

  it("resolves every variable reference", () => {
    const vars = theme.vars as Record<string, string | number>;
    const resolveRef = (value: string | number, seen = new Set<string>()): string | number => {
      if (typeof value === "number" || value === "" || /^(#|oklch\(|okhsl\()/i.test(value)) return value;
      if (seen.has(value)) throw new Error(`Circular variable reference: ${value}`);
      if (!(value in vars)) throw new Error(`Unknown variable reference: ${value}`);
      return resolveRef(vars[value]!, new Set([...seen, value]));
    };

    for (const value of Object.values(theme.colors as Record<string, string | number>)) {
      resolveRef(value);
    }
    for (const value of Object.values((theme.export ?? {}) as Record<string, string | number>)) {
      resolveRef(value);
    }
  });

  it("renders thinking as muted text and responses as primary text", () => {
    expect([theme.colors.thinkingText, theme.colors.text]).toEqual(["muted", "text"]);
  });
});
