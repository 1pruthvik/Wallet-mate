import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Learning from "./pages/Learning";
import Mentor from "./pages/Mentor";
import Trading from "./pages/Trading";
import FinancialHealth from "./pages/FinancialHealth";
import Profile from "./pages/Profile";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<AuthPage defaultMode="login" />} />
        <Route path="/signup" element={<AuthPage defaultMode="signup" />} />
        <Route path="/forgot-password" element={<AuthPage defaultMode="forgot-password" />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Application Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/transactions"
            element={<Transactions />}
          />

          <Route
            path="/financial-health"
            element={<FinancialHealth />}
          />

          <Route
            path="/learning"
            element={<Learning />}
          />

          <Route
            path="/mentor"
            element={<Mentor />}
          />

          <Route
            path="/trading"
            element={<Trading />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;