# Code Explainer Enterprise

A production-ready GenAI application that provides deep architectural insights, Big-O complexity analysis, and generates robust enterprise-grade JUnit tests for code snippets.

## Architecture

This project is built using a modern, decoupled Full-Stack architecture:

- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS + Framer Motion.
- **Backend:** FastAPI (Python) + Pydantic validation + Google Generative AI (Gemini 2.5 Flash).
- **Deployment:** Docker & Docker Compose for instantaneous containerized environments.

## Features

- ⚡️ **Real-time Code Analysis:** Submit code in Java, Python, TS, JS, Go, or C++.
- 🧠 **GenAI Pipeline:** Structured output parsing guarantees accurate JSON structures directly from the LLM.
- 🎨 **Elite UI/UX:** A beautiful, dark-themed, glassmorphic interface inspired by top-tier SaaS products (Vercel, Linear, Stripe).
- 🛠 **Monaco Editor:** Integrated VS Code-like code editing experience right in the browser.
- 🛡 **Security Scanning:** Proactively identifies code smells and potential security vulnerabilities.

## Quick Start (Docker)

1. Clone the repository and navigate to the project directory.
2. Create a `.env` file in the root based on `.env.example`:
   ```bash
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```
3. Run with Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
4. Access the web interface at [http://localhost:3000](http://localhost:3000)
5. Access the API documentation at [http://localhost:8000/api/v1/openapi.json](http://localhost:8000/api/v1/openapi.json)

## Local Development

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to start analyzing code!
