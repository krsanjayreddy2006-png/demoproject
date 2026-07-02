import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // OAuth2PasswordRequestForm expects x-www-form-urlencoded with:
      // - username
      // - password
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await API.post("/login", formData.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await API.post("/register", { email, password });

      setSuccess("Account created! Please sign in.");
      setTab("login");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">📱</div>
          <span className="auth-brand-name">FinRelief AI</span>
        </div>
        <div className="auth-hero">
          <h1>
            Take Control of Your <span>Financial Future</span>
          </h1>
          <p>
            AI-powered debt management that helps you negotiate smarter, settle
            faster, and live debt-free sooner.
          </p>
        </div>
        <div className="auth-stats">
          <div className="auth-stat">
            <div className="auth-stat-value">40-75%</div>
            <div className="auth-stat-label">Settlement Range</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-value">AI</div>
            <div className="auth-stat-label">Powered Strategy</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-value">Free</div>
            <div className="auth-stat-label">To Get Started</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="auth-form-title">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="auth-form-subtitle">
            {tab === "login" ? "Sign in to your dashboard" : "Start your debt relief journey"}
          </p>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => {
                setTab("login");
                setError("");
                setSuccess("");
              }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => {
                setTab("register");
                setError("");
                setSuccess("");
              }}
            >
              Register
            </button>
          </div>

          {error && <div className="error-msg">⚠️ {error}</div>}
          {success && <div className="success-msg">✅ {success}</div>}

          <div className="field-group">
            <label className="field-label">Email address</label>
            <input
              type="email"
              className="field-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              type="password"
              className="field-input"
              placeholder={tab === "register" ? "Min. 6 characters" : "Enter password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())
              }
            />
          </div>

          <button
            className="btn-primary"
            onClick={tab === "login" ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : tab === "login"
                ? "Sign In →"
                : "Create Account →"}
          </button>
        </div>
      </div>
    </div>
  );
}

