import { create } from "zustand";
import type { ScanProgress, ScanResult } from "../lib/types";

interface ScanState {
  status: "idle" | "scanning" | "ready" | "error";
  progress: ScanProgress | null;
  result: ScanResult | null;
  error: string | null;
  source: "live" | "demo" | null;
  setScanning(p: ScanProgress, source: "live" | "demo"): void;
  setProgress(p: ScanProgress): void;
  setResult(r: ScanResult, source: "live" | "demo"): void;
  setError(msg: string): void;
  reset(): void;
}

export const useScanStore = create<ScanState>((set) => ({
  status: "idle",
  progress: null,
  result: null,
  error: null,
  source: null,
  setScanning: (p, source) =>
    set({ status: "scanning", progress: p, error: null, result: null, source }),
  setProgress: (p) => set({ progress: p }),
  setResult: (r, source) => set({ status: "ready", result: r, source, progress: null }),
  setError: (msg) => set({ status: "error", error: msg }),
  reset: () => set({ status: "idle", progress: null, result: null, error: null, source: null }),
}));
