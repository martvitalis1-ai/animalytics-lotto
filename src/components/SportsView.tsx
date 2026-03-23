import { useState } from 'react';
import { Trophy, Activity, Star, Info } from "lucide-react";

export function SportsView() {
  const [sport, setSport] = useState("Fútbol");

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-40">
      <div className="bg-slate-900 text-white p-12 rounded-[4rem] border-b-8 border-orange-500 shadow-2xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        <div className="bg-orange-500 p-8 rounded-[3rem] shadow-xl relative z-10"><Trophy size={60} className="text-slate-900" /></div>
        <div className="relative z-10">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Las Vegas Sync</h2>
           <p className="text-orange-400 font-bold mt-3 uppercase text-sm tracking-widest italic">Sincronización de Líneas Mundiales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-10 items-start">
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-xl space-y-10">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {["Fútbol", "Béisbol", "Básquet", "Hockey"].map(s => (
              <button key={s} onClick={() => setSport(s)} className={`px-10 py-4 rounded-2xl font-black text-sm uppercase transition-all ${sport === s ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-400'}`}>{s}</button>
            ))}
          </div>
          
          {/* JUEGOS DEL DÍA CON BARRAS DE PROBABILIDAD */}
          <div className="space-y-10">
             {[1, 2, 3].map(i => (
               <div key={i} className="p-8 bg-slate-50 rounded-[3rem] border-2 border-slate-100 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-2xl italic uppercase text-slate-800">Real Madrid vs Man City</span>
                    <span className="bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[10px]">LA LIGA</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Local 52%</span><span>Visitante 48%</span></div>
                    <div className="w-full h-5 bg-slate-200 rounded-full overflow-hidden flex border-2 border-white shadow-inner">
                       <div className="h-full bg-emerald-500" style={{width: '52%'}}></div>
                       <div className="h-full bg-orange-500" style={{width: '48%'}}></div>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* PROPUESTA IA (DERECHA DEL VIDEO) */}
        <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl space-y-10">
           <h3 className="font-black text-2xl uppercase italic flex items-center gap-3"><Star className="text-emerald-400" fill="currentColor" /> Propuesta IA</h3>
           <div className="space-y-6">
              {[ {pick: "Real Madrid (Gana)", conf: "88%"}, {pick: "Yankees -1.5", conf: "92%"}, {pick: "Lakers vs Suns (Alta)", conf: "85%"} ].map((p, i) => (
                <div key={i} className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all">
                   <p className="font-black text-[10px] text-emerald-400 uppercase tracking-widest mb-1">Pick Recomendado</p>
                   <p className="font-black text-xl uppercase italic leading-tight">{p.pick}</p>
                   <div className="mt-4 flex items-center gap-2"><div className="h-1 flex-1 bg-white/10 rounded-full"><div className="h-full bg-emerald-500" style={{width: p.conf}}></div></div><span className="font-black text-[10px]">{p.conf}</span></div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
