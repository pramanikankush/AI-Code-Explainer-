# Code Explainer Enterprise

Production-ready GenAI app for code understanding with architecture insights, complexity analysis, and generated JUnit tests.

## Jump To

- [What You Get](#what-you-get)
- [Live Endpoints](#live-endpoints)
- [Quick Start with Docker](#quick-start-with-docker)
- [Run Locally](#run-locally)
- [Try the API in 30 Seconds](#try-the-api-in-30-seconds)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## What You Get

- Real-time analysis for Java, Python, TypeScript, JavaScript, Go, and C++ snippets.
- Structured LLM output mapped to strict response schemas.
- Architecture breakdown and Big-O reasoning.
- Security smell hints and actionable refactor suggestions.
- Generated JUnit-style tests for enterprise workflows.

## Live Endpoints

- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health
- OpenAPI docs: http://localhost:8000/api/v1/openapi.json

## Quick Start with Docker

### 1) Clone and move into the project

```bash
git clone https://github.com/pramanikankush/AI-Code-Explainer-.git
cd AI-Code-Explainer-
```

### 2) Configure environment

Create `.env` in the project root:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3) Build and start

```bash
docker compose up --build -d
```

### 4) Verify

```bash
docker compose ps
```

Open http://localhost:3000 and submit a code snippet.

## Run Locally

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install and run:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## Try the API in 30 Seconds

Send a request to analyze code:

```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
   -H "Content-Type: application/json" \
   -d '{
      "code": "public class Sum { int add(int a,int b){ return a+b; } }",
      "language": "java",
      "mode": "expert"
   }'
```

Expected response sections:

- `explanation`
- `architecture`
- `time_complexity`
- `space_complexity`
- `junit_tests`
- `security_vulnerabilities`
- `refactor_suggestions`

## Tech Stack

- Frontend: Next.js 14, React, Tailwind CSS, Framer Motion
- Backend: FastAPI, Pydantic, Google Generative AI
- Infra: Docker, Docker Compose

## Project Structure

```text
code-explainer/
   backend/
      api/
      core/
      models/
      services/
      main.py
   frontend/
      src/
   docker-compose.yml
   .env.example
   explain.py
   test_e2e.py
```

## Troubleshooting

### `GOOGLE_API_KEY` not set

- Ensure `.env` exists in the root.
- Ensure key name is exactly `GOOGLE_API_KEY`.
- Restart backend container/app after changing `.env`.

### Frontend cannot reach backend

- Confirm backend is running on port `8000`.
- Confirm frontend uses `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`.
- Check CORS setting in backend config.

### Docker warning about `version` in compose

- New Docker Compose ignores the `version` field.
- This warning is non-blocking.

## License

For personal and educational use unless otherwise specified by the repository owner.
