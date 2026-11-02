## Overview

Money Tracker is an AI-powered personal finance tracker that runs as a PWA. Transactions can be logged three ways: typing like a chat ("coffee 25k gopay"), snapping a receipt or an e-wallet payment screenshot, or filling a form. Text and images are read automatically and saved as transactions, complete with category, pocket, and merchant.

![Money Tracker home on desktop: side navigation, today’s transactions, and total assets per pocket](./images/beranda-desktop-1600x1000.avif)

## Background

I often felt that my money had simply "disappeared". I could not tell where it was leaking: was I snacking too often, or were some things just expensive for me? I tried tracking it in Excel, but entering every item by hand was a chore, so I built my own app to track money coming in and going out.

At the time I had also just integrated an LLM at work. There I learned that a model asked to simply "read a receipt" answers in a different shape every time, while a system prompt and a JSON schema make it fill in fields you define in advance. I brought that approach to this app.

## Journey

**Three inputs, two dropped.** The first release (19 September 2026) had three ways in: receipt photos, PDF bank statement import, and a Telegram bot. Bank statements turned out not to answer my question: they show how much money went in and out, not where it went. I built the Telegram bot because I usually pay by QRIS, and I could forward the payment proof to the bot for the AI to read. Then I learned that a PWA can receive "Share" from other apps too, so the bot was no longer needed. Both were removed in version 1.0.0.

**OCR that hung.** On the day of the first release, receipt reading failed on the production server without any error message. The cause took several attempts to find: the Tesseract worker, its WASM files, and sharp's native library were not deployed, because they are loaded through runtime paths.

**A pause.** After that I put the project on hold for about a month. There was still a lot to fix, and work was busy. I came back when I had free time: from 21 to 31 October there were 169 commits, taking it from version 1.0.0 to 2.9.0.

**Finding the most accurate way to read.** I compared several paths with real receipts. Tesseract plus Groq was slow and inaccurate, and Groq's small token limit often cut results short. Tesseract plus Gemini (to save Gemini tokens) was also often wrong, especially about the source of funds. In the end the image goes straight to Gemini, without OCR. The accuracy tests themselves used up Gemini's free quota, which turned out to be only 20 requests a day because the `-latest` alias had silently switched models. Since then the model name has been pinned.

**From a tab to a conversation.** At first, incomplete readings went to a "Needs fixing" tab. Wrong results piled up there, and the tab was rarely opened. Now the AI asks right away while logging, through the **+** button, like a chat.

**One design for every screen.** I looked for a design system for a PWA used on phones, tablets, and desktops, and chose Samsung's One UI (it helps that my phone is a Samsung).

