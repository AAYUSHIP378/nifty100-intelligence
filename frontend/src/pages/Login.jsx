import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("auth/login/", {
        username,
        password,
      });

      // 🔥 ONLY JWT TOKENS EXIST HERE
      login({
        token: res.data.access,
        role: "user", // temporary (backend me role nahi hai)
      });

      navigate("/");

    } catch (err) {
      console.log(err.response?.data);
      alert("Invalid credentials ❌");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        placeholder="username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}