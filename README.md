# InterviewTop

A platform for browsing, searching, and sharing tech interview experiences. Interview posts are scraped from LeetCode Discuss, processed with LLMs for structured extraction, and served through a modern web application.

## Tech Stack

| Layer       | Technology                                      |
| ----------- | ----------------------------------------------- |
| **Frontend**| React 18 · TypeScript · Vite · Tailwind · shadcn/ui |
| **Backend** | FastAPI · Motor (async MongoDB) · Pydantic v2   |
| **Database**| MongoDB Atlas                                   |
| **Auth**    | JWT (email/password) · Google OAuth 2.0         |
| **Scripts** | Python (scraping + LLM processing via Gemini, OpenAI, DeepSeek) |

## Project Structure

```
InterviewTop/
├── backend/          # FastAPI REST API
│   └── app/          # Application package (routes, models, auth, config)
├── frontend/         # React + Vite SPA
│   └── src/          # Components, pages, hooks, API client
├── scripts/          # Data scraping & LLM processing pipelines
└── docs/             # Setup guides and documentation
```

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas connection string

### Backend

```bash
cd backend
cp .env.example .env        # fill in your values
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
cp .env.example .env        # fill in your values
npm install
npm run dev
```

### Scripts

See [scripts/README.md](scripts/README.md) for details on running the data pipeline.

## Documentation

- [Setup Guide](docs/setup.md) — detailed backend auth setup & API usage
- [Google OAuth Setup](docs/google_auth_setup.md) — configuring Google Sign-In
