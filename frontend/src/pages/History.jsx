import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    API.get("/ai-history")
      .then(r => { setHistory(r.data.history || []); setLoading(false); })
      .catch(e => { if (e.response?.status === 401) { localStorage.removeItem("token"); navigate("/login"); } setLoading(false); });
  }, []);

  const formatDate = (str) => {
    try { return new Date(str).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return str; }
  };

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-content"><div className="page-loading"><div className="ai-spinner"/><span>Loading history...</span></div></div></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">📜 AI History</h1>
          <p className="page-subtitle">Past AI analyses and negotiation strategies generated for you</p>
        </div>
        <div className="page-body">
          {history.length === 0 ? (
            <div className="card"><div className="empty-state">
              <div className="empty-state-icon">📜</div>
              <h3>No history yet</h3>
              <p>Generate AI strategies from the Settlement Predictor or Negotiation Email pages to see them here.</p>
              <button className="btn-primary" style={{width:"auto",marginTop:0}} onClick={() => navigate("/settlement-predictor")}>Go to Settlement Predictor</button>
            </div></div>
          ) : (
            <div>
              <div style={{marginBottom:16,fontSize:14,color:"var(--text-muted)"}}>{history.length} record{history.length !== 1 ? "s" : ""} found</div>
              {history.map((item, i) => (
                <div className="history-item" key={i}>
                  <div className="history-meta">
                    <span className="history-date">{formatDate(item.created_at)}</span>
                    <span className="history-tag">{item.query_type || "AI Analysis"}</span>
                  </div>
                  <div className="history-text">{item.response?.slice(0, 300)}...</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
