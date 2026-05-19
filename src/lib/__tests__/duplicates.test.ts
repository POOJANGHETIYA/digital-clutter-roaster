/**
 * Tests for the Verified Duplicate Detection pipeline (v0.2.0).
 *
 * These tests run in happy-dom (no real SubtleCrypto), so they exercise
 * the metadata-only tiers (likely + suspect). The full-hash "exact" tier
 * is tested separately with a mock crypto implementation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectDuplicates, countByStrength, reclaimableByStrength } from "../duplicates";
import type { FileNode } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _id = 0;
function makeFile(overrides: Partial<FileNode> & { name: string; size: number }): FileNode {
  return {
    id: `f${++_id}`,
    path: `/Users/you/Documents/${overrides.name}`,
    ext: overrides.name.includes(".") ? overrides.name.split(".").pop()! : "",
    modified: Date.now() - 86400_000,
    parent: "/Users/you/Documents",
    depth: 3,
    category: "documents",
    isDevJunk: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Core acceptance criteria
// ---------------------------------------------------------------------------

describe("detectDuplicates – acceptance criteria", () => {
  beforeEach(() => { _id = 0; });

  it("same name alone does NOT create an exact duplicate", async () => {
    const files = [
      makeFile({ name: "report.pdf", size: 1_000_000, path: "/a/report.pdf" }),
      makeFile({ name: "report.pdf", size: 2_000_000, path: "/b/report.pdf" }), // different size
    ];
    const groups = await detectDuplicates(files);
    const exactGroups = groups.filter((g) => g.strength === "exact");
    expect(exactGroups).toHaveLength(0);
  });

  it("same size alone does NOT create an exact duplicate (no file handles)", async () => {
    const files = [
      makeFile({ name: "alpha.pdf", size: 1_000_000, path: "/a/alpha.pdf" }),
      makeFile({ name: "beta.pdf", size: 1_000_000, path: "/b/beta.pdf" }),
    ];
    const groups = await detectDuplicates(files);
    const exactGroups = groups.filter((g) => g.strength === "exact");
    expect(exactGroups).toHaveLength(0);
  });

  it("files below 256 KB are ignored", async () => {
    const files = [
      makeFile({ name: "tiny.txt", size: 100_000, path: "/a/tiny.txt" }),
      makeFile({ name: "tiny.txt", size: 100_000, path: "/b/tiny.txt" }),
    ];
    const groups = await detectDuplicates(files);
    expect(groups).toHaveLength(0);
  });

  it("dev-junk files are excluded", async () => {
    const files = [
      makeFile({ name: "index.js", size: 500_000, path: "/a/node_modules/pkg/index.js", isDevJunk: true }),
      makeFile({ name: "index.js", size: 500_000, path: "/b/node_modules/pkg/index.js", isDevJunk: true }),
    ];
    const groups = await detectDuplicates(files);
    expect(groups).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Likely duplicates (same size + same name)
// ---------------------------------------------------------------------------

describe("detectDuplicates – likely tier", () => {
  beforeEach(() => { _id = 0; });

  it("produces a 'likely' group for same name + same size", async () => {
    const files = [
      makeFile({ name: "invoice.pdf", size: 1_500_000, path: "/Downloads/invoice.pdf" }),
      makeFile({ name: "invoice.pdf", size: 1_500_000, path: "/Desktop/invoice.pdf" }),
    ];
    const groups = await detectDuplicates(files);
    expect(groups).toHaveLength(1);
    expect(groups[0].strength).toBe("likely");
    expect(groups[0].verificationMethod).toBe("metadata");
    expect(groups[0].fileCount).toBe(2);
  });

  it("reclaimableBytes = size × (count - 1)", async () => {
    const size = 2_000_000;
    const files = [
      makeFile({ name: "photo.jpg", size, path: "/a/photo.jpg" }),
      makeFile({ name: "photo.jpg", size, path: "/b/photo.jpg" }),
      makeFile({ name: "photo.jpg", size, path: "/c/photo.jpg" }),
    ];
    const groups = await detectDuplicates(files);
    const g = groups.find((g) => g.strength === "likely");
    expect(g).toBeDefined();
    expect(g!.reclaimableBytes).toBe(size * 2);
  });

  it("legacy compat fields are populated", async () => {
    const files = [
      makeFile({ name: "doc.pdf", size: 1_000_000, path: "/a/doc.pdf" }),
      makeFile({ name: "doc.pdf", size: 1_000_000, path: "/b/doc.pdf" }),
    ];
    const groups = await detectDuplicates(files);
    const g = groups[0];
    expect(g.key).toBe(g.id);
    expect(g.size).toBe(g.totalBytes);
    expect(g.count).toBe(g.fileCount);
    expect(g.totalWaste).toBe(g.reclaimableBytes);
    expect(g.confidence).toBe(g.strength);
  });
});

// ---------------------------------------------------------------------------
// Suspect duplicates (same size, similar name)
// ---------------------------------------------------------------------------

describe("detectDuplicates – suspect tier", () => {
  beforeEach(() => { _id = 0; });

  it("produces a 'suspect' group for same size + similar stem", async () => {
    const size = 5_000_000;
    const files = [
      makeFile({ name: "proposal_draft.docx", size, path: "/a/proposal_draft.docx" }),
      makeFile({ name: "proposal_v2.docx", size, path: "/b/proposal_v2.docx" }),
    ];
    const groups = await detectDuplicates(files);
    const suspects = groups.filter((g) => g.strength === "suspect");
    expect(suspects.length).toBeGreaterThanOrEqual(1);
  });

  it("same size, completely different names → suspect (size-only)", async () => {
    const size = 3_000_000;
    const files = [
      makeFile({ name: "alpha.mov", size, path: "/a/alpha.mov" }),
      makeFile({ name: "zeta.mov", size, path: "/b/zeta.mov" }),
    ];
    const groups = await detectDuplicates(files);
    const suspects = groups.filter((g) => g.strength === "suspect");
    expect(suspects.length).toBeGreaterThanOrEqual(1);
    expect(suspects[0].verificationMethod).toBe("filename-pattern");
  });
});

// ---------------------------------------------------------------------------
// Exact duplicates (requires SubtleCrypto mock)
// ---------------------------------------------------------------------------

describe("detectDuplicates – exact tier (mocked crypto)", () => {
  beforeEach(() => {
    _id = 0;
    // Mock SubtleCrypto so full-hash returns a deterministic value
    const mockDigest = vi.fn(async (_algo: string, buf: ArrayBuffer) => {
      // Return a hash based on buffer length to simulate identical content
      const len = buf.byteLength;
      const arr = new Uint8Array(32).fill(len % 256);
      return arr.buffer;
    });
    vi.stubGlobal("crypto", { subtle: { digest: mockDigest } });
  });

  it("produces an 'exact' group when full hashes match", async () => {
    const size = 2_000_000;
    const content = new Uint8Array(size).fill(42); // identical content

    const files = [
      makeFile({ name: "video.mp4", size, path: "/a/video.mp4" }),
      makeFile({ name: "video_copy.mp4", size, path: "/b/video_copy.mp4" }),
    ];

    // Build a fileHandleMap with File objects of identical content
    const fileHandleMap = new Map<string, File>([
      ["/a/video.mp4", new File([content], "video.mp4")],
      ["/b/video_copy.mp4", new File([content], "video_copy.mp4")],
    ]);

    const groups = await detectDuplicates(files, fileHandleMap);
    const exactGroups = groups.filter((g) => g.strength === "exact");
    expect(exactGroups.length).toBeGreaterThanOrEqual(1);
    expect(exactGroups[0].verificationMethod).toBe("full-hash");
    expect(exactGroups[0].confidenceScore).toBe(1.0);
  });

  it("does NOT produce exact group when content differs (different hash)", async () => {
    const size = 2_000_000;

    const files = [
      makeFile({ name: "a.pdf", size, path: "/a/a.pdf" }),
      makeFile({ name: "b.pdf", size, path: "/b/b.pdf" }),
    ];

    // Different content → different buffer lengths → different mock hash
    const fileHandleMap = new Map<string, File>([
      ["/a/a.pdf", new File([new Uint8Array(size).fill(1)], "a.pdf")],
      ["/b/b.pdf", new File([new Uint8Array(size - 1).fill(2)], "b.pdf")], // different size slice
    ]);

    const groups = await detectDuplicates(files, fileHandleMap);
    const exactGroups = groups.filter((g) => g.strength === "exact");
    // The two files have different buffer sizes in the mock, so they should not form an exact group together
    const exactWithBothFiles = exactGroups.filter(
      (g) => g.files.some((f) => f.path === "/a/a.pdf") && g.files.some((f) => f.path === "/b/b.pdf"),
    );
    expect(exactWithBothFiles).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Summary helpers
// ---------------------------------------------------------------------------

describe("countByStrength / reclaimableByStrength", () => {
  it("counts groups by strength correctly", async () => {
    const files = [
      makeFile({ name: "same.pdf", size: 1_000_000, path: "/a/same.pdf" }),
      makeFile({ name: "same.pdf", size: 1_000_000, path: "/b/same.pdf" }),
      makeFile({ name: "other.mov", size: 5_000_000, path: "/c/other.mov" }),
      makeFile({ name: "other2.mov", size: 5_000_000, path: "/d/other2.mov" }),
    ];
    const groups = await detectDuplicates(files);
    const counts = countByStrength(groups);
    expect(counts.exact + counts.likely + counts.suspect).toBe(groups.length);
  });

  it("reclaimableByStrength sums correctly", async () => {
    const files = [
      makeFile({ name: "doc.pdf", size: 2_000_000, path: "/a/doc.pdf" }),
      makeFile({ name: "doc.pdf", size: 2_000_000, path: "/b/doc.pdf" }),
    ];
    const groups = await detectDuplicates(files);
    const reclaim = reclaimableByStrength(groups);
    const total = reclaim.exact + reclaim.likely + reclaim.suspect;
    expect(total).toBe(groups.reduce((s, g) => s + g.reclaimableBytes, 0));
  });
});

// ---------------------------------------------------------------------------
// Ordering: exact first, then by reclaimable bytes
// ---------------------------------------------------------------------------

describe("detectDuplicates – ordering", () => {
  it("exact groups appear before likely groups", async () => {
    // We can only test this with mocked crypto
    vi.stubGlobal("crypto", {
      subtle: {
        digest: vi.fn(async () => new Uint8Array(32).fill(99).buffer),
      },
    });

    const size = 3_000_000;
    const files = [
      makeFile({ name: "likely.pdf", size, path: "/a/likely.pdf" }),
      makeFile({ name: "likely.pdf", size, path: "/b/likely.pdf" }),
      makeFile({ name: "exact_a.mov", size: size + 1, path: "/c/exact_a.mov" }),
      makeFile({ name: "exact_b.mov", size: size + 1, path: "/d/exact_b.mov" }),
    ];

    const fileHandleMap = new Map<string, File>([
      ["/c/exact_a.mov", new File([new Uint8Array(size + 1).fill(7)], "exact_a.mov")],
      ["/d/exact_b.mov", new File([new Uint8Array(size + 1).fill(7)], "exact_b.mov")],
    ]);

    const groups = await detectDuplicates(files, fileHandleMap);
    const strengths = groups.map((g) => g.strength);
    const firstNonExact = strengths.findIndex((s) => s !== "exact");
    const lastExact = strengths.lastIndexOf("exact");
    // All exact groups come before any non-exact group
    if (firstNonExact !== -1 && lastExact !== -1) {
      expect(lastExact).toBeLessThan(firstNonExact);
    }
  });
});
