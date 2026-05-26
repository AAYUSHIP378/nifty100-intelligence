import { useEffect, useState } from "react";
import api from "../api/axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import { Link } from "react-router-dom";

function RiskDashboard() {

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // ================= FETCH API =================

  useEffect(() => {

    api
      .get("ml-scores/")

      .then((res) => {

        const rawData = res.data || [];

        // REMOVE DUPLICATES

        const uniqueData = Array.from(

          new Map(
            rawData.map(item => [item.symbol, item])
          ).values()

        );

        setData(uniqueData);

        setLoading(false);

      })

      .catch((err) => {

        console.error("Risk API Error:", err);

        setLoading(false);

      });

  }, []);

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="flex justify-center items-center h-screen bg-slate-950">

        <div className="h-14 w-14 border-t-4 border-red-500 rounded-full animate-spin"></div>

      </div>

    );

  }

  // ================= RISK LOGIC =================

  const riskData = data.map(item => ({

    ...item,

    riskLevel:

      item.health_label === "POOR"
        ? "HIGH"

        : item.health_label === "WEAK"
        ? "MEDIUM"

        : "LOW"

  }));

  // ================= SEARCH =================

  const filteredData = riskData.filter(item =>

    item.symbol
      ?.toLowerCase()
      .includes(search.toLowerCase())

  );

  // ================= COUNTS =================

  const highRisk = riskData.filter(
    d => d.riskLevel === "HIGH"
  ).length;

  const mediumRisk = riskData.filter(
    d => d.riskLevel === "MEDIUM"
  ).length;

  const lowRisk = riskData.filter(
    d => d.riskLevel === "LOW"
  ).length;

  // ================= PIE DATA =================

  const pieData = [

    {
      name: "HIGH",
      value: highRisk
    },

    {
      name: "MEDIUM",
      value: mediumRisk
    },

    {
      name: "LOW",
      value: lowRisk
    }

  ];

  const COLORS = [
    "#ef4444",
    "#f59e0b",
    "#22c55e"
  ];

  return (

    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* ================= TITLE ================= */}

      <h1 className="text-5xl font-bold mb-10 text-red-400">

        ⚠️ Risk Dashboard

      </h1>

      {/* ================= SEARCH ================= */}

      <div className="mb-8">

        <input
          type="text"
          placeholder="Search Company..."
          className="p-4 rounded-2xl text-black w-full md:w-96 shadow-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">

          <h2 className="text-slate-400 mb-2">

            High Risk

          </h2>

          <p className="text-5xl font-bold text-red-400">

            {highRisk}

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">

          <h2 className="text-slate-400 mb-2">

            Medium Risk

          </h2>

          <p className="text-5xl font-bold text-yellow-400">

            {mediumRisk}

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">

          <h2 className="text-slate-400 mb-2">

            Low Risk

          </h2>

          <p className="text-5xl font-bold text-green-400">

            {lowRisk}

          </p>

        </div>

      </div>

      {/* ================= PIE CHART ================= */}

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-10 shadow-lg">

        <h2 className="text-2xl font-semibold mb-6 text-red-400">

          Risk Distribution

        </h2>

        <ResponsiveContainer width="100%" height={400}>

          <PieChart>

            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={140}
              label
            >

              {pieData.map((entry, index) => (

                <Cell
                  key={index}
                  fill={COLORS[index]}
                />

              ))}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

      {/* ================= BAR CHART ================= */}

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-10 shadow-lg">

        <h2 className="text-2xl font-semibold mb-6 text-red-400">

          Top Risk Companies

        </h2>

        <ResponsiveContainer width="100%" height={400}>

          <BarChart data={filteredData.slice(0, 10)}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="symbol" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="overall_score"
              fill="#ef4444"
              radius={[10, 10, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* ================= COMPANY CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">

        {filteredData.slice(0, 12).map((item, index) => (

          <Link
            to={`/company/${item.symbol}`}
            key={index}
          >

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:scale-105 transition duration-300">

              <div className="flex justify-between items-center mb-5">

                <h2 className="text-2xl font-bold text-red-400">

                  {item.symbol}

                </h2>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold

                  ${
                    item.riskLevel === "HIGH"
                      ? "bg-red-500/20 text-red-400"

                      : item.riskLevel === "MEDIUM"
                      ? "bg-yellow-500/20 text-yellow-300"

                      : "bg-green-500/20 text-green-400"
                  }
                  `}
                >

                  {item.riskLevel}

                </span>

              </div>

              <div className="mb-5">

                <p className="text-slate-400 mb-2">

                  Overall Score

                </p>

                <p className="text-5xl font-bold text-white">

                  {Number(item.overall_score).toFixed(2)}

                </p>

              </div>

              <div className="mb-5">

                <p className="text-slate-400 mb-2">

                  Health Status

                </p>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold

                  ${
                    item.health_label === "EXCELLENT"
                      ? "bg-cyan-500/20 text-cyan-400"

                      : item.health_label === "GOOD"
                      ? "bg-green-500/20 text-green-400"

                      : item.health_label === "AVERAGE"
                      ? "bg-yellow-500/20 text-yellow-300"

                      : item.health_label === "WEAK"
                      ? "bg-orange-500/20 text-orange-300"

                      : "bg-red-500/20 text-red-400"
                  }
                  `}
                >

                  {item.health_label}

                </span>

              </div>

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-sm text-slate-400">

                    Risk Exposure

                  </span>

                  <span className="text-sm font-bold">

                    {Number(item.overall_score).toFixed(0)}%

                  </span>

                </div>

                <div className="w-full bg-slate-700 rounded-full h-3">

                  <div
                    className="bg-red-400 h-3 rounded-full"
                    style={{
                      width: `${item.overall_score}%`
                    }}
                  ></div>

                </div>

              </div>

            </div>

          </Link>

        ))}

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-semibold mb-6 text-red-400">

          Risk Analysis Table

        </h2>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-slate-800">

                <th className="p-4 text-left">
                  Rank
                </th>

                <th className="p-4 text-left">
                  Symbol
                </th>

                <th className="p-4 text-left">
                  Score
                </th>

                <th className="p-4 text-left">
                  Health
                </th>

                <th className="p-4 text-left">
                  Risk
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredData.map((item, index) => (

                <tr
                  key={index}
                  className="border-b border-slate-800 hover:bg-slate-800 transition"
                >

                  <td className="p-4 font-bold">

                    #{index + 1}

                  </td>

                  <td className="p-4 font-semibold">

                    <Link
                      to={`/company/${item.symbol}`}
                      className="text-red-400 hover:text-red-300"
                    >

                      {item.symbol}

                    </Link>

                  </td>

                  <td className="p-4">

                    {Number(item.overall_score).toFixed(2)}

                  </td>

                  <td className="p-4">

                    {item.health_label}

                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold

                      ${
                        item.riskLevel === "HIGH"
                          ? "bg-red-500/20 text-red-400"

                          : item.riskLevel === "MEDIUM"
                          ? "bg-yellow-500/20 text-yellow-300"

                          : "bg-green-500/20 text-green-400"
                      }
                      `}
                    >

                      {item.riskLevel}

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default RiskDashboard;