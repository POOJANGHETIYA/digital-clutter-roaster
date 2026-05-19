import type { ScanResult } from "./types";
import { formatBytes } from "./format";
import { countByStrength, reclaimableByStrength } from "./duplicates";

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
  lines.push("");

  // ── Verified duplicate section ──────────────────────────────────────────
  if (r.duplicates.length > 0) {
    const counts = countByStrength(r.duplicates);
    const reclaim = reclaimableByStrength(r.duplicates);
    lines.push(`## Duplicate detection (v0.2.0)`);
    lines.push("");
    lines.push(`| Tier | Groups | Reclaimable |`);
    lines.push(`|------|--------|-------------|`);
    lines.push(`| Exact duplicates *(verified by content)* | ${counts.exact} | ${formatBytes(reclaim.exact)} |`);
    lines.push(`| Likely duplicates *(strong match, review recommended)* | ${counts.likely} | ${formatBytes(reclaim.likely)} |`);
    lines.push(`| Review suspects *(similar files, manual check needed)* | ${counts.suspect} | ${formatBytes(reclaim.suspect)} |`);
    lines.push("");
    const exactGroups = r.duplicates.filter((d) => d.strength === "exact");
    if (exactGroups.length > 0) {
      lines.push(`### Exact duplicates`);
      for (const g of exactGroups.slice(0, 10)) {
        lines.push(`- **${formatBytes(g.totalBytes)} × ${g.fileCount} copies** — ${formatBytes(g.reclaimableBytes)} reclaimable`);
        lines.push(`  - Verified by: \`${g.verificationMethod}\``);
        lines.push(`  - ${g.explanation}`);
        for (const f of g.files) lines.push(`    - \`${f.path}\``);
      }
      lines.push("");
    }
    const likelyGroups = r.duplicates.filter((d) => d.strength === "likely");
    if (likelyGroups.length > 0) {
      lines.push(`### Likely duplicates`);
      for (const g of likelyGroups.slice(0, 10)) {
        lines.push(`- **${g.files[0]?.name ?? "-"}** — ${g.fileCount} copies, ${formatBytes(g.reclaimableBytes)} reclaimable`);
        lines.push(`  - ${g.explanation}`);
      }
      lines.push("");
    }
    const suspectGroups = r.duplicates.filter((d) => d.strength === "suspect");
    if (suspectGroups.length > 0) {
      lines.push(`### Review suspects`);
      for (const g of suspectGroups.slice(0, 10)) {
        lines.push(`- **${g.files[0]?.name ?? "-"}** — ${g.fileCount} files, ${formatBytes(g.reclaimableBytes)} potentially reclaimable`);
        lines.push(`  - ${g.explanation}`);
      }
    }
  }

  return lines.join("\n");
}

export function exportJson(r: ScanResult): string {
  const counts = countByStrength(r.duplicates);
  const reclaim = reclaimableByStrength(r.duplicates);

  // Trim heavy file list from export; enrich duplicates with verification detail
  const slim = {
    ...r,
    files: undefined,
    folders: undefined,
    largestFiles: r.largestFiles.map((f) => ({ ...f })),
    duplicates: r.duplicates.map((d) => ({
      id: d.id,
      strength: d.strength,
      verificationMethod: d.verificationMethod,
      fileCount: d.fileCount,
      totalBytes: d.totalBytes,
      reclaimableBytes: d.reclaimableBytes,
      confidenceScore: d.confidenceScore,
      explanation: d.explanation,
      sharedExtension: d.sharedExtension,
      files: d.files.map((f) => ({ id: f.id, name: f.name, path: f.path, size: f.size })),
    })),
    duplicateSummary: {
      exact: { groups: counts.exact, reclaimableBytes: reclaim.exact },
      likely: { groups: counts.likely, reclaimableBytes: reclaim.likely },
      suspect: { groups: counts.suspect, reclaimableBytes: reclaim.suspect },
    },
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
