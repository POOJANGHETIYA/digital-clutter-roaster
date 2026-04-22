import type { ScanResult } from "./types";
import { formatBytes } from "./format";

export function exportMarkdown(r: ScanResult): string {
  const lines: string[] = [];
  lines.push(`# Digital Clutter Roast - ${r.rootName}`);
  lines.push("");
  lines.push(`*Generated ${new Date(r.scannedAt).toLocaleString()}*`);
  lines.push("");
  lines.push(`## The verdict`);
  lines.push(`- **Archetype:** ${r.roast.archetype}`);
  lines.push(`- **Roast score:** ${r.roast.score}/100`);
  lines.push(`- **Total scanned:** ${formatBytes(r.totalSize)} across ${r.totalFiles.toLocaleString()} files`);
  lines.push(`- **Reclaimable:** ${formatBytes(r.reclaimableBytes)}`);
  lines.push("");
  lines.push(`> ${r.roast.archetypeBlurb}`);
  lines.push("");
  lines.push(`## The roast`);
  for (const l of r.roast.lines) lines.push(`- ${l}`);
  lines.push("");
  lines.push(`**Intervention:** ${r.roast.intervention}`);
  lines.push("");
  lines.push(`**Good news:** ${r.roast.goodNews}`);
  lines.push("");
  lines.push(`## Cleanup plan`);
  for (const c of r.cleanup) {
    lines.push(`- **[${c.level.toUpperCase()}] ${c.title}** - ~${formatBytes(c.estimatedBytes)} (${c.safety})`);
    lines.push(`  - ${c.why}`);
  }
  lines.push("");
  lines.push(`## Top categories`);
  for (const c of r.categories.slice(0, 8)) {
    lines.push(`- ${c.label}: ${formatBytes(c.size)} (${c.count} files)`);
  }
  lines.push("");
  lines.push(`## Largest files`);
  for (const f of r.largestFiles.slice(0, 10)) {
    lines.push(`- ${formatBytes(f.size)} - \`${f.path}\``);
  }
  return lines.join("\n");
}

export function exportJson(r: ScanResult): string {
  // Trim heavy file list from export
  const slim = {
    ...r,
    files: undefined,
    folders: undefined,
    largestFiles: r.largestFiles.map((f) => ({ ...f })),
  };
  return JSON.stringify(slim, null, 2);
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
