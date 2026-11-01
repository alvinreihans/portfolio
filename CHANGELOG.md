# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Works section and project pages: seven projects as cards in a grid (Money Tracker first, then Teman Jalan, Garuda Games Chat Forum, Video Belajar, Plant Classification API, CropOptima, and Notes App), and a page per project at `/projects/:slug` with a fact box, a short story in Indonesian and English, top-down pixel flowcharts (each step once, with branches and merges drawn as arrows), and a link to the next project. The Money Tracker story covers its background, journey, and outcome, then documents the app (features, architecture, receipt pipeline, Ask AI, security, testing), with five AVIF screenshots from a demo account filled with sample data. The other six stories document each app from its code (features, architecture, flowcharts, testing, and CI/CD where they exist), with tags and summaries corrected to match what the repositories show (phone and tablet shots stay at most 380px wide, and every image reserves its size so nothing shifts while it loads). Stories are markdown files (react-markdown and remark-gfm, loaded only on project pages); adding a project is adding a folder.
- Switching language fades the page text and navbar links out and back in instead of swapping them at once (off for reduced motion), and a project story keeps showing until the other language is ready, so the page no longer collapses to a loading line and jumps.
- Moving to another page (for example from the home page to the CV) fades the new page in with a small rise; the navbar, sky, and scene stay put, same-page section links do not animate, and reduced motion shows the page at once.
- CV page `/cv`: a live preview of the public Google Docs CV in the active language, with a PDF download and an "Open in new tab" link to the same document. `npm run check-cv` checks both public CVs for phone numbers and forbidden keywords and that the PDF download works.
- The pixel sky (clouds, and stars at night) and the scene with Contact now appear on every page, not only the home page, so visitors can get in touch from the CV, project, and 404 pages too. The scene stays the same while moving between pages.
- The beaver from one sprite everywhere: a beaver-head favicon (SVG, 32px PNG, and a 180px Apple touch icon), and a 1200x630 Open Graph image with the name, role, and domain. `index.html` now has Open Graph and Twitter/X card tags, and `npm run brand` regenerates the icons and the image from the sprite.
- Experience roadmap graph in the style of a GitHub commit graph: main starts with an init commit, and education and work are branches of their own; Bangkit, MBKM research and internship, and the thesis fork off the education branch, AWS Back-End Academy and Harisenin fork off main, and each merges back into its parent on its end date (the thesis just before graduation), while the current job stays open, branch label chips, and a HEAD marker on the current job. Cards link to the resulting repositories and publications (ORCID). A branch can hold several commits: Bangkit starts with the program and its certificates, then a Google Cloud Associate Cloud Engineer commit with its Credly credential, then merges. All 43 certificates appear inside the program that earned them, 42 of them linking to their credential page at the issuer (three highlights, then a "Show N more" button that unfolds the rest with a short animation, or at once for reduced motion), with the rest under "Other certificates" and a link to LinkedIn. The graph is decorative and hidden from screen readers; on phones it narrows to a slim gutter.
- Experience section: education, work, internship, training, and certification events from the CV, newest first, each with its type and dates in the active language (the current job reads "February 2026 – Present"). The branch layout for the upcoming roadmap graph is computed from the data, so new events need no manual positions.
- The beaver can be greeted: clicking it or pressing Enter or Space makes it hop (a sleeping one wakes up) and a pixel speech bubble types out a line that fits the scene and the time of day, in the active language; screen readers hear the whole line once. Scenes come alive with falling leaves or fireflies, gulls, cars in two lanes (with headlights at night), campfire smoke, and flickering lights. All of it stays still in static mode, where the bubble shows the line at once.
- Pixel scenery on the home page: a page-wide sky with slowly drifting clouds (kept in the side margins on wide screens) and night stars, and one of four scenes picked at random per visit (park, beach, city, mountain) with an idle beaver mascot above the Contact section. Contact and the footer continue the scene's ground texture, with a mail icon (subject in the active language) first in the row of social links. The scene loads separately, pauses when off screen or in a hidden tab, and stays still for reduced motion, data saver, 2G connections, low-memory or 2-core devices, and browsers that cannot keep 30 fps. `?scene=` and `?seed=` pin a scene for review.
- Hero: heading, intro, an action row (View CV, Experience, Projects, Contact), social links (LinkedIn, GitHub, Instagram, icons from Font Awesome Free under CC BY 4.0), and a pixel sky (sun and clouds by day; moon, twinkling stars, and darker clouds by night).
- Tech stack section with five groups from the CV.
- On the home page, the desktop navbar links stay visually hidden while the hero action row is on screen and fade in once it scrolls away; they remain available to screen readers and appear on keyboard focus. Tapping outside the mobile menu closes it, and keyboard focus is no longer hidden behind the sticky navbar.
- Pixel icons: the theme button shows a sun with rays or a crescent moon, and the language control is now a single button with a pixel flag (Indonesia or the United States) that switches to the other language. This also frees up space in the navbar on small phones.
- Site layout: sticky navbar with links to the Experience, Projects, and Contact sections and the CV page (they also work from other pages), a mobile menu below 640px (closes with Esc or after choosing a link), a skip link, a footer with the current year, and focus moving to the new page heading or section after navigation.
- Day/Night theme: the first visit follows the system light or dark setting (and follows live changes), the sun/moon button saves a different choice, and picking the system theme again clears it. A small inline script applies the theme before first paint, and the color transition is off for visitors who prefer reduced motion.
- Indonesian and English support (i18next): the first visit follows the browser language (Indonesian or English, else English), the ID/EN toggle saves the choice, and `<html lang>` and the page title follow the active language. All draft copy is marked `_review` until the owner reviews it.
- React SPA scaffold: Vite, React, TypeScript, React Router, and Tailwind CSS, with design tokens for Day and Night, self-hosted Jersey 10 and Manrope fonts, and placeholder routes for `/`, `/cv`, `/projects/:slug`, and 404.
- `vercel.json` with the Vite build, SPA rewrite, security headers, and long caching for hashed assets.
- Vercel builds only `main` and `react-rewrite`; other branches are skipped to save the Hobby plan build quota.
- GitHub Actions CI that runs lint, format check, type check, `check-i18n`, unit tests, and the build on every pull request.
- `check-i18n` and initial JavaScript size budget (170 KB gzip) scripts.
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

### Fixed

- On narrow phones the scene no longer widens the page: the mountain and beach props stay inside the screen, the greeting button is clipped to the scene, and the speech bubble moves inward to stay on screen while its tail still points at the beaver.
- The logo (or any link to the page that is already open) now glides back to the top instead of jumping; the browser back and forward buttons still restore the scroll position, and reduced motion still jumps.
- Cards (tech stack, experience, other certificates) now carry the layered card shadow from the design system, so they stand out from the page in both Day and Night.
- Links to a section (hero buttons and navbar) scroll smoothly again instead of jumping; visitors who prefer reduced motion still jump straight there.
- No focus ring around a section, heading, or the main area when focus moves there after a link or a reload (for example on `/#contact`); buttons and links keep their focus ring.

### Removed

- The old static HTML/CSS/JS site files (`assets/`, `components/`, `contents/`, and the old `index.html`); the live site on `main` keeps them until cutover.

- Stale remote branches `develop` and `v1-react`; their commits are already part of `main`.

## [0.1.0] - 2025-12-14

Static HTML/CSS/JS portfolio, served by GitHub Pages and later migrated to Vercel.

### Added

- Home page with hero, tech stack, and social links.
- Works page, 404 page, navbar, and footer with contact form.
- Hash-based SPA router and CV download.
