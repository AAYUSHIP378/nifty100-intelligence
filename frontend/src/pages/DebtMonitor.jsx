import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

function DebtMonitor() {

  const { symbol } = useParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

        // FILTER RISKY COMPANIES

        let riskyCompanies = uniqueData.filter(

          item =>

            item.health_label === "WEAK" ||
            item.health_label === "POOR"

        );

        // FILTER SINGLE COMPANY

        if (symbol) {

          riskyCompanies = riskyCompanies.filter(

            item =>
              item.symbol?.toLowerCase() ===
              symbol.toLowerCase()

          );

        }

        // SORT LOWEST SCORE FIRST

        const sorted = riskyCompanies.sort(

          (a, b) => a.overall_score - b.overall_score

        );

        setData(sorted);

        setLoading(false);

      })

      .catch((err) => {

        console.error("Debt Monitor Error:", err);

        setLoading(false);

      });

  }, [symbol]);

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="flex justify-center items-center h-screen bg-slate-950">

        <div className="h-14 w-14 border-t-4 border-yellow-500 rounded-full animate-spin"></div>

      </div>

    );

  }

  // ================= COUNTS =================

  const weakCount = data.filter(
    d => d.health_label === "WEAK"
  ).length;

  const poorCount = data.filter(
    d => d.health_label === "POOR"
  ).length;

  const totalRisky = data.length;

  const avgDebtRisk = data.length
    ? (
        data.reduce(
          (acc, item) =>
            acc + Number(item.overall_score),
          0
        ) / data.length
      ).toFixed(2)
    : 0;

  // ================= PIE DATA =================

  const pieData = [

    {
      name: "WEAK",
      value: weakCount
    },

    {
      name: "POOR",
      value: poorCount
    }

  ];

  const COLORS = [
    "#f97316",
    "#ef4444"
  ];

  // ================= CHART DATA =================

  const topRiskCompanies = data.slice(0, 10);

  return (

    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* ================= TITLE ================= */}

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-5xl font-bold text-yellow-400 mb-3">

            💰 Debt Monitor

          </h1>

          <p className="text-slate-400 text-lg">

            Live tracking of financially weak and debt-risk companies

          </p>

        </div>

        {symbol && (

          <Link
            to="/debt"
            className="bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-2xl"
          >

            ← Back

          </Link>

        )}

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">

          <h2 className="text-slate-400 text-sm mb-2">

            TOTAL RISKY

          </h2>

          <p className="text-5xl font-bold text-yellow-400">

            {totalRisky}

          </p>

        </div>

        <div className="bg-orange-500/10 border border-orange-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-orange-300 text-sm mb-2">

            WEAK

          </h2>

          <p className="text-5xl font-bold text-orange-300">

            {weakCount}

          </p>

        </div>

        <div className="bg-red-500/10 border border-red-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-red-400 text-sm mb-2">

            POOR

          </h2>

          <p className="text-5xl font-bold text-red-400">

            {poorCount}

          </p>

        </div>

        <div className="bg-yellow-500/10 border border-yellow-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-yellow-300 text-sm mb-2">

            AVG RISK SCORE

          </h2>

          <p className="text-5xl font-bold text-yellow-300">

            {avgDebtRisk}

          </p>

        </div>

      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* ================= BAR CHART ================= */}

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

          <h2 className="text-2xl font-bold mb-6 text-yellow-400">

            Top Financially Weak Companies

          </h2>

          <ResponsiveContainer width="100%" height={400}>

            <BarChart data={topRiskCompanies}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="symbol" />

              <YAxis domain={[0, 50]} />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="overall_score"
                fill="#f59e0b"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* ================= PIE CHART ================= */}

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

          <h2 className="text-2xl font-bold mb-6 text-yellow-400">

            Risk Distribution

          </h2>

          <ResponsiveContainer width="100%" height={400}>

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={130}
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

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

        <h2 className="text-2xl font-bold mb-6 text-yellow-400">

          Debt Risk Companies

        </h2>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-slate-800">

                <th className="p-4 text-left">Rank</th>

                <th className="p-4 text-left">Company</th>

                <th className="p-4 text-left">Overall Score</th>

                <th className="p-4 text-left">Health Label</th>

                <th className="p-4 text-left">Debt Risk</th>

              </tr>

            </thead>

            <tbody>

              {data.map((item, index) => {

                const riskLevel =

                  item.health_label === "POOR"
                    ? "CRITICAL"
                    : "HIGH";

                return (

                  <tr
                    key={index}
                    className="border-b border-slate-800 hover:bg-slate-800 transition"
                  >

                    <td className="p-4 font-bold">

                      #{index + 1}

                    </td>

                    <td className="p-4 font-semibold text-yellow-300">

                      <Link
                        to={`/debt/${item.symbol}`}
                        className="hover:text-yellow-200"
                      >

                        {item.symbol}

                      </Link>

                    </td>

                    <td className="p-4">

                      {Number(item.overall_score).toFixed(2)}

                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold

                        ${
                          item.health_label === "WEAK"
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-red-500/20 text-red-400"
                        }
                        `}
                      >

                        {item.health_label}

                      </span>

                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold

                        ${
                          riskLevel === "CRITICAL"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-300"
                        }
                        `}
                      >

                        {riskLevel}

                      </span>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default DebtMonitor;