## Overview

A REST API for a discussion forum: users register and sign in, create threads, add comments, and delete their own comments. It is my submission for Dicoding's "Menjadi Back-End Developer Expert dengan JavaScript" class (the Automation Testing and Clean Architecture project), part of the AWS Back-End Academy.

## Features

- Registration, login, token refresh, and logout with JWT; refresh tokens are stored in the database and passwords are hashed with bcrypt.
- Creating threads and adding comments, both protected by JWT.
- Deleting a comment is allowed only for its owner (anyone else gets a 403) and is a soft delete: the comment stays stored and shows as "**komentar telah dihapus**" (comment deleted).
- A public thread detail endpoint with its comments sorted by time.
- A `/status` endpoint for health checks.

## Architecture

```flow
Client -> *Hapi API (JWT) -> Handler -> Use case -> Repository -> PostgreSQL
Use case -> Entity (validation)
```

The code follows Clean Architecture in four layers: Domains (entities that validate themselves, and abstract repositories), Applications (use cases), Infrastructures (PostgreSQL repositories, bcrypt, JWT, and the Hapi server), and Interfaces (one Hapi plugin per resource).

Use cases depend only on abstract repositories; the PostgreSQL implementations are wired in through a dependency injection container. Queries are parameterised, the schema is managed with node-pg-migrate migrations, and domain errors are translated into HTTP responses in one place (the `onPreResponse` hook).

## Testing

Tests are written with Jest across 42 test files. Use cases are tested with mocked repositories, while the repositories and HTTP endpoints are tested against a real PostgreSQL database.

## CI/CD

```flow
Pull request -> *GitHub Actions CI (PostgreSQL + Jest)
Push to main -> GitHub Actions CD -> AWS EC2 (pm2)
```

Every pull request to `main` runs the migrations and the full test suite on GitHub Actions with a PostgreSQL 15 service. Every push to `main` deploys to AWS EC2 over SSH and reloads the app with pm2. To make sure CI really blocks broken code, I deliberately broke a test in a pull request and then fixed it.
