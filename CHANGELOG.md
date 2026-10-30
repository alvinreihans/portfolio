# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `.gitignore` for design mockups, dependencies, build output, environment files, and editor/OS files.
- `CHANGELOG.md` to track notable changes.
- `react-rewrite` integration branch for the React SPA rewrite; the live site on `main` stays untouched until the rewrite is ready.

### Removed

- Stale remote branches `develop` and `v1-react`; their commits are already part of `main`.

## [0.1.0] - 2025-12-14

Static HTML/CSS/JS portfolio, served by GitHub Pages and later migrated to Vercel.

### Added

- Home page with hero, tech stack, and social links.
- Works page, 404 page, navbar, and footer with contact form.
- Hash-based SPA router and CV download.
