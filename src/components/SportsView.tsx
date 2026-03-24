import { useState } from 'react';
import { Trophy, Activity, Star, Info, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SportsView() {
  const [sport, setSport] = useState("Fútbol");
  const [league, setLeague] = useState("La Liga");
  const [showPropuesta, setShowPropuesta] = useState(false);

  // Datos simulados basados en el video para recrear la experiencia exacta
  const matches = [
    { team1: "Real Madrid", team2: "Man City", time: "02:00 PM", league: "Champions League", prob1: 52, draw: 15, prob2: 33, pick: "Gana Local" },
    { team1: "Barcelona", team2: "PSG", time: "03:00 PM", league: "Champions League", prob1: 45, draw: 22, prob2: 33, pick: "Alta 2.5" },
    { team1: "Lakers", team2: "Suns", time: "08:00 PM", league: "NBA", prob1: 57, draw: 0, prob2: 43, pick: "Over 228.5" }
  ];

  const propuestaIA = [
    { team: "Real Madrid", type: "Gana", confidence: "88%", logo: "⚽" },
    { team: "Yankees", type: "-1.5 Runline", confidence: "92%", logo: "⚾" },
    { team: "Lakers", type: "Alta (228.5)", confidence: "85%", logo: "🏀" },
    { team: "Man City", type: "Ambos Anotan", confidence: "79%", logo: "⚽" }
  ];

  return (
    <div className="space-y-6 pb-40 animate-in fade-in duration-700">
      
      {/* HEADER DE SECCIÓN */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black uppercase italic text-slate-900 flex items-center gap-3">
              <Trophy className="text-orange-500" size={32} /> Tendencias Deportivas
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
              Análisis estadístico • Hockey (NHL), NFL, NBA, MLB, Fútbol (Libertadores/Champions)
            </p>
          </div>
          
          <Button 
            onClick={() => setShowPropuesta(!showPropuesta)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl h-14 px-8 shadow-lg flex items-center gap-2 uppercase italic"
          >
            <Sparkles size={18} /> Propuesta IA
          </Button>
        </div>

        {/* SELECTORES (FOTO DEL VIDEO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Deporte</label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="h-14 border-4 border-slate-900 rounded-2xl font-black bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Fútbol", "Béisbol", "Básquet", "Hockey", "NFL"].map(s => (
                  <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Liga</label>
            <Select value={league} onValueChange={setLeague}>
              <SelectTrigger className="h-14 border-4 border-slate-900 rounded-2xl font-black bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["La Liga", "Premier League", "Serie A", "Champions League", "NBA", "MLB"].map(l => (
                  <SelectItem key={l} value={l} className="font-bold">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* LISTADO DE ENCUENTROS */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-6 md:p-10 shadow-2xl">
        <h3 className="font-black text-xl uppercase italic mb-8 flex items-center gap-2 border-b-2 pb-4">
          <Activity size={20} className="text-emerald-500" /> Encuentros del Día
        </h3>
        
        <div className="space-y-12">
          {matches.map((m, i) => (
            <div key={i} className="relative group">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
                <span className="font-black text-2xl md:text-3xl uppercase italic text-slate-800">{m.team1}</span>
                <div className="bg-slate-900 text-white px-6 py-1 rounded-full font-black text-xs italic border-2 border-orange-500">
                  {m.time} VS
                </div>
                <span className="font-black text-2xl md:text-3xl uppercase italic text-slate-800">{m.team2}</span>
              </div>

              {/* BARRAS DE PROBABILIDAD (COMO EL VIDEO) */}
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 px-4">
                   <span>Gana Local {m.prob1}%</span>
                   {m.draw > 0 && <span>Empate {m.draw}%</span>}
                   <span>Gana Visitante {m.prob2}%</span>
                </div>
                <div className="w-full h-8 bg-slate-100 rounded-full overflow-hidden flex border-2 border-slate-900 shadow-inner p-1">
                   <div className="h-full bg-emerald-500 rounded-full" style={{width: `${m.prob1}%`}}></div>
                   {m.draw > 0 && <div className="h-full bg-slate-300 mx-1 rounded-full" style={{width: `${m.draw}%`}}></div>}
                   <div className="h-full bg-orange-500 rounded-full" style={{width: `${m.prob2}%`}}></div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="bg-slate-900 text-emerald-400 px-6 py-2 rounded-2xl font-black text-xs italic border-b-4 border-emerald-700">
                  SUGERENCIA IA: {m.pick}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROPUESTA ESTRATÉGICA COMBINADA (SE ACTIVA CON EL BOTÓN) */}
      {showPropuesta && (
        <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[4rem] border-b-[16px] border-emerald-500 shadow-2xl space-y-10 animate-in zoom-in duration-500">
           <div className="flex items-center gap-4">
              <div className="bg-emerald-500 p-3 rounded-2xl"><Star fill="white" size={24} /></div>
              <h3 className="font-black text-3xl uppercase italic tracking-tighter">Propuesta Estratégica Combinada</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {propuestaIA.map((p, i) => (
                <div key={i} className="bg-white/5 border-2 border-white/10 p-6 rounded-[2.5rem] flex justify-between items-center hover:bg-white/10 transition-all">
                   <div className="flex items-center gap-4">
                      <span className="text-3xl bg-slate-800 w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg border border-white/20">{p.logo}</span>
                      <div>
                         <p className="font-black text-xl italic leading-none">{p.team}</p>
                         <p className="text-emerald-400 font-black text-[10px] uppercase mt-1 tracking-widest">{p.type}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Confianza</p>
                      <p className="font-black text-2xl text-white italic">{p.confidence}</p>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="bg-white/5 p-6 rounded-[2.5rem] border-2 border-dashed border-white/20 flex flex-col items-center">
              <p className="font-black text-emerald-500 text-4xl italic tracking-tighter">PARLAY MAESTRO</p>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase">Cuota Estimada: +850 • Probabilidad de éxito: 82%</p>
           </div>
        </div>
      )}
    </div>
  );
}
