import type {
  CategoryBreakdown,
  ClutterCategoryId,
  CleanupSuggestion,
  DevJunkCluster,
  DuplicateGroup,
  FileNode,
  FolderSummary,
  ScanResult,
} from "./types";
import { generateRoast } from "./roast";

const STALE_DAYS = 180;
const STALE_MS = STALE_DAYS * 86400_000;

const CATEGORY_META: Record<ClutterCategoryId, { label: string; description: string }> = {
  screenshots: { label: "Screenshots", description: "Cmd-Shift-3 receipts piling up" },
  downloads: { label: "Downloads leftovers", description: "Files you forgot the moment they landed" },
  archives: { label: "Archives & installers", description: "Zips, DMGs, PKGs, ISOs" },
  videos: { label: "Videos", description: "Heavy hitters by definition" },
  images: { label: "Images", description: "Photos, exports, design assets" },
  documents: { label: "Documents", description: "PDFs, decks, sheets, notes" },
  audio: { label: "Audio", description: "Tracks, samples, voice memos" },
  code: { label: "Code & configs", description: "Source files and configs" },
  "dev-junk": { label: "Developer junk", description: "node_modules, build, DerivedData & friends" },
  duplicates: { label: "Duplicates", description: "Same bytes, different excuse" },
  stale: { label: "Stale files", description: `Untouched for ${STALE_DAYS}+ days` },
  other: { label: "Other", description: "Uncategorized files" },
};

