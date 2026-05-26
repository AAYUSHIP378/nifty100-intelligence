import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

/* =========================
   PROTECTED ROUTE
========================= */

export default function ProtectedRoute({ children }) {

  const { user } = useContext(AuthContext);

  const location = useLocation();

  // ================= NO USER =================

  if (!user) {

    return (

      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />

    );

  }

  // ================= VALID USER =================

  return children;

}

/* =========================
   ADMIN ROUTE
========================= */

export function AdminRoute({ children }) {

  const { user } = useContext(AuthContext);

  const location = useLocation();

  // ================= NOT LOGGED IN =================

  if (!user) {

    return (

      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />

    );

  }

  // ================= NOT ADMIN =================

  if (
    user.role?.toLowerCase() !== "admin"
  ) {

    return (

      <Navigate
        to="/dashboard"
        replace
      />

    );

  }

  // ================= ADMIN ACCESS =================

  return children;

}