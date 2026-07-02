import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const rights = [
  { icon: "🚫", color: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", title: "No Harassment", text: "Recovery agents CANNOT call you before 7 AM or after 7 PM. Threats, abuse, or use of force is illegal under RBI guidelines." },
  { icon: "📋", color: "rgba(37,99,235,0.12)", border: "rgba(37,99,235,0.25)", title: "Right to Statement", text: "You have the right to receive a full and detailed loan account statement at any time, free of charge." },
  { icon: "🤝", color: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", title: "Settlement Negotiation", text: "You can negotiate a one-time settlement with your lender. Lenders are allowed to accept partial payments to close an NPA account." },
  { icon: "🔔", color: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", title: "Advance Notice Required", text: "Lenders must give you 60-day advance notice before classifying your account as NPA (Non-Performing Asset)." },
  { icon: "⚖️", color: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", title: "Grievance Redressal", text: "Every bank must have a Grievance Redressal Officer. You can escalate to RBI Banking Ombudsman if unresolved in 30 days." },
  { icon: "📜", color: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", title: "NOC After Settlement", text: "After full payment or settlement, you are legally entitled to a No-Objection Certificate (NOC) from the lender." },
  { icon: "🏠", color: "rgba(37,99,235,0.12)", border: "rgba(37,99,235,0.25)", title: "Property Protection", text: "Lenders cannot seize property without following SARFAESI Act procedures. You have the right to challenge auction notices." },
  { icon: "📱", color: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", title: "Privacy Rights", text: "Recovery agents cannot contact your family, employer, or neighbors to pressure you for repayment." },
];

const steps = [
  { num: "01", title: "Document Everything", desc: "Keep records of all calls, letters, and communications from lenders and recovery agents." },
  { num: "02", title: "Request Written Settlement", desc: "Ask for any settlement offer in writing before making any payment." },
  { num: "03", title: "File a Complaint", desc: "If harassed, file a complaint with RBI Ombudsman at cms.rbi.org.in or call 14448." },
  { num: "04", title: "Get Legal Help", desc: "Consult a debt settlement lawyer for large amounts. Many offer free initial consultations." },
];

export default function KnowYourRights() {
  const navigate = useNavigate();
  useEffect(() => { if (!localStorage.getItem("token")) navigate("/login"); }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">⚖️ Know Your Rights</h1>
          <p className="page-subtitle">RBI guidelines and legal protections for Indian borrowers</p>
        </div>
        <div className="page-body">
          {/* Hero banner */}
          <div style={{background:"linear-gradient(135deg,rgba(37,99,235,0.12),rgba(16,185,129,0.08))",border:"1px solid rgba(37,99,235,0.2)",borderRadius:20,padding:"28px 32px",marginBottom:28}}>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:700,marginBottom:8}}>You Have Rights as a Borrower 💪</h2>
            <p style={{color:"var(--text-secondary)",fontSize:14,lineHeight:1.7,maxWidth:600}}>
              Under RBI's Fair Practices Code and the SARFAESI Act, lenders and recovery agents must follow strict rules. Knowing these rights protects you from illegal harassment and helps you negotiate from a position of strength.
            </p>
          </div>

          <div className="rights-grid" style={{marginBottom:28}}>
            {rights.map((r, i) => (
              <div className="right-card" key={i} style={{borderColor:r.border}}>
                <div className="right-icon" style={{background:r.color,border:`1px solid ${r.border}`}}>{r.icon}</div>
                <div className="right-card-title">{r.title}</div>
                <div className="right-card-text">{r.text}</div>
              </div>
            ))}
          </div>

          {/* Action Steps */}
          <div className="card">
            <div className="card-title">🛡️ What To Do If Harassed</div>
            <div className="card-subtitle">Step-by-step protection guide</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
              {steps.map((s, i) => (
                <div key={i} style={{padding:"20px",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:12}}>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:28,fontWeight:700,color:"rgba(255,255,255,0.08)",marginBottom:8}}>{s.num}</div>
                  <div style={{fontFamily:"var(--font-display)",fontWeight:600,fontSize:15,marginBottom:6}}>{s.title}</div>
                  <div style={{fontSize:13,color:"var(--text-secondary)",lineHeight:1.6}}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RBI Contact */}
          <div style={{marginTop:20,padding:"20px 24px",background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontWeight:600,marginBottom:4}}>📞 RBI Banking Ombudsman</div>
              <div style={{fontSize:13,color:"var(--text-secondary)"}}>Toll-free: <strong>14448</strong> · Website: <strong>cms.rbi.org.in</strong></div>
            </div>
            <a href="https://cms.rbi.org.in" target="_blank" rel="noreferrer" className="btn-primary" style={{textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8,width:"auto",marginTop:0,padding:"10px 20px"}}>
              File Complaint →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
