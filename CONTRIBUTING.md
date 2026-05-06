# Contributing to Digital Clutter Roaster

Thanks for your interest in contributing.
This project is public, portfolio-friendly and open to community improvements.

## What contributions are welcome

- Bug fixes
- New or improved clutter analysis heuristics
- UX and accessibility improvements
- Performance improvements for large scans
- Documentation improvements
- Tests and CI improvements

If you are unsure whether an idea fits, open a feature request first.

## Ground rules

- Keep the product local-first and privacy-conscious
- Do not add misleading claims about file access, telemetry, or data collection
- Do not claim full-system access; scanning is only for user-selected folders
- Keep humor tasteful and helpful; personality should never reduce clarity or usability

## Local setup

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install and run

```bash
pnpm install
pnpm dev
```

### Validate before opening a PR

```bash
pnpm lint
pnpm build
```

## Branch naming suggestions

Use short, descriptive branch names, for example:

- `feat/duplicate-confidence-copy`
- `fix/scan-progress-freeze`
- `docs/readme-privacy-clarity`
- `chore/ci-pnpm-cache`

## Commit message guidance

Use imperative, descriptive commit messages.

- Good: `fix: avoid stale progress text during scan completion`
- Good: `docs: clarify local-first scanning limitations`
- Avoid: `stuff`, `updates`, `final changes`

Conventional Commits are encouraged but not required.

## Pull request expectations

- Keep PRs focused and reasonably small
- Link the related issue (or explain why there is none)
- Explain user-facing impact clearly
- Include screenshots/GIFs for UI changes
- Include privacy/trust considerations for scan-related changes
- Update docs when behavior changes

## Reporting bugs and requesting features

- Use the issue templates in `.github/ISSUE_TEMPLATE/`
- For security issues, do not open a public issue; use [SECURITY.md](./SECURITY.md)

## Privacy and trust requirements for contributors

Changes that affect scanning, reporting, or data handling must preserve the project's trust model:

- Explicit user folder selection only
- Local analysis by default
- Clear disclosure of what metadata is used
- No hidden collection, upload, or misleading wording

If you propose telemetry or remote processing in the future, it must be opt-in, clearly documented and reviewed carefully.

## Before opening a PR

- [ ] I read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [ ] I ran `pnpm lint` and `pnpm build`
- [ ] I updated docs for user-visible behavior changes
- [ ] I reviewed privacy/trust impact
- [ ] I avoided misleading claims about scanning or data collection
- [ ] I kept humor professional and usability-first

## Review and communication

Maintainers will review as time permits.
Constructive, respectful discussion helps everyone ship better changes faster.
