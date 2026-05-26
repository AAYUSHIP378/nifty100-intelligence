import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../api/axios";
import { AuthContext } from "../auth/AuthContext";

function Login() {

  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!username || !password) {

      alert("Please fill all fields");

      return;

    }

    try {

      setLoading(true);

      const res = await api.post("auth/login/", {

        username,
        password,

      });

      console.log("LOGIN RESPONSE:", res.data);

      // ================= SAVE AUTH =================

      login({

        token:

          res.data.token ||
          res.data.access ||
          res.data.access_token,

        role:

          res.data.role ||
          res.data.user?.role ||
          "user",

      });

      // ================= REDIRECT =================

      if (

        res.data.role === "admin" ||
        res.data.user?.role === "admin"

      ) {

        navigate("/admin");

      } else {

        navigate("/dashboard");

      }

    } catch (err) {

      console.log("LOGIN ERROR:", err.response?.data);

      alert(

        err.response?.data?.detail ||

        err.response?.data?.message ||

        "Invalid Credentials ❌"

      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">

      {/* ================= LOGIN CARD ================= */}

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">

        {/* ================= HEADER ================= */}

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-cyan-400 mb-3">

            Welcome Back 👋

          </h1>

          <p className="text-slate-400">

            Login to access your Financial Intelligence Dashboard

          </p>

        </div>

        {/* ================= USERNAME ================= */}

        <div className="mb-5">

          <label className="block mb-2 text-slate-300 font-semibold">

            Username

          </label>

          <input
            type="text"
            className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400 transition"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

        </div>

        {/* ================= PASSWORD ================= */}

        <div className="mb-6">

          <label className="block mb-2 text-slate-300 font-semibold">

            Password

          </label>

          <input
            type="password"
            className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400 transition"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

        </div>

        {/* ================= LOGIN BUTTON ================= */}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 transition p-4 rounded-2xl font-bold text-lg shadow-lg"
        >

          {loading ? "Logging in..." : "Login"}

        </button>

        {/* ================= DIVIDER ================= */}

        <div className="flex items-center gap-4 my-8">

          <div className="flex-1 h-[1px] bg-slate-700"></div>

          <span className="text-slate-400 text-sm">

            OR

          </span>

          <div className="flex-1 h-[1px] bg-slate-700"></div>

        </div>

        {/* ================= SIGNUP LINK ================= */}

        <div className="text-center">

          <p className="text-slate-400 mb-3">

            Don't have an account?

          </p>

          <Link
            to="/signup"
            className="inline-block w-full bg-slate-800 hover:bg-slate-700 transition p-4 rounded-2xl font-bold border border-slate-700"
          >

            Create New Account

          </Link>

        </div>

      </div>

    </div>

  );

}

export default Login;