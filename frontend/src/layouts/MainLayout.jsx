import { Link, useLocation, Outlet } from "react-router-dom";

function MainLayout() {

  const location = useLocation();

  const menus = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "📊"
    },

    {
      name: "Risk Dashboard",
      path: "/risk",
      icon: "⚠️"
    },

    {
      name: "Company Deep Dive",
      path: "/company",
      icon: "🏢"
    },

    {
      name: "Sector Analysis",
      path: "/sectors",
      icon: "📈"
    },

    {
      name: "Health Scorecard",
      path: "/health",
      icon: "💎"
    },

    {
      name: "Growth Analytics",
      path: "/growth",
      icon: "🚀"
    },

    {
      name: "Debt Monitor",
      path: "/debt",
      icon: "💰"
    },

    {
      name: "Dividend Analytics",
      path: "/dividend",
      icon: "🏆"
    },

    {
      name: "Admin",
      path: "/admin",
      icon: "👑"
    }

  ];

  return (

    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* ================= SIDEBAR ================= */}

      <aside className="w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col">

        <h1 className="text-3xl font-bold text-blue-400 mb-10">

          B100 Intelligence

        </h1>

        <div className="space-y-3">

          {menus.map((item, index) => (

            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300

              ${
                location.pathname === item.path
                  ? "bg-blue-600 shadow-lg"
                  : "hover:bg-slate-800"
              }
              
              `}
            >

              <span className="text-xl">

                {item.icon}

              </span>

              <span className="font-medium">

                {item.name}

              </span>

            </Link>

          ))}

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ================= TOPBAR ================= */}

        <div className="bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-white">

            Financial Analytics Platform

          </h2>

          <div className="text-sm text-slate-400">

            Nifty 100 Intelligence System

          </div>

        </div>

        {/* ================= PAGE CONTENT ================= */}

        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">

          <Outlet />

        </div>

      </main>

    </div>

  );

}

export default MainLayout;