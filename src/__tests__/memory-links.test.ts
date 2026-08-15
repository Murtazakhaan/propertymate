import { describe, expect, it } from "vitest";
import { findDanglingMemLinks } from "../../scripts/check-memory-links.mjs";

describe("project memory documentation", () => {
  it("has no dangling mem:// references", async () => {
    const dangling = await findDanglingMemLinks();
    expect(
      dangling,
      dangling.length
        ? `Missing memory files:\n${dangling
            .map((d: { source: string; reference: string; expected: string }) => `  ${d.source} → ${d.reference} (expected ${d.expected})`)
            .join("\n")}`
        : "",
    ).toEqual([]);
  });
});