**Spec first, then code.** The project follows spec-driven development, a method I had just learned from [Dicoding](https://www.dicoding.com/). Every feature starts from a specification (system behaviour, data in and out, decisions, acceptance criteria) that serves as the source of truth and as the instructions for the AI that helps write the code. That produced 26 specification documents.

## Outcome

- Version 2.9.0, 246 commits, 26 specifications, and 28 database migrations.
- I use it myself every day. For e-wallet payments I just share the payment proof to the app; cash or e-money card transactions I type like a chat. Each account's data is isolated, so the app is ready for more than one user.
- My original question, where the money goes, is not answered yet. I have only just started logging regularly and am still adding receipts from earlier months. I expect the pattern to show after about three months of data.

## Features

**Logging**

- Free text, receipt or payment screenshots (camera or upload), and a manual form.
- Android share target: receipts or text can be shared straight from another app and processed in the background. If the result needs more detail, the user gets a push notification.
- Chat-style logging: when the AI is unsure, it asks right there. Unfinished entries get reminders on day 1 and day 7 and are deleted on day 30.
- Category memory per merchant, with name matching that still works when a name is truncated ("WAITENJOY.CO…") or missing words such as "Toko" (shop). When a category is corrected, the app offers to fix similar older transactions too.

![Logging through the chat on a phone: typing "bakso 25rb gopay" saves a GoPay food expense right away](./images/catat-mobile-780x1688.avif)

**Understanding your money**

- Analytics: monthly summary, six-month trend, category breakdown, top merchants, and projections.
- Budgeting methods: per category, 50/30/20, 80/20, 70/20/10, custom percentages, Zero-Based, Pay Yourself First, 6 Jars, and Kakeibo.
- Pockets (bank accounts and e-wallets) with balances over time, savings goals, loans and receivables with Snowball or Avalanche payoff strategies, instalments, PayLater, and data export.
- **Ask AI**: questions about your own data, such as "why did I overspend this month?".

![October analytics on desktop: money in and out, highlights, and top merchants](./images/analitik-desktop-1600x1000.avif)

![Budget settings on a tablet with the 50/30/20 method and income split per group](./images/budget-tablet-800x1151.avif)

## Architecture

```flow
PWA (Next.js) -> *API route -> Gemini / Groq (JSON extraction) -> Validation
API route -> Supabase (PostgreSQL + RLS)
```

One Next.js app (App Router) serves both the pages and the API routes, in three layers:

- **The proxy** refreshes the Supabase session on every request and sends signed-out visitors to the login page. API routes are not redirected; they answer 401 themselves.
- **API routes** are thin: they check the session, limit the input (JPEG, PNG, WebP, or HEIC images up to 5 MB), and hand the work to `src/lib`.
- **`src/lib`** holds the logic: the reading pipeline, validation, saving, analytics, budgeting methods, loans, and notifications.

Supabase provides PostgreSQL, authentication, and Row Level Security. The schema is managed through 28 versioned migrations applied by a small custom runner (`db:migrate`, `db:status`). The UI follows Samsung's One UI style and is built with plain CSS, without a UI or charting library.

## Receipt reading pipeline

```flow
Receipt photo -> sharp (1080px, JPEG) -> *Gemini (JSON extraction) -> Validation -> Transaction
Validation -> Draft (asked in the chat)
```

1. **Compress.** The image is rotated by its EXIF data and scaled down with sharp to a 1080px JPEG. In tests with real receipts, files shrank by about 80% (415 KB to 81 KB), and all three receipts were read correctly in 2.7 to 3 seconds. At 720px, the merchant and PayLater details started to disappear.
2. **Gemini.** Gemini Flash-Lite reads the image and fills in JSON fields defined by a schema. It reads the layout of a payment screen (big totals, discounts, PayLater) more reliably than OCR. The model name is pinned rather than using a `-latest` alias: that alias once silently moved to a model with a free quota of 20 requests a day. The model can be swapped through an environment variable without redeploying.
3. **Validation.** A result that parses as JSON is not necessarily sensible, so its amount, type, and category are checked first.
4. **Draft.** If Gemini fails or returns something invalid, the transaction is still saved as a draft, and the AI asks for what is missing in the chat. The pipeline never throws, so user data is never lost. Every result carries a decision trace (`notes`) explaining what happened.

Typed text is read by Groq first, through three chained models. Groq quotas are counted per model, so switching models means a fresh quota. If all of them fail, Gemini is the fallback, then a draft.

## Saving a transaction

Before it is saved, every AI result goes through a few checks:

- **The category** comes from the latest transaction with the same merchant. Merchants are stored encrypted, so matching happens after decryption, and no plain-text merchant list is ever stored.
- **Duplicate detection:** a transaction with the same type, amount, date, time, and pocket is flagged as a likely duplicate and sent back to draft for the user to confirm.
- **PayLater purchases** become an instalment plan straight away.

## Ask AI

The principle: **the numbers come from the server, the AI explains.** Language models often add up wrong, so Gemini answers through server functions (function calling): `ringkasan_bulan` (monthly summary), `cari_transaksi` (search transactions), `saldo_kantong` (pocket balances), `pinjaman_cicilan` (loans and instalments), and `usul_ubah_kategori` (suggest a category change). These run with the user's session, so Row Level Security still applies.

- Differences, averages, and percentages go through a `hitung` (calculate) function: a small arithmetic parser (not `eval`) that rejects any number of 1,000 or more that did not come from an earlier function result.
- Every rupiah amount in an answer is checked against the function results. If one does not match, the model is asked to rewrite once; if it still does not match, the answer is flagged as uncertain.
- Answers link to the History page with the same filter, so the numbers can be checked.
- Any change the AI suggests, such as a new category, always needs the user's confirmation.

![Ask AI on a phone explaining why October spending was higher than September, using amounts from the function results](./images/tanya-mobile-780x720.avif)

## Security and privacy

- **Encrypted personal columns:** merchant, notes, and the original text of each entry are encrypted with AES-256 through pgcrypto, using a key in Supabase Vault. The app reads through a view that decrypts and writes through triggers that encrypt. The app code did not have to change, searching the history keeps working, and a leaked database dump cannot be read.
- **Per-account isolation:** Row Level Security on every table, plus a `uji:isolasi` script that checks through the real API that another account cannot read, change, or reference this account's data.
- **Security headers:** a Content Security Policy (scripts, images, and workers only from the app itself; data connections only to the app and Supabase), no framing by other sites, and camera access only for this app.
- Sign-in through Supabase Auth (email and password, including password reset). AI API keys live on the server only.

## Testing

- **Unit tests:** 17 `uji:<area>` scripts (validation, dates, analytics, pockets, loans, budgeting methods, and more), written as plain `tsx` scripts with `node:assert`, without a test framework.
- **End-to-end tests:** 18 suites in a headless browser through the DevTools Protocol, including an accessibility suite. These, along with `uji:isolasi` and `eval:tanya`, use temporary accounts that are deleted at the end, so they are safe to run against the real database.
- **Measurements:** typed-text accuracy over 18 sentences against the real Groq API (`ukur:teks`), and evaluation of Ask AI answers (`eval:tanya`).
- **Diagnostics:** `test:receipt` and `test:teks` run the same production code and expose each stage, so results can be checked before they are trusted.

## Deployment and operations

- Runs on Vercel in the Singapore region.
- Changes are recorded in a changelog that follows Keep a Changelog and Semantic Versioning; the version shown in the app is read from `package.json`.
