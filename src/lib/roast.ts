import type {
  CategoryBreakdown,
  DevJunkCluster,
  DuplicateGroup,
  RoastReport,
} from "./types";
import { formatBytes } from "./format";

interface RoastInput {
  categories: CategoryBreakdown[];
  devJunk: DevJunkCluster[];
  duplicates: DuplicateGroup[];
  staleBytes: number;
  totalSize: number;
  reclaimableBytes: number;
  clutterScore: number;
}

interface Archetype {
  id: string;
  name: string;
  blurb: string;
  match: (i: RoastInput) => number; // higher = stronger match
  lines: (i: RoastInput) => string[];
}

const ARCHETYPES: Archetype[] = [
  {
    id: "zip-goblin",
    name: "Zip Goblin",
    blurb: "Hoarder of archives. Believer that one day, you'll need that .dmg again. (You won't.)",
    match: (i) => {
      const a = i.categories.find((c) => c.id === "archives");
      return a ? a.size / 1_000_000 : 0;
    },
    lines: (i) => {
      const a = i.categories.find((c) => c.id === "archives");
      return [
        `You have kept ${a?.count ?? 0} archives "just in case." This is not a strategy.`,
        `Your Mac contains enough installer leftovers to run a small museum.`,
        a ? `${formatBytes(a.size)} of compressed indecision.` : "",
      ].filter(Boolean);
    },
  },
  {
    id: "screenshot-dragon",
    name: "Screenshot Dragon",
    blurb: "Sleeps on a hoard of Cmd-Shift-3s. Will not part with a single one.",
    match: (i) => (i.categories.find((c) => c.id === "screenshots")?.count ?? 0) / 4,
    lines: (i) => {
      const s = i.categories.find((c) => c.id === "screenshots");
      return [
        `${s?.count ?? 0} screenshots. You are not documenting; you are coping.`,
        `Your Mac is one screenshot away from folklore.`,
        `Most of these were taken to "send later." Later never came.`,
      ];
    },
  },
  {
    id: "build-necromancer",
    name: "Build Folder Necromancer",
    blurb: "Resurrects projects from 2021 every time you open Finder. node_modules whisper your name.",
    match: (i) => i.devJunk.reduce((s, d) => s + d.size, 0) / 1_000_000,
    lines: (i) => {
      const nm = i.devJunk.filter((d) => d.kind === "node_modules").length;
      const total = i.devJunk.reduce((s, d) => s + d.size, 0);
      return [
        `${nm} node_modules folders. A small JavaScript civilization lives on your disk.`,
        `${formatBytes(total)} of build artifacts. None of it is load-bearing.`,
        `You haven't touched some of these projects since shipping was still optional.`,
      ];
    },
  },
  {
    id: "duplicate-lord",
    name: "Duplicate Lord",
    blurb: "Why have one copy when you could have four? Final_v2_FINAL energy.",
    match: (i) => i.duplicates.length * 5,
    lines: (i) => {
      const waste = i.duplicates.reduce((s, d) => s + d.totalWaste, 0);
      return [
        `${i.duplicates.length} duplicate clusters. The same bytes living different lives.`,
        `${formatBytes(waste)} of pure redundancy.`,
        `You are not archiving. You are avoiding decisions.`,
      ];
    },
  },
  {
    id: "downloads-historian",
    name: "Downloads Historian",
    blurb: "Your Downloads folder is a working archive of every PDF you opened once.",
    match: (i) => (i.categories.find((c) => c.id === "downloads")?.size ?? 0) / 1_000_000,
    lines: (i) => {
      const d = i.categories.find((c) => c.id === "downloads");
      return [
        `Your Downloads folder has not known peace.`,
        `${d?.count ?? 0} forgotten files quietly aging in there.`,
        `Some of those PDFs were "read later." It is now later.`,
      ];
    },
  },
  {
    id: "stale-curator",
    name: "Chaotic Archivist",
    blurb: "Keeps everything, organizes nothing. The system is the absence of a system.",
    match: (i) => i.staleBytes / 1_000_000 / 5,
    lines: (i) => [
      `${formatBytes(i.staleBytes)} hasn't been touched in 6+ months.`,
      `If a file falls in your Documents folder and no one opens it, does it really exist?`,
      `You are running an unpaid archive of your past selves.`,
    ],
  },
  {
    id: "video-warlord",
    name: "Video Warlord",
    blurb: "Holds entire seasons hostage in /Movies. Ships nothing, stores everything.",
    match: (i) => (i.categories.find((c) => c.id === "videos")?.size ?? 0) / 5_000_000,
    lines: (i) => {
      const v = i.categories.find((c) => c.id === "videos");
      return [
        `${formatBytes(v?.size ?? 0)} of video. The director's cut nobody asked for.`,
        `These files are heavy. Your decisions about them are not.`,
      ];
    },
  },
];

export function generateRoast(input: RoastInput): RoastReport {
  const ranked = [...ARCHETYPES]
    .map((a) => ({ a, score: a.match(input) }))
    .sort((x, y) => y.score - x.score);

  const winner = ranked[0]?.a ?? ARCHETYPES[0];
  const lines = winner.lines(input).slice(0, 4);

  // Always add one universal closer
  lines.push(closingLine(input.clutterScore));

  const intervention = buildIntervention(input);
  const goodNews = buildGoodNews(input);

  return {
    archetype: winner.name,
    archetypeBlurb: winner.blurb,
    score: input.clutterScore,
    lines,
    intervention,
    goodNews,
  };
}

function closingLine(score: number): string {
  if (score >= 80) return "Diagnosis: this Mac needs an intervention, not a cleanup.";
  if (score >= 60) return "Diagnosis: solidly messy. Salvageable in an afternoon.";
  if (score >= 40) return "Diagnosis: comfortably cluttered. Could be worse.";
  if (score >= 20) return "Diagnosis: surprisingly tidy. Suspicious, even.";
  return "Diagnosis: suspiciously immaculate. Are you okay?";
}

function buildIntervention(i: RoastInput): string {
  const steps: string[] = [];
  if (i.devJunk.length) steps.push("nuke build/node_modules folders");
  if (i.duplicates.length) steps.push("review duplicate clusters");
  const arch = i.categories.find((c) => c.id === "archives");
  if (arch && arch.size > 500_000_000) steps.push("delete old DMGs and installers");
  const screenshots = i.categories.find((c) => c.id === "screenshots");
  if (screenshots && screenshots.count > 100) steps.push("triage screenshots older than 6 months");
  if (steps.length === 0) steps.push("keep doing whatever you're doing");
  return `Start with ${steps.slice(0, 3).join(", then ")}.`;
}

function buildGoodNews(i: RoastInput): string {
  if (i.reclaimableBytes > 0) {
    return `You can reclaim roughly ${formatBytes(
      i.reclaimableBytes,
    )} without touching anything you actually use.`;
  }
  return "Most of this mess is reversible. None of it defines you.";
}
