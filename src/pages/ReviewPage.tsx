import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";
import { useScanStore } from "@/store/scan";
import { formatBytes, formatRelative } from "@/lib/format";
import type { ClutterCategoryId } from "@/lib/types";

const FILTERS: { id: "all" | ClutterCategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "dev-junk", label: "Dev junk" },
  { id: "archives", label: "Archives" },
  { id: "screenshots", label: "Screenshots" },
  { id: "videos", label: "Videos" },
  { id: "images", label: "Images" },
  { id: "downloads", label: "Downloads" },
  { id: "documents", label: "Documents" },
];

export function ReviewPage() {
  const navigate = useNavigate();
  const { result } = useScanStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [staleOnly, setStaleOnly] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"size" | "modified">("size");

  useEffect(() => {
    if (!result) navigate("/scan");
  }, [result, navigate]);

  const rows = useMemo(() => {
    if (!result) return [];
    let r = result.files;
    if (filter !== "all") r = r.filter((f) => f.category === filter);
    if (staleOnly) r = r.filter((f) => f.isStale);
    if (q.trim()) {
      const needle = q.toLowerCase();
      r = r.filter((f) => f.name.toLowerCase().includes(needle) || f.path.toLowerCase().includes(needle));
    }
    r = [...r].sort((a, b) => (sort === "size" ? b.size - a.size : a.modified - b.modified));
    return r.slice(0, 500);
  }, [result, filter, staleOnly, q, sort]);

  if (!result) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <Link to="/results" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to roast
        </Link>
        <div className="mt-4">
          <span className="stamp text-ember">Review</span>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Every flagged file. No surprises.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Filter, search, sort. Showing top 500 results per filter.</p>
        </div>

        <div className="panel mt-6 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${filter === f.id ? "border-ember bg-ember text-ember-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground"}`}>
                {f.label}
              </button>
            ))}
            <label className="ml-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={staleOnly} onChange={(e) => setStaleOnly(e.target.checked)} className="h-3 w-3 accent-ember" />
              Stale only (180+ days)
            </label>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or path…"
                  className="rounded-md border border-border bg-surface pl-7 pr-3 py-1.5 text-xs outline-none focus:border-ember" />
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value as "size" | "modified")}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs">
                <option value="size">Sort: largest</option>
                <option value="modified">Sort: oldest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="panel mt-4 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border bg-surface-2 px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div>File</div>
            <div className="text-right">Size</div>
            <div className="hidden sm:block text-right">Modified</div>
            <div className="text-right">Category</div>
          </div>
          {rows.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No files match these filters.</div>
          )}
          <ul className="divide-y divide-border">
            {rows.map((f) => (
              <li key={f.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-2.5 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-mono text-xs">{f.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{f.path}</div>
                </div>
                <div className="text-right font-display font-semibold text-ember">{formatBytes(f.size)}</div>
                <div className="hidden sm:block text-right text-xs text-muted-foreground">{formatRelative(f.modified)}</div>
                <div className="text-right">
                  <span className="rounded border border-border bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{f.category}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
