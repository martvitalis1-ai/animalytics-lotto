import { useState } from 'react';
import { Trophy, Activity, Star } from "lucide-react";

export function SportsView() {
  const [sport, setSport] = useState("Fútbol");

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-orange-500 shadow-2xl relative overflow-hidden">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Las Vegas Sync</h2>
        <p className="text-orange-400 font-bold mt-2 uppercase text-xs tracking-widest">Sincronización en Tiempo Real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-xl">
          <div className="flex gap-4 mb-8">
            {["Fútbol", "Béisbol", "Basket"].map(s => (
              <button key={s} onClick={() => setSport(s)} className={`px-6 py-2 rounded-xl font-black text-xs ${sport === s ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{s}</button>
            ))}
          </div>
          {/* Mapeo de juegos tal cual el video */}
          <div className="space-y-6">
             <div className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center border-2 border-slate-100">
                <div className="flex flex-col">
                  <span className="font-black text-xl italic uppercase">Real Madrid vs Barcelona</span>
                  <span className="text-[10px] font-bold text-slate-400">LA LIGA - 02:00 PM</span>
                </div>
                <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden flex">
                   <div className="h-full bg-emerald-500" style={{width: '52%'}}></div>
                   <div className="h-full bg-orange-500" style={{width: '48%'}}></div>
                </div>
             </div>
          </div>
        </div>

        {/* PROPUESTA IA (Derecha en el video) */}
        <div className="bg-slate-900 text-white p-8 rounded-[3.5rem] border-b-8 border-emerald-500 shadow-2xl">
           <h3 className="font-black text-xl uppercase italic mb-6 flex items-center gap-2"><Star className="text-emerald-400" /> Propuesta IA</h3>
           <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <p className="font-black text-xs text-emerald-400">PICK #1</p>
                 <p className="font-bold">Real Madrid (Gana)</p>
                 <p className="text-[10px] text-slate-400 mt-1">Confianza: 88%</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
