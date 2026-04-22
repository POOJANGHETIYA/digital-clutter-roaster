import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { ArrowRight, Clock, Copy, Cpu, Download, FileText, Flame, Folder, HardDrive, ListChecks, ScanSearch, Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";
import { useScanStore } from "@/store/scan";
import { formatBytes, formatNumber, formatRelative } from "@/lib/format";
import { downloadText, exportJson, exportMarkdown } from "@/lib/export";

export function ResultsPage() {
  const navigate = useNavigate();
  const { result, source } = useScanStore();

  useEffect(() => {
    if (!result) navigate("/scan");
  }, [result, navigate]);

  if (!result) return null;
  const r = result;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        {/* Top strip */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="stamp text-ember">Roast report</span>
              {source === "demo" && (
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">Demo data</span>
              )}
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="text-muted-foreground">/</span>{r.rootName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Scanned {formatNumber(r.totalFiles)} files across {formatNumber(r.totalFolders)} folders in {(r.durationMs / 1000).toFixed(1)}s.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/scan" className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-2">
              <ScanSearch className="h-4 w-4" /> New scan
            </Link>
            <button onClick={() => downloadText(`roast-${r.rootName}.md`, exportMarkdown(r), "text/markdown")}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-2">
              <Download className="h-4 w-4" /> Markdown
            </button>
            <button onClick={() => downloadText(`roast-${r.rootName}.json`, exportJson(r), "application/json")}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-2">
              <FileText className="h-4 w-4" /> JSON
            </button>
          </div>
        </div>

        {/* Overview */}
        <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          <OverviewCard icon={HardDrive} label="Total scanned" value={formatBytes(r.totalSize)} />
          <OverviewCard icon={Flame} label="Roast score" value={`${r.clutterScore}/100`} accent />
          <OverviewCard icon={Sparkles} label="Reclaimable" value={formatBytes(r.reclaimableBytes)} />
          <OverviewCard icon={Copy} label="Duplicate clusters" value={formatNumber(r.duplicates.length)} />
          <OverviewCard icon={Cpu} label="Dev junk roots" value={formatNumber(r.devJunk.length)} />
        </section>

        {/* Roast card */}
        <section className="mt-6"><RoastCard result={r} /></section>

        {/* Cleanup plan */}
        <section className="mt-10">
          <SectionHeader kicker="Cleanup plan" title="Three lanes. Pick a Saturday." icon={ListChecks} />
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {(["quick", "medium", "manual"] as const).map((level) => {
              const items = r.cleanup.filter((c) => c.level === level);
              const total = items.reduce((s, c) => s + c.estimatedBytes, 0);
              return (
                <div key={level} className="panel p-5">
                  <div className="flex items-center justify-between">
                    <div className="stamp text-ember">
                      {level === "quick" ? "Quick wins" : level === "medium" ? "Medium effort" : "Manual review"}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">~{formatBytes(total)}</span>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {items.length === 0 && <li className="text-sm text-muted-foreground">Nothing flagged here.</li>}
                    {items.map((c) => (
                      <li key={c.id} className="rounded-lg border border-border bg-surface p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-display text-sm font-semibold">{c.title}</div>
                          <span className="font-mono text-xs text-ember whitespace-nowrap">{formatBytes(c.estimatedBytes)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{c.why}</p>
                        <div className="mt-2 flex gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                          <span className="rounded border border-border px-1.5 py-0.5">{c.confidence} conf.</span>
                          <span className={`rounded border px-1.5 py-0.5 ${c.safety === "generally-safe" ? "border-success/30 text-success" : "border-warning/40 text-warning"}`}>
                            {c.safety === "generally-safe" ? "safe" : "review"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Categories + Largest */}
        <section className="mt-12 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionHeader kicker="Clutter categories" title="Where the bytes really live" icon={Folder} />
            <div className="panel mt-4 divide-y divide-border">
              {r.categories.slice(0, 9).map((c) => {
                const max = r.categories[0]?.size || 1;
                const pct = (c.size / max) * 100;
                return (
                  <div key={c.id} className="flex items-center gap-4 p-4">
                    <div className="min-w-[150px]">
                      <div className="font-display text-sm font-semibold">{c.label}</div>
                      <div className="text-xs text-muted-foreground">{formatNumber(c.count)} files</div>
                    </div>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="absolute inset-y-0 left-0 bg-ember" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="w-24 text-right font-mono text-xs">{formatBytes(c.size)}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-2">
            <SectionHeader kicker="Largest files" title="The heavy hitters" icon={HardDrive} />
            <div className="panel mt-4 divide-y divide-border">
              {r.largestFiles.slice(0, 8).map((f) => (
                <div key={f.id} className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate font-mono text-xs">{f.name}</div>
                    <div className="font-display text-sm font-semibold text-ember">{formatBytes(f.size)}</div>
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{f.path}</div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {formatRelative(f.modified)} · <span>{f.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dev junk + Duplicates */}
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div>
            <SectionHeader kicker="Developer junk" title="The build folder graveyard" icon={Cpu} />
            <div className="panel mt-4">
              {r.devJunk.length === 0 && <div className="p-6 text-sm text-muted-foreground">No dev junk detected. Suspicious.</div>}
              <ul className="divide-y divide-border">
                {r.devJunk.slice(0, 10).map((d) => (
                  <li key={d.rootPath} className="flex items-center gap-3 p-3">
                    <span className="font-mono rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px]">{d.kind}</span>
                    <div className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{d.rootPath}</div>
                    <div className="font-display text-sm font-semibold text-ember">{formatBytes(d.size)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <SectionHeader kicker="Duplicates" title="Same bytes, different excuse" icon={Copy} />
            <div className="panel mt-4">
              {r.duplicates.length === 0 && <div className="p-6 text-sm text-muted-foreground">No duplicate clusters found.</div>}
              <ul className="divide-y divide-border">
                {r.duplicates.slice(0, 10).map((d) => (
                  <li key={d.key} className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate font-mono text-xs">{d.files[0]?.name ?? "-"}</div>
                      <div className="font-display text-sm font-semibold text-ember">{formatBytes(d.totalWaste)}</div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <span className="rounded border border-border px-1.5 py-0.5">{d.confidence}</span>
                      <span>{d.count} copies · {formatBytes(d.size)} each</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Review CTA */}
        <section className="mt-12">
          <Link to="/review" className="panel group flex items-center justify-between gap-4 p-6 transition-transform hover:-translate-y-0.5">
            <div>
              <div className="stamp text-ember">Review the evidence</div>
              <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">Browse every flagged file before you do anything</h3>
              <p className="mt-1 text-sm text-muted-foreground">Filter by category, sort by size or age. Nothing gets touched without you.</p>
            </div>
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, accent }: { icon: typeof Flame; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`panel p-4 ${accent ? "ember-glow" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="stamp text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "text-ember" : "text-muted-foreground"}`} />
      </div>
      <div className={`mt-2 font-display text-2xl font-semibold ${accent ? "text-ember" : ""}`}>{value}</div>
    </div>
  );
}

function SectionHeader({ kicker, title, icon: Icon }: { kicker: string; title: string; icon: typeof Flame }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="stamp text-ember">{kicker}</div>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      </div>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}

function RoastCard({ result }: { result: NonNullable<ReturnType<typeof useScanStore.getState>["result"]> }) {
  const { roast } = result;
  return (
    <div className="panel relative overflow-hidden">
      <div className="bg-noise absolute inset-0 opacity-50" aria-hidden />
      <div className="relative grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <div className="border-b border-border p-7 md:border-b-0 md:border-r">
          <div className="stamp text-ember">The verdict</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="font-display text-4xl font-semibold tracking-tight">{roast.archetype}</div>
            <ScoreRing score={roast.score} />
          </div>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{roast.archetypeBlurb}</p>
          <div className="mt-6 rounded-lg border border-border bg-surface-2 p-4">
            <div className="stamp text-muted-foreground">Intervention plan</div>
            <p className="mt-1 text-sm">{roast.intervention}</p>
          </div>
          <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="stamp text-success">Good news</div>
            <p className="mt-1 text-sm">{roast.goodNews}</p>
          </div>
        </div>
        <div className="p-7">
          <div className="stamp text-muted-foreground">The roast</div>
          <ul className="mt-3 space-y-3 text-[15px] leading-snug">
            {roast.lines.map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-ember">›</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="relative h-12 w-12">
      <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
        <circle cx="22" cy="22" r={r} stroke="currentColor" className="text-border" strokeWidth="4" fill="none" />
        <circle cx="22" cy="22" r={r} stroke="currentColor" className="text-ember" strokeWidth="4" strokeLinecap="round" fill="none" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display text-xs font-semibold">{score}</div>
    </div>
  );
}
