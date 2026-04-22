import { Link } from "react-router";
import { ArrowRight, Eye, Lock, ServerOff, ShieldCheck } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <span className="stamp text-ember">Privacy</span>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Local-first. By design, not by promise.
        </h1>
        <p className="mt-4 text-muted-foreground">
          The roast is funny. The privacy posture is not. Here's the plain truth about what happens
          when you scan a folder.
        </p>

        <div className="mt-10 grid gap-3">
          {[
            { icon: Lock, title: "Scanning is browser-only.", body: "All file enumeration and analysis happens in your browser. The File System Access API gives the page read access to the single folder you pick - nothing more." },
            { icon: ServerOff, title: "We don't upload your files.", body: "There is no scan-related backend. We do not transmit file metadata, names, paths, or contents anywhere." },
            { icon: Eye, title: "We don't read file contents.", body: "We use file metadata only - name, size, extension, modified date. Duplicate detection in v1 is heuristic (size + name), not content hashing." },
            { icon: ShieldCheck, title: "Nothing is deleted.", body: "v1 is analysis-only on purpose. Every flagged item is reviewable. You decide what to act on, in Finder, on your terms." },
          ].map((c) => (
            <div key={c.title} className="panel flex gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <c.icon className="h-5 w-5 text-ember" />
              </div>
              <div>
                <div className="font-display font-semibold">{c.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="panel mt-8 p-6">
          <h2 className="font-display text-lg font-semibold">What we may store locally</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your theme preference (light/dark) is stored in <span className="font-mono">localStorage</span>{" "}
            on your machine. That's it.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <Link to="/scan" className="inline-flex items-center gap-2 rounded-lg bg-ember px-5 py-3 text-sm font-medium text-ember-foreground">
            Roast a folder
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
