import { useState, useMemo } from 'react';
import { Trophy, Activity, Star, Info, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdBanner } from "./AdBanner"; // 🛡️ Importación integrada correctamente arriba

// 🛡️ MOTOR DE DATOS INTELIGENTE (ESTUDIO REAL) - INTACTO
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

  // 🧠 LÓGICA DE FILTRADO INTELIGENTE - INTACTA
  const ligasDisponibles = useMemo(() => DEPORTES_DATA[sport as keyof typeof DEPORTES_DATA].ligas, [sport]);
  
  const partidosFiltrados = useMemo(() => {
    return DEPORTES_DATA[sport as keyof typeof DEPORTES_DATA].partidos.filter(p => p.liga === league);
  }, [sport, league]);

  const handleSportChange = (newSport: string) => {
    setSport(newSport);
    setLeague(DEPORTES_DATA[newSport as keyof typeof DEPORTES_DATA].ligas[0]);
  };

  return (
    <div className="space-y-6 pb-40 animate-in fade-in duration-700 px-1">
      
      {/* HEADER DE SECCIÓN */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 flex items-center gap-3 tracking-tighter">
              <Trophy className="text-orange-500" size={32} /> Tendencias Deportivas
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
              Análisis Estadístico Maestra • Sincronización Mundial
            </p>
          </div>
          
          <Button 
            onClick={() => setShowPropuesta(!showPropuesta)}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-black rounded-2xl h-14 px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 uppercase italic border-2 border-slate-900"
          >
            <Sparkles size={18} /> Propuesta IA
          </Button>
        </div>

        {/* SELECTORES */}
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
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[4rem] p-6 md:p-10 shadow-2xl overflow-hidden">
        <h3 className="font-black text-lg md:text-xl uppercase italic mb-8 flex items-center gap-2 border-b-2 pb-4 text-slate-800">
          <Activity size={20} className="text-emerald-500" /> Partidos: {league}
        </h3>
        
        <div className="space-y-16">
          {partidosFiltrados.length > 0 ? partidosFiltrados.map((m, i) => (
            <div key={i} className="relative">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
                <div className="flex flex-col items-center flex-1">
                   <span className="font-black text-xl md:text-3xl uppercase italic text-slate-900 text-center">{m.t1}</span>
                   <span className="text-[9px] bg-slate-100 px-3 py-1 rounded-full font-black mt-2">LOCAL</span>
                </div>
                
                <div className="bg-slate-900 text-white w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center border-4 border-emerald-500 shadow-xl shrink-0">
                   <span className="text-[8px] font-black opacity-50 uppercase">Versus</span>
                   <span className="font-black text-[10px] md:text-xs">{m.time}</span>
                </div>
                
                <div className="flex flex-col items-center flex-1">
                   <span className="font-black text-xl md:text-3xl uppercase italic text-slate-900 text-center">{m.t2}</span>
                   <span className="text-[9px] bg-slate-100 px-3 py-1 rounded-full font-black mt-2">VISITANTE</span>
                </div>
              </div>

              {/* BARRAS DE PROBABILIDAD */}
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 px-2 md:px-4">
                   <span className="text-emerald-600">{m.t1}: {m.p1}%</span>
                   {m.draw > 0 && <span>Empate: {m.draw}%</span>}
                   <span className="text-orange-600">{m.t2}: {m.p2}%</span>
                </div>
                <div className="w-full h-8 bg-slate-100 rounded-full overflow-hidden flex border-2 border-slate-900 shadow-inner p-1">
                   <div className="h-full bg-emerald-500 rounded-full" style={{width: `${m.p1}%`}}></div>
                   {m.draw > 0 && <div className="h-full bg-slate-300 mx-1 rounded-full" style={{width: `${m.draw}%`}}></div>}
                   <div className="h-full bg-orange-500 rounded-full" style={{width: `${m.p2}%`}}></div>
                </div>
              </div>

              <div className="mt-8 flex justify-center px-2">
                <div className="bg-slate-900 text-emerald-400 px-4 md:px-8 py-3 rounded-2xl font-black text-[10px] md:text-sm italic border-b-4 border-emerald-700 flex items-center gap-2 shadow-lg text-center">
                  <CheckCircle2 size={14} className="shrink-0" /> SUGERENCIA: {m.pick}
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center text-slate-300 font-black uppercase italic">No hay encuentros disponibles</div>
          )}
        </div>
      </div>

      {/* PROPUESTA IA COMBINADA */}
      {showPropuesta && (
        <div className="bg-slate-900 text-white p-6 md:p-12 rounded-[3rem] md:rounded-[4rem] border-b-[12px] border-emerald-500 shadow-2xl space-y-8 animate-in zoom-in duration-500">
           <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="bg-emerald-500 p-2 md:p-3 rounded-xl shadow-lg"><Star fill="white" size={20} /></div>
              <h3 className="font-black text-xl md:text-3xl uppercase italic tracking-tighter">Combinada de Alta Probabilidad</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[partidosFiltrados[0]].map((p, i) => (
                <div key={i} className="bg-white/5 border-2 border-white/10 p-5 rounded-3xl flex justify-between items-center shadow-inner">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-black text-lg text-emerald-400">#1</div>
                      <div>
                         <p className="font-black text-lg italic leading-none">{p?.t1} v {p?.t2}</p>
                         <p className="text-emerald-400 font-black text-[9px] uppercase mt-2 tracking-widest">{p?.pick}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* 🛡️ BANNER DE PUBLICIDAD INTEGRADO AL FINAL DEL DIV PRINCIPAL */}
      <AdBanner slotId="deportes" />
      
    </div>
  );
}
