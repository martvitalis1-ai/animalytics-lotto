import { Trophy, Activity, Star } from "lucide-react";

export function SportsView() {
  const games = [
    { league: "NBA", match: "LAKERS vs CELTICS", line: "O/U 228.5", pick: "OVER" },
    { league: "MLB", match: "YANKEES vs RED SOX", line: "RL -1.5", pick: "YANKEES" },
    { league: "EUROPA", match: "REAL MADRID vs CITY", line: "Gana/Empata", pick: "MADRID" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-orange-500 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="bg-orange-500 p-6 rounded-[2.5rem] shadow-xl relative z-10"><Trophy size={40} className="text-slate-900" /></div>
        <div className="relative z-10">
           <h2 className="text-3xl font-black uppercase italic leading-none">Las Vegas Sync</h2>
           <p className="text-orange-400 font-bold mt-2 uppercase text-xs">Sincronización Mundial Real</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((g, i) => (
          <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl">
             <span className="font-black text-[10px] text-emerald-500 uppercase">{g.league}</span>
             <h4 className="font-black text-xl italic mt-2 uppercase">{g.match}</h4>
             <div className="mt-4 flex justify-between items-center border-t pt-4">
                <span className="font-bold text-slate-400">{g.line}</span>
                <span className="bg-slate-900 text-emerald-400 px-4 py-1 rounded-full font-black text-xs">PICK: {g.pick}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
