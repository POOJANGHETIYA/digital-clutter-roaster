import { useNavigate } from "react-router";
import { useState } from "react";
import { AlertTriangle, Apple, FolderOpen, Sparkles, Lock, Info } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";
import { useScanStore } from "@/store/scan";
import { enumerateDirectory, isFsAccessSupported, pickDirectory } from "@/lib/scan";
import { analyze } from "@/lib/analyze";
import { buildDemoFiles } from "@/lib/demo";

export function ScanPage() {
  const navigate = useNavigate();
  const { status, progress, setScanning, setProgress, setResult, setError, reset } =
    useScanStore();
  const [supported] = useState(() => isFsAccessSupported());

  async function handlePick() {
    reset();
    const handle = await pickDirectory();
    if (!handle) return;
    const start = performance.now();
    setScanning(
      { phase: "enumerating", filesScanned: 0, foldersScanned: 0, bytesScanned: 0, flavor: "Knocking on the folder door…" },
      "live",
    );
    try {
      const files = await enumerateDirectory(handle, (p) => setProgress(p));
      setProgress({
        phase: "analyzing", filesScanned: files.length, foldersScanned: 0,
        bytesScanned: files.reduce((s, f) => s + f.size, 0), flavor: "Cross-referencing your bad habits…",
      });
      await new Promise((r) => setTimeout(r, 80));
      const result = analyze(files, handle.name, performance.now() - start);
      setResult(result, "live");
      navigate("/results");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Scan failed.";
      setError(msg);
    }
  }

  function handleDemo() {
    reset();
    const start = performance.now();
    setScanning(
      { phase: "analyzing", filesScanned: 0, foldersScanned: 0, bytesScanned: 0, flavor: "Loading a fictional but very real-feeling Mac…" },
      "demo",
    );
    setTimeout(() => {
      const files = buildDemoFiles();
      const result = analyze(files, "Demo Mac (~/)", performance.now() - start);
      setResult(result, "demo");
      navigate("/results");
    }, 600);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <Apple className="h-3 w-3" />
            <span className="stamp">Pick a folder · Mac-first</span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            What folder are we roasting today?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            We recommend starting with <span className="font-mono text-foreground">~/Downloads</span>,{" "}
            <span className="font-mono text-foreground">~/Desktop</span>, or a{" "}
            <span className="font-mono text-foreground">~/Projects</span> directory.
          </p>
        </div>

        <div className="mt-10 panel relative overflow-hidden p-8">
          <div className="bg-noise absolute inset-0 opacity-40" aria-hidden />
          <div className="relative flex flex-col items-center text-center">
            <div className="pulse-ring rounded-full">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground text-background">
                <FolderOpen className="h-8 w-8 text-ember" />
              </div>
            </div>

            {!supported && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-4 text-left text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
                <div>
                  <div className="font-medium">Your browser doesn't support folder scanning.</div>
                  <div className="mt-1 text-muted-foreground">
                    The File System Access API works best in Chrome, Edge, Arc, or Brave on macOS.
                  </div>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button onClick={handlePick} disabled={!supported || status === "scanning"}
                className="inline-flex items-center gap-2 rounded-lg bg-ember px-5 py-3 text-sm font-medium text-ember-foreground shadow-ember transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
                <FolderOpen className="h-4 w-4" /> Pick a folder
              </button>
              <button onClick={handleDemo} disabled={status === "scanning"}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground hover:bg-surface-2 disabled:opacity-50">
                <Sparkles className="h-4 w-4 text-ember" /> Try with demo data
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Files stay on your Mac</span>
              <span className="flex items-center gap-1.5"><Info className="h-3 w-3" /> Analysis only - no deletions</span>
            </div>
          </div>
          {status === "scanning" && progress && <ScanInline progress={progress} />}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { t: "We classify, not snoop", d: "We read file metadata (name, size, modified date). We don't open file contents." },
            { t: "Big folders are fine", d: "We chunk the work and keep the UI responsive. Progress shown live." },
            { t: "You stay in control", d: "Every flagged item is reviewable. Nothing is touched without you." },
          ].map((c) => (
            <div key={c.t} className="rounded-lg border border-border bg-surface p-4 text-sm">
              <div className="font-display font-semibold">{c.t}</div>
              <div className="mt-1 text-muted-foreground">{c.d}</div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ScanInline({ progress }: { progress: ReturnType<typeof useScanStore.getState>["progress"] }) {
  if (!progress) return null;
  const mb = progress.bytesScanned / 1024 / 1024;
  return (
    <div className="relative mt-8 w-full">
      <div className="relative h-1 overflow-hidden rounded-full bg-surface-2">
        <div className="scan-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-ember to-transparent" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Stat label="Files" value={progress.filesScanned.toLocaleString()} />
        <Stat label="Folders" value={progress.foldersScanned.toLocaleString()} />
        <Stat label="Size" value={`${mb.toFixed(1)} MB`} />
      </div>
      <p className="mt-4 text-center font-mono text-xs text-muted-foreground">{progress.flavor ?? "Working…"}</p>
      {progress.currentPath && (
        <p className="mt-1 truncate text-center font-mono text-[11px] text-muted-foreground/70">{progress.currentPath}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}
