import { Link } from "react-router";
import {
  ArrowRight,
  Flame,
  Folder,
  HardDrive,
  Lock,
  ScanSearch,
  Sparkles,
  TerminalSquare,
  ImageIcon,
  Archive,
  Film,
  Copy,
  Clock,
  Cpu,
  Apple,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";

const ARCHETYPES = [
  { name: "Zip Goblin", line: "Hoarder of installers. Believes one day, you'll need that 2019 .dmg." },
  { name: "Screenshot Dragon", line: "Sleeps on a hoard of Cmd-Shift-3s. Will not part with a single one." },
  { name: "Build Folder Necromancer", line: "Resurrects projects from 2021 every time you open Finder." },
  { name: "Duplicate Lord", line: "Why have one copy when you could have four? final_v2_FINAL.pdf energy." },
  { name: "Downloads Historian", line: "Your Downloads folder is a working archive of every PDF you opened once." },
  { name: "Chaotic Archivist", line: "Keeps everything, organizes nothing. The system is the absence of a system." },
];

const CATEGORIES = [
  { icon: ImageIcon, label: "Screenshots overload" },
  { icon: Archive, label: "DMGs, ZIPs & installers" },
  { icon: Film, label: "Heavy video files" },
  { icon: Copy, label: "Duplicate clusters" },
  { icon: Clock, label: "Stale files (6+ months)" },
  { icon: Cpu, label: "node_modules & build dirs" },
  { icon: Folder, label: "Downloads chaos" },
  { icon: TerminalSquare, label: "Xcode DerivedData" },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="bg-noise absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <Apple className="h-3 w-3" />
            <span className="stamp">macOS · v1.0 · local-first</span>
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            Your Mac's storage is a <span className="italic text-ember">crime scene</span>.
            <br className="hidden sm:block" />
            We roast the evidence.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Digital Clutter Roaster scans folders you choose, finds what's wasting space and writes
            you a brutally honest report - with a real cleanup plan attached.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/scan"
              className="group inline-flex items-center gap-2 rounded-lg bg-ember px-5 py-3 text-sm font-medium text-ember-foreground shadow-ember transition-transform hover:-translate-y-0.5"
            >
              <Flame className="h-4 w-4" />
              Pick a folder to roast
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground hover:bg-surface-2"
            >
              See how it works
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-4">
            {[
              { icon: HardDrive, label: "Local-first" },
              { icon: Apple, label: "Mac-first" },
              { icon: Lock, label: "No uploads" },
              { icon: Sparkles, label: "No signup" },
            ].map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2"
              >
                <t.icon className="h-3.5 w-3.5 text-ember" />
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Faux receipt preview */}
        <div className="relative mx-auto max-w-6xl px-5 pb-16">
          <ReceiptPreview />
        </div>
      </section>

      {/* ARCHETYPES */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="stamp text-ember">The clutter pantheon</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Which archetype are you?
              </h2>
            </div>
            <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
              Every messy Mac fits a personality. The roast picks yours based on what's actually on
              disk.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ARCHETYPES.map((a, i) => (
              <article
                key={a.name}
                className="group panel relative overflow-hidden p-5 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-lg font-semibold">{a.name}</h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    #{(i + 1).toString().padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{a.line}</p>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ember/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE DETECT */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="stamp text-ember">What we detect</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            The stuff Mac users always have, never look at.
          </h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm"
              >
                <c.icon className="h-4 w-4 text-ember" />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="stamp text-ember">How it works</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps. No backend. No drama.
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Choose a folder on your Mac",
                desc: "Downloads, Desktop, Projects - anything you want analyzed.",
              },
              {
                n: "02",
                title: "We analyze locally",
                desc: "File sizes, clutter patterns, duplicate signals, dev junk - all in your browser.",
              },
              {
                n: "03",
                title: "Get the roast & the plan",
                desc: "A funny verdict and a ranked cleanup checklist you can actually act on.",
              },
            ].map((s) => (
              <li key={s.n} className="panel relative p-6">
                <div className="font-mono text-xs text-ember">{s.n}</div>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SAFETY */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="stamp text-ember">Safe by default</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Analysis first. We never delete a thing.
            </h2>
            <p className="mt-4 text-muted-foreground">
              The roast points fingers; you do the cleanup. Every flagged item is reviewable, every
              suggestion has a confidence rating and nothing leaves your machine.
            </p>
            <Link
              to="/privacy"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ember hover:underline"
            >
              Read the privacy details
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3">
            {[
              "We only see folders you explicitly select.",
              "Files never leave your browser.",
              "No deletes - v1 is analysis-only on purpose.",
              "Heuristics are labelled. We say when we're guessing.",
            ].map((t) => (
              <div
                key={t}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm"
              >
                <Lock className="mt-0.5 h-4 w-4 text-ember" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-16 md:flex-row md:items-center">
          <div>
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to find out what your Mac thinks of you?
            </h2>
            <p className="mt-3 max-w-xl text-sm text-background/70">
              Takes 30 seconds. You'll laugh, you'll wince, you'll free up gigabytes.
            </p>
          </div>
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 rounded-lg bg-ember px-5 py-3 text-sm font-medium text-ember-foreground"
          >
            <ScanSearch className="h-4 w-4" />
            Start the roast
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function ReceiptPreview() {
  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="panel relative overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            ~/Downloads - roast.txt
          </span>
          <span className="stamp text-ember">LIVE</span>
        </div>
        <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
          <div className="border-b border-border p-6 md:border-b-0 md:border-r">
            <div className="stamp text-muted-foreground">Verdict</div>
            <div className="mt-1 font-display text-3xl font-semibold">Zip Goblin</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Hoarder of installers. Believes one day, you'll need that 2019 .dmg.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-border bg-surface p-3">
                <div className="font-mono text-xs text-muted-foreground">SCORE</div>
                <div className="font-display text-xl font-semibold text-ember">82</div>
              </div>
              <div className="rounded-md border border-border bg-surface p-3">
                <div className="font-mono text-xs text-muted-foreground">SCANNED</div>
                <div className="font-display text-xl font-semibold">42 GB</div>
              </div>
              <div className="rounded-md border border-border bg-surface p-3">
                <div className="font-mono text-xs text-muted-foreground">RECLAIM</div>
                <div className="font-display text-xl font-semibold">11.4 GB</div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="stamp text-muted-foreground">The roast</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-ember">›</span> You have kept 14 zip files for emotional reasons.
              </li>
              <li className="flex gap-2">
                <span className="text-ember">›</span> Your Mac is one screenshot away from folklore.
              </li>
              <li className="flex gap-2">
                <span className="text-ember">›</span> 4 node_modules folders. A small JS civilization.
              </li>
              <li className="flex gap-2">
                <span className="text-ember">›</span> You are not archiving. You are avoiding decisions.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        className="absolute -bottom-3 left-1/2 h-3 w-[92%] -translate-x-1/2 rounded-b-2xl bg-foreground/5 blur-md"
        aria-hidden
      />
    </div>
  );
}
