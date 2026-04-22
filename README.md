# Digital Clutter Roaster

Roasting your Mac’s bad storage habits, one folder at a time.

Digital Clutter Roaster is a Mac-first, local-first storage analyzer that helps you inspect selected folders, detect clutter patterns and produce a funny but actionable cleanup report.

## Product overview

Digital Clutter Roaster is built for people whose Downloads, Desktop and project folders quietly become storage black holes.

It scans only what you explicitly choose, highlights high-impact clutter and gives you a clear cleanup plan without taking destructive actions on your behalf.

## Why this exists

Most cleanup tools fail in one of two ways: they either overwhelm users with low-signal data or ask for too much trust.

This project exists to be:

- Useful: prioritize the biggest cleanup wins first.
- Honest: show confidence levels and avoid over-claiming.
- Trustworthy: local-first analysis with explicit user folder selection.
- Safe: analysis-first workflow with no automatic deletion in v1.

## Features

- Folder-by-folder scanning via File System Access API.
- Large file detection and category breakdowns.
- Duplicate cluster detection with confidence labeling.
- Stale file detection for old or untouched files.
- macOS clutter pattern detection for screenshots, installer leftovers, downloads noise and developer junk.
- Roast report with archetype, score and prioritized cleanup suggestions.
- Review screen for inspecting flagged files.
- Export options for Markdown and JSON reports.
- Demo mode for exploring the UI quickly.

## Screenshots and demo

- TODO: Add screenshot of homepage hero.
- TODO: Add screenshot of scan progress screen.
- TODO: Add screenshot of results and roast report.
- TODO: Add screenshot of review table and filters.
- TODO: Add demo video or GIF walkthrough.

## How it works

1. You select a folder.
2. The app enumerates files and metadata in-browser.
3. Heuristics classify clutter categories and identify likely cleanup opportunities.
4. The app generates a roast summary plus an actionable plan.
5. You review the evidence and decide what to delete manually.

## Safe-by-default behavior

- No automatic deletion in v1.
- No background scanning.
- No silent folder access.
- No claims of full-system access.

You stay in control of every cleanup action.

## Privacy and security

- Local-first by design: analysis runs in the browser.
- Scans only folders explicitly selected by the user.
- Does not upload file contents.
- Uses metadata for analysis such as name, size, extension and modified date.
- Security disclosure process is documented in the repository’s security policy.

## Limitations

- Mac-first heuristics in the current version.
- Browser support depends on File System Access API availability.
- Duplicate detection is heuristic in v1, not full content hashing.
- No built-in file deletion or automation in v1.

## Platform scope

Digital Clutter Roaster is Mac-first for now.

Cross-platform support can be explored later, but macOS quality and trust are the current priority.

## Tech stack

- React + TypeScript.
- Vite.
- Zustand.
- ESLint.
- pnpm.
- TODO: Add testing stack details when the test suite is finalized.

## Local development setup

### Prerequisites

- Node.js 20+.
- pnpm 9+.

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm dev
```

### Build production bundle

```bash
pnpm build
```

## Scripts

- `pnpm dev`: start local development server.
- `pnpm build`: type-check and build for production.
- `pnpm lint`: run lint checks.
- `pnpm preview`: preview production build locally.

## Project structure

```text
.
├── public/
├── src/
│   ├── components/
│   ├── lib/
│   │   └── analyzers/
│   ├── pages/
│   └── store/
├── .github/
│   └── workflows/
├── README.md
└── LICENSE
```

## Roadmap

- Improve confidence scoring and explanation quality.
- Expand test coverage for scan and analysis modules.
- Improve accessibility and keyboard-first navigation.
- Refine export format and report readability.
- Explore optional future analyzer packs without breaking local-first guarantees.

## License

This project is licensed under the MIT License.
