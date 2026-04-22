import type { FileNode } from "./types";
import { macOsAnalyzer } from "./analyzers/macos";

const day = 86400_000;
const now = Date.now();

interface Seed {
  path: string;
  size: number;
  daysOld: number;
}

const SEEDS: Seed[] = [
  // Downloads chaos
  ...range(40).map((i) => ({
    path: `Macintosh HD/Users/you/Downloads/installer-${i}.dmg`,
    size: rand(80_000_000, 1_200_000_000),
    daysOld: rand(120, 800),
  })),
  ...range(30).map((i) => ({
    path: `Macintosh HD/Users/you/Downloads/archive-${i}.zip`,
    size: rand(5_000_000, 400_000_000),
    daysOld: rand(60, 500),
  })),
  ...range(25).map((i) => ({
    path: `Macintosh HD/Users/you/Downloads/invoice-${i}.pdf`,
    size: rand(80_000, 4_000_000),
    daysOld: rand(10, 700),
  })),
  // Screenshots overload
  ...range(420).map((i) => ({
    path: `Macintosh HD/Users/you/Desktop/Screenshot 2024-${pad(rand(1, 12))}-${pad(rand(1, 28))} at ${pad(rand(0, 23))}.${pad(rand(0, 59))}.${pad(rand(0, 59))}.png`,
    size: rand(300_000, 6_000_000),
    daysOld: rand(1, 400),
  })),
  // Desktop clutter
  ...range(35).map((i) => ({
    path: `Macintosh HD/Users/you/Desktop/notes-${i}.txt`,
    size: rand(1_000, 200_000),
    daysOld: rand(20, 600),
  })),
  // Videos
  ...range(18).map((i) => ({
    path: `Macintosh HD/Users/you/Movies/recording-${i}.mp4`,
    size: rand(200_000_000, 4_500_000_000),
    daysOld: rand(30, 900),
  })),
  // Photo library exports
  ...range(220).map((i) => ({
    path: `Macintosh HD/Users/you/Pictures/exports/img-${i}.jpg`,
    size: rand(1_000_000, 9_000_000),
    daysOld: rand(20, 500),
  })),
  // Duplicates: same name + size in multiple folders
  ...flat(
    range(8).map((i) => {
      const size = rand(20_000_000, 350_000_000);
      const name = `vacation-edit-${i}.mov`;
      return [
        { path: `Macintosh HD/Users/you/Desktop/${name}`, size, daysOld: rand(60, 400) },
        { path: `Macintosh HD/Users/you/Movies/${name}`, size, daysOld: rand(60, 400) },
        { path: `Macintosh HD/Users/you/Downloads/${name}`, size, daysOld: rand(60, 400) },
      ];
    }),
  ),
  ...flat(
    range(14).map((i) => {
      const size = rand(2_000_000, 30_000_000);
      const name = `final_v${i}_FINAL.pdf`;
      return [
        { path: `Macintosh HD/Users/you/Documents/${name}`, size, daysOld: rand(30, 600) },
        { path: `Macintosh HD/Users/you/Desktop/${name}`, size, daysOld: rand(30, 600) },
      ];
    }),
  ),
  // Dev junk: node_modules
  ...flat(
    ["portfolio", "client-app", "old-side-project", "experiment-2022"].map((proj) =>
      range(1200).map((i) => ({
        path: `Macintosh HD/Users/you/Projects/${proj}/node_modules/pkg-${i}/index.js`,
        size: rand(2_000, 80_000),
        daysOld: rand(30, 800),
      })),
    ),
  ),
  // .next
  ...range(300).map((i) => ({
    path: `Macintosh HD/Users/you/Projects/portfolio/.next/cache/${i}.bin`,
    size: rand(50_000, 2_000_000),
    daysOld: rand(5, 200),
  })),
  // Xcode DerivedData
  ...range(180).map((i) => ({
    path: `Macintosh HD/Users/you/Library/Developer/Xcode/DerivedData/MyApp-abc/Build/Products/${i}.o`,
    size: rand(100_000, 12_000_000),
    daysOld: rand(20, 500),
  })),
  // dist
  ...range(80).map((i) => ({
    path: `Macintosh HD/Users/you/Projects/client-app/dist/asset-${i}.js`,
    size: rand(50_000, 4_000_000),
    daysOld: rand(20, 400),
  })),
  // Some clean code
  ...range(40).map((i) => ({
    path: `Macintosh HD/Users/you/Projects/portfolio/src/components/Comp${i}.tsx`,
    size: rand(2_000, 30_000),
    daysOld: rand(1, 90),
  })),
];

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}
function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function flat<T>(arr: T[][]): T[] {
  return ([] as T[]).concat(...arr);
}

let id = 100000;

export function buildDemoFiles(): FileNode[] {
  return SEEDS.map((s) => {
    const segs = s.path.split("/");
    const name = segs[segs.length - 1];
    const parent = segs.slice(0, -1).join("/");
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
    const { category, devJunkKind } = macOsAnalyzer.classify({ name, path: s.path, ext });
    return {
      id: `d${++id}`,
      name,
      path: s.path,
      size: s.size,
      ext,
      modified: now - s.daysOld * day,
      parent,
      depth: segs.length - 1,
      category,
      isDevJunk: !!devJunkKind,
      devJunkKind,
    };
  });
}
