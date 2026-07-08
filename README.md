# 💰 AI Powered Debt Relief & Financial Recovery Platform — Setup Guide

## ✅ Bugs Fixed
- `datetime.utcnow()` → `datetime.now(timezone.utc)` (deprecated warning removed)
- `@app.on_event("startup")` → `lifespan` context manager (FastAPI modern pattern)
- Removed broken Ollama dependency → replaced with Google Gemini AI + smart fallback
- Fixed missing `query_type` / `response` fields in `AIHistory` model
- Added missing API routes: `/add-loan`, `/ai-negotiation-strategy`, `/ai-history`, `/generate-negotiation-email/{id}`
- Fixed `history_service` import error (removed, inlined into routes)
- CORS now includes all common dev ports
- Full frontend rebuilt with startup-quality dark UI

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Optional: For AI features, also run:
pip install google-generativeai
```

### 2. Configure Environment

Edit `.env` file:
```
DATABASE_URL=postgresql://postgres:YourPassword@localhost:5432/finrelief_db
GOOGLE_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_key_here
```

**Get a FREE Gemini API key at:** https://aistudio.google.com/app/apikey

> Note: The app works without a Gemini key — it uses smart rule-based fallback automatically.

### 3. Create PostgreSQL Database

```sql
CREATE DATABASE finrelief_db;
```

### 4. Run Backend

```bash
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://127.0.0.1:8000
API Docs at: http://127.0.0.1:8000/docs

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 📁 Project Structure

```
FinReliefAI/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # DB connection
│   ├── models/
│   │   ├── user.py
│   │   ├── loan.py
│   │   └── ai_history.py       # Fixed: added query_type, response fields
│   ├── routes/
│   │   ├── auth.py              # Register / Login
│   │   └── dashboard.py        # All dashboard endpoints
│   ├── services/
│   │   ├── ai_engine.py        # Fixed: Gemini AI + fallback (no more Ollama)
│   │   ├── financial_engine.py
│   │   └── settlement_engine.py
│   └── utils/
│       ├── auth.py              # Fixed: JWT + bcrypt
│       └── schemas.py
├── frontend/
│   └── src/
│       ├── App.jsx              # Router
│       ├── App.css              # Full dark UI styles
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── FinancialHealth.jsx
│       │   ├── SettlementPredictor.jsx
│       │   ├── NegotiationEmail.jsx
│       │   ├── KnowYourRights.jsx
│       │   └── History.jsx
│       ├── components/
│       │   └── Sidebar.jsx
│       └── services/
│           └── api.js           # Axios with auth interceptor
├── .env                         # Your config (do not commit)
├── requirements.txt             # Updated (no Ollama)
└── README.md
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Get JWT token |
| GET | `/dashboard-data` | Full dashboard data |
| PUT | `/update-profile` | Update income/expenses |
| POST | `/add-loan` | Add a loan |
| DELETE | `/delete-loan/{id}` | Delete a loan |
| GET | `/settlement-predictor` | Settlement predictions |
| GET | `/ai-negotiation-strategy` | AI strategy |
| GET | `/generate-negotiation-email/{id}` | Generate letter |
| GET | `/ai-history` | View past AI outputs |
| GET | `/financial-health` | Health metrics |

---

## 💡 Tips

- Works **without** a Gemini API key (rule-based fallback)
- Add `GOOGLE_API_KEY` to `.env` for personalized AI advice
- Database tables are auto-created on first run
- JWT tokens expire after 2 hours
