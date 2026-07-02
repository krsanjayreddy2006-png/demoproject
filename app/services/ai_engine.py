import os
import json
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")


def _call_gemini(prompt: str) -> str:
    """Call Google Gemini API if key is available, otherwise use rule-based fallback."""
    if not GOOGLE_API_KEY:
        return None  # Will fall through to fallback

    try:
        import google.generativeai as genai
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text
    except ImportError:
        return None
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None


def _negotiation_fallback(user, loans, financial_health, settlement_data) -> str:
    """Rule-based negotiation strategy when AI is unavailable."""
    stress = financial_health.get("stress_level", "Low")
    surplus = financial_health.get("surplus", 0)
    emi_ratio = financial_health.get("emi_ratio_percent", 0)

    strategy = f"""📋 FINANCIAL NEGOTIATION STRATEGY
{'='*50}

💰 YOUR FINANCIAL SNAPSHOT:
• Monthly Surplus: ₹{surplus:,.2f}
• EMI Burden: {emi_ratio:.1f}% of income
• Stress Level: {stress}

🎯 NEGOTIATION PLAN:
"""

    for loan in settlement_data:
        settlement_pct = loan['suggested_settlement_percentage']
        strategy += f"""
🏦 {loan['lender_name'].upper()}:
  • Outstanding: ₹{loan['outstanding_amount']:,.2f}
  • Settlement Offer: {settlement_pct}% = ₹{loan['outstanding_amount'] * settlement_pct / 100:,.2f}
  • Risk Level: {loan['risk_category']}
  • Approach: {"Lead with hardship letter + lump sum offer" if loan['risk_category'] == 'High' else "Negotiate EMI reduction first"}
"""

    strategy += """
📝 KEY TALKING POINTS:
1. Emphasize genuine financial hardship with documentation
2. Request interest waiver or reduction as part of settlement
3. Get ALL settlement terms in writing before paying
4. Ask for NOC (No-Objection Certificate) post-settlement
5. Negotiate "Full & Final Settlement" status for credit report

⚠️ DOCUMENTS TO REQUEST:
• Original loan agreement
• Complete account statement
• Written settlement offer letter
• NOC template

⏱️ TIMELINE: 30-90 days for full negotiation and settlement

Note: Add your GOOGLE_API_KEY to .env for AI-powered personalized advice.
"""
    return strategy


def generate_negotiation_strategy(user, loans, financial_health, settlement_data) -> str:
    """Generate negotiation strategy using Gemini AI or rule-based fallback."""

    loan_summary = "\n".join([
        f"- {loan['lender_name']}: Outstanding ₹{loan['outstanding_amount']:.2f}, "
        f"Interest {loan['interest_rate']}%, EMI ₹{loan['emi']:.2f}, "
        f"Settlement: {loan['suggested_settlement_percentage']}%, Risk: {loan['risk_category']}"
        for loan in settlement_data
    ]) or "No loans available."

    prompt = f"""You are a professional financial negotiation advisor for Indian borrowers.

User Financial Profile:
- Monthly Income: ₹{user.monthly_income:.2f}
- Monthly Expenses: ₹{user.monthly_expenses:.2f}
- Surplus: ₹{financial_health.get('surplus', 0):.2f}
- EMI Ratio: {financial_health.get('emi_ratio_percent', 0):.2f}%
- Debt-to-Income: {financial_health.get('debt_to_income_percent', 0):.2f}%
- Stress Level: {financial_health.get('stress_level', 'Unknown')}
- Total Outstanding: ₹{financial_health.get('total_outstanding', 0):.2f}

Loans:
{loan_summary}

Generate a comprehensive negotiation strategy including:
1. Specific approach for each lender
2. Suggested opening settlement offer percentages
3. Key talking points
4. Documents to collect
5. Risk mitigation steps
6. Expected timeline

Be specific, actionable, and supportive. Format clearly with sections."""

    result = _call_gemini(prompt)
    if result:
        return result

    return _negotiation_fallback(user, loans, financial_health, settlement_data)


def generate_financial_strategy(
    total_debt: float,
    monthly_income: float,
    monthly_expenses: float,
    interest_rate: float
) -> dict:
    """Generate financial strategy using Gemini AI or rule-based fallback."""

    surplus = monthly_income - monthly_expenses
    debt_to_income = (total_debt / monthly_income * 100) if monthly_income > 0 else 0

    # Determine health
    if debt_to_income < 30 and surplus > 0:
        health = "Good"
    elif debt_to_income < 60:
        health = "Moderate"
    else:
        health = "Poor"

    prompt = f"""You are a financial advisor for Indian borrowers.

Financial Data:
- Total Debt: ₹{total_debt:,.2f}
- Monthly Income: ₹{monthly_income:,.2f}
- Monthly Expenses: ₹{monthly_expenses:,.2f}
- Monthly Surplus: ₹{surplus:,.2f}
- Interest Rate: {interest_rate}%
- Debt-to-Income: {debt_to_income:.1f}%

Provide a JSON response with these exact keys:
{{
  "financial_health": "Good/Moderate/Poor",
  "debt_strategy": "Specific debt payoff strategy",
  "budget_tips": ["tip1", "tip2", "tip3"],
  "negotiation_advice": "Advice for negotiating with creditors"
}}

Return ONLY valid JSON, no markdown."""

    result = _call_gemini(prompt)
    if result:
        try:
            # Clean up markdown code blocks if present
            clean = result.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except json.JSONDecodeError:
            pass

    # Rule-based fallback
    months_to_payoff = int(total_debt / max(surplus, 1)) if surplus > 0 else 999

    budget_tips = []
    if surplus < monthly_income * 0.2:
        budget_tips.append("Cut discretionary spending by 20% to boost debt payments")
    budget_tips.append("Use the avalanche method: pay highest-interest debt first")
    budget_tips.append("Consider selling unused assets to make lump-sum payments")
    budget_tips.append("Avoid new credit until existing debt is under control")

    return {
        "financial_health": health,
        "debt_strategy": (
            f"With ₹{surplus:,.2f} monthly surplus, you can clear ₹{total_debt:,.2f} debt "
            f"in approximately {months_to_payoff} months. Focus on the highest-interest loan first "
            f"(avalanche method) to minimize total interest paid."
        ),
        "budget_tips": budget_tips[:3],
        "negotiation_advice": (
            f"With {debt_to_income:.0f}% debt-to-income ratio, you have "
            f"{'strong' if debt_to_income > 60 else 'moderate'} negotiating leverage. "
            "Request interest rate reduction or EMI holiday first, then settlement."
        )
    }
