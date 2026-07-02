import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

export default function NegotiationEmail() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    API.get("/dashboard-data")
      .then(r => setLoans(r.data.loans || []))
      .catch(e => { if (e.response?.status === 401) { localStorage.removeItem("token"); navigate("/login"); }});
  }, []);

  const generateEmail = async () => {
    if (!selectedLoan) { alert("Please select a loan first."); return; }
    try {
      setLoading(true); setEmail("");
      const res = await API.get(`/generate-negotiation-email/${selectedLoan}`);
      setEmail(res.data.email || "No email generated.");
    } catch (e) {
      setEmail("⚠️ Failed to generate email. Please try again.");
    } finally { setLoading(false); }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">✉️ Negotiation Email Generator</h1>
          <p className="page-subtitle">AI-crafted professional letters to send to your lenders</p>
        </div>
        <div className="page-body">
          <div className="card" style={{marginBottom:20}}>
            <div className="card-title">Generate a Negotiation Letter</div>
            <div className="card-subtitle">Select a loan and we'll write a professional settlement request</div>
            <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div className="field-group" style={{flex:1,minWidth:200,marginBottom:0}}>
                <label className="field-label">Select Loan</label>
                <select className="field-input" value={selectedLoan} onChange={e => setSelectedLoan(e.target.value)}>
                  <option value="">-- Choose a lender --</option>
                  {loans.map(l => <option key={l.id} value={l.id}>{l.lender_name} — ₹{Number(l.outstanding_amount).toLocaleString("en-IN")}</option>)}
                </select>
              </div>
              <button className="btn-primary" style={{width:"auto",marginTop:0,whiteSpace:"nowrap",padding:"12px 24px"}} onClick={generateEmail} disabled={loading || !selectedLoan}>
                {loading ? "Generating..." : "✉️ Generate Letter"}
              </button>
            </div>
          </div>

          {loading && <div className="card"><div className="ai-loading"><div className="ai-spinner"/><span>Writing your negotiation letter...</span></div></div>}

          {email && !loading && (
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div className="card-title">📄 Generated Letter</div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn-secondary" onClick={copyEmail}>{copied ? "✅ Copied!" : "📋 Copy"}</button>
                </div>
              </div>
              <div className="ai-box">
                <pre style={{whiteSpace:"pre-wrap",fontFamily:"var(--font-body)",fontSize:14,lineHeight:1.8,color:"var(--text-primary)"}}>{email}</pre>
              </div>
              <div style={{marginTop:16,padding:"12px 16px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,fontSize:13,color:"#fcd34d"}}>
                ⚠️ <strong>Tip:</strong> Review and personalize this letter before sending. Add your full name, address, and loan account number.
              </div>
            </div>
          )}

          {!email && !loading && (
            <div className="card"><div className="empty-state">
              <div className="empty-state-icon">✉️</div>
              <h3>No letter generated yet</h3>
              <p>Select a loan above and click "Generate Letter" to create a professional negotiation email.</p>
            </div></div>
          )}
        </div>
      </div>
    </div>
  );
}
