import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, ShieldCheck, AlertTriangle, Eye } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";
import { useScanStore } from "@/store/scan";
import { formatBytes, formatRelative } from "@/lib/format";
import type { ClutterCategoryId, DuplicateMatchStrength } from "@/lib/types";

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

const DUP_STRENGTH_FILTERS: { id: "all" | DuplicateMatchStrength; label: string; icon?: typeof ShieldCheck }[] = [
  { id: "all", label: "All duplicates" },
  { id: "exact", label: "Exact", icon: ShieldCheck },
  { id: "likely", label: "Likely", icon: AlertTriangle },
  { id: "suspect", label: "Suspects", icon: Eye },
];

export function ReviewPage() {
  const navigate = useNavigate();
  const { result } = useScanStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [dupStrength, setDupStrength] = useState<(typeof DUP_STRENGTH_FILTERS)[number]["id"]>("all");
  const [staleOnly, setStaleOnly] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"size" | "modified">("size");
  const [view, setView] = useState<"files" | "duplicates">("files");

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

  const dupGroups = useMemo(() => {
    if (!result) return [];
    let groups = result.duplicates;
    if (dupStrength !== "all") groups = groups.filter((g) => g.strength === dupStrength);
    if (q.trim()) {
      const needle = q.toLowerCase();
      groups = groups.filter((g) =>
        g.files.some((f) => f.name.toLowerCase().includes(needle) || f.path.toLowerCase().includes(needle)),
      );
    }
    return groups;
  }, [result, dupStrength, q]);

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

        {/* View toggle */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setView("files")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${view === "files" ? "bg-foreground text-background" : "border border-border bg-surface text-muted-foreground hover:text-foreground"}`}
          >
            All files
          </button>
          <button
            onClick={() => setView("duplicates")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${view === "duplicates" ? "bg-foreground text-background" : "border border-border bg-surface text-muted-foreground hover:text-foreground"}`}
          >
            Duplicates
            {result.duplicates.length > 0 && (
              <span className="ml-1.5 rounded-full bg-ember px-1.5 py-0.5 text-[10px] font-semibold text-ember-foreground">
                {result.duplicates.length}
              </span>
            )}
          </button>
        </div>

        {view === "files" ? (
          <>
            <div className="panel mt-4 p-4">
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
          </>
        ) : (
          <DuplicatesReviewPanel groups={dupGroups} dupStrength={dupStrength} setDupStrength={setDupStrength} q={q} setQ={setQ} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Duplicates review sub-panel
// ---------------------------------------------------------------------------

import type { DuplicateGroup } from "@/lib/types";
import { ShieldCheck as _ShieldCheck, AlertTriangle as _AlertTriangle, Eye as _Eye } from "lucide-react";

const STRENGTH_ICON: Record<string, typeof _ShieldCheck> = {
  exact: _ShieldCheck,
  likely: _AlertTriangle,
  suspect: _Eye,
};

const STRENGTH_BADGE: Record<string, string> = {
  exact: "border-success/40 bg-success/10 text-success",
  likely: "border-warning/40 bg-warning/10 text-warning",
  suspect: "border-border bg-surface text-muted-foreground",
};

function DuplicatesReviewPanel({
  groups,
  dupStrength,
  setDupStrength,
  q,
  setQ,
}: {
  groups: DuplicateGroup[];
  dupStrength: string;
  setDupStrength: (v: DuplicateMatchStrength | "all") => void;
  q: string;
  setQ: (v: string) => void;
}) {
  return (
    <>
      <div className="panel mt-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {DUP_STRENGTH_FILTERS.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => setDupStrength(f.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                  dupStrength === f.id
                    ? "border-ember bg-ember text-ember-foreground"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="h-3 w-3" />}
                {f.label}
              </button>
            );
          })}
          <div className="ml-auto">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search filename or path…"
                className="rounded-md border border-border bg-surface pl-7 pr-3 py-1.5 text-xs outline-none focus:border-ember"
              />
            </div>
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="panel mt-4 p-8 text-center text-sm text-muted-foreground">
          No duplicate groups match these filters.
        </div>
      ) : (
        <div className="panel mt-4 overflow-hidden">
          <ul className="divide-y divide-border">
            {groups.map((g) => {
              const Icon = STRENGTH_ICON[g.strength] ?? _Eye;
              return (
                <li key={g.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 shrink-0 ${g.strength === "exact" ? "text-success" : g.strength === "likely" ? "text-warning" : "text-muted-foreground"}`} />
                      <div>
                        <div className="font-display text-sm font-semibold">
                          {g.files[0]?.name ?? "—"}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{g.explanation}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-display text-sm font-semibold text-ember">
                        {formatBytes(g.reclaimableBytes)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {g.fileCount} copies · {formatBytes(g.totalBytes)} each
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-widest ${STRENGTH_BADGE[g.strength]}`}>
                      {g.strength}
                    </span>
                    <span className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {g.verificationMethod}
                    </span>
                    {g.sharedExtension && (
                      <span className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        .{g.sharedExtension}
                      </span>
                    )}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {g.files.map((f) => (
                      <li key={f.id} className="flex items-center justify-between gap-3 rounded border border-border bg-surface px-2 py-1.5">
                        <div className="min-w-0">
                          <div className="truncate font-mono text-[11px]">{f.name}</div>
                          <div className="truncate text-[10px] text-muted-foreground">{f.path}</div>
                        </div>
                        <div className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {formatBytes(f.size)}
                        </div>
                        <div className="shrink-0 text-[10px] text-muted-foreground">
                          {formatRelative(f.modified)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
