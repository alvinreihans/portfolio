## Overview

Video Belajar is an online course app from the Harisenin bootcamp, built from Figma designs: a course catalogue, course details, checkout, a learning page with videos, summaries, and quizzes, certificates, and account pages. The repository holds two parts: a React SPA at the root and an Express REST API in the `backend/` folder.

## Frontend

```flow
*React SPA (Vite, Redux Toolkit) -> axios -> MockAPI (courses)
React SPA (Vite, Redux Toolkit) -> Sample data (checkout, lessons, orders)
```

- React 19, Vite, Tailwind CSS, Redux Toolkit, and React Router, with 13 pages. Pages that need a login redirect to `/login` and return to where the user started after signing in.
- A course management page: add, edit, and delete courses through a validated form, using Redux Toolkit async thunks and axios against MockAPI.
- Checkout (payment method choice, a virtual account countdown), lessons, quizzes, orders, and certificates use static sample data; login is still client-side.
- Design tokens from Figma (colours and type scale) became CSS variables mapped into the Tailwind theme, plus 12 base UI components.
- Course state grew in steps: shared global state, then MockAPI through axios, then Redux Toolkit.
- Fixed protected pages that briefly flashed to `/login`: the login state is now read from localStorage when the state is created, not after the first render.

## Backend

```flow
Client (Postman) -> *Express router (15 resources) -> CRUD controller -> CRUD service (parameterised SQL) -> MySQL
```

- 15 resources, each with 6 REST endpoints (list with filters and pagination, detail, create, replace, partial update, delete). All of them are generated from one generic CRUD pattern: a registry declares each resource's table and columns, and factories build its router, controller, and service.
- Safe from SQL injection by design: every value uses a placeholder, column names come only from a whitelist, and LIMIT and OFFSET are parsed as numbers and capped at 200.
- MySQL errors become meaningful HTTP statuses: duplicates become 409, foreign key violations become 400 or 409.
- The server stops at startup if the database cannot be reached.
- 15 InnoDB tables with 19 foreign keys, seed data, `db:schema`, `db:seed`, and `db:reset` scripts, and a Postman collection of 94 requests.

On the `main` branch, the frontend does not use this backend yet. Wiring them together, along with JWT login, email verification, and image uploads, is in progress on a separate branch.
