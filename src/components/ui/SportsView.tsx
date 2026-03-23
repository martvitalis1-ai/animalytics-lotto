// src/components/SportsView.tsx
import { Trophy, Globe, Activity } from "lucide-react";

export function SportsView() {
  const games = [
    { league: "NBA - USA", match: "LAKERS vs CELTICS", line: "O/U 228.5", pick: "OVER" },
    { league: "MLB - USA", match: "YANKEES vs RED SOX", line: "RL -1.5", pick: "YANKEES" },
    { league: "CHAMPIONS LEAGUE", match: "REAL MADRID vs MAN CITY", line: "Gana/Empata", pick: "MADRID" },
    { league: "NBA - USA", match: "WARRIORS vs SUNS", line: "H -4.5", pick: "WARRIORS" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* HEADER DE ALTO IMPACTO */}
      <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-orange-500 shadow-2xl relative overflow-hidden">
        <Globe className="absolute right-[-20px] bottom-[-20px] size-64 opacity-10 rotate-12 text-orange-500" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
           <div className="bg-orange-500 p-8 rounded-[3rem] shadow-[0_0_40px_rgba(249,115,22,0.4)]">
              <Trophy size={50} className="text-slate-900" />
           </div>
           <div className="text-center md:text-left">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter">LAS VEGAS SYNC: LÍNEAS MUNDIALES</h2>
              <p className="text-orange-400 font-black mt-3 uppercase text-sm tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
                <Activity size={16} className="animate-pulse" /> Sincronización en tiempo real con cuotas oficiales
              </p>
           </div>
        </div>
      </div>

      {/* REJILLA DE LOGROS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {games.map((g, i) => (
          <div key={i} className="bg-white border-4 border-slate-900 rounded-[3.5rem] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] transition-all">
             <div className="flex justify-between items-start">
                <span className="bg-slate-100 text-slate-500 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">{g.league}</span>
                <div className="bg-orange-500/10 text-orange-600 p-2 rounded-full"><Trophy size={16}/></div>
             </div>
             <h4 className="font-black text-2xl italic uppercase mt-4 text-slate-800 leading-tight">{g.match}</h4>
             <div className="mt-8 flex justify-between items-center border-t-4 border-slate-50 pt-6">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Línea/Límite</span>
                   <span className="font-black text-xl text-slate-900">{g.line}</span>
                </div>
                <div className="bg-slate-900 text-emerald-400 px-6 py-3 rounded-2xl font-black text-lg shadow-xl border-b-4 border-emerald-700">
                   PICK: {g.pick}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
