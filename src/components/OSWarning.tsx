import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Monitor, 
  Smartphone, 
  Sparkles, 
  Chrome, 
  Apple, 
  ShieldAlert,
  RotateCcw,
  BookOpen
} from "lucide-react";

import { APP_CONFIG, Platform } from "@/lib/config";
import { useScanStore } from "@/store/scan";
import { buildDemoFiles } from "@/lib/demo";
import { analyze } from "@/lib/analyze";

type ModalType = "insecure" | "mobile" | "limited-browser" | "non-mac-desktop" | null;

interface ModalContent {
  icon: React.ReactNode;
  badge: string;
  heading: string;
  body: string;
  bullets: string[];
  primaryAction: string;
  secondaryAction: string;
  secondaryIcon?: React.ReactNode;
  onSecondary?: () => void;
  isHardBlock?: boolean;
}

export function OSWarning() {
  const navigate = useNavigate();
  const { reset, setScanning, setResult } = useScanStore();
  const [show, setShow] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [detectedOS, setDetectedOS] = useState<Platform>("Unknown");
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(true);
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    let currentOS: Platform = "Unknown";

    // 1. Initial detection via User Agent string
    if (/Android/i.test(ua)) currentOS = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) currentOS = "iOS";
    else if (/Macintosh|Mac OS X/i.test(ua)) currentOS = "macOS";
    else if (/Windows/i.test(ua)) currentOS = "Windows";
    else if (/Linux/i.test(ua)) currentOS = "Linux";

    // 2. Refinement for "Desktop Mode" on mobile
    const uad = (navigator as any).userAgentData;
    if (uad) {
      const brandPlatform = uad.platform?.toLowerCase();
      if (brandPlatform?.includes("android")) currentOS = "Android";
      else if (brandPlatform?.includes("macos")) currentOS = "macOS";
    }

    // 3. Heuristic for Android spoofing as Linux (Desktop Mode)
    if (currentOS === "Linux" && /arm|aarch/i.test(navigator.platform)) {
      currentOS = "Android";
    }

    setDetectedOS(currentOS);

    const secure = window.isSecureContext;
    const supportsDirectoryPicker = 'showDirectoryPicker' in window;
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || currentOS === "Android" || currentOS === "iOS" || uad?.mobile;
    const isMac = currentOS === "macOS";

    setIsSecure(secure);
    setIsSupportedBrowser(supportsDirectoryPicker);

    let type: ModalType = null;

    if (!secure) {
      type = "insecure";
    } else if (isMobile) {
      type = "mobile";
    } else if (!supportsDirectoryPicker) {
      type = "limited-browser";
    } else if (!isMac) {
      type = "non-mac-desktop";
    }

    setModalType(type);

    if (type !== null) {
      const dismissed = sessionStorage.getItem(`os-warning-dismissed-${type}`);
      if (!dismissed || type === "insecure") {
        const timer = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDemo = () => {
    setShow(false);
    reset();
    const start = performance.now();
    setScanning(
      { 
        phase: "analyzing", 
        filesScanned: 0, 
        foldersScanned: 0, 
        bytesScanned: 0, 
        flavor: "Loading a fictional but very real-feeling Mac…" 
      },
      "demo",
    );
    
    setTimeout(() => {
      const files = buildDemoFiles();
      const result = analyze(files, "Demo Mac (~/)", performance.now() - start);
      setResult(result, "demo");
      navigate("/results");
    }, 800);
  };

  const dismiss = () => {
    if (modalType === "insecure") {
      window.location.reload();
      return;
    }
    setShow(false);
    if (modalType) {
      sessionStorage.setItem(`os-warning-dismissed-${modalType}`, "true");
    }
  };

  const getContent = (): ModalContent | null => {
    switch (modalType) {
      case "insecure":
        return {
          icon: <ShieldAlert className="h-7 w-7" />,
          badge: "Secure connection required",
          heading: "Local folder access needs HTTPS",
          body: "Digital Clutter Roaster uses browser file access features that require a secure context. Open the app over HTTPS to use folder scanning.",
          bullets: [
            "File System Access API is restricted to secure origins.",
            "Localhost is generally considered secure, but production needs SSL.",
            "Your privacy is protected by end-to-end encryption."
          ],
          primaryAction: "Retry",
          secondaryAction: "Open documentation",
          secondaryIcon: <BookOpen className="h-4 w-4" />,
          onSecondary: () => window.open("https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts", "_blank"),
          isHardBlock: true
        };
      case "mobile":
        return {
          icon: <Smartphone className="h-7 w-7" />,
          badge: "Desktop recommended",
          heading: "This tool is built for desktop folder scanning",
          body: "Digital Clutter Roaster is designed for desktop-class local folder access and macOS-focused cleanup heuristics. Mobile browsers are not the intended experience right now.",
          bullets: [
            "Folder scanning support is limited on mobile browsers.",
            "The full cleanup workflow may not be available here.",
            "You can still explore demo mode."
          ],
          primaryAction: "Open demo mode",
          secondaryAction: "Dismiss",
          onSecondary: () => setShow(false)
        };
      case "limited-browser":
        return {
          icon: <Chrome className="h-7 w-7" />,
          badge: "Browser compatibility notice",
          heading: "Best in Chrome or Edge on Mac",
          body: "You’re on macOS, but your current browser may not fully support the local folder workflow required by Digital Clutter Roaster.",
          bullets: [
            "Folder scanning depends on modern file access APIs.",
            "Some browsers provide partial or no support for directory picking.",
            "For the smoothest experience, use the latest Chrome or Edge on macOS."
          ],
          primaryAction: "Continue anyway",
          secondaryAction: "Open demo mode",
          secondaryIcon: <Sparkles className="h-4 w-4 text-ember" />,
          onSecondary: handleDemo
        };
      case "non-mac-desktop":
        return {
          icon: <Monitor className="h-7 w-7" />,
          badge: "Compatibility notice",
          heading: "Best experienced on macOS",
          body: `We detected that you’re using ${detectedOS}. Digital Clutter Roaster is currently optimized for macOS-specific clutter patterns and works best in a Chromium-based desktop browser.`,
          bullets: [
            "Some cleanup suggestions may not match your OS structure.",
            "macOS-specific artifacts like .dmg, .DS_Store, and certain folder patterns may not apply.",
            "You can still explore the app and continue at your own discretion."
          ],
          primaryAction: "Continue anyway",
          secondaryAction: "Try demo mode",
          secondaryIcon: <Sparkles className="h-4 w-4 text-ember" />,
          onSecondary: handleDemo
        };
      default:
        return null;
    }
  };

  const content = getContent();

  // If we are on macOS + supported browser + secure, show the tiny badge
  if (!show && detectedOS === "macOS" && isSupportedBrowser && isSecure) {
    return (
      <div className="fixed bottom-6 left-6 z-[90] animate-in fade-in slide-in-from-bottom-2 duration-1000">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface/80 backdrop-blur-md px-3 py-1.5 shadow-sm">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-success/20 text-success">
            <Apple className="h-2.5 w-2.5" />
          </div>
          <span className="stamp text-[10px] text-muted-foreground">Optimized for macOS</span>
        </div>
      </div>
    );
  }

  if (!show || !content) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 sm:p-6">
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-700" 
        onClick={content.isHardBlock ? undefined : dismiss}
      />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        <div className="bg-noise absolute inset-0 opacity-20" aria-hidden />
        
        <div className="relative p-6 sm:p-8">
          {!content.isHardBlock && (
            <button 
              onClick={dismiss}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ember/10 text-ember mb-8 ember-glow">
            {content.icon}
          </div>

          <p className="stamp text-ember mb-2">{content.badge}</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight leading-none">
            {content.heading}
          </h2>
          
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {content.body}
          </p>

          <div className="mt-6 space-y-3">
            {content.bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember/60" />
                <p className="text-sm text-muted-foreground leading-snug">{bullet}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={modalType === "mobile" ? handleDemo : dismiss}
              className="inline-flex flex-[1.2] items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {modalType === "insecure" && <RotateCcw className="h-4 w-4" />}
              {content.primaryAction}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={content.onSecondary}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-2 active:scale-[0.98]"
            >
              {content.secondaryIcon}
              {content.secondaryAction}
            </button>
          </div>
          
          <div className="mt-8 border-t border-border pt-6 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              v{APP_CONFIG.version} · Secure Context: {isSecure ? "Yes" : "No"}
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
