import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Alerts from "./pages/Alerts.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import History from "./pages/History.jsx";
import Login from "./pages/Login.jsx";
import Manual from "./pages/Manual.jsx";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register.jsx";
import Reports from "./pages/Reports.jsx";
import Thresholds from "./pages/Thresholds.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/thresholds" element={<Thresholds />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<div style={{ padding: 16 }}>404</div>} />
    </Routes>
  );
}