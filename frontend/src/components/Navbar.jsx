export default function Navbar() {

  return (

    <div className="h-20 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">

      {/* TITLE */}

      <div>

        <h2 className="text-2xl font-semibold">

          Financial Intelligence Dashboard

        </h2>

        <p className="text-sm text-slate-400">

          Nifty 100 Analytics Platform

        </p>

      </div>

      {/* RIGHT SIDE */}

      <div className="flex items-center gap-4">

        <div className="bg-slate-800 px-4 py-2 rounded-lg">

          <p className="text-sm text-slate-300">
            Live Analytics
          </p>

        </div>

      </div>

    </div>

  );
}