export const APP_CONFIG = {
  name: "Digital Clutter Roaster",
  version: "1.0.0",
  targetPlatform: "macOS" as const,
  githubUrl: "https://github.com/POOJANGHETIYA/digital-clutter-roaster",
};

export type Platform = "macOS" | "Windows" | "Linux" | "Android" | "iOS" | "Unknown";
