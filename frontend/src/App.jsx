import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";

import ProtectedRoute, {
  AdminRoute
} from "./auth/ProtectedRoute.jsx";

import MainLayout from "./layouts/MainLayout.jsx";

// ================= PAGES =================

import Dashboard from "./pages/Dashboard.jsx";
import CompanyDeepDive from "./pages/CompanyDeepDive.jsx";
import SectorAnalysis from "./pages/SectorAnalysis.jsx";
import HealthScorecard from "./pages/HealthScorecard.jsx";
import GrowthAnalytics from "./pages/GrowthAnalytics.jsx";
import DebtMonitor from "./pages/DebtMonitor.jsx";
import DividendAnalytics from "./pages/DividendAnalytics.jsx";
import RiskDashboard from "./pages/RiskDashboard.jsx";
import PowerBIDashboards from "./pages/PowerBIDashboards.jsx";

import Admin from "./components/Admin.jsx";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ================= DEFAULT ROUTE ================= */}

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* ================= PUBLIC ROUTES ================= */}

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ================= PROTECTED ROUTES ================= */}

        <Route
          element={
            <ProtectedRoute>

              <MainLayout />

            </ProtectedRoute>
          }
        >

          {/* ================= DASHBOARD ================= */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ================= COMPANY ================= */}

          <Route
            path="/company"
            element={<CompanyDeepDive />}
          />

          <Route
            path="/company/:symbol"
            element={<CompanyDeepDive />}
          />

          {/* ================= SECTOR ANALYSIS ================= */}

          <Route
            path="/sectors"
            element={<SectorAnalysis />}
          />

          {/* ================= HEALTH ================= */}

          <Route
            path="/health"
            element={<HealthScorecard />}
          />

          {/* ================= GROWTH ================= */}

          <Route
            path="/growth"
            element={<GrowthAnalytics />}
          />

          {/* ================= DEBT ================= */}

          <Route
            path="/debt"
            element={<DebtMonitor />}
          />

          {/* ================= DIVIDEND ================= */}

          <Route
            path="/dividend"
            element={<DividendAnalytics />}
          />

          {/* ================= RISK ================= */}

          <Route
            path="/risk"
            element={<RiskDashboard />}
          />

          {/* ================= POWER BI DASHBOARDS ================= */}

          <Route
            path="/powerbi"
            element={<PowerBIDashboards />}
          />

        </Route>

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>

              <MainLayout />

            </AdminRoute>
          }
        >

          <Route
            index
            element={<Admin />}
          />

        </Route>

        {/* ================= FALLBACK ================= */}

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;