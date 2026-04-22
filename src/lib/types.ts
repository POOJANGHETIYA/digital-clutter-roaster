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

export interface DuplicateGroup {
  key: string;
  size: number;
  count: number;
  totalWaste: number; // size * (count - 1)
  confidence: "exact" | "likely" | "name";
  files: FileNode[];
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
