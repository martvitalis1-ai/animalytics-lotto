import { useState, useMemo } from 'react';
import { Trophy, Activity, Star, Info, Sparkles, CheckCircle2, Award, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdBanner } from "./AdBanner";

// 🐎 MOTOR DE HIPISMO PROFESIONAL
const HIPISMO_DATA = {
  "La Rinconada (VEN)": [
    { 
      carrera: "5ta Válida (5y6)", 
      distancia: "1.200m", 
      caballo: "LUNA NUEVA", 
      numero: "05",
      jinete: "R. Capriles", 
      entrenador: "R. García",
      analisis: "Presenta el mejor speed rating de la distancia. Su última carrera fue un 'trámite' y hoy sale por el puesto 1, ideal para su estilo de punta. El entrenador García tiene 35% de efectividad con Capriles en esta distancia."
    }
  ],
  "Gulfstream Park (USA)": [
    { 
      carrera: "8va Race (Optional Claiming)", 
      distancia: "1.700m (Tapeta)", 
      caballo: "GLOBAL SENSATION", 
      numero: "02",
      jinete: "Irad Ortiz Jr.", 
      entrenador: "Todd Pletcher",
      analisis: "Pletcher baja de lote a este ejemplar tras fallar en un Grado 3. El cambio a la monta de Irad Ortiz es clave; las estadísticas muestran que cuando Irad monta para este establo en Tapeta, la efectividad sube al 42%. Los rivales directos vienen de descansos largos."
    }
  ]
};

const DEPORTES_DATA = {
  "Fútbol": [
    { liga: "Champions League", t1: "Real Madrid", t2: "Man City", pick: "Over 2.5 Goles", analisis: "Ambos equipos llegan con promedio goleador superior a 2.1 por partido. La baja del central titular en el equipo visitante deja espacios que Vinicius aprovechará en transiciones rápidas." }
  ],
  "NBA": [
    { liga: "NBA", t1: "Lakers", t2: "Warriors", pick: "Warriors ML", analisis: "Curry viene de promediar 32 puntos en la semana. La defensa perimetral de Lakers ha permitido un 38% en triples en los últimos 3 juegos. Pronosticamos victoria directa visitante." }
  ]
};

export function SportsView() {
  const [activeTab, setActiveTab] = useState<'deportes' | 'hipismo'>('deportes');

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-700">
      
      {/* HEADER DE SECCIÓN */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
           <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
             <Trophy className="text-yellow-400" size={48} /> Centro de Análisis
           </h2>
           <p className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mt-2">Sincronización Maestra de Tendencias Deportivas</p>
        </div>
      </div>

      {/* SELECTOR DE CATEGORÍA (Bunker Style) */}
      <div className="flex bg-white border-4 border-slate-900 rounded-full p-2 shadow-xl max-w-md mx-auto">
         <button 
           onClick={() => setActiveTab('deportes')}
           className={`flex-1 py-3 rounded-full font-black uppercase text-xs transition-all ${activeTab === 'deportes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
         >
           Deportes
         </button>
         <button 
           onClick={() => setActiveTab('hipismo')}
           className={`flex-1 py-3 rounded-full font-black uppercase text-xs transition-all ${activeTab === 'hipismo' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
         >
           Carreras de Caballos
         </button>
      </div>

      {/* CONTENIDO: DEPORTES */}
      {activeTab === 'deportes' && (
        <div className="space-y-8">
           {Object.entries(DEPORTES_DATA).map(([deporte, items]) => (
             <div key={deporte} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-8 shadow-xl">
                <h3 className="font-black text-2xl uppercase italic text-slate-900 border-b-4 border-slate-100 pb-2 mb-6 flex items-center gap-3">
                   <Activity className="text-emerald-500" /> {deporte}
                </h3>
                <div className="grid gap-6">
                   {items.map((item, i) => (
                     <div key={i} className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                           <span className="font-black text-lg md:text-2xl uppercase italic text-slate-800">{item.t1} vs {item.t2}</span>
                           <span className="bg-emerald-500 text-slate-900 px-4 py-1 rounded-full font-black text-[10px] uppercase">IA Pick</span>
                        </div>
                        <div className="bg-slate-900 text-white p-6 rounded-[2rem] border-l-8 border-emerald-500 shadow-lg">
                           <p className="font-black text-emerald-400 text-lg md:text-xl uppercase mb-2">Sugerencia: {item.pick}</p>
                           <p className="text-slate-300 text-xs md:text-sm font-bold leading-relaxed italic uppercase">
                             <Info className="inline mr-2 text-white" size={14} /> 
                             {item.analisis}
                           </p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      )}

      {/* CONTENIDO: HIPISMO (ESTILO PROFESIONAL) */}
      {activeTab === 'hipismo' && (
        <div className="space-y-8">
           {Object.entries(HIPISMO_DATA).map(([pista, carreras]) => (
             <div key={pista} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8 border-b-4 border-slate-50 pb-4">
                   <h3 className="font-black text-2xl uppercase italic text-slate-900 flex items-center gap-3">
                      <Award className="text-yellow-500" /> {pista}
                   </h3>
                   <span className="font-black text-[10px] text-slate-400 uppercase tracking-tighter">Estudio de Gánader</span>
                </div>

                <div className="grid gap-8">
                   {carreras.map((c, i) => (
                     <div key={i} className="relative space-y-6">
                        {/* Ficha del Caballo */}
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                           <div className="w-20 h-20 bg-slate-900 rounded-2xl flex flex-col items-center justify-center border-4 border-emerald-500 shadow-xl">
                              <span className="text-white font-black text-3xl">{c.numero}</span>
                              <span className="text-emerald-400 font-black text-[8px] uppercase">Orden</span>
                           </div>
                           <div className="text-center md:text-left">
                              <h4 className="font-black text-3xl md:text-5xl uppercase italic text-slate-900 tracking-tighter">{c.caballo}</h4>
                              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                                 <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                                    <Gauge size={12}/> {c.distancia}
                                 </span>
                                 <span className="font-black text-[10px] uppercase text-slate-600 italic">Jinete: {c.jinete}</span>
                                 <span className="font-black text-[10px] uppercase text-slate-600 italic">Entrenador: {c.entrenador}</span>
                              </div>
                           </div>
                        </div>

                        {/* Análisis Técnico */}
                        <div className="bg-amber-50 border-4 border-slate-900 p-6 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                           <div className="absolute top-0 right-0 bg-slate-900 text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase italic">
                              Análisis de Búnker
                           </div>
                           <p className="font-black text-slate-900 text-sm md:text-lg leading-relaxed uppercase italic">
                             "{c.analisis}"
                           </p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      )}

      {/* PUBLICIDAD AL FINAL */}
      <AdBanner slotId="deportes" />
    </div>
  );
}
