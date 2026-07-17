# Digital Business Card + RFID/NFC Tap Card

## Backend (Spring Boot + PostgreSQL)

### 1) Run PostgreSQL

```bash
createdb business_card
```

Or with Docker:

```bash
docker run --name business-card-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=business_card -p 5432:5432 -d postgres:16
```

Default credentials used in `backend/src/main/resources/application.properties`:

- username: `postgres`
- password: `postgres`

### 2) Configure credentials

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` or `GEMINI_API_KEY` | AI card scan |
| `SELCOM_API_KEY` / `SELCOM_API_SECRET` / `SELCOM_VENDOR` | Live Selcom payments (optional; demo checkout if empty) |
| `SCAN_FREE_LIMIT` | Free AI scans before subscribe (default `2`) |
| `SELCOM_AMOUNT_TZS` | Subscription price in TZS (default `10000`) |
| `FRONTEND_BASE_URL` / `PUBLIC_BASE_URL` | Payment redirect + webhook base URLs |

`.env` is gitignored. Do not commit secrets.

### 3) Run backend

```bash
cd backend
./run.sh
# or: mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

## Frontend (React + Tailwind)

### 4) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Default Seed Data

- Card slug: `japhari-mbaru`
- Tag code: `TAG12345`
- Admin login:
  - username: `admin`
  - password: `admin123`

## Test URLs

- `http://localhost:5173/u/japhari-mbaru`
- `http://localhost:8080/c/TAG12345`
- `http://localhost:5173/admin/login`

## Notes

- CORS is set to allow `http://localhost:5173`.
- vCard download is available at `GET /api/public/profile/{slug}/vcard`.
