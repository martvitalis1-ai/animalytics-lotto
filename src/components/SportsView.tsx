import { useState } from 'react';
import { Trophy, Globe, Activity, Star, Info } from "lucide-react";

export function SportsView() {
  const [sport, setSport] = useState("NBA");

  const parleys = {
    "NBA": [
      { day: "Lunes 23/03", time: "07:30 PM", match: "LAKERS vs CELTICS", pick: "OVER 228.5", detail: "Ambos equipos vienen de anotar +115 puntos en sus últimos 3 choques. Defensas mermadas por lesiones." },
      { day: "Lunes 23/03", time: "08:00 PM", match: "WARRIORS vs SUNS", pick: "SUNS A GANAR", detail: "Warriors con baja de Curry en el último minuto. Suns domina la pintura 2 a 1." }
    ],
    "FUTBOL": [
      { day: "Lunes 23/03", time: "03:00 PM", match: "REAL MADRID vs MAN CITY", pick: "ALTA 2.5", detail: "Promedio de goles en Champions para estos equipos es de 3.2. Historial ofensivo pesado." }
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-orange-500 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Líneas de Las Vegas</h2>
          <div className="flex gap-2 bg-white/10 p-2 rounded-2xl">
            {["NBA", "MLB", "FUTBOL"].map(s => (
              <button key={s} onClick={() => setSport(s)} className={`px-6 py-2 rounded-xl font-black text-xs ${sport === s ? 'bg-orange-500 text-slate-900' : 'text-white'}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {parleys[sport as keyof typeof parleys]?.map((g, i) => (
          <div key={i} className="bg-white border-4 border-slate-900 rounded-[3.5rem] p-8 shadow-xl">
            <div className="flex justify-between items-center border-b-4 border-slate-50 pb-4 mb-4">
              <span className="font-black text-xs text-slate-400 uppercase tracking-widest">{g.day} | {g.time}</span>
              <span className="bg-emerald-500 text-white px-4 py-1 rounded-full font-black text-[10px]">RECOMENDADO</span>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-black text-3xl italic uppercase text-slate-800">{g.match}</h4>
                <div className="mt-4 p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
                   <p className="font-black text-orange-600 text-xl">LOGRO: {g.pick}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 flex gap-4">
                <Info className="text-slate-400 shrink-0" />
                <p className="text-sm font-bold text-slate-500 leading-relaxed italic">{g.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
