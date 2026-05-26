import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

function DividendAnalytics() {

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

        // TOP COMPANIES

        const topCompanies = uniqueData
          .sort((a, b) => b.overall_score - a.overall_score)
          .slice(0, 15);

        setData(topCompanies);

        setLoading(false);

      })

      .catch((err) => {

        console.error("Dividend API Error:", err);

        setLoading(false);

      });

  }, []);

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="flex justify-center items-center h-screen bg-slate-950">

        <div className="h-14 w-14 border-t-4 border-orange-500 rounded-full animate-spin"></div>

      </div>

    );

  }

  // ================= COUNTS =================

  const excellentCount = data.filter(
    d => d.health_label === "EXCELLENT"
  ).length;

  const goodCount = data.filter(
    d => d.health_label === "GOOD"
  ).length;

  const averageCount = data.filter(
    d => d.health_label === "AVERAGE"
  ).length;

  const weakCount = data.filter(
    d => d.health_label === "WEAK"
  ).length;

  const poorCount = data.filter(
    d => d.health_label === "POOR"
  ).length;

  // ================= PIE DATA =================

  const pieData = [

    {
      name: "EXCELLENT",
      value: excellentCount
    },

    {
      name: "GOOD",
      value: goodCount
    },

    {
      name: "AVERAGE",
      value: averageCount
    },

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
    "#06b6d4",
    "#22c55e",
    "#eab308",
    "#f97316",
    "#ef4444"
  ];

  // ================= TOP BAR CHART DATA =================

  const chartData = data.slice(0, 10);

  return (

    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* ================= TITLE ================= */}

      <div className="mb-10">

        <h1 className="text-5xl font-bold text-orange-400 mb-3">

          🏆 Dividend Analytics

        </h1>

        <p className="text-slate-400 text-lg">

          Top performing dividend and financially stable companies

        </p>

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

          <h2 className="text-slate-400 text-sm mb-2">

            TOTAL TOP STOCKS

          </h2>

          <p className="text-5xl font-bold text-orange-400">

            {data.length}

          </p>

        </div>

        <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-cyan-300 text-sm mb-2">

            EXCELLENT

          </h2>

          <p className="text-5xl font-bold text-cyan-300">

            {excellentCount}

          </p>

        </div>

        <div className="bg-green-500/10 border border-green-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-green-400 text-sm mb-2">

            GOOD

          </h2>

          <p className="text-5xl font-bold text-green-400">

            {goodCount}

          </p>

        </div>

        <div className="bg-yellow-500/10 border border-yellow-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-yellow-300 text-sm mb-2">

            AVERAGE

          </h2>

          <p className="text-5xl font-bold text-yellow-300">

            {averageCount}

          </p>

        </div>

        <div className="bg-red-500/10 border border-red-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-red-400 text-sm mb-2">

            RISKY

          </h2>

          <p className="text-5xl font-bold text-red-400">

            {weakCount + poorCount}

          </p>

        </div>

      </div>

      {/* ================= CHART SECTION ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* ================= BAR CHART ================= */}

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

          <h2 className="text-2xl font-bold mb-6 text-orange-400">

            Top Dividend Performers

          </h2>

          <ResponsiveContainer width="100%" height={400}>

            <BarChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="symbol" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="overall_score"
                fill="#fb923c"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* ================= PIE CHART ================= */}

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

          <h2 className="text-2xl font-bold mb-6 text-orange-400">

            Health Distribution

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

      {/* ================= COMPANY CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {data.map((item, index) => {

          const healthColor =

            item.health_label === "EXCELLENT"
              ? "text-cyan-300"

              : item.health_label === "GOOD"
              ? "text-green-400"

              : item.health_label === "AVERAGE"
              ? "text-yellow-300"

              : item.health_label === "WEAK"
              ? "text-orange-300"

              : "text-red-400";

          const bgColor =

            item.health_label === "EXCELLENT"
              ? "bg-cyan-500/20"

              : item.health_label === "GOOD"
              ? "bg-green-500/20"

              : item.health_label === "AVERAGE"
              ? "bg-yellow-500/20"

              : item.health_label === "WEAK"
              ? "bg-orange-500/20"

              : "bg-red-500/20";

          return (

            <Link
              to={`/company/${item.symbol}`}
              key={index}
            >

              <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 hover:scale-105 transition">

                {/* RANK */}

                <div className="flex justify-between items-center mb-5">

                  <span className="text-slate-400">

                    Rank #{index + 1}

                  </span>

                  <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-bold">

                    TOP STOCK

                  </span>

                </div>

                {/* SYMBOL */}

                <h2 className="text-3xl font-bold text-orange-400 mb-6">

                  {item.symbol}

                </h2>

                {/* SCORE */}

                <div className="mb-5">

                  <p className="text-slate-400 mb-2">

                    Overall Score

                  </p>

                  <p className="text-5xl font-bold">

                    {Number(item.overall_score).toFixed(2)}

                  </p>

                </div>

                {/* HEALTH */}

                <div className="mb-6">

                  <p className="text-slate-400 mb-2">

                    Health Status

                  </p>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${bgColor} ${healthColor}`}
                  >

                    {item.health_label}

                  </span>

                </div>

                {/* PERFORMANCE BAR */}

                <div>

                  <div className="flex justify-between mb-2">

                    <span className="text-sm text-slate-400">

                      Performance

                    </span>

                    <span className="text-sm font-bold">

                      {Number(item.overall_score).toFixed(0)}%

                    </span>

                  </div>

                  <div className="w-full bg-slate-700 rounded-full h-3">

                    <div
                      className="bg-orange-400 h-3 rounded-full"
                      style={{
                        width: `${item.overall_score}%`
                      }}
                    ></div>

                  </div>

                </div>

              </div>

            </Link>

          );

        })}

      </div>

    </div>

  );

}

export default DividendAnalytics;