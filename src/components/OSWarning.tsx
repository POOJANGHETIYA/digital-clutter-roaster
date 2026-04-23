import { useState, useEffect } from "react";
import { AlertTriangle, X, ArrowRight, Laptop, Monitor, Smartphone } from "lucide-react";

import { APP_CONFIG, Platform } from "@/lib/config";

export function OSWarning() {
  const [show, setShow] = useState(false);
  const [detectedOS, setDetectedOS] = useState<Platform>("Unknown");

  useEffect(() => {
    const ua = window.navigator.userAgent;
    let currentOS: Platform = "Unknown";

    if (/Macintosh|Mac OS X/i.test(ua)) currentOS = "macOS";
    else if (/Windows/i.test(ua)) currentOS = "Windows";
    else if (/Linux/i.test(ua)) currentOS = "Linux";
    else if (/Android/i.test(ua)) currentOS = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) currentOS = "iOS";

    setDetectedOS(currentOS);

    // Show warning if not on the target platform
    const isTargetPlatform = currentOS === APP_CONFIG.targetPlatform;
    
    if (!isTargetPlatform) {
      const dismissed = sessionStorage.getItem("os-warning-dismissed");
      if (!dismissed) {
        // Small delay for better entry feel
        const timer = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const getOSIcon = () => {
    switch (detectedOS) {
      case "Windows":
      case "Linux":
        return <Monitor className="h-6 w-6" />;
      case "Android":
      case "iOS":
        return <Smartphone className="h-6 w-6" />;
      default:
        return <Laptop className="h-6 w-6" />;
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-700" 
        onClick={() => setShow(false)}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        <div className="bg-noise absolute inset-0 opacity-20" aria-hidden />
        
        <div className="relative p-6 sm:p-8">
          <button 
            onClick={() => {
              setShow(false);
              sessionStorage.setItem("os-warning-dismissed", "true");
            }}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
            aria-label="Close warning"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ember/10 text-ember mb-8 ember-glow">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <p className="stamp text-ember mb-2">Platform Notice</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight leading-none">
            Designed for {APP_CONFIG.targetPlatform}
          </h2>
          
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We detected you're on <span className="font-semibold text-foreground inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-2 text-sm">{getOSIcon()} {detectedOS}</span>. 
            The {APP_CONFIG.name} is built specifically for the {APP_CONFIG.targetPlatform} ecosystem.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">File system specifics:</span> We look for {APP_CONFIG.targetPlatform} artifacts like <code className="text-[11px] font-mono bg-surface-2 px-1 rounded">.dmg</code>, <code className="text-[11px] font-mono bg-surface-2 px-1 rounded">DS_Store</code>, and <code className="text-[11px] font-mono bg-surface-2 px-1 rounded">~/Library</code>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Inaccurate Roasts:</span> Cleanup suggestions might not apply to your OS structure.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                setShow(false);
                sessionStorage.setItem("os-warning-dismissed", "true");
              }}
              className="inline-flex flex-[1.2] items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Enter anyway
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="https://github.com/POOJANGHETIYA/digital-clutter-roaster"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-2 active:scale-[0.98]"
            >
              Waitlist
            </a>
          </div>
          
          <div className="mt-8 border-t border-border pt-6 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              v{APP_CONFIG.version} · {APP_CONFIG.targetPlatform} Only
            </p>
            <div className="flex gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ember/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-ember/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
