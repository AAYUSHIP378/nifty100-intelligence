import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= SIGNUP =================

  const handleSignup = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      console.log("DATA SENT:", {
        username,
        email,
        password,
      });

      const res = await api.post("auth/register/", {
        username,
        email,
        password,
      });

      console.log(res.data);

      alert("Signup Successful ✅");

      // AUTO REDIRECT

      navigate("/login");

    } catch (err) {

      console.log("ERROR:", err.response?.data);

      alert(

        JSON.stringify(
          err.response?.data || "Signup Failed"
        )

      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">

      {/* CARD */}

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8">

        {/* HEADER */}

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-cyan-400 mb-3">

            🚀 Create Account

          </h1>

          <p className="text-slate-400">

            Signup to access Financial Intelligence Platform

          </p>

        </div>

        {/* FORM */}

        <form onSubmit={handleSignup}>

          {/* USERNAME */}

          <div className="mb-5">

            <label className="block text-sm text-slate-300 mb-2">

              Username

            </label>

            <input
              type="text"
              required
              className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

          </div>

          {/* EMAIL */}

          <div className="mb-5">

            <label className="block text-sm text-slate-300 mb-2">

              Email Address

            </label>

            <input
              type="email"
              required
              className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>

          {/* PASSWORD */}

          <div className="mb-6">

            <label className="block text-sm text-slate-300 mb-2">

              Password

            </label>

            <input
              type="password"
              required
              className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>

          {/* SIGNUP BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition duration-300 text-white font-bold py-4 rounded-2xl shadow-lg"
          >

            {loading ? "Creating Account..." : "Signup"}

          </button>

        </form>

        {/* LOGIN LINK */}

        <div className="mt-8 text-center">

          <p className="text-slate-400">

            Already have an account?

          </p>

          <Link
            to="/login"
            className="inline-block mt-3 text-cyan-400 hover:text-cyan-300 font-bold"
          >

            Login Here →

          </Link>

        </div>

      </div>

    </div>

  );

}