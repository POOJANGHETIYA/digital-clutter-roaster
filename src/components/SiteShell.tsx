import { Link, useLocation } from "react-router";
import { Flame } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/scan", label: "Scan" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/privacy", label: "Privacy" },
] as const;

export function SiteHeader() {
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="group flex items-center gap-2">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
            <Flame className="h-4 w-4 text-ember" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Digital Clutter Roaster
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = loc.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/scan"
            className="hidden rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Roast a folder
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-ember" />
          <span>Digital Clutter Roaster - local-first, Mac-first, no judgment (lots of judgment).</span>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/how-it-works" className="hover:text-foreground">How it works</Link>
        </div>
      </div>
    </footer>
  );
}
