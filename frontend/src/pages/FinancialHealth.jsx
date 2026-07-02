import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

const fmt = n => `₹${Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0})}`;
const fmtPct = n => `${Number(n||0).toFixed(1)}%`;

export default function FinancialHealth() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    API.get("/dashboard-data").then(r => { setData(r.data); setLoading(false); })
      .catch(e => { if (e.response?.status===401) { localStorage.removeItem("token"); navigate("/login"); } setLoading(false); });
  }, []);

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-content"><div className="page-loading"><div className="ai-spinner"/><span>Loading...</span></div></div></div>;

  const fs = data?.financial_summary || {};
  const u = data?.user || {};
  const emiRatio = Math.min(Number(fs.emi_ratio||0), 100);
  const dtiRatio = Math.min(Number(fs.debt_to_income||0), 100);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">💚 Financial Health</h1>
          <p className="page-subtitle">Detailed analysis of your debt stress and repayment capacity</p>
        </div>
        <div className="page-body">
          {/* Stress Level Banner */}
          <div className="card" style={{marginBottom:24,borderColor:fs.stress_level==="High"?"rgba(239,68,68,0.3)":fs.stress_level==="Medium"?"rgba(245,158,11,0.3)":"rgba(16,185,129,0.3)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div className="card-title">Overall Financial Stress</div>
                <p style={{color:"var(--text-secondary)",fontSize:14,marginTop:4}}>
                  {fs.stress_level==="High" ? "⚠️ High stress detected. Consider debt consolidation or settlement." :
                   fs.stress_level==="Medium" ? "⚡ Moderate stress. Monitor EMI obligations carefully." :
                   "✅ Low stress. You're managing debt well."}
                </p>
              </div>
              <span className={`stress-badge ${fs.stress_level||"Low"}`} style={{fontSize:16,padding:"8px 20px"}}>
                {fs.stress_level || "Low"}
              </span>
            </div>
          </div>

          <div className="stats-grid" style={{marginBottom:24}}>
            <div className="stat-card blue">
              <div className="stat-label">Monthly Income</div>
              <div className="stat-value neutral">{fmt(u.monthly_income)}</div>
            </div>
            <div className="stat-card red">
              <div className="stat-label">Monthly Expenses</div>
              <div className="stat-value neutral">{fmt(u.monthly_expenses)}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Monthly Surplus</div>
              <div className={`stat-value ${(fs.surplus||0)>=0?"positive":"negative"}`}>{fmt(fs.surplus)}</div>
            </div>
            <div className="stat-card purple">
              <div className="stat-label">Lump Sum Available</div>
              <div className="stat-value neutral">{fmt(u.lump_sum_available)}</div>
            </div>
          </div>

          {/* Ratio Meters */}
          <div className="grid-2" style={{gap:16}}>
            <div className="health-meter">
              <div className="meter-label">
                <span className="meter-name">EMI-to-Income Ratio</span>
                <span className="meter-value">{fmtPct(fs.emi_ratio)}</span>
              </div>
              <div className="progress-bar-track">
                <div className={`progress-bar-fill ${emiRatio>50?"red":emiRatio>30?"amber":"green"}`} style={{width:`${emiRatio}%`}}/>
              </div>
              <p style={{fontSize:12,color:"var(--text-muted)",marginTop:8}}>
                Ideal: Below 30% · Yours: {fmtPct(fs.emi_ratio)}
                {emiRatio>50?" — Critical: EMIs consuming too much income":emiRatio>30?" — Warning: High EMI burden":"  — Healthy range"}
              </p>
            </div>
            <div className="health-meter">
              <div className="meter-label">
                <span className="meter-name">Debt-to-Income Ratio</span>
                <span className="meter-value">{fmtPct(fs.debt_to_income)}</span>
              </div>
              <div className="progress-bar-track">
                <div className={`progress-bar-fill ${dtiRatio>80?"red":dtiRatio>50?"amber":"green"}`} style={{width:`${Math.min(dtiRatio,100)}%`}}/>
              </div>
              <p style={{fontSize:12,color:"var(--text-muted)",marginTop:8}}>
                Ideal: Below 50% · Yours: {fmtPct(fs.debt_to_income)}
                {dtiRatio>80?" — Critical: Very high total debt":dtiRatio>50?" — Warning: Debt load is high":"  — Manageable range"}
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="card" style={{marginTop:24}}>
            <div className="card-title">💡 Improvement Tips</div>
            <div className="card-subtitle">Based on your financial profile</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {icon:"📉",tip:"Reduce discretionary spending to increase surplus"},
                {icon:"🏦",tip:"Contact lenders for EMI restructuring options"},
                {icon:"💰",tip:"Use lump sum for highest-interest loan first"},
                {icon:"📋",tip:"Track all expenses to find savings opportunities"},
              ].map((t,i) => (
                <div key={i} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20}}>{t.icon}</span>
                  <span style={{fontSize:13,color:"var(--text-secondary)",lineHeight:1.6}}>{t.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
