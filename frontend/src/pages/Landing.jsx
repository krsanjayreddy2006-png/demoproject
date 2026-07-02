import { useNavigate } from "react-router-dom";
import "../App.css";

const features = [
  { icon: "📊", title: "Financial Health", desc: "Real-time debt stress analysis and EMI ratio tracking" },
  { icon: "🤝", title: "Settlement AI", desc: "Smart settlement predictions based on your financial profile" },
  { icon: "✉️", title: "Negotiation Emails", desc: "AI-crafted professional letters to your lenders" },
  { icon: "⚖️", title: "Know Your Rights", desc: "RBI guidelines and legal protection for borrowers" },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="landing-hero">
      <div className="landing-hero-bg" />
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="auth-brand-icon">💰</div>
          <span>FinRelief AI</span>
        </div>
        <button className="btn-secondary" onClick={() => navigate("/login")}>Sign In</button>
      </nav>
      <div className="landing-hero-body">
        <div className="landing-hero-content">
          <div className="landing-badge">🚀 Smart Debt Relief Platform</div>
          <h1 className="landing-h1">Resolve Debt With <span>AI Intelligence</span></h1>
          <p className="landing-p">
            FinRelief AI analyzes your financial situation, predicts optimal settlement offers, and generates negotiation strategies — all powered by AI.
          </p>
          <div className="landing-actions">
            <button className="landing-btn-primary" onClick={() => navigate("/login")}>Get Started Free →</button>
            <button className="landing-btn-ghost" onClick={() => navigate("/login")}>View Dashboard</button>
          </div>
        </div>
      </div>
      <div className="landing-features">
        <div className="landing-features-grid">
          {features.map(f => (
            <div className="landing-feature" key={f.title}>
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
