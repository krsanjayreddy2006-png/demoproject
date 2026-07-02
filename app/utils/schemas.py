from pydantic import BaseModel, EmailStr
from typing import Optional


# -------------------------
# User Schemas
# -------------------------

class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -------------------------
# Loan Schema
# -------------------------

class LoanCreate(BaseModel):
    lender_name: str
    outstanding_amount: float
    interest_rate: float
    emi: float
    overdue_months: int
    loan_type: str


# -------------------------
# Financial Update Schema
# -------------------------

class FinancialUpdate(BaseModel):
    monthly_income: float
    monthly_expenses: float
    lump_sum_available: Optional[float] = 0


# -------------------------
# AI Strategy Schema
# -------------------------

class AIStrategyRequest(BaseModel):
    total_debt: float
    monthly_income: float
    monthly_expenses: float
    interest_rate: float
