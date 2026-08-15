#!/usr/bin/env node
/**
 * Scans every markdown file under .lovable/memory for `mem://` references
 * and verifies a matching documentation file exists.
 * Exits with code 1 and a report when any reference is dangling.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const MEMORY_DIR = path.resolve(".lovable/memory");

export async function collectMarkdownFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectMarkdownFiles(full)));
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

/** Resolve a mem:// target to the file path it should live at. */
export function resolveMemPath(target) {
  const clean = target.replace(/^mem:\/\//, "").replace(/[).,]+$/, "");
  const base = path.join(MEMORY_DIR, clean);
  return base.endsWith(".md") ? base : `${base}.md`;
}

export async function findDanglingMemLinks() {
  if (!existsSync(MEMORY_DIR)) return [];
  const files = await collectMarkdownFiles(MEMORY_DIR);
  const dangling = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const matches = content.matchAll(/mem:\/\/[A-Za-z0-9._~\/-]+/g);
    for (const [raw] of matches) {
      // `mem://~user` is a platform-managed file that lives outside the project.
      if (raw.startsWith("mem://~")) continue;
      const expected = resolveMemPath(raw);
      if (!existsSync(expected)) {
        dangling.push({
          source: path.relative(process.cwd(), file),
          reference: raw,
          expected: path.relative(process.cwd(), expected),
        });
      }
    }
  }
  return dangling;
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]).endsWith("check-memory-links.mjs");

if (isDirectRun) {
  const dangling = await findDanglingMemLinks();
  if (dangling.length === 0) {
    console.log("✓ All mem:// references resolve to existing files.");
  } else {
    console.error(`✗ ${dangling.length} dangling mem:// reference(s):\n`);
    for (const d of dangling) {
      console.error(`  ${d.source} → ${d.reference}\n    missing file: ${d.expected}`);
    }
    process.exit(1);
  }
}
