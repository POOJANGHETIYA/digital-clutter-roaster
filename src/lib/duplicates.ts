/**
 * Verified Duplicate Detection – v0.2.0
 *
 * Three-tier pipeline:
 *   1. Group by exact byte size  (cheap, no I/O)
 *   2. Narrow with partial-hash  (first 64 KB via SubtleCrypto)
 *   3. Full-hash only on narrowed candidates  (SubtleCrypto SHA-256)
 *
 * Tiers:
 *   exact   – full content hash matches  (verificationMethod: "full-hash")
 *   likely  – same size + same name      (verificationMethod: "metadata")
 *   suspect – same size, similar name    (verificationMethod: "filename-pattern")
 *
 * Rules enforced:
 *   - Same name alone  → never "exact"
 *   - Same size alone  → never "exact"
 *   - Only a matching full-hash → "exact"
 */

import type {
  DuplicateGroup,
  DuplicateMatchStrength,
  DuplicateVerificationMethod,
  FileNode,
} from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum file size to consider for duplicate detection (256 KB). */
const MIN_SIZE = 256 * 1024;

/** Bytes read for the partial-hash pass (64 KB). */
const PARTIAL_BYTES = 64 * 1024;

/** Maximum groups returned (sorted by reclaimable bytes desc). */
const MAX_GROUPS = 60;

// ---------------------------------------------------------------------------
// Hashing helpers (SubtleCrypto – available in all modern browsers)
// ---------------------------------------------------------------------------

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function partialHash(file: File): Promise<string | null> {
  try {
    const slice = file.slice(0, PARTIAL_BYTES);
    const buf = await slice.arrayBuffer();
    return sha256Hex(buf);
  } catch {
    return null;
  }
}

