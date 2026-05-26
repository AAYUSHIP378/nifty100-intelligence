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

function SectorAnalysis() {

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

        console.error("Sector Analysis Error:", err);

        setLoading(false);

      });

  }, []);

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="flex justify-center items-center h-screen bg-slate-950">

        <div className="h-14 w-14 border-t-4 border-green-500 rounded-full animate-spin"></div>

      </div>

    );

  }

  // ================= STATIC SECTOR DATA =================

  const sectorData = [

    {
      name: "BANKING",
      value: 25
    },

    {
      name: "IT",
      value: 20
    },

    {
      name: "AUTO",
      value: 18
    },

    {
      name: "ENERGY",
      value: 15
    },

    {
      name: "PHARMA",
      value: 14
    }

  ];

  // ================= COLORS =================

  const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6"
  ];

  // ================= TOP COMPANIES =================

  const topCompanies = [...data]
    .sort((a, b) => b.overall_score - a.overall_score)
    .slice(0, 10);

  // ================= COUNTS =================

  const excellentCount = data.filter(
    d => d.health_label === "EXCELLENT"
  ).length;

  const goodCount = data.filter(
    d => d.health_label === "GOOD"
  ).length;

  const riskyCount = data.filter(
    d =>
      d.health_label === "WEAK" ||
      d.health_label === "POOR"
  ).length;

  return (

    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* ================= TITLE ================= */}

      <div className="mb-10">

        <h1 className="text-5xl font-bold mb-3 text-green-400">

          📈 Sector Analysis

        </h1>

        <p className="text-slate-400 text-lg">

          Sector-wise market intelligence and performance analytics

        </p>

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">

          <h2 className="text-slate-400 text-sm mb-2">

            TOTAL COMPANIES

          </h2>

          <p className="text-5xl font-bold text-green-400">

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

        <div className="bg-red-500/10 border border-red-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-red-400 text-sm mb-2">

            RISKY

          </h2>

          <p className="text-5xl font-bold text-red-400">

            {riskyCount}

          </p>

        </div>

      </div>

      {/* ================= CHART SECTION ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* ================= PIE CHART ================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">

          <h2 className="text-2xl font-bold mb-6 text-green-400">

            Sector Distribution

          </h2>

          <ResponsiveContainer width="100%" height={450}>

            <PieChart>

              <Pie
                data={sectorData}
                dataKey="value"
                outerRadius={160}
                label
              >

                {sectorData.map((entry, index) => (

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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">

          <h2 className="text-2xl font-bold mb-6 text-green-400">

            Top Performing Companies

          </h2>

          <ResponsiveContainer width="100%" height={450}>

            <BarChart data={topCompanies}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="symbol" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="overall_score"
                fill="#22c55e"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* ================= SECTOR CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">

        {sectorData.map((sector, index) => (

          <div
            key={index}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:scale-105 transition duration-300"
          >

            <div
              className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: `${COLORS[index]}20`,
                color: COLORS[index]
              }}
            >

              {sector.name.charAt(0)}

            </div>

            <h2 className="text-2xl font-bold mb-3">

              {sector.name}

            </h2>

            <p className="text-slate-400 mb-4">

              Sector Strength

            </p>

            <p
              className="text-5xl font-bold"
              style={{ color: COLORS[index] }}
            >

              {sector.value}%

            </p>

            <div className="mt-5">

              <div className="w-full bg-slate-700 rounded-full h-3">

                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${sector.value}%`,
                    backgroundColor: COLORS[index]
                  }}
                ></div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

export default SectorAnalysis;