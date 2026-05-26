import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

function CompanyDeepDive() {

  const { symbol } = useParams();

  const [data, setData] = useState([]);
  const [companyData, setCompanyData] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================

  useEffect(() => {

    const fetchCompanies = async () => {

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

        console.error(
          "Company Deep Dive Error:",
          err
        );

      } finally {

        setLoading(false);

      }

    };

    fetchCompanies();

  }, []);

  // ================= FIND COMPANY =================
  // IMPORTANT:
  // NO setState here
  // useMemo fixes rerender issue

  const selectedCompany = useMemo(() => {

    if (!symbol) return null;

    return data.find(

      item =>

        item.symbol
          ?.toLowerCase()
          .trim() ===
        symbol
          ?.toLowerCase()
          .trim()

    ) || null;

  }, [data, symbol]);

  // ================= HEALTH CLASS =================

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

  // ================= RISK LEVEL =================

  const getRisk = (health) => {

    if (health === "POOR")
      return "HIGH";

    if (health === "WEAK")
      return "MEDIUM";

    return "LOW";

  };

  // ================= RISK CLASS =================

  const getRiskClass = (risk) => {

    if (risk === "LOW")
      return "bg-green-500/20 text-green-400 border border-green-500/30";

    if (risk === "MEDIUM")
      return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";

    return "bg-red-500/20 text-red-400 border border-red-500/30";

  };

  // ================= FILTERED DATA =================

  const filtered = useMemo(() => {

    return data.filter(item =>

      item.symbol
        ?.toLowerCase()
        .includes(search.toLowerCase())

    );

  }, [data, search]);

  // ================= COUNTS =================

  const excellentCount = filtered.filter(
    item => item.health_label === "EXCELLENT"
  ).length;

  const goodCount = filtered.filter(
    item => item.health_label === "GOOD"
  ).length;

  const averageCount = filtered.filter(
    item => item.health_label === "AVERAGE"
  ).length;

  const weakCount = filtered.filter(
    item => item.health_label === "WEAK"
  ).length;

  const poorCount = filtered.filter(
    item => item.health_label === "POOR"
  ).length;

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="flex justify-center items-center h-screen bg-slate-950">

        <div className="h-16 w-16 border-t-4 border-cyan-400 rounded-full animate-spin"></div>

      </div>

    );

  }

  // ================= SINGLE COMPANY PAGE =================

  if (symbol) {

    // ================= NOT FOUND =================

    if (!selectedCompany) {

      return (

        <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-6">

          <h1 className="text-5xl font-bold text-red-400 mb-4">

            Company Not Found

          </h1>

          <p className="text-slate-400 mb-8 text-center">

            No company data available for this symbol.

          </p>

          <Link
            to="/company"
            className="bg-cyan-600 hover:bg-cyan-700 transition px-6 py-3 rounded-2xl font-semibold"
          >

            Back To Companies

          </Link>

        </div>

      );

    }

    const risk =
      getRisk(selectedCompany.health_label);

    const score = Number(
      selectedCompany.overall_score || 0
    );

    return (

      <div className="min-h-screen bg-slate-950 text-white p-6">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-10">

          <div>

            <h1 className="text-5xl font-bold text-cyan-400 mb-3">

              🏢 {selectedCompany.symbol}

            </h1>

            <p className="text-slate-400 text-lg">

              Detailed AI powered financial intelligence report

            </p>

          </div>

          <Link
            to="/company"
            className="bg-slate-800 hover:bg-slate-700 transition px-6 py-3 rounded-2xl text-center"
          >

            ← Back To Companies

          </Link>

        </div>

        {/* TOP METRICS */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <p className="text-slate-400 mb-3">

              Overall ML Score

            </p>

            <h2 className="text-6xl font-bold text-white">

              {score.toFixed(2)}

            </h2>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <p className="text-slate-400 mb-4">

              Health Status

            </p>

            <span
              className={`px-5 py-3 rounded-full text-lg font-bold ${getHealthClass(selectedCompany.health_label)}`}
            >

              {selectedCompany.health_label}

            </span>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <p className="text-slate-400 mb-4">

              Risk Level

            </p>

            <span
              className={`px-5 py-3 rounded-full text-lg font-bold ${getRiskClass(risk)}`}
            >

              {risk}

            </span>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <p className="text-slate-400 mb-3">

              Market Status

            </p>

            <h2 className="text-4xl font-bold text-green-400">

              ACTIVE

            </h2>

          </div>

        </div>

        {/* PERFORMANCE */}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-10">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-3xl font-bold text-cyan-400">

              Performance Strength

            </h2>

            <span className="text-2xl font-bold">

              {score.toFixed(0)}%

            </span>

          </div>

          <div className="w-full bg-slate-800 rounded-full h-5 overflow-hidden">

            <div
              className="bg-cyan-400 h-5 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(score, 100)}%`
              }}
            ></div>

          </div>

        </div>

        {/* DETAILS */}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

          <h2 className="text-3xl font-bold mb-8 text-cyan-400">

            Company Intelligence

          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-slate-800 rounded-2xl p-6">

              <p className="text-slate-400 mb-2">

                Company Symbol

              </p>

              <p className="text-3xl font-bold text-white">

                {selectedCompany.symbol}

              </p>

            </div>

            <div className="bg-slate-800 rounded-2xl p-6">

              <p className="text-slate-400 mb-2">

                Health Classification

              </p>

              <p className="text-3xl font-bold text-white">

                {selectedCompany.health_label}

              </p>

            </div>

            <div className="bg-slate-800 rounded-2xl p-6">

              <p className="text-slate-400 mb-2">

                Financial Risk

              </p>

              <p className="text-3xl font-bold text-white">

                {risk}

              </p>

            </div>

            <div className="bg-slate-800 rounded-2xl p-6">

              <p className="text-slate-400 mb-2">

                AI Prediction Score

              </p>

              <p className="text-3xl font-bold text-cyan-400">

                {score.toFixed(2)}

              </p>

            </div>

          </div>

        </div>

      </div>

    );

  }

  // ================= COMPANY LIST PAGE =================

  return (

    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}

      <div className="mb-10">

        <h1 className="text-5xl font-bold text-cyan-400 mb-3">

          🏢 Company Deep Dive

        </h1>

        <p className="text-slate-400 text-lg">

          Detailed ML powered analysis of all companies

        </p>

      </div>

      {/* SEARCH */}

      <div className="mb-10">

        <input
          type="text"
          placeholder="Search Company Symbol..."
          className="bg-slate-900 border border-slate-700 px-5 py-4 rounded-2xl w-full md:w-96 text-white focus:outline-none focus:border-cyan-500"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-6 mb-12">

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

          <h2 className="text-slate-400 text-sm mb-3">

            TOTAL

          </h2>

          <p className="text-5xl font-bold text-cyan-400">

            {filtered.length}

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

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-3xl p-6">

          <h2 className="text-orange-300 text-sm mb-3">

            WEAK

          </h2>

          <p className="text-5xl font-bold">

            {weakCount}

          </p>

        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6">

          <h2 className="text-red-300 text-sm mb-3">

            POOR

          </h2>

          <p className="text-5xl font-bold">

            {poorCount}

          </p>

        </div>

      </div>

      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {filtered.map((item, index) => (

          <Link
            to={`/company/${item.symbol}`}
            key={item.symbol || index}
          >

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-lg hover:scale-105 hover:border-cyan-500/40 transition duration-300">

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-3xl font-bold text-cyan-400">

                  {item.symbol}

                </h2>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${getHealthClass(item.health_label)}`}
                >

                  {item.health_label}

                </span>

              </div>

              <div className="bg-slate-800 rounded-2xl p-5 mb-6">

                <p className="text-slate-400 mb-2">

                  Overall ML Score

                </p>

                <h3 className="text-5xl font-bold text-white">

                  {Number(
                    item.overall_score || 0
                  ).toFixed(2)}

                </h3>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </div>

  );

}

export default CompanyDeepDive;