export function analyze(files: FileNode[], rootName: string, durationMs: number): ScanResult {
  const now = Date.now();
  const folders = new Map<string, FolderSummary>();

  // Mark stale + build folder map
  for (const f of files) {
    if (now - f.modified > STALE_MS) f.isStale = true;
    let p = f.parent;
    let depth = f.depth - 1;
    while (p) {
      const existing = folders.get(p);
      if (existing) {
        existing.size += f.size;
        existing.files += 1;
      } else {
        const name = p.split("/").pop() || p;
        folders.set(p, { path: p, name, size: f.size, files: 1, depth });
      }
      const idx = p.lastIndexOf("/");
      if (idx === -1) break;
      p = p.slice(0, idx);
      depth--;
    }
  }

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const totalFiles = files.length;
  const totalFolders = folders.size;

  // Largest
  const largestFiles = [...files].sort((a, b) => b.size - a.size).slice(0, 25);
  const largestFolders = [...folders.values()]
    .filter((f) => f.depth >= 0)
    .sort((a, b) => b.size - a.size)
    .slice(0, 12);

  // Categories
  const categories: CategoryBreakdown[] = (Object.keys(CATEGORY_META) as ClutterCategoryId[])
    .filter((id) => id !== "duplicates" && id !== "stale")
    .map((id) => {
      const subset = files.filter((f) => f.category === id);
      return {
        id,
        label: CATEGORY_META[id].label,
        description: CATEGORY_META[id].description,
        size: subset.reduce((s, f) => s + f.size, 0),
        count: subset.length,
      };
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.size - a.size);

  // Duplicates: group by size+name (likely) and same size only (suspect)
  const duplicates = detectDuplicates(files);

  // Dev junk clusters: collapse by top-most matching dir
  const devJunk = detectDevJunkClusters(files);

  // Stale
  const staleFiles = files.filter((f) => f.isStale);
  const staleBytes = staleFiles.reduce((s, f) => s + f.size, 0);

  // Reclaimable: dev junk + duplicate waste + stale archives in downloads
  const dupWaste = duplicates.reduce((s, d) => s + d.totalWaste, 0);
  const devJunkBytes = devJunk.reduce((s, d) => s + d.size, 0);
  const staleArchiveBytes = staleFiles
    .filter((f) => f.category === "archives" || f.category === "downloads")
    .reduce((s, f) => s + f.size, 0);
  const reclaimableBytes = dupWaste + devJunkBytes + staleArchiveBytes;

  const clutterScore = computeClutterScore({
    totalSize,
    reclaimableBytes,
    duplicates,
    devJunk,
    staleBytes,
    categories,
  });

  const cleanup = buildCleanupPlan({
    duplicates,
    devJunk,
    categories,
    staleArchiveBytes,
    files,
  });

  const roast = generateRoast({
    categories,
    devJunk,
    duplicates,
    staleBytes,
    totalSize,
    reclaimableBytes,
    clutterScore,
  });

  return {
    rootName,
    scannedAt: Date.now(),
    durationMs,
    totalSize,
    totalFiles,
    totalFolders,
    largestFiles,
    largestFolders,
    categories,
    duplicates,
    devJunk,
    staleBytes,
    reclaimableBytes,
    clutterScore,
    roast,
    cleanup,
    files,
    folders: [...folders.values()],
  };
}

function detectDuplicates(files: FileNode[]): DuplicateGroup[] {
  const bySize = new Map<number, FileNode[]>();
  for (const f of files) {
    if (f.size < 256 * 1024) continue; // ignore <256KB to avoid noise
    if (f.isDevJunk) continue;
    const arr = bySize.get(f.size) ?? [];
    arr.push(f);
    bySize.set(f.size, arr);
  }
  const groups: DuplicateGroup[] = [];
  for (const [size, arr] of bySize) {
    if (arr.length < 2) continue;
    // Sub-group by name for higher-confidence "likely" duplicates
    const byName = new Map<string, FileNode[]>();
    for (const f of arr) {
      const k = f.name.toLowerCase();
      const list = byName.get(k) ?? [];
      list.push(f);
      byName.set(k, list);
    }
    for (const [name, list] of byName) {
      if (list.length >= 2) {
        groups.push({
          key: `${size}:${name}`,
          size,
          count: list.length,
          totalWaste: size * (list.length - 1),
          confidence: "likely",
          files: list,
        });
      }
    }
    // Same size, different names → suspects
    const matchedIds = new Set(
      [...byName.values()].filter((l) => l.length >= 2).flatMap((l) => l.map((f) => f.id)),
    );
    const remaining = arr.filter((f) => !matchedIds.has(f.id));
    if (remaining.length >= 2) {
      groups.push({
        key: `size:${size}`,
        size,
        count: remaining.length,
        totalWaste: size * (remaining.length - 1),
        confidence: "name",
        files: remaining,
      });
    }
  }
  groups.sort((a, b) => b.totalWaste - a.totalWaste);
  return groups.slice(0, 50);
}

function detectDevJunkClusters(files: FileNode[]): DevJunkCluster[] {
  const clusters = new Map<string, DevJunkCluster>();
  for (const f of files) {
    if (!f.isDevJunk || !f.devJunkKind) continue;
    // Find the top-most matching dir in the path
    const segs = f.path.split("/");
    const idx = segs.indexOf(f.devJunkKind);
    if (idx === -1) continue;
    const root = segs.slice(0, idx + 1).join("/");
    const existing = clusters.get(root);
    if (existing) {
      existing.size += f.size;
      existing.files += 1;
    } else {
      clusters.set(root, {
        kind: f.devJunkKind,
        rootPath: root,
        size: f.size,
        files: 1,
      });
    }
  }
  return [...clusters.values()].sort((a, b) => b.size - a.size).slice(0, 25);
}

function computeClutterScore(args: {
  totalSize: number;
  reclaimableBytes: number;
  duplicates: DuplicateGroup[];
  devJunk: DevJunkCluster[];
  staleBytes: number;
  categories: CategoryBreakdown[];
}): number {
  if (args.totalSize === 0) return 0;
  const reclaimRatio = Math.min(1, args.reclaimableBytes / args.totalSize);
  const dupSignal = Math.min(1, args.duplicates.length / 20);
  const devSignal = Math.min(1, args.devJunk.length / 8);
  const staleSignal = Math.min(1, args.staleBytes / Math.max(1, args.totalSize));
  const screenshots = args.categories.find((c) => c.id === "screenshots")?.count ?? 0;
  const screenshotSignal = Math.min(1, screenshots / 200);

  const score =
    reclaimRatio * 45 +
    dupSignal * 15 +
    devSignal * 20 +
    staleSignal * 12 +
    screenshotSignal * 8;
  return Math.round(Math.min(100, score));
}

function buildCleanupPlan(args: {
  duplicates: DuplicateGroup[];
  devJunk: DevJunkCluster[];
  categories: CategoryBreakdown[];
  staleArchiveBytes: number;
  files: FileNode[];
}): CleanupSuggestion[] {
  const out: CleanupSuggestion[] = [];

  // Quick wins
  const nodeModules = args.devJunk.filter((d) => d.kind === "node_modules");
  if (nodeModules.length > 0) {
    out.push({
      id: "quick-node-modules",
      level: "quick",
      title: `Nuke ${nodeModules.length} node_modules folder${nodeModules.length > 1 ? "s" : ""}`,
      why: "Reinstallable in seconds with your package manager. Always safe to remove.",
      estimatedBytes: nodeModules.reduce((s, d) => s + d.size, 0),
      confidence: "high",
      safety: "generally-safe",
      targetCategory: "dev-junk",
    });
  }

  const buildDirs = args.devJunk.filter((d) =>
    ["dist", "build", ".next", "out", "DerivedData", ".turbo", ".cache", "coverage"].includes(d.kind),
  );
  if (buildDirs.length > 0) {
    out.push({
      id: "quick-build-dirs",
      level: "quick",
      title: `Clear ${buildDirs.length} build / cache folder${buildDirs.length > 1 ? "s" : ""}`,
      why: "Generated artifacts. Will be re-created on next build.",
      estimatedBytes: buildDirs.reduce((s, d) => s + d.size, 0),
      confidence: "high",
      safety: "generally-safe",
      targetCategory: "dev-junk",
    });
  }

  if (args.staleArchiveBytes > 0) {
    out.push({
      id: "quick-stale-archives",
      level: "quick",
      title: "Delete stale installers in Downloads",
      why: "Old DMGs, ZIPs and PKGs untouched for 6+ months. Re-downloadable if you ever need them.",
      estimatedBytes: args.staleArchiveBytes,
      confidence: "high",
      safety: "generally-safe",
      targetCategory: "archives",
    });
  }

  // Medium effort
  const topDups = args.duplicates.slice(0, 10);
  if (topDups.length > 0) {
    out.push({
      id: "medium-duplicates",
      level: "medium",
      title: `Review ${topDups.length} duplicate cluster${topDups.length > 1 ? "s" : ""}`,
      why: "Same file, multiple homes. Pick the canonical copy and delete the rest.",
      estimatedBytes: topDups.reduce((s, d) => s + d.totalWaste, 0),
      confidence: "medium",
      safety: "needs-review",
      targetCategory: "duplicates",
    });
  }

  const screenshots = args.categories.find((c) => c.id === "screenshots");
  if (screenshots && screenshots.count > 50) {
    out.push({
      id: "medium-screenshots",
      level: "medium",
      title: `Triage ${screenshots.count} screenshots`,
      why: "Most screenshots become irrelevant after a week. Keep the keepers, delete the rest.",
      estimatedBytes: screenshots.size,
      confidence: "medium",
      safety: "needs-review",
      targetCategory: "screenshots",
    });
  }

  const videos = args.categories.find((c) => c.id === "videos");
  if (videos && videos.size > 1024 * 1024 * 1024) {
    out.push({
      id: "manual-videos",
      level: "manual",
      title: "Audit large video files",
      why: "Videos are usually the heaviest category. Move keepers to external storage.",
      estimatedBytes: videos.size,
      confidence: "low",
      safety: "needs-review",
      targetCategory: "videos",
    });
  }

  const downloads = args.categories.find((c) => c.id === "downloads");
  if (downloads && downloads.count > 0) {
    out.push({
      id: "manual-downloads",
      level: "manual",
      title: "Manually sweep your Downloads folder",
      why: "The natural habitat of digital regret. Worth a 10-minute pass.",
      estimatedBytes: downloads.size,
      confidence: "low",
      safety: "needs-review",
      targetCategory: "downloads",
    });
  }

  return out;
}

export { CATEGORY_META };