async function fullHash(file: File): Promise<string | null> {
  try {
    const buf = await file.arrayBuffer();
    return sha256Hex(buf);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Group builder helpers
// ---------------------------------------------------------------------------

let _groupCounter = 0;
function nextGroupId(): string {
  return `dg${++_groupCounter}`;
}

function buildGroup(
  files: FileNode[],
  strength: DuplicateMatchStrength,
  method: DuplicateVerificationMethod,
  explanation: string,
  confidenceScore: number,
): DuplicateGroup {
  const size = files[0]?.size ?? 0;
  const reclaimable = size * (files.length - 1);
  const exts = [...new Set(files.map((f) => f.ext).filter(Boolean))];
  const id = nextGroupId();
  return {
    id,
    key: id, // legacy compat
    strength,
    verificationMethod: method,
    fileIds: files.map((f) => f.id),
    files,
    fileCount: files.length,
    totalBytes: size,
    reclaimableBytes: reclaimable,
    sharedExtension: exts.length === 1 ? exts[0] : null,
    sharedSizeBytes: size,
    confidenceScore,
    explanation,
    // legacy compat
    size,
    count: files.length,
    totalWaste: reclaimable,
    confidence: strength,
  };
}

// ---------------------------------------------------------------------------
// Normalised stem comparison for suspect detection
// ---------------------------------------------------------------------------

/**
 * Strip common version/copy suffixes so "report_v2_FINAL" and "report_v3"
 * share the same normalised stem.
 */
function normaliseStem(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "") // remove extension
    .replace(/[-_ ](copy|final|v\d+|draft|backup|bak|\d{4}-\d{2}-\d{2}|\d+)$/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Detect duplicates using the three-tier pipeline.
 *
 * When `fileHandleMap` is provided (live scan), the function will attempt
 * partial + full hashing to produce "exact" groups.
 * In demo mode (no handles), it falls back to metadata-only tiers.
 */
export async function detectDuplicates(
  files: FileNode[],
  fileHandleMap?: Map<string, File>,
  onProgress?: (done: number, total: number) => void,
): Promise<DuplicateGroup[]> {
  // ── Stage 0: filter candidates ──────────────────────────────────────────
  const candidates = files.filter(
    (f) => f.size >= MIN_SIZE && !f.isDevJunk,
  );

  // ── Stage 1: group by exact byte size ───────────────────────────────────
  const bySize = new Map<number, FileNode[]>();
  for (const f of candidates) {
    const arr = bySize.get(f.size) ?? [];
    arr.push(f);
    bySize.set(f.size, arr);
  }

  // Keep only size-groups with ≥2 members
  const sizeGroups = [...bySize.values()].filter((g) => g.length >= 2);

  const groups: DuplicateGroup[] = [];

  // ── Stage 2 + 3: content hashing (only when File handles are available) ─
  if (fileHandleMap && fileHandleMap.size > 0) {
    let done = 0;
    const total = sizeGroups.reduce((s, g) => s + g.length, 0);

    for (const sizeGroup of sizeGroups) {
      // Partial-hash pass to narrow candidates
      const partialBuckets = new Map<string, FileNode[]>();
      for (const f of sizeGroup) {
        const fh = fileHandleMap.get(f.path);
        if (!fh) continue;
        const ph = await partialHash(fh);
        if (!ph) continue;
        const bucket = partialBuckets.get(ph) ?? [];
        bucket.push(f);
        partialBuckets.set(ph, bucket);
        done++;
        onProgress?.(done, total);
        // Yield every 20 files to keep UI alive
        if (done % 20 === 0) await new Promise((r) => setTimeout(r, 0));
      }

      // Full-hash pass only on partial-hash matches
      for (const [, partialGroup] of partialBuckets) {
        if (partialGroup.length < 2) continue;

        const fullBuckets = new Map<string, FileNode[]>();
        for (const f of partialGroup) {
          const fh = fileHandleMap.get(f.path);
          if (!fh) continue;
          const fhash = await fullHash(fh);
          if (!fhash) continue;
          const bucket = fullBuckets.get(fhash) ?? [];
          bucket.push(f);
          fullBuckets.set(fhash, bucket);
        }

        for (const [, exactGroup] of fullBuckets) {
          if (exactGroup.length < 2) continue;
          groups.push(
            buildGroup(
              exactGroup,
              "exact",
              "full-hash",
              `${exactGroup.length} identical files verified by full content hash. Safe to keep one copy.`,
              1.0,
            ),
          );
        }
      }
    }
  }

  // ── Metadata tiers (always run; skip files already in exact groups) ──────
  const exactFileIds = new Set(groups.flatMap((g) => g.fileIds));

  for (const sizeGroup of sizeGroups) {
    const remaining = sizeGroup.filter((f) => !exactFileIds.has(f.id));
    if (remaining.length < 2) continue;

    // Likely: same size + same filename (case-insensitive)
    const byName = new Map<string, FileNode[]>();
    for (const f of remaining) {
      const k = f.name.toLowerCase();
      const list = byName.get(k) ?? [];
      list.push(f);
      byName.set(k, list);
    }

    const likelyIds = new Set<string>();
    for (const [, nameGroup] of byName) {
      if (nameGroup.length < 2) continue;
      likelyIds.forEach((id) => nameGroup.find((f) => f.id === id)); // no-op guard
      nameGroup.forEach((f) => likelyIds.add(f.id));
      groups.push(
        buildGroup(
          nameGroup,
          "likely",
          "metadata",
          `${nameGroup.length} files share the same name and exact byte size. Content not verified — review before deleting.`,
          0.75,
        ),
      );
    }

    // Suspect: same size, similar normalised stem, different names
    const suspects = remaining.filter((f) => !likelyIds.has(f.id));
    if (suspects.length < 2) continue;

    const byStem = new Map<string, FileNode[]>();
    for (const f of suspects) {
      const stem = normaliseStem(f.name);
      const list = byStem.get(stem) ?? [];
      list.push(f);
      byStem.set(stem, list);
    }

    const stemMatchedIds = new Set<string>();
    for (const [, stemGroup] of byStem) {
      if (stemGroup.length < 2) continue;
      stemGroup.forEach((f) => stemMatchedIds.add(f.id));
      groups.push(
        buildGroup(
          stemGroup,
          "suspect",
          "filename-pattern",
          `${stemGroup.length} files have similar names and the same byte size. Weak signal — manual check recommended.`,
          0.4,
        ),
      );
    }

    // Remaining same-size, different-name files (no stem match)
    const sizeOnly = suspects.filter((f) => !stemMatchedIds.has(f.id));
    if (sizeOnly.length >= 2) {
      groups.push(
        buildGroup(
          sizeOnly,
          "suspect",
          "filename-pattern",
          `${sizeOnly.length} files share the same byte size but have different names. Coincidence is possible — review manually.`,
          0.25,
        ),
      );
    }
  }

  // ── Sort and cap ─────────────────────────────────────────────────────────
  // Priority: exact first, then by reclaimable bytes desc
  const STRENGTH_ORDER: Record<DuplicateMatchStrength, number> = {
    exact: 0,
    likely: 1,
    suspect: 2,
  };

  groups.sort((a, b) => {
    const so = STRENGTH_ORDER[a.strength] - STRENGTH_ORDER[b.strength];
    if (so !== 0) return so;
    return b.reclaimableBytes - a.reclaimableBytes;
  });

  return groups.slice(0, MAX_GROUPS);
}

// ---------------------------------------------------------------------------
// Summary helpers (used by ResultsPage + export)
// ---------------------------------------------------------------------------

export function countByStrength(
  groups: DuplicateGroup[],
): Record<DuplicateMatchStrength, number> {
  return {
    exact: groups.filter((g) => g.strength === "exact").length,
    likely: groups.filter((g) => g.strength === "likely").length,
    suspect: groups.filter((g) => g.strength === "suspect").length,
  };
}

export function reclaimableByStrength(
  groups: DuplicateGroup[],
): Record<DuplicateMatchStrength, number> {
  return {
    exact: groups.filter((g) => g.strength === "exact").reduce((s, g) => s + g.reclaimableBytes, 0),
    likely: groups.filter((g) => g.strength === "likely").reduce((s, g) => s + g.reclaimableBytes, 0),
    suspect: groups.filter((g) => g.strength === "suspect").reduce((s, g) => s + g.reclaimableBytes, 0),
  };
}
