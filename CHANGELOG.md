# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `.gitignore` for design mockups, dependencies, build output, environment files, and editor/OS files.
- `CHANGELOG.md` to track notable changes.
- `CLAUDE.md` with the working agreement (spec-driven development, git rules, quality bar).
- `specs/01-overview.md`, the first draft spec for the React SPA rewrite (in Indonesian), with the first round of owner decisions.
- `specs/06-project-stories.md`, a draft spec for markdown-based project stories (structure, images, diagrams, i18n).
- `specs/02-design-system.md`, a draft spec for the design system (tokens with verified contrast, typography, components, Day/Night theme, otter mascot).
- `specs/05-deployment.md`, a draft spec for build configuration, Vercel and DNS setup, CI, and the cutover and rollback plan.
- `specs/04-pages.md`, a draft spec for the content and layout of every route, with draft copy in Indonesian and English.
- `specs/03-i18n.md`, a draft spec for the ID/EN language support, Indonesian first (detection, files, key naming, CV and email per language, checks).
- Project stories are written as free-form short stories, with a fact box (summary, tags, links) above each story.
- Two-part numbering for spec questions (`Q<spec>.<n>`, for example `Q1.3`) so questions from different specs no longer clash.
- Experience roadmap planned as a GitHub-style commit graph (Mermaid plan in `specs/04-pages.md`): education and work on `main`, internship, training, and certifications on branches.
- CV page `/cv` planned: an in-site preview of public Google Docs (Indonesian and English) with PDF download, so the CV on the site follows every update of the document.
- `react-rewrite` integration branch for the React SPA rewrite; the live site on `main` stays untouched until the rewrite is ready.

### Removed

- Stale remote branches `develop` and `v1-react`; their commits are already part of `main`.

## [0.1.0] - 2025-12-14

Static HTML/CSS/JS portfolio, served by GitHub Pages and later migrated to Vercel.

### Added

- Home page with hero, tech stack, and social links.
- Works page, 404 page, navbar, and footer with contact form.
- Hash-based SPA router and CV download.
