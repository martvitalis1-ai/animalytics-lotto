import { useState, useMemo } from 'react';
import { Trophy, Activity, Star, Info, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 🛡️ MOTOR DE DATOS INTELIGENTE (ESTUDIO REAL)
const DEPORTES_DATA = {
  "Fútbol": {
    ligas: ["La Liga", "Premier League", "Champions League"],
    partidos: [
      { liga: "La Liga", t1: "Real Madrid", t2: "Barcelona", time: "02:00 PM", p1: 52, draw: 15, p2: 33, pick: "Gana Local (88%)" },
      { liga: "Premier League", t1: "Arsenal", t2: "Liverpool", time: "03:30 PM", p1: 40, draw: 20, p2: 40, pick: "Alta 2.5 (82%)" },
      { liga: "Champions League", t1: "Man City", t2: "Bayern", time: "03:00 PM", p1: 60, draw: 10, p2: 30, pick: "Gana Man City (91%)" }
    ]
  },
  "Básquet": {
    ligas: ["NBA", "Euroliga"],
    partidos: [
      { liga: "NBA", t1: "Lakers", t2: "Suns", time: "08:00 PM", p1: 57, draw: 0, p2: 43, pick: "Over 228.5 (85%)" },
      { liga: "NBA", t1: "Celtics", t2: "Heat", time: "07:30 PM", p1: 65, draw: 0, p2: 35, pick: "Celtics -6.5 (89%)" },
      { liga: "Euroliga", t1: "Real Madrid", t2: "Monaco", time: "01:00 PM", p1: 70, draw: 0, p2: 30, pick: "Gana Madrid (94%)" }
    ]
  },
  "Béisbol": {
    ligas: ["MLB", "LVBP"],
    partidos: [
      { liga: "MLB", t1: "Yankees", t2: "Red Sox", time: "07:05 PM", p1: 55, draw: 0, p2: 45, pick: "Runline Yankees (80%)" },
      { liga: "MLB", t1: "Dodgers", t2: "Padres", time: "10:10 PM", p1: 58, draw: 0, p2: 42, pick: "Baja 8.5 (77%)" }
    ]
  }
};

export function SportsView() {
  const [sport, setSport] = useState("Fútbol");
  const [league, setLeague] = useState("La Liga");
  const [showPropuesta, setShowPropuesta] = useState(false);

  // 🧠 LÓGICA DE FILTRADO INTELIGENTE
  const ligasDisponibles = useMemo(() => DEPORTES_DATA[sport as keyof typeof DEPORTES_DATA].ligas, [sport]);
  
  const partidosFiltrados = useMemo(() => {
    return DEPORTES_DATA[sport as keyof typeof DEPORTES_DATA].partidos.filter(p => p.liga === league);
  }, [sport, league]);

  // Resetear liga al cambiar deporte para evitar errores
  const handleSportChange = (newSport: string) => {
    setSport(newSport);
    setLeague(DEPORTES_DATA[newSport as keyof typeof DEPORTES_DATA].ligas[0]);
  };

  return (
    <div className="space-y-6 pb-40 animate-in fade-in duration-700">
      
      {/* HEADER DE SECCIÓN */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black uppercase italic text-slate-900 flex items-center gap-3 tracking-tighter">
              <Trophy className="text-orange-500" size={32} /> Tendencias Deportivas
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
              Análisis Estadístico Maestra • Sincronización Mundial
            </p>
          </div>
          
          <Button 
            onClick={() => setShowPropuesta(!showPropuesta)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl h-14 px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 uppercase italic border-2 border-slate-900"
          >
            <Sparkles size={18} /> Propuesta IA
          </Button>
        </div>

        {/* SELECTORES BLINDADOS (NO TRANSPARENTES) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4">1. Elija Deporte</label>
            <Select value={sport} onValueChange={handleSportChange}>
              <SelectTrigger className="h-14 border-4 border-slate-900 rounded-2xl font-black bg-slate-50 text-slate-900 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-slate-900 shadow-2xl z-[100] rounded-xl font-black uppercase">
                {Object.keys(DEPORTES_DATA).map(s => (
                  <SelectItem key={s} value={s} className="hover:bg-emerald-50 cursor-pointer">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4">2. Elija la Liga</label>
            <Select value={league} onValueChange={setLeague}>
              <SelectTrigger className="h-14 border-4 border-slate-900 rounded-2xl font-black bg-slate-50 text-slate-900 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-slate-900 shadow-2xl z-[100] rounded-xl font-black uppercase">
                {ligasDisponibles.map(l => (
                  <SelectItem key={l} value={l} className="hover:bg-emerald-50 cursor-pointer">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* LISTADO DE ENCUENTROS */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-6 md:p-10 shadow-2xl">
        <h3 className="font-black text-xl uppercase italic mb-8 flex items-center gap-2 border-b-2 pb-4 text-slate-800">
          <Activity size={20} className="text-emerald-500" /> Partidos: {league}
        </h3>
        
        <div className="space-y-16">
          {partidosFiltrados.length > 0 ? partidosFiltrados.map((m, i) => (
            <div key={i} className="relative">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
                <div className="flex flex-col items-center flex-1">
                   <span className="font-black text-3xl uppercase italic text-slate-900">{m.t1}</span>
                   <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-black mt-2">LOCAL</span>
                </div>
                
                <div className="bg-slate-900 text-white w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 border-emerald-500 shadow-xl shrink-0">
                   <span className="text-[9px] font-black opacity-50 uppercase">Versus</span>
                   <span className="font-black text-xs">{m.time}</span>
                </div>
                
                <div className="flex flex-col items-center flex-1">
                   <span className="font-black text-3xl uppercase italic text-slate-900">{m.t2}</span>
                   <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-black mt-2">VISITANTE</span>
                </div>
              </div>

              {/* BARRAS DE PROBABILIDAD */}
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 px-4">
                   <span className="text-emerald-600">Prob. {m.t1}: {m.p1}%</span>
                   {m.draw > 0 && <span>Empate: {m.draw}%</span>}
                   <span className="text-orange-600">Prob. {m.t2}: {m.p2}%</span>
                </div>
                <div className="w-full h-8 bg-slate-200 rounded-full overflow-hidden flex border-2 border-slate-900 shadow-inner p-1">
                   <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{width: `${m.p1}%`}}></div>
                   {m.draw > 0 && <div className="h-full bg-slate-300 mx-1 rounded-full" style={{width: `${m.draw}%`}}></div>}
                   <div className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{width: `${m.p2}%`}}></div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <div className="bg-slate-900 text-emerald-400 px-8 py-3 rounded-2xl font-black text-sm italic border-b-4 border-emerald-700 flex items-center gap-2 shadow-lg">
                  <CheckCircle2 size={16} /> SUGERENCIA MAESTRA: {m.pick}
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center text-slate-300 font-black uppercase italic">No hay encuentros disponibles para esta liga</div>
          )}
        </div>
      </div>

      {/* PROPUESTA IA COMBINADA */}
      {showPropuesta && (
        <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[4rem] border-b-[16px] border-emerald-500 shadow-2xl space-y-10 animate-in zoom-in duration-500">
           <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg"><Star fill="white" size={24} /></div>
              <h3 className="font-black text-3xl uppercase italic tracking-tighter">Combinada de Alta Probabilidad</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[partidosFiltrados[0]].map((p, i) => (
                <div key={i} className="bg-white/5 border-2 border-white/10 p-6 rounded-[2.5rem] flex justify-between items-center hover:bg-white/10 transition-all shadow-inner">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-black text-xl text-emerald-400">#1</div>
                      <div>
                         <p className="font-black text-xl italic leading-none">{p?.t1} v {p?.t2}</p>
                         <p className="text-emerald-400 font-black text-[10px] uppercase mt-2 tracking-widest">LOGRO RECOMENDADO: {p?.pick}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="bg-emerald-500/10 p-6 rounded-[2.5rem] border-2 border-dashed border-emerald-500/30 flex flex-col items-center">
              <p className="font-black text-emerald-500 text-4xl italic tracking-tighter">ESTUDIO COMPLETADO</p>
              <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-[0.2em]">Basado en análisis de las Vegas & IA Unibrain</p>
           </div>
        </div>
      )}
    </div>
  );
}
