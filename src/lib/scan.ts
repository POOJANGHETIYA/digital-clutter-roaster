import type { FileNode, ProgressCallback } from "./types";
import { macOsAnalyzer } from "./analyzers/macos";

const SCAN_FLAVORS = [
  "Interviewing your Downloads folder…",
  "Counting screenshots taken in moments of weakness…",
  "Investigating suspicious zip behavior…",
  "Measuring the consequences of 'I'll organize it later'…",
  "Cataloguing forgotten installers…",
  "Estimating emotional attachment to old DMGs…",
  "Sniffing out node_modules graveyards…",
  "Asking your Desktop some hard questions…",
];

let idCounter = 0;
const nextId = () => `f${++idCounter}`;

// File System Access API types are not in default lib for older TS
type FSDirHandle = {
  name: string;
  kind: "directory";
  values(): AsyncIterable<FSDirHandle | FSFileHandle>;
};
type FSFileHandle = {
  name: string;
  kind: "file";
  getFile(): Promise<File>;
};

declare global {
  interface Window {
    showDirectoryPicker?: (opts?: { mode?: "read" | "readwrite" }) => Promise<FSDirHandle>;
  }
}

export function isFsAccessSupported(): boolean {
  return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
}

export async function pickDirectory(): Promise<FSDirHandle | null> {
  if (!isFsAccessSupported()) return null;
  try {
    const handle = await window.showDirectoryPicker!({ mode: "read" });
    return handle;
  } catch {
    return null;
  }
}

export async function enumerateDirectory(
  handle: FSDirHandle,
  onProgress?: ProgressCallback,
): Promise<FileNode[]> {
  const out: FileNode[] = [];
  let files = 0;
  let folders = 0;
  let bytes = 0;
  let lastFlavor = Date.now();
  let flavorIdx = 0;

  async function walk(dir: FSDirHandle, parentPath: string, depth: number) {
    folders++;
    const here = parentPath ? `${parentPath}/${dir.name}` : dir.name;
    if (Date.now() - lastFlavor > 700) {
      flavorIdx = (flavorIdx + 1) % SCAN_FLAVORS.length;
      lastFlavor = Date.now();
    }
    onProgress?.({
      phase: "enumerating",
      filesScanned: files,
      foldersScanned: folders,
      bytesScanned: bytes,
      currentPath: here,
      flavor: SCAN_FLAVORS[flavorIdx],
    });

    for await (const entry of dir.values()) {
      if (entry.kind === "directory") {
        // For dev-junk dirs we still descend but cap depth to keep things responsive
        await walk(entry as FSDirHandle, here, depth + 1);
      } else {
        try {
          const file = await (entry as FSFileHandle).getFile();
          const path = `${here}/${file.name}`;
          const ext = file.name.includes(".")
            ? file.name.slice(file.name.lastIndexOf(".") + 1)
            : "";
          const { category, devJunkKind } = macOsAnalyzer.classify({
            name: file.name,
            path,
            ext,
          });
          const node: FileNode = {
            id: nextId(),
            name: file.name,
            path,
            size: file.size,
            ext: ext.toLowerCase(),
            modified: file.lastModified,
            parent: here,
            depth: depth + 1,
            category,
            isDevJunk: !!devJunkKind,
            devJunkKind,
          };
          out.push(node);
          files++;
          bytes += file.size;
          if (files % 200 === 0) {
            onProgress?.({
              phase: "enumerating",
              filesScanned: files,
              foldersScanned: folders,
              bytesScanned: bytes,
              currentPath: path,
              flavor: SCAN_FLAVORS[flavorIdx],
            });
            // Yield to keep UI alive
            await new Promise((r) => setTimeout(r, 0));
          }
        } catch {
          // ignore unreadable file
        }
      }
    }
  }

  await walk(handle, "", 0);
  onProgress?.({
    phase: "enumerating",
    filesScanned: files,
    foldersScanned: folders,
    bytesScanned: bytes,
    flavor: "Wrapping up the investigation…",
  });
  return out;
}
