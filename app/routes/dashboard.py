from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import SessionLocal
from app.models.user import User
from app.models.loan import Loan
from app.models.ai_history import AIHistory

from app.utils.auth import get_current_user
from app.services.financial_engine import (
    calculate_financial_health,
    calculate_loan_priority,
    simulate_debt_timeline
)
from app.services.settlement_engine import calculate_settlement_probability
from app.services.ai_engine import generate_negotiation_strategy, generate_financial_strategy

router = APIRouter()

class ProfileUpdate(BaseModel):
    monthly_income: float
    monthly_expenses: float
    lump_sum_available: float = 0

class LoanCreate(BaseModel):
    lender_name: str
    outstanding_amount: float
    interest_rate: float
    emi: float
    overdue_months: int = 0
    loan_type: str = "NBFC"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.put("/update-profile")
def update_profile(profile: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        user.monthly_income = profile.monthly_income
        user.monthly_expenses = profile.monthly_expenses
        user.lump_sum_available = profile.lump_sum_available
        db.commit()
        return {"message": "Profile Updated Successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.post("/add-loan")
def add_loan(loan: LoanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        new_loan = Loan(
            user_id=current_user.id, lender_name=loan.lender_name,
            outstanding_amount=loan.outstanding_amount, interest_rate=loan.interest_rate,
            emi=loan.emi, overdue_months=loan.overdue_months, loan_type=loan.loan_type
        )
        db.add(new_loan)
        db.commit()
        db.refresh(new_loan)
        return {"message": "Loan Added Successfully", "id": new_loan.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add loan: {str(e)}")

@router.get("/loans")
def get_loans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Loan).filter(Loan.user_id == current_user.id).all()

@router.delete("/delete-loan/{loan_id}")
def delete_loan(loan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()
    return {"message": "Loan deleted successfully"}

@router.get("/dashboard-data")
def get_dashboard_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        loans = db.query(Loan).filter(Loan.user_id == user.id).all()
        health_data = calculate_financial_health(user, loans)
        emi_ratio = health_data.get("emi_ratio_percent", 0)
        priorities = calculate_loan_priority(loans, emi_ratio)
        settlements = calculate_settlement_probability(user, loans)
        loans_list = [{"id": l.id, "lender_name": l.lender_name, "outstanding_amount": l.outstanding_amount,
                       "interest_rate": l.interest_rate, "emi": l.emi, "overdue_months": l.overdue_months,
                       "loan_type": l.loan_type} for l in loans]
        return {
            "user": {"monthly_income": user.monthly_income, "monthly_expenses": user.monthly_expenses,
                     "lump_sum_available": user.lump_sum_available},
            "financial_summary": {"surplus": health_data.get("surplus", 0),
                                  "emi_ratio": health_data.get("emi_ratio_percent", 0),
                                  "debt_to_income": health_data.get("debt_to_income_percent", 0),
                                  "stress_level": health_data.get("stress_level", "Low"),
                                  "total_outstanding": health_data.get("total_outstanding", 0),
                                  "total_emi": health_data.get("total_emi", 0),
                                  "total_loans": health_data.get("total_loans", 0)},
            "loans": loans_list, "priorities": priorities, "settlements": settlements
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")

@router.get("/settlement-predictor")
def get_settlement_prediction(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    return {"settlements": calculate_settlement_probability(current_user, loans)}

@router.get("/ai-negotiation-strategy")
def get_ai_negotiation_strategy(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        loans = db.query(Loan).filter(Loan.user_id == user.id).all()
        if not loans:
            return {"strategy": "Please add at least one loan to generate an AI strategy."}
        financial_health = calculate_financial_health(user, loans)
        settlement_data = calculate_settlement_probability(user, loans)
        strategy = generate_negotiation_strategy(user, loans, financial_health, settlement_data)
        try:
            db.add(AIHistory(user_id=user.id, query_type="Negotiation Strategy", response=strategy))
            db.commit()
        except Exception:
            db.rollback()
        return {"strategy": strategy}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Strategy error: {str(e)}")

@router.get("/generate-negotiation-email/{loan_id}")
def generate_negotiation_email(loan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == user.id).first()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        settlement_data = calculate_settlement_probability(user, [loan])
        settlement_pct = settlement_data[0]["suggested_settlement_percentage"] if settlement_data else 50
        email_body = f"""Subject: Request for One-Time Settlement — Loan Account

To,
The Settlement Department,
{loan.lender_name}

Dear Sir/Madam,

I am writing to formally request a One-Time Settlement (OTS) for my outstanding loan account.

ACCOUNT DETAILS:
  Lender              : {loan.lender_name}
  Outstanding Amount  : Rs. {loan.outstanding_amount:,.2f}
  Monthly EMI         : Rs. {loan.emi:,.2f}
  Overdue Period      : {loan.overdue_months} months

FINANCIAL SITUATION:
Due to genuine financial hardship, I am unable to continue servicing my loan as per the original schedule. My monthly income is Rs. {user.monthly_income:,.2f} against total expenses of Rs. {user.monthly_expenses:,.2f}, leaving minimal surplus after essential needs.

SETTLEMENT PROPOSAL:
I respectfully propose a One-Time Settlement at {settlement_pct}% of the outstanding amount:
  Settlement Amount: Rs. {loan.outstanding_amount * settlement_pct / 100:,.2f}

I can arrange this payment within 30-45 days of receiving written settlement confirmation.

MY REQUESTS:
1. Written settlement offer with exact terms
2. Waiver of penal interest and charges
3. No-Objection Certificate (NOC) upon payment
4. Account closure with "Settled" status on credit report

I assure you of my genuine intention to resolve this matter promptly.

Yours sincerely,
[Your Full Name]
[Loan Account Number]
[Contact Number]
[Date]

---
Note: Payment will only be made after written settlement confirmation is received.
"""
        try:
            db.add(AIHistory(user_id=user.id, query_type="Negotiation Email", response=email_body))
            db.commit()
        except Exception:
            db.rollback()
        return {"email": email_body}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email error: {str(e)}")

@router.get("/ai-history")
def get_ai_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        records = db.query(AIHistory).filter(AIHistory.user_id == current_user.id).order_by(AIHistory.created_at.desc()).limit(50).all()
        return {"history": [{"id": r.id, "query_type": r.query_type, "response": r.response,
                              "created_at": r.created_at.isoformat() if r.created_at else ""} for r in records]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History error: {str(e)}")

@router.get("/financial-health")
def get_financial_health(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    return {**calculate_financial_health(current_user, loans),
            "monthly_income": current_user.monthly_income,
            "monthly_expenses": current_user.monthly_expenses}

@router.get("/debt-timeline")
def get_debt_timeline(extra_payment: float = 0, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    return simulate_debt_timeline(current_user, loans, extra_payment)
