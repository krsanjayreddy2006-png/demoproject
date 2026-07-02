import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const navItems = [
  { icon: "📊", label: "Dashboard", path: "/dashboard" },
  { icon: "💚", label: "Financial Health", path: "/financial-health" },
  { icon: "🎯", label: "Settlement Predictor", path: "/settlement-predictor" },
  { icon: "✉️", label: "Negotiation Email", path: "/negotiation-email" },
  { icon: "⚖️", label: "Know Your Rights", path: "/know-your-rights" },
  { icon: "📜", label: "History", path: "/history" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">💰</div>
        <span className="sidebar-brand-text">FinRelief AI</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-item ${pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item" onClick={logout}>
          <span className="nav-item-icon">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
