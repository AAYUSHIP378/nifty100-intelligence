import { Link } from "react-router-dom";

function Sidebar() {

  return (

    <div className="w-72 bg-slate-900 min-h-screen p-5 border-r border-slate-800">

      <h1 className="text-2xl font-bold text-white mb-8">
        B100 Intelligence
      </h1>

      <div className="flex flex-col gap-3">

        <Link to="/dashboard" className="text-white">
          📊 Dashboard
        </Link>

        <Link to="/risk" className="text-white">
          ⚠️ Risk Dashboard
        </Link>

        <Link to="/company" className="text-white">
          🏢 Company Deep Dive
        </Link>

        <Link to="/sectors" className="text-white">
          📈 Sector Analysis
        </Link>

        <Link to="/health" className="text-white">
          💎 Health Scorecard
        </Link>

        <Link to="/growth" className="text-white">
          🚀 Growth Analytics
        </Link>

        <Link to="/debt" className="text-white">
          💰 Debt Monitor
        </Link>

        <Link to="/dividend" className="text-white">
          🏆 Dividend Analytics
        </Link>

        <Link to="/admin" className="text-white">
          👑 Admin
        </Link>

      </div>

    </div>

  );

}

export default Sidebar;