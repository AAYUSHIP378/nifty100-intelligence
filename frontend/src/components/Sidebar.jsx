import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {

  const location = useLocation();

  const menu = [

    {
      name: "Executive Overview",
      path: "/dashboard"
    },

    {
      name: "Company Deep Dive",
      path: "/company"
    },

    {
      name: "Sector Analysis",
      path: "/sectors"
    },

    {
      name: "Health Scorecard",
      path: "/health"
    },

    {
      name: "Growth Analytics",
      path: "/growth"
    },

    {
      name: "Debt Monitor",
      path: "/debt"
    },

    {
      name: "Dividend Analytics",
      path: "/dividend"
    },

    {
      name: "Risk Dashboard",
      path: "/risk"
    }

  ];

  return (

    <div className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col">

      {/* LOGO */}

      <div className="p-6 border-b border-slate-800">

        <h1 className="text-2xl font-bold text-blue-400">
          B100 Intelligence
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Financial Analytics Platform
        </p>

      </div>

      {/* MENU */}

      <div className="flex-1 p-4 space-y-2">

        {menu.map((item, index) => (

          <Link
            key={index}
            to={item.path}
            className={`block px-4 py-3 rounded-xl transition-all duration-200

              ${
                location.pathname === item.path
                  ? "bg-blue-500 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300"
              }
            `}
          >

            {item.name}

          </Link>

        ))}

      </div>

      {/* FOOTER */}

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">

        Nifty 100 Intelligence System

      </div>

    </div>

  );
}