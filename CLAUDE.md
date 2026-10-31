# CLAUDE.md

Working agreement for the portfolio rewrite (alvinreihans.web.id): a React SPA replacing the static HTML/CSS/JS site.

## Ground rules

1. **Spec-driven development.** Write and agree on the spec before writing code. Specs live in `specs/`. If requirements change mid-way, update the spec first, then the code.
2. **No git writes.** Never run `git commit`, `git push`, or anything that changes git state (branch, merge, rebase, reset, tag, stash). The owner is relearning git and runs all of it personally. Read-only commands (`status`, `log`, `diff`, `branch`) are fine. When work is ready, describe what changed and let the owner commit. Teach and give exact commands when asked.
3. **Specs before code.** Numbered files in `specs/` (`01-overview.md`, `02-design-system.md`, `03-i18n.md`, `04-pages.md`, ...). The owner reviews and approves a spec before implementation starts. Open questions and decisions are numbered `Q<spec>.<n>` (for example `Q1.3` is question 3 of `01-overview.md`) so numbers never clash across specs.
4. **Small slices.** Work one feature at a time (scaffold, theme, i18n, a page, ...) and let the owner check it before moving on. No large unreviewed changes.
5. **Ask before big moves.** Adding a dependency, restructuring folders, or touching deployment (Vercel, DNS) needs explicit approval.
6. **Definition of done.** Every feature has acceptance criteria in its spec. Verify with Playwright (EN/ID, Day/Night, mobile and desktop) before calling it done. Report failures faithfully.
7. **Accessibility is part of the spec.** WCAG AA contrast, keyboard navigation, visible focus, `prefers-reduced-motion` respected, `<html lang>` follows the selected language.
8. **Performance.** Optimized images (avif), preloaded fonts, Lighthouse 90+ for Performance and Accessibility.
9. **Do not touch the live site.** `main` is deployed to alvinreihans.web.id via Vercel. All rewrite work targets the `react-rewrite` branch and its preview deployments.
10. **No private data in code** beyond what is already public (email in the footer). The contact form approach is decided in a spec first.
11. **Content comes from the owner.** Numbers, claims, and project stories are only used when the owner confirms them. Placeholders are marked clearly (`TODO(owner)`).
12. **Language.** Indonesian first. UI copy is written in Indonesian (source and fallback language) and translated to English, both living in the locale files (see `specs/03-i18n.md`). Code comments and identifiers are in English. Specs in `specs/` are written in Indonesian (technical terms stay in English).

## Git workflow (GitHub Flow with an integration branch)

```
main (live site)
 └── react-rewrite (integration branch, Vercel preview)
       └── feat/<name>, fix/<name>, chore/<name>  (short-lived, PR into react-rewrite)
```

- Never merge into `main` until the rewrite is complete; that deploys to production.
- Commit messages follow Conventional Commits: `<type>(<scope>): <imperative summary>` with types `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- One commit, one purpose. Keep commits small.
- Every user-visible change adds a line under `[Unreleased]` in `CHANGELOG.md` (Keep a Changelog format).
- Git identity is set per repository (not `--global`), because the machine is shared with work repos.

## Project context

- Owner: Alvin, backend developer (Node.js, Express/Hapi, PostgreSQL, Redis, MQTT, GCP/AWS). Chats in Indonesian, casual.
- Goal: job hunting (recruiters should get it in 10 to 30 seconds) plus personal showcase.
- Design direction: `mockups/c-minimal-refero.html` (local only, git-ignored): minimal light layout, Refero "Obscura" style, Jersey 10 headings, Manrope body, Cloud Mist `#e3f1fe` canvas, Signal Orange `#ff5e24` accent, pixel sun/moon/stars with a Day/Night theme (not light/dark).
- Planned stack: Vite, React, TypeScript, React Router, Tailwind CSS, react-i18next. Vercel needs a rewrite of all paths to `index.html` for client-side routing.
- Hosting: Vercel (production branch `main`), domain alvinreihans.web.id at DomaiNesia.
