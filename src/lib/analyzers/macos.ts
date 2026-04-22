import type { ClutterCategoryId, OsAnalyzer } from "../types";

const EXT_MAP: Record<string, ClutterCategoryId> = {
  // images
  png: "images", jpg: "images", jpeg: "images", gif: "images", webp: "images",
  heic: "images", tiff: "images", bmp: "images", svg: "images", raw: "images",
  // videos
  mp4: "videos", mov: "videos", mkv: "videos", avi: "videos", webm: "videos", m4v: "videos",
  // audio
  mp3: "audio", wav: "audio", flac: "audio", aac: "audio", m4a: "audio", ogg: "audio",
  // archives / installers
  zip: "archives", rar: "archives", "7z": "archives", tar: "archives", gz: "archives",
  bz2: "archives", xz: "archives", dmg: "archives", pkg: "archives", iso: "archives",
  // docs
  pdf: "documents", doc: "documents", docx: "documents", xls: "documents",
  xlsx: "documents", ppt: "documents", pptx: "documents", txt: "documents",
  md: "documents", rtf: "documents", pages: "documents", numbers: "documents",
  key: "documents",
  // code
  ts: "code", tsx: "code", js: "code", jsx: "code", py: "code", rs: "code",
  go: "code", rb: "code", java: "code", kt: "code", swift: "code", c: "code",
  h: "code", cpp: "code", cs: "code", php: "code", sh: "code", json: "code",
  yaml: "code", yml: "code", toml: "code", lock: "code",
};

const DEV_JUNK_DIRS = new Set([
  "node_modules", ".next", "dist", "build", "out", ".turbo", ".cache",
  ".parcel-cache", ".vite", "coverage", "DerivedData", ".gradle",
  "__pycache__", ".pytest_cache", "target", ".nuxt", ".svelte-kit",
  ".expo", "Pods", ".venv", "venv", "vendor",
]);

function isScreenshotName(name: string): boolean {
  // Mac screenshots: "Screenshot 2024-01-12 at 10.32.47.png" or "Screen Shot ..."
  const lower = name.toLowerCase();
  return /^(screenshot|screen shot|cleanshot|simulator screen shot)/.test(lower);
}

function isInDownloads(path: string): boolean {
  return /\/downloads\//i.test(path) || /^downloads\//i.test(path);
}

export const macOsAnalyzer: OsAnalyzer = {
  id: "macos",
  label: "macOS",

  classify({ name, path, ext }) {
    const lowerExt = ext.toLowerCase().replace(/^\./, "");
    const devJunkKind = this.isDevJunkPath(path);
    if (devJunkKind) {
      return { category: "dev-junk", devJunkKind };
    }
    if (isScreenshotName(name)) {
      return { category: "screenshots" };
    }
    const cat = EXT_MAP[lowerExt];
    if (cat) {
      // installer-ish files in Downloads still count as archives
      return { category: cat };
    }
    if (isInDownloads(path)) {
      return { category: "downloads" };
    }
    return { category: "other" };
  },

  isDevJunkPath(path: string) {
    const segs = path.split("/");
    for (const s of segs) {
      if (DEV_JUNK_DIRS.has(s)) return s;
    }
    return null;
  },
};
