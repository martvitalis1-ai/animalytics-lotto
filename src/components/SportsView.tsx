import { useState } from 'react';
import { Trophy, Activity, Star } from "lucide-react";

export function SportsView() {
  const [sport, setSport] = useState("Fútbol");

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER DE COMANDO */}
      <div className="bg-slate-900 text-white p-12 rounded-[4rem] border-b-8 border-orange-500 shadow-2xl flex flex-col md:flex-row items-center gap-10">
        <div className="bg-orange-500 p-8 rounded-[3rem] shadow-xl"><Trophy size={60} className="text-slate-900" /></div>
        <div className="text-center md:text-left">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Las Vegas Sync</h2>
           <p className="text-orange-400 font-bold mt-3 uppercase text-sm tracking-widest flex items-center justify-center md:justify-start gap-2">
             <Activity size={16} className="animate-pulse" /> Sincronización en tiempo real
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-xl">
          <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar">
            {["Fútbol", "Béisbol", "Básquet", "Hockey"].map(s => (
              <button key={s} onClick={() => setSport(s)} className={`px-10 py-4 rounded-2xl font-black text-sm uppercase transition-all ${sport === s ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{s}</button>
            ))}
          </div>
          {/* GRÁFICOS DE PROBABILIDAD DEL VIDEO */}
          <div className="space-y-12">
             <div className="p-8 bg-slate-50 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <span className="font-black text-2xl italic uppercase">Real Madrid vs Man City</span>
                <div className="w-full md:w-64 h-4 bg-slate-200 rounded-full overflow-hidden flex">
                   <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{width: '52%'}}></div>
                   <div className="h-full bg-orange-500" style={{width: '48%'}}></div>
                </div>
                <span className="font-black text-xl text-emerald-500 uppercase">52% Win Prob</span>
             </div>
          </div>
        </div>

        {/* PROPUESTA IA DEL VIDEO */}
        <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl flex flex-col">
           <h3 className="font-black text-2xl uppercase italic mb-10 flex items-center gap-3"><Star className="text-emerald-400" fill="currentColor" /> Propuesta IA</h3>
           <div className="space-y-6 flex-1">
              {[ {pick: "Real Madrid (Gana)", conf: "88%"}, {pick: "Lakers vs Suns (Alta)", conf: "92%"} ].map((p, i) => (
                <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10">
                   <p className="font-black text-xs text-emerald-400 uppercase tracking-widest">Combinada Maestro</p>
                   <p className="font-black text-xl mt-1 uppercase italic">{p.pick}</p>
                   <p className="text-[10px] font-bold text-slate-500 mt-2">CONFIAZA DEL ALGORITMO: {p.conf}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
