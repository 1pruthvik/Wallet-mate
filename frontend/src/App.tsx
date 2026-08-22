import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Learning from "./pages/Learning";
import Mentor from "./pages/Mentor";
import Trading from "./pages/Trading";
import FinancialHealth from "./pages/FinancialHealth";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<AppLayout />}>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

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

      </Routes>
    </BrowserRouter>
  );
}

export default App;