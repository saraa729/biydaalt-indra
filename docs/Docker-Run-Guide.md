# Docker Run Guide

This repository runs as a Docker Compose stack with:

- `api-gateway` on port `3000`
- `backend` on port `3008`
- `auth-service` on port `3006`
- `user-service` on port `3007`
- `student-service` on port `3001`
- `teacher-service` on port `3002`
- `program-service` on port `3003`
- `material-service` on port `3004`
- `contact-service` on port `3005`
- `db` on `3307` locally

## 1. Prerequisites

- Docker Desktop installed and running
- Ports `3000` to `3008` free on your machine
- The root `.env` file present in the repository

## 2. Start The Stack

From the repository root:

```bash
docker compose up -d --build
```

What this does:

- builds every service image
- starts MariaDB
- starts the gateway and all services
- runs backend migrations from the backend container entrypoint

## 3. Check Service Health

Use either browser or curl:

```bash
curl http://localhost:3000/health
curl http://localhost:3008/health
```

If those return a JSON success response, the stack is up.

## 4. Seed Initial Data

The database needs the seed step once after the first clean start.

Run:

```bash
docker compose exec backend npm run seed
```

This seed gives you:

- roles
- a default super admin user
- sample programs

Default credentials from seed:

- email: `admin@indracyber.mn`
- password: `Admin@123`

## 5. Import Postman

Import these files into Postman:

- `postman/IndraCyber-Institute.postman_collection.json`
- `postman/IndraCyber-Institute.postman_environment.json`

Then select the `IndraCyber Institute Local` environment.

Recommended flow:

1. Send `Auth -> Login`
2. Postman saves the returned token into the `token` environment variable
3. Use the protected requests in the collection

## 6. Main Base URLs

- Gateway: `http://localhost:3000`
- Backend: `http://localhost:3008`

Use the gateway for normal API testing.
Use backend directly only when you want to bypass the gateway.

## 7. Common Requests

- Login: `POST /api/auth/login`
- Dashboard: `GET /api/dashboard/me`
- Log Monitoring: `GET /api/logs` and `GET /api/logs/stats`
- Service Monitoring: `GET /api/monitoring/overview` and `GET /api/monitoring/services`
- Attendance: `GET /api/attendance/me`
- Grades: `GET /api/grades/me`
- Backups: `GET /api/backups`

## 8. Reset Everything

If you want a clean database reset:

```bash
docker compose down -v
docker compose up -d --build
docker compose exec backend npm run seed
```

## 9. Useful Logs

```bash
docker compose logs -f backend
docker compose logs -f api-gateway
```

If a service does not start, check its logs first.

## 10. Notes

- The backup system stores JSON snapshots in the `backups` directory.
- The gateway proxies most public API traffic.
- The backend service serves the LMS/admin routes and the JSON backup endpoints.
- Monitoring endpoints are protected and should be used with an admin token.
