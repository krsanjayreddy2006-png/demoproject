import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

const fmt = n => `₹${Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0})}`;

export default function SettlementPredictor() {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [aiStrategy, setAiStrategy] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      setLoadingData(true);
      const res = await API.get("/settlement-predictor");
      setSettlements(res.data.settlements || []);
    } catch (e) {
      if (e.response?.status === 401) { localStorage.removeItem("token"); navigate("/login"); }
      else setError("Failed to load settlements.");
    } finally { setLoadingData(false); }
  };

  const fetchAI = async () => {
    try {
      setLoadingAI(true); setAiStrategy("");
      const res = await API.get("/ai-negotiation-strategy");
      setAiStrategy(res.data.strategy || "No strategy generated.");
    } catch (e) {
      setAiStrategy("⚠️ Could not generate AI strategy. Please add loans and update your profile first.");
    } finally { setLoadingAI(false); }
  };

  if (loadingData) return <div className="app-layout"><Sidebar /><div className="main-content"><div className="page-loading"><div className="ai-spinner"/><span>Loading...</span></div></div></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">🎯 Settlement Predictor</h1>
          <p className="page-subtitle">AI-powered settlement estimates for each of your loans</p>
        </div>
        <div className="page-body">
          {error && <div className="error-msg">{error}</div>}

          {settlements.length === 0 ? (
            <div className="card"><div className="empty-state">
              <div className="empty-state-icon">🏦</div>
              <h3>No loans to predict</h3>
              <p>Add loans from your Dashboard to see settlement predictions.</p>
              <button className="btn-primary" style={{width:"auto",marginTop:0}} onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
            </div></div>
          ) : (
            <div className="settlements-grid" style={{marginBottom:28}}>
              {settlements.map((s, i) => {
                const saving = s.outstanding_amount - (s.outstanding_amount * s.suggested_settlement_percentage / 100);
                return (
                  <div className="settlement-card" key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div className="settlement-lender">{s.lender_name}</div>
                      <span className={`priority-badge ${s.risk_category}`}>{s.risk_category} Risk</span>
                    </div>
                    <div className="settlement-pct">{s.suggested_settlement_percentage}%</div>
                    <div className="settlement-pct-label">Suggested Settlement</div>
                    <div className="settlement-amount">{fmt(s.outstanding_amount * s.suggested_settlement_percentage / 100)}</div>
                    <div className="settlement-original">Original: {fmt(s.outstanding_amount)}</div>
                    <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:"8px 12px",fontSize:13,color:"var(--accent-green-light)"}}>
                      💰 Potential saving: {fmt(saving)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Strategy */}
          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div className="card-title">🤖 AI Negotiation Strategy</div>
                <div className="card-subtitle">Personalized advice based on your financial profile</div>
              </div>
              <button className="btn-primary" style={{width:"auto",marginTop:0}} onClick={fetchAI} disabled={loadingAI}>
                {loadingAI ? "Generating..." : aiStrategy ? "Regenerate" : "Generate Strategy"}
              </button>
            </div>
            {loadingAI && <div className="ai-loading"><div className="ai-spinner"/><span>AI is analyzing your financial profile...</span></div>}
            {aiStrategy && !loadingAI && (
              <div className="ai-box"><div className="ai-content">{aiStrategy}</div></div>
            )}
            {!aiStrategy && !loadingAI && (
              <div style={{textAlign:"center",padding:"32px",color:"var(--text-muted)",fontSize:14}}>
                Click "Generate Strategy" to get personalized AI negotiation advice
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
