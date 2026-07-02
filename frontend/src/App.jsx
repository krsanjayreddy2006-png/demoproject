import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FinancialHealth from "./pages/FinancialHealth";
import SettlementPredictor from "./pages/SettlementPredictor";
import NegotiationEmail from "./pages/NegotiationEmail";
import KnowYourRights from "./pages/KnowYourRights";
import History from "./pages/History";

function PrivateRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/financial-health" element={<PrivateRoute><FinancialHealth /></PrivateRoute>} />
        <Route path="/settlement-predictor" element={<PrivateRoute><SettlementPredictor /></PrivateRoute>} />
        <Route path="/negotiation-email" element={<PrivateRoute><NegotiationEmail /></PrivateRoute>} />
        <Route path="/know-your-rights" element={<PrivateRoute><KnowYourRights /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
