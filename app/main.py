from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine, Base

# Import Models (important for table creation)
from app.models.user import User
from app.models.loan import Loan
from app.models.ai_history import AIHistory

# Import Routers
from app.routes.dashboard import router as dashboard_router
from app.routes.auth import router as auth_router


# -------------------------
# Lifespan (replaces deprecated @app.on_event)
# -------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    print("✅ Database Tables Created Successfully")
    yield
    # Shutdown (nothing to do)


app = FastAPI(title="FinRelief AI 🚀", lifespan=lifespan)

# -------------------------
# CORS CONFIGURATION
# -------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Include Routers
# -------------------------
app.include_router(auth_router)
app.include_router(dashboard_router)


# -------------------------
# Root Route
# -------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to FinRelief AI 🚀", "status": "running"}


# -------------------------
# Test Database Connection
# -------------------------
@app.get("/test-db")
def test_db():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"database_status": "Connected ✅"}
