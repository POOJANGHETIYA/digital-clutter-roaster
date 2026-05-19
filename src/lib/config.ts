export const APP_CONFIG = {
  name: "Digital Clutter Roaster",
  version: "0.2.0",
  targetPlatform: "macOS" as const,
  githubUrl: "https://github.com/POOJANGHETIYA/digital-clutter-roaster",
};

export type Platform = "macOS" | "Windows" | "Linux" | "Android" | "iOS" | "Unknown";
