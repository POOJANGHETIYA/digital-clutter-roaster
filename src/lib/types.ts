// Core domain types for Digital Clutter Roaster.
// Designed so we can plug in additional OS analyzers later.

export type ClutterCategoryId =
  | "screenshots"
  | "downloads"
  | "archives"
  | "videos"
  | "images"
  | "documents"
  | "audio"
  | "code"
  | "dev-junk"
  | "duplicates"
  | "stale"
  | "other";

export interface FileNode {
  id: string;
  name: string;
  path: string;
  size: number;
  ext: string;
  modified: number; // epoch ms
  parent: string;
  depth: number;
  category: ClutterCategoryId;
  isStale?: boolean;
  isDevJunk?: boolean;
  devJunkKind?: string; // e.g. "node_modules"
}

export interface FolderSummary {
  path: string;
  name: string;
  size: number;
  files: number;
  depth: number;
}

// ---------------------------------------------------------------------------
// Verified Duplicate Detection – v0.2.0
// ---------------------------------------------------------------------------

/** How strongly we believe these files are duplicates. */
export type DuplicateMatchStrength = "exact" | "likely" | "suspect";

/**
 * What evidence was used to classify the group.
 * - full-hash   : SHA-256 of the entire file content (exact only)
 * - partial-hash: SHA-256 of the first 64 KB (narrows candidates)
 * - metadata    : same size + same name (likely)
 * - filename-pattern: similar name, same size (suspect)
 */
export type DuplicateVerificationMethod =
  | "full-hash"
  | "partial-hash"
  | "metadata"
  | "filename-pattern";

export interface DuplicateGroup {
  /** Stable identifier for this group. */
  id: string;
  /** Duplicate strength tier. */
  strength: DuplicateMatchStrength;
  /** Evidence method used to classify this group. */
  verificationMethod: DuplicateVerificationMethod;
  /** IDs of the FileNode members. */
  fileIds: string[];
  /** Convenience copy of the FileNode objects. */
  files: FileNode[];
  fileCount: number;
  /** Byte size of one copy. */
  totalBytes: number;
  /** Bytes that could be freed by keeping one copy. */
  reclaimableBytes: number;
  sharedExtension?: string | null;
  sharedSizeBytes?: number | null;
  /** 0–1 confidence score. */
  confidenceScore: number;
  /** Human-readable explanation shown in the UI. */
  explanation: string;

  // ── Legacy compat fields (kept so existing roast/export code compiles) ──
  /** @deprecated use `id` */
  key: string;
  /** @deprecated use `totalBytes` */
  size: number;
  /** @deprecated use `fileCount` */
  count: number;
  /** @deprecated use `reclaimableBytes` */
  totalWaste: number;
  /** @deprecated use `strength` */
  confidence: DuplicateMatchStrength | "name";
}

export interface CategoryBreakdown {
  id: ClutterCategoryId;
  label: string;
  description: string;
  size: number;
  count: number;
}

export interface DevJunkCluster {
  kind: string; // node_modules, .next, DerivedData, dist, build, .cache
  rootPath: string;
  size: number;
  files: number;
}

export interface CleanupSuggestion {
  id: string;
  level: "quick" | "medium" | "manual";
  title: string;
  why: string;
  estimatedBytes: number;
  confidence: "high" | "medium" | "low";
  safety: "generally-safe" | "needs-review";
  targetCategory?: ClutterCategoryId;
}

export interface RoastReport {
  archetype: string;
  archetypeBlurb: string;
  score: number; // 0-100
  lines: string[];
  intervention: string;
  goodNews: string;
}

export interface ScanResult {
  rootName: string;
  scannedAt: number;
  durationMs: number;
  totalSize: number;
  totalFiles: number;
  totalFolders: number;
  largestFiles: FileNode[];
  largestFolders: FolderSummary[];
  categories: CategoryBreakdown[];
  duplicates: DuplicateGroup[];
  devJunk: DevJunkCluster[];
  staleBytes: number;
  reclaimableBytes: number;
  clutterScore: number; // 0-100 (higher = messier)
  roast: RoastReport;
  cleanup: CleanupSuggestion[];
  files: FileNode[];
  folders: FolderSummary[];
}

export interface ScanProgress {
  phase: "enumerating" | "analyzing" | "duplicates" | "roasting" | "done";
  filesScanned: number;
  foldersScanned: number;
  bytesScanned: number;
  currentPath?: string;
  flavor?: string;
}

export type ProgressCallback = (p: ScanProgress) => void;

// OS analyzer interface - Mac is the only impl in v1.
export interface OsAnalyzer {
  id: "macos" | "windows" | "linux";
  label: string;
  classify(file: Pick<FileNode, "name" | "path" | "ext">): {
    category: ClutterCategoryId;
    devJunkKind?: string;
  };
  isDevJunkPath(path: string): string | null;
}
