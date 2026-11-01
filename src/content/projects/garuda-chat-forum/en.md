The final project of the AWS Back-End Academy: the backend for a gaming community's discussion forum. It offers authentication, threads, and comments through a RESTful API, and the focus is on how it is built.

The code follows Clean Architecture, so the business rules do not depend on the framework or the database, and it was developed test-first with Jest. The API is built with Hapi and JWT, data lives in PostgreSQL with node-pg-migrate migrations, and passwords are hashed with bcrypt.

```flow
Client -> *Hapi API (JWT) -> Use case -> Repository -> PostgreSQL
GitHub Actions (CI/CD) -> AWS EC2
```

A GitHub Actions CI/CD pipeline runs the tests before deploying to Amazon EC2, with the database on Amazon RDS.
