export function formatBytes(bytes: number, digits = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : digits)} ${units[i]}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const day = 86400_000;
  if (diff < day) return "today";
  if (diff < day * 30) return `${Math.round(diff / day)}d ago`;
  if (diff < day * 365) return `${Math.round(diff / (day * 30))}mo ago`;
  return `${(diff / (day * 365)).toFixed(1)}y ago`;
}
