import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 🔄 Load user from localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      setUser({
        token,
        role,
      });
    }
  }, []);

  // 🔐 LOGIN FUNCTION
  const login = (data) => {
    // expected: { token: "", role: "" }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    setUser({
      token: data.token,
      role: data.role,
    });
  };

  // 🚪 LOGOUT FUNCTION (SAFE CLEAR)
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}