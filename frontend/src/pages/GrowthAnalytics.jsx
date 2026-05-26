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
  Legend
} from "recharts";

function GrowthAnalytics() {

  const [data, setData] = useState([]);

  useEffect(() => {

    api
      .get("ml-scores/")
      .then((res) => {

        const rawData = res.data || [];

        // ================= REMOVE DUPLICATES =================

        const uniqueData = Array.from(

          new Map(
            rawData.map(item => [item.symbol, item])
          ).values()

        );

        // ================= SORT BY SCORE =================

        const sorted = uniqueData.sort(

          (a, b) => b.overall_score - a.overall_score

        );

        setData(sorted);

      })

      .catch((err) => {

        console.error("Growth Analytics Error:", err);

      });

  }, []);

  // ================= TOP GROWTH =================

  const topGrowth = data.slice(0, 10);

  // ================= HEALTH COUNTS =================

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

  // ================= AVG GROWTH =================

  const avgGrowth = data.length
    ? (
        data.reduce(
          (acc, item) =>
            acc + Number(item.overall_score),
          0
        ) / data.length
      ).toFixed(2)
    : 0;

  return (

    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* ================= TITLE ================= */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold text-cyan-400 mb-3">

          🚀 Growth Analytics

        </h1>

        <p className="text-slate-400 text-lg">

          Real-time company growth intelligence dashboard

        </p>

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

          <h2 className="text-slate-400 text-sm mb-2">

            TOTAL

          </h2>

          <p className="text-4xl font-bold text-cyan-400">

            {data.length}

          </p>

        </div>

        <div className="bg-emerald-500/10 border border-emerald-500 rounded-2xl p-6">

          <h2 className="text-emerald-400 text-sm mb-2">

            EXCELLENT

          </h2>

          <p className="text-4xl font-bold">

            {excellentCount}

          </p>

        </div>

        <div className="bg-green-500/10 border border-green-500 rounded-2xl p-6">

          <h2 className="text-green-400 text-sm mb-2">

            GOOD

          </h2>

          <p className="text-4xl font-bold">

            {goodCount}

          </p>

        </div>

        <div className="bg-yellow-500/10 border border-yellow-500 rounded-2xl p-6">

          <h2 className="text-yellow-300 text-sm mb-2">

            AVERAGE

          </h2>

          <p className="text-4xl font-bold">

            {averageCount}

          </p>

        </div>

        <div className="bg-orange-500/10 border border-orange-500 rounded-2xl p-6">

          <h2 className="text-orange-300 text-sm mb-2">

            WEAK

          </h2>

          <p className="text-4xl font-bold">

            {weakCount}

          </p>

        </div>

        <div className="bg-red-500/10 border border-red-500 rounded-2xl p-6">

          <h2 className="text-red-400 text-sm mb-2">

            POOR

          </h2>

          <p className="text-4xl font-bold">

            {poorCount}

          </p>

        </div>

      </div>

      {/* ================= AVG SCORE ================= */}

      <div className="bg-slate-900 rounded-2xl p-6 mb-10 border border-slate-800">

        <h2 className="text-2xl font-bold mb-4">

          Average Growth Score

        </h2>

        <p className="text-6xl font-bold text-cyan-400">

          {avgGrowth}

        </p>

      </div>

      {/* ================= BAR CHART ================= */}

      <div className="bg-slate-900 rounded-2xl p-6 mb-10 border border-slate-800">

        <h2 className="text-2xl font-bold mb-6">

          Top 10 Growth Companies

        </h2>

        <ResponsiveContainer width="100%" height={420}>

          <BarChart data={topGrowth}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="symbol" />

            <YAxis domain={[0, 100]} />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="overall_score"
              fill="#06b6d4"
              radius={[10, 10, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* ================= COMPANY CARDS ================= */}

      <div>

        <h2 className="text-3xl font-bold mb-8">

          Top Performing Companies

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {topGrowth.map((item, index) => {

            const healthStyle =

              item.health_label === "EXCELLENT"
                ? "bg-emerald-500/20 text-emerald-400"

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

                <div
                  className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition"
                >

                  {/* ================= HEADER ================= */}

                  <div className="flex justify-between items-center mb-5">

                    <h2 className="text-2xl font-bold text-cyan-400">

                      {item.symbol}

                    </h2>

                    <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm font-bold">

                      #{index + 1}

                    </span>

                  </div>

                  {/* ================= SCORE ================= */}

                  <div className="mb-5">

                    <p className="text-slate-400 mb-2">

                      Growth Score

                    </p>

                    <p className="text-5xl font-bold text-white">

                      {Number(item.overall_score).toFixed(2)}

                    </p>

                  </div>

                  {/* ================= HEALTH ================= */}

                  <div className="mb-6">

                    <p className="text-slate-400 mb-2">

                      Health Status

                    </p>

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold ${healthStyle}`}
                    >

                      {item.health_label}

                    </span>

                  </div>

                  {/* ================= PERFORMANCE BAR ================= */}

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

export default GrowthAnalytics;