import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";

import { Link } from "react-router-dom";

function Dashboard() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState("ALL");

  // ================= FETCH DATA =================

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        setLoading(true);

        const res = await api.get("ml-scores/");

        const rawData = res.data || [];

        // REMOVE DUPLICATES

        const uniqueData = Array.from(

          new Map(
            rawData.map(item => [item.symbol, item])
          ).values()

        );

        // SORT DESC

        const sortedData = uniqueData.sort(

          (a, b) =>
            Number(b.overall_score || 0) -
            Number(a.overall_score || 0)

        );

        setData(sortedData);

      } catch (err) {

        console.error("Dashboard Error:", err);

      } finally {

        setLoading(false);

      }

    };

    fetchDashboard();

  }, []);

  // ================= FILTER DATA =================

  const filteredData = useMemo(() => {

    return data.filter((item) => {

      const symbol =
        item.symbol?.toLowerCase() || "";

      const health =
        item.health_label?.toLowerCase() || "";

      const riskLevel =

        item.health_label === "POOR"
          ? "high"

          : item.health_label === "WEAK"
          ? "medium"

          : "low";

      const searchText =
        search.toLowerCase();

      const matchSearch =

        symbol.includes(searchText) ||

        health.includes(searchText) ||

        riskLevel.includes(searchText);

      const matchHealth =

        healthFilter === "ALL" ||

        item.health_label === healthFilter;

      return matchSearch && matchHealth;

    });

  }, [data, search, healthFilter]);

  // ================= COUNTS =================

  const totalCompanies = data.length;

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

  const highRiskCount =
    weakCount + poorCount;

  // ================= AVG SCORE =================

  const avgScore = totalCompanies
    ? (
        data.reduce(
          (acc, item) =>
            acc +
            Number(item.overall_score || 0),
          0
        ) / totalCompanies
      ).toFixed(2)
    : "0";

  // ================= CHART DATA =================

  const topCompanies =
    filteredData.slice(0, 10);

  const healthCounts = [

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

  // ================= EXPORT CSV =================

  const exportCSV = () => {

    const rows = [

      [
        "Rank",
        "Symbol",
        "Overall Score",
        "Health Label",
        "Risk Level"
      ],

      ...filteredData.map((item, index) => [

        index + 1,

        item.symbol,

        Number(item.overall_score || 0).toFixed(2),

        item.health_label,

        item.health_label === "POOR"
          ? "HIGH"
          : item.health_label === "WEAK"
          ? "MEDIUM"
          : "LOW"

      ])

    ];

    const csvContent = rows
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "financial_dashboard.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  };

  // ================= HEALTH BADGE =================

  const getHealthClass = (health) => {

    if (health === "EXCELLENT")
      return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";

    if (health === "GOOD")
      return "bg-green-500/20 text-green-400 border border-green-500/30";

    if (health === "AVERAGE")
      return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";

    if (health === "WEAK")
      return "bg-orange-500/20 text-orange-300 border border-orange-500/30";

    return "bg-red-500/20 text-red-400 border border-red-500/30";

  };

  // ================= RISK BADGE =================

  const getRiskClass = (risk) => {

    if (risk === "LOW")
      return "bg-green-500/20 text-green-400 border border-green-500/30";

    if (risk === "MEDIUM")
      return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";

    return "bg-red-500/20 text-red-400 border border-red-500/30";

  };

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="flex justify-center items-center h-screen bg-slate-950">

        <div className="h-16 w-16 border-t-4 border-cyan-400 rounded-full animate-spin"></div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}

      <div className="mb-10">

        <h1 className="text-5xl font-bold text-cyan-400 mb-3">

          📊 Financial Intelligence Dashboard

        </h1>

        <p className="text-slate-400 text-lg">

          Real-time ML powered analytics platform for company health,
          growth, debt risk and financial intelligence.

        </p>

      </div>

      {/* FILTERS */}

      <div className="flex flex-wrap gap-4 mb-10">

        <input
          type="text"
          placeholder="Search Company / Health / Risk..."
          className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-2xl w-full md:w-96 text-white focus:outline-none focus:border-cyan-500"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-2xl text-white focus:outline-none focus:border-cyan-500"
          value={healthFilter}
          onChange={(e) =>
            setHealthFilter(e.target.value)
          }
        >

          <option value="ALL">
            All Health
          </option>

          <option value="EXCELLENT">
            Excellent
          </option>

          <option value="GOOD">
            Good
          </option>

          <option value="AVERAGE">
            Average
          </option>

          <option value="WEAK">
            Weak
          </option>

          <option value="POOR">
            Poor
          </option>

        </select>

        <button
          onClick={exportCSV}
          className="bg-cyan-600 hover:bg-cyan-700 transition px-6 py-3 rounded-2xl font-semibold"
        >
          Export CSV
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

          <h2 className="text-slate-400 text-sm mb-3">
            TOTAL COMPANIES
          </h2>

          <p className="text-5xl font-bold text-cyan-400">
            {totalCompanies}
          </p>

        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-3xl p-6">

          <h2 className="text-cyan-300 text-sm mb-3">
            EXCELLENT
          </h2>

          <p className="text-5xl font-bold">
            {excellentCount}
          </p>

        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-3xl p-6">

          <h2 className="text-green-300 text-sm mb-3">
            GOOD
          </h2>

          <p className="text-5xl font-bold">
            {goodCount}
          </p>

        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-6">

          <h2 className="text-yellow-300 text-sm mb-3">
            AVERAGE
          </h2>

          <p className="text-5xl font-bold">
            {averageCount}
          </p>

        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6">

          <h2 className="text-red-300 text-sm mb-3">
            HIGH RISK
          </h2>

          <p className="text-5xl font-bold">
            {highRiskCount}
          </p>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

          <h2 className="text-slate-400 text-sm mb-3">
            AVG SCORE
          </h2>

          <p className="text-5xl font-bold text-white">
            {avgScore}
          </p>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;