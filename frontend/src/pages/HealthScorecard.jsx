import { useEffect, useState } from "react";
import api from "../api/axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import { Link } from "react-router-dom";

function HealthScorecard() {

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

        setData(uniqueData);

        setLoading(false);

      })

      .catch((err) => {

        console.error("Health API Error:", err);

        setLoading(false);

      });

  }, []);

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="flex justify-center items-center h-screen bg-slate-950">

        <div className="h-14 w-14 border-t-4 border-cyan-500 rounded-full animate-spin"></div>

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

  // ================= TOTAL =================

  const totalCompanies = data.length;

  const highRiskCompanies = weakCount + poorCount;

  // ================= PIE DATA =================

  const chartData = [

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

  return (

    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* ================= TITLE ================= */}

      <div className="mb-10">

        <h1 className="text-5xl font-bold text-cyan-400 mb-3">

          💎 Health Scorecard

        </h1>

        <p className="text-slate-400 text-lg">

          Live ML-powered health analytics of Nifty 100 companies

        </p>

      </div>

      {/* ================= TOP STATS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-10">

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

          <h2 className="text-slate-400 text-sm mb-2">
            TOTAL
          </h2>

          <p className="text-4xl font-bold text-cyan-400">
            {totalCompanies}
          </p>

        </div>

        <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-cyan-400 text-sm mb-2">
            EXCELLENT
          </h2>

          <p className="text-4xl font-bold text-cyan-300">
            {excellentCount}
          </p>

        </div>

        <div className="bg-green-500/10 border border-green-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-green-400 text-sm mb-2">
            GOOD
          </h2>

          <p className="text-4xl font-bold">
            {goodCount}
          </p>

        </div>

        <div className="bg-yellow-500/10 border border-yellow-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-yellow-300 text-sm mb-2">
            AVERAGE
          </h2>

          <p className="text-4xl font-bold">
            {averageCount}
          </p>

        </div>

        <div className="bg-orange-500/10 border border-orange-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-orange-300 text-sm mb-2">
            WEAK
          </h2>

          <p className="text-4xl font-bold">
            {weakCount}
          </p>

        </div>

        <div className="bg-red-500/10 border border-red-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-red-400 text-sm mb-2">
            POOR
          </h2>

          <p className="text-4xl font-bold">
            {poorCount}
          </p>

        </div>

      </div>

      {/* ================= SECOND ROW ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

          <h2 className="text-slate-400 mb-3">
            High Risk Companies
          </h2>

          <p className="text-5xl font-bold text-red-400">
            {highRiskCompanies}
          </p>

        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

          <h2 className="text-slate-400 mb-3">
            Stable Companies
          </h2>

          <p className="text-5xl font-bold text-green-400">
            {excellentCount + goodCount}
          </p>

        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

          <h2 className="text-slate-400 mb-3">
            Moderate Risk
          </h2>

          <p className="text-5xl font-bold text-yellow-300">
            {averageCount}
          </p>

        </div>

      </div>

      {/* ================= CHART + INSIGHTS ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* PIE CHART */}

        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800">

          <h2 className="text-2xl font-bold mb-6 text-cyan-400">

            Company Health Distribution

          </h2>

          <ResponsiveContainer width="100%" height={450}>

            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={150}
                label
              >

                {chartData.map((entry, index) => (

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

        {/* INSIGHTS */}

        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800">

          <h2 className="text-2xl font-bold mb-8 text-cyan-400">

            AI Health Insights

          </h2>

          <div className="space-y-5">

            {chartData.map((item, index) => (

              <div
                key={index}
                className="bg-slate-800 rounded-xl p-5"
              >

                <h3 className="text-lg font-semibold mb-2">

                  {item.name}

                </h3>

                <p className="text-slate-300">

                  Total Companies: {item.value}

                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* ================= COMPANY HEALTH CARDS ================= */}

      <div className="mt-12">

        <h2 className="text-3xl font-bold mb-8 text-cyan-400">

          Company Health Cards

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {data.slice(0, 12).map((item, index) => {

            const healthStyle =

              item.health_label === "EXCELLENT"
                ? "bg-cyan-500/20 text-cyan-400"

                : item.health_label === "GOOD"
                ? "bg-green-500/20 text-green-400"

                : item.health_label === "AVERAGE"
                ? "bg-yellow-500/20 text-yellow-300"

                : item.health_label === "WEAK"
                ? "bg-orange-500/20 text-orange-300"

                : "bg-red-500/20 text-red-400";

            return (

              <Link
                to={`/company/${item.symbol}`}
                key={index}
              >

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:scale-105 transition duration-300">

                  <div className="flex justify-between items-center mb-5">

                    <h2 className="text-2xl font-bold text-cyan-400">

                      {item.symbol}

                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${healthStyle}`}
                    >

                      {item.health_label}

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

                  <div>

                    <div className="flex justify-between mb-2">

                      <span className="text-sm text-slate-400">
                        Financial Health
                      </span>

                      <span className="text-sm font-bold">

                        {Number(item.overall_score).toFixed(0)}%

                      </span>

                    </div>

                    <div className="w-full bg-slate-700 rounded-full h-3">

                      <div
                        className="bg-cyan-400 h-3 rounded-full"
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

    </div>

  );

}

export default HealthScorecard;