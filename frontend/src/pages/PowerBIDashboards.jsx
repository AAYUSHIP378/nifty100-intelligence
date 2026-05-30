import { useState } from "react";
import { Link } from "react-router-dom";

function PowerBIDashboards() {
  const [selectedDashboard, setSelectedDashboard] = useState(null);

  // 7 Power BI Dashboards
  const dashboards = [
    {
      id: 1,
      name: "Executive Overview",
      file: "01_executive_overview.pbix",
      description: "Market Snapshot, Sector Performance, YoY Growth Tracker",
      color: "from-blue-600 to-blue-800",
    },
    {
      id: 2,
      name: "Company Deep Dive",
      file: "02_company_deep_dive.pbix",
      description: "Individual company financials, trends, and metrics",
      color: "from-purple-600 to-purple-800",
    },
    {
      id: 3,
      name: "Sector Comparison",
      file: "03_sector_comparison.pbix",
      description: "Cross-sector performance and analysis",
      color: "from-green-600 to-green-800",
    },
    {
      id: 4,
      name: "Health Scorecard",
      file: "04_health_scorecard.pbix",
      description: "Company health scores and financial ratings",
      color: "from-amber-600 to-amber-800",
    },
    {
      id: 5,
      name: "Growth Analytics",
      file: "05_growth_analytics.pbix",
      description: "Revenue growth, profit margins, and expansion trends",
      color: "from-red-600 to-red-800",
    },
    {
      id: 6,
      name: "Debt & Leverage",
      file: "06_debt_leverage.pbix",
      description: "Debt ratios, leverage analysis, and risk metrics",
      color: "from-indigo-600 to-indigo-800",
    },
    {
      id: 7,
      name: "Dividend Returns",
      file: "07_dividend_returns.pbix",
      description: "Dividend yield, payout ratios, and shareholder returns",
      color: "from-cyan-600 to-cyan-800",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Power BI Dashboards</h1>
        <p className="text-slate-400">
          Access all 7 Power BI dashboards built on Nifty 100 financial data
        </p>
      </div>

      {/* Dashboards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {dashboards.map((dashboard) => (
          <div
            key={dashboard.id}
            className="group cursor-pointer"
            onClick={() => setSelectedDashboard(dashboard)}
          >
            <div
              className={`bg-gradient-to-br ${dashboard.color} p-6 rounded-lg h-full transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{dashboard.name}</h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {dashboard.description}
                  </p>
                </div>
                <span className="text-3xl font-bold text-white/30">
                  {String(dashboard.id).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-white/60">{dashboard.file}</span>
                <span className="text-lg group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3">About these dashboards</h2>
        <ul className="text-sm text-slate-300 space-y-2">
          <li>
            ✓ Built on PostgreSQL warehouse data (dim_* and fact_* tables)
          </li>
          <li>✓ Connected to real-time financial metrics and ML scores</li>
          <li>✓ Interactive filters for company, sector, and time period</li>
          <li>
            ✓ Ready for download or embed in Power BI Service for sharing
          </li>
        </ul>
      </div>

      {/* PBIX Files Location */}
      <div className="bg-blue-950/30 border border-blue-700/50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">📁 PBIX Files Location</h3>
        <p className="text-sm text-slate-300">
          All Power BI files are located in the <code className="bg-slate-800 px-2 py-1 rounded">POWERBI/</code> folder:
        </p>
        <div className="mt-3 bg-slate-900 rounded p-3 text-xs font-mono text-slate-200 overflow-x-auto">
          <div>./POWERBI/01_executive_overview.pbix</div>
          <div>./POWERBI/02_company_deep_dive.pbix</div>
          <div>./POWERBI/03_sector_comparison.pbix</div>
          <div>./POWERBI/04_health_scorecard.pbix</div>
          <div>./POWERBI/05_growth_analytics.pbix</div>
          <div>./POWERBI/06_debt_leverage.pbix</div>
          <div>./POWERBI/07_dividend_returns.pbix</div>
        </div>
      </div>

      {/* Modal - Dashboard Details */}
      {selectedDashboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-lg max-w-2xl w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-cyan-400 text-sm font-semibold">
                  Dashboard {String(selectedDashboard.id).padStart(2, "0")}
                </span>
                <h2 className="text-3xl font-bold mt-2">
                  {selectedDashboard.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDashboard(null)}
                className="text-2xl text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 mb-6">
              {selectedDashboard.description}
            </p>

            <div className="bg-slate-800/50 rounded p-4 mb-6">
              <h3 className="font-semibold mb-2">File Details</h3>
              <p className="text-sm text-slate-300">
                <strong>File:</strong> {selectedDashboard.file}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                <strong>Location:</strong> POWERBI/{selectedDashboard.file}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold mb-3">Next Steps</h3>
              <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                <li>
                  Open Power BI Desktop
                </li>
                <li>
                  Open the .pbix file from POWERBI/ folder
                </li>
                <li>
                  Publish to Power BI Service to share and embed
                </li>
                <li>
                  Copy embed URL to display in this dashboard
                </li>
              </ol>
            </div>

            <button
              onClick={() => setSelectedDashboard(null)}
              className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PowerBIDashboards;
