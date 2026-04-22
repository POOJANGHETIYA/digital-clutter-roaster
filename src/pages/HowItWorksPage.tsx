import { Link } from "react-router";
import { ArrowRight, Cpu, FolderOpen, ScanSearch, Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-16">
        <span className="stamp text-ember">How it works</span>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          A storage analyzer disguised as a comedy bit.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Digital Clutter Roaster runs entirely in your browser. There's no backend involved in the
          scan, no uploads and no destructive actions. Here's the full pipeline.
        </p>

        <ol className="mt-12 space-y-6">
          {[
            { icon: FolderOpen, title: "1. You pick a folder", body: "Using the File System Access API, you grant read access to a single folder you choose - typically Downloads, Desktop, Documents, or a Projects directory. We can't see anything you didn't explicitly select." },
            { icon: ScanSearch, title: "2. We enumerate locally", body: "We walk the directory tree and read file metadata: name, size, modified date, extension, depth. We do not open file contents. The work is chunked so the UI stays responsive on big trees." },
            { icon: Cpu, title: "3. The analyzer runs", body: "A Mac-aware classifier categorizes every file: screenshots, archives, dev junk (node_modules, .next, dist, DerivedData…), stale files, duplicates by size + name and more. Heuristics are clearly labelled in the UI." },
            { icon: Sparkles, title: "4. The roast engine writes the report", body: "Based on patterns in your scan, the engine picks an archetype (Zip Goblin, Screenshot Dragon, etc.), produces a roast score, witty lines, an intervention plan and a ranked cleanup checklist with safety ratings." },
          ].map((s) => (
            <li key={s.title} className="panel flex gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <s.icon className="h-5 w-5 text-ember" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">{s.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="panel mt-12 p-6">
          <h2 className="font-display text-xl font-semibold">Honest limitations</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· We only analyze folders you manually select. We never scan your whole Mac automatically.</li>
            <li>· Browser support varies. The File System Access API works best in Chrome / Edge / Arc / Brave.</li>
            <li>· Protected system folders may not be selectable - by design.</li>
            <li>· Duplicate detection is heuristic (size + name). We don't hash full file contents in v1.</li>
            <li>· Stale-file detection is based on modified date and location, not certainty.</li>
          </ul>
        </div>

        <div className="mt-10 flex justify-center">
          <Link to="/scan" className="inline-flex items-center gap-2 rounded-lg bg-ember px-5 py-3 text-sm font-medium text-ember-foreground">
            Try it on a folder
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
