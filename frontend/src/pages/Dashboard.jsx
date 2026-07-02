import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import "../App.css";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  const [loanForm, setLoanForm] = useState({
    lender_name: "", outstanding_amount: "", interest_rate: "",
    emi: "", overdue_months: "0", loan_type: "NBFC"
  });
  const [profileForm, setProfileForm] = useState({
    monthly_income: "", monthly_expenses: "", lump_sum_available: ""
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError("");
      const res = await API.get("/dashboard-data");
      setData(res.data);
      const u = res.data.user;
      setProfileForm({
        monthly_income: u.monthly_income || "",
        monthly_expenses: u.monthly_expenses || "",
        lump_sum_available: u.lump_sum_available || ""
      });
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem("token"); navigate("/login"); }
      else setError("Failed to load dashboard data.");
    } finally { setLoading(false); }
  };

  const submitLoan = async () => {
    if (!loanForm.lender_name || !loanForm.outstanding_amount || !loanForm.interest_rate || !loanForm.emi) {
      setFormMsg("Please fill all required fields."); return;
    }
    try {
      setSubmitting(true); setFormMsg("");
      await API.post("/add-loan", {
        lender_name: loanForm.lender_name,
        outstanding_amount: parseFloat(loanForm.outstanding_amount),
        interest_rate: parseFloat(loanForm.interest_rate),
        emi: parseFloat(loanForm.emi),
        overdue_months: parseInt(loanForm.overdue_months),
        loan_type: loanForm.loan_type,
      });
      setShowLoanModal(false);
      setLoanForm({ lender_name: "", outstanding_amount: "", interest_rate: "", emi: "", overdue_months: "0", loan_type: "NBFC" });
      fetchData();
    } catch (err) {
      setFormMsg(err.response?.data?.detail || "Failed to add loan.");
    } finally { setSubmitting(false); }
  };

  const submitProfile = async () => {
    try {
      setSubmitting(true); setFormMsg("");
      await API.put("/update-profile", {
        monthly_income: parseFloat(profileForm.monthly_income) || 0,
        monthly_expenses: parseFloat(profileForm.monthly_expenses) || 0,
        lump_sum_available: parseFloat(profileForm.lump_sum_available) || 0,
      });
      setShowProfileModal(false);
      fetchData();
    } catch (err) {
      setFormMsg(err.response?.data?.detail || "Failed to update profile.");
    } finally { setSubmitting(false); }
  };

  const deleteLoan = async (id) => {
    if (!confirm("Delete this loan?")) return;
    try { await API.delete(`/delete-loan/${id}`); fetchData(); }
    catch { alert("Failed to delete loan."); }
  };

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content"><div className="page-loading"><div className="ai-spinner" /><span>Loading dashboard...</span></div></div>
    </div>
  );

  const fs = data?.financial_summary || {};
  const loans = data?.loans || [];
  const priorities = data?.priorities || [];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Your financial snapshot at a glance</p>
        </div>
        <div className="page-body">
          {error && <div className="error-msg" style={{marginBottom:20}}>{error}</div>}

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card green">
              <div className="stat-label">Monthly Surplus</div>
              <div className={`stat-value ${fs.surplus >= 0 ? "positive" : "negative"}`}>{fmt(fs.surplus)}</div>
              <div className="stat-sub">After all expenses</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-label">Total Outstanding</div>
              <div className="stat-value neutral">{fmt(fs.total_outstanding)}</div>
              <div className="stat-sub">{fs.total_loans || 0} active loans</div>
            </div>
            <div className="stat-card red">
              <div className="stat-label">Total EMI</div>
              <div className="stat-value neutral">{fmt(fs.total_emi)}</div>
              <div className="stat-sub">{fmtPct(fs.emi_ratio)} of income</div>
            </div>
            <div className="stat-card amber">
              <div className="stat-label">Debt-to-Income</div>
              <div className="stat-value neutral">{fmtPct(fs.debt_to_income)}</div>
              <div className="stat-sub">Ratio</div>
            </div>
            <div className={`stat-card ${fs.stress_level === "Low" ? "green" : fs.stress_level === "Medium" ? "amber" : "red"}`}>
              <div className="stat-label">Stress Level</div>
              <div className="stat-value neutral">
                <span className={`stress-badge ${fs.stress_level || "Low"}`}>
                  {fs.stress_level === "Low" ? "🟢" : fs.stress_level === "Medium" ? "🟡" : "🔴"} {fs.stress_level || "Low"}
                </span>
              </div>
              <div className="stat-sub">Financial stress index</div>
            </div>
          </div>

          {/* Profile quick view */}
          <div className="card" style={{marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div className="card-title">Financial Profile</div>
                <div className="card-subtitle">Your income and expense baseline</div>
              </div>
              <button className="btn-secondary" onClick={() => { setShowProfileModal(true); setFormMsg(""); }}>✏️ Edit Profile</button>
            </div>
            <div className="grid-2">
              <div>
                <div className="meter-label">
                  <span className="meter-name">Monthly Income</span>
                  <span className="meter-value">{fmt(data?.user?.monthly_income)}</span>
                </div>
              </div>
              <div>
                <div className="meter-label">
                  <span className="meter-name">Monthly Expenses</span>
                  <span className="meter-value">{fmt(data?.user?.monthly_expenses)}</span>
                </div>
              </div>
              <div>
                <div className="meter-label">
                  <span className="meter-name">Lump Sum Available</span>
                  <span className="meter-value">{fmt(data?.user?.lump_sum_available)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loans table */}
          <div className="loans-section">
            <div className="loans-header">
              <div>
                <h2 className="card-title">Active Loans</h2>
                <p className="card-subtitle">Manage your debt portfolio</p>
              </div>
              <button className="btn-success" onClick={() => { setShowLoanModal(true); setFormMsg(""); }}>+ Add Loan</button>
            </div>

            {loans.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">🏦</div>
                  <h3>No loans added yet</h3>
                  <p>Add your loans to get AI-powered settlement predictions and negotiation strategies.</p>
                  <button className="btn-success" onClick={() => { setShowLoanModal(true); setFormMsg(""); }}>+ Add Your First Loan</button>
                </div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Lender</th>
                      <th>Type</th>
                      <th>Outstanding</th>
                      <th>Interest</th>
                      <th>EMI</th>
                      <th>Overdue</th>
                      <th>Priority</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map(loan => {
                      const p = priorities.find(x => x.loan_id === loan.id);
                      return (
                        <tr key={loan.id}>
                          <td style={{fontWeight:600}}>{loan.lender_name}</td>
                          <td><span style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"2px 8px",fontSize:12}}>{loan.loan_type}</span></td>
                          <td className="amount-cell">{fmt(loan.outstanding_amount)}</td>
                          <td className="amount-cell">{loan.interest_rate}%</td>
                          <td className="amount-cell">{fmt(loan.emi)}</td>
                          <td>{loan.overdue_months > 0 ? <span style={{color:"#fca5a5"}}>{loan.overdue_months} mo.</span> : <span style={{color:"var(--accent-green-light)"}}>Current</span>}</td>
                          <td>{p && <span className={`priority-badge ${p.priority}`}>{p.priority}</span>}</td>
                          <td><button className="btn-danger" onClick={() => deleteLoan(loan.id)}>Delete</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Loan Modal */}
      {showLoanModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLoanModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Add New Loan</h3>
              <button className="modal-close" onClick={() => setShowLoanModal(false)}>×</button>
            </div>
            {formMsg && <div className="error-msg">{formMsg}</div>}
            <div className="grid-2">
              <div className="field-group col-span-2">
                <label className="field-label">Lender Name *</label>
                <input className="field-input" placeholder="e.g. HDFC Bank" value={loanForm.lender_name} onChange={e => setLoanForm(p => ({...p, lender_name: e.target.value}))} />
              </div>
              <div className="field-group">
                <label className="field-label">Loan Type *</label>
                <select className="field-input" value={loanForm.loan_type} onChange={e => setLoanForm(p => ({...p, loan_type: e.target.value}))}>
                  <option>NBFC</option><option>Bank</option><option>Personal</option><option>Credit Card</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Outstanding Amount (₹) *</label>
                <input className="field-input" type="number" placeholder="500000" value={loanForm.outstanding_amount} onChange={e => setLoanForm(p => ({...p, outstanding_amount: e.target.value}))} />
              </div>
              <div className="field-group">
                <label className="field-label">Interest Rate (% p.a.) *</label>
                <input className="field-input" type="number" step="0.1" placeholder="14.5" value={loanForm.interest_rate} onChange={e => setLoanForm(p => ({...p, interest_rate: e.target.value}))} />
              </div>
              <div className="field-group">
                <label className="field-label">Monthly EMI (₹) *</label>
                <input className="field-input" type="number" placeholder="15000" value={loanForm.emi} onChange={e => setLoanForm(p => ({...p, emi: e.target.value}))} />
              </div>
              <div className="field-group col-span-2">
                <label className="field-label">Overdue Months</label>
                <input className="field-input" type="number" min="0" placeholder="0" value={loanForm.overdue_months} onChange={e => setLoanForm(p => ({...p, overdue_months: e.target.value}))} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowLoanModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={submitLoan} disabled={submitting}>{submitting ? "Adding..." : "Add Loan"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowProfileModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Update Financial Profile</h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            {formMsg && <div className="error-msg">{formMsg}</div>}
            <div className="field-group">
              <label className="field-label">Monthly Income (₹)</label>
              <input className="field-input" type="number" placeholder="50000" value={profileForm.monthly_income} onChange={e => setProfileForm(p => ({...p, monthly_income: e.target.value}))} />
            </div>
            <div className="field-group">
              <label className="field-label">Monthly Expenses (₹)</label>
              <input className="field-input" type="number" placeholder="30000" value={profileForm.monthly_expenses} onChange={e => setProfileForm(p => ({...p, monthly_expenses: e.target.value}))} />
            </div>
            <div className="field-group">
              <label className="field-label">Lump Sum Available (₹)</label>
              <input className="field-input" type="number" placeholder="100000" value={profileForm.lump_sum_available} onChange={e => setProfileForm(p => ({...p, lump_sum_available: e.target.value}))} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={submitProfile} disabled={submitting}>{submitting ? "Saving..." : "Save Profile"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
