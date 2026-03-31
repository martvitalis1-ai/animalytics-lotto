import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  Trophy, Activity, Star, Info, Sparkles, CheckCircle2, 
  Clock, Zap, Target, LayoutGrid, Calculator,
  BookOpen, HelpCircle, Dumbbell, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdBanner } from "./AdBanner";

export function SportsView() {
  const [mode, setMode] = useState<'deportes' | 'hipismo'>('deportes');
  const [loading, setLoading] = useState(true);

  // 🛡️ ESTADOS DE DATOS REALES (Vienen de Supabase)
  const [sportsData, setSportsData] = useState<any[]>([]);
  const [horseData, setHorseData] = useState<any[]>([]);

  // Filtros
  const [sport, setSport] = useState("Fútbol");
  const [track, setTrack] = useState("La Rinconada (VEN)");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showIA, setShowIA] = useState(false);
  const [showCuadroIA, setShowCuadroIA] = useState(false);

  useEffect(() => {
    async function fetchCarteleraReal() {
      setLoading(true);
      
      // 1. Cargar Deportes desde la tabla que llena el Google Script
      const { data: sData, error: sError } = await supabase
        .from('sports_schedule' as any)
        .select('*')
        .eq('event_date', date);
      
      if (!sError) setSportsData(sData || []);

      // 2. Cargar Hipismo desde la tabla que llena el Google Script
      const { data: hData, error: hError } = await supabase
        .from('horse_racing_schedule' as any)
        .select('*')
        .eq('event_date', date);
      
      if (!hError) setHorseData(hData || []);

      setLoading(false);
    }
    fetchCarteleraReal();
  }, [date]);

  // Lógica de Filtrado Dinámico
  const filteredMatches = useMemo(() => sportsData.filter(j => j.sport === sport), [sportsData, sport]);
  const filteredRaces = useMemo(() => horseData.filter(r => r.track === track).sort((a,b) => a.race_number - b.race_number), [horseData, track]);

  // 🛡️ LÓGICA DE CUADRO IA (Automático)
  const cuadroIA = useMemo(() => {
    return filteredRaces
      .filter(r => r.valida_text.toLowerCase().includes('válida') || r.valida_text.toLowerCase().includes('pick'))
      .slice(0, 6)
      .map(r => ({
        leg: r.valida_text,
        picks: [r.favorite.match(/\(([^)]+)\)/)?.[1] || "01"], 
        tipo: "LÍNEA"
      }));
  }, [filteredRaces]);

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-1000 relative min-h-screen">
      
      {/* FONDO TEMÁTICO */}
      <div className={`fixed inset-0 pointer-events-none opacity-[0.06] grayscale transition-all duration-700 ${mode === 'deportes' ? 'bg-[url("https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000")] bg-cover' : 'bg-[url("https://images.unsplash.com/photo-1599201948464-966904945437?q=80&w=1000")] bg-cover'}`} />

      {/* HEADER MAESTRO */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative z-10 text-left">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
           {mode === 'deportes' ? <Trophy className="text-yellow-400" /> : <Calculator className="text-emerald-400" />}
           {mode === 'deportes' ? "BÚNKER DEPORTIVO" : "SISTEMA HÍPICO PRO"}
        </h2>
        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 ml-1 italic">Sincronización Automática • {date}</p>
      </div>

      {/* SELECTOR DE MÓDULO */}
      <div className="flex bg-white border-4 border-slate-900 rounded-full p-2 shadow-2xl max-w-md mx-auto relative z-10">
         <button onClick={() => setMode('deportes')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'deportes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>PARLEY / DEPORTES</button>
         <button onClick={() => setMode('hipismo')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'hipismo' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>CARRERAS CABALLOS</button>
      </div>

      {/* FILTROS DINÁMICOS */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-4 relative z-10 text-slate-900 text-left">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="font-black text-[9px] uppercase text-slate-400 ml-2">Seleccionar Fecha</label>
               <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-14 rounded-2xl font-black shadow-inner" />
            </div>
            <div className="space-y-1">
               <label className="font-black text-[9px] uppercase text-slate-400 ml-2">{mode === 'deportes' ? 'Deporte' : 'Hipódromo'}</label>
               {mode === 'deportes' ? (
                 <Select value={sport} onValueChange={setSport}>
                    <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-4 border-slate-900 z-[250]">
                       {["Fútbol", "Béisbol", "Básquet", "Hockey (Jockey)", "Fútbol Americano"].map(s => <SelectItem key={s} value={s} className="font-black uppercase">{s}</SelectItem>)}
                    </SelectContent>
                 </Select>
               ) : (
                 <Select value={track} onValueChange={setTrack}>
                    <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-4 border-slate-900 z-[250]">
                       {["La Rinconada (VEN)", "Gulfstream Park (USA)"].map(t => <SelectItem key={t} value={t} className="font-black uppercase">{t}</SelectItem>)}
                    </SelectContent>
                 </Select>
               )}
            </div>
         </div>
      </div>

      {/* --- RENDERIZADO DEPORTES --- */}
      {mode === 'deportes' && (
        <div className="space-y-8 relative z-10 text-slate-900 text-left">
           <Button onClick={() => setShowIA(!showIA)} className="w-full h-16 bg-emerald-500 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-lg uppercase italic transition-all active:translate-y-1"><Sparkles size={20} className="mr-2"/> {showIA ? "OCULTAR TICKET" : "VER TICKET MAESTRO IA"}</Button>
           
           {showIA && filteredMatches.filter(m => m.is_ia_pick).length > 0 && (
             <div className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[3rem] p-6 shadow-2xl space-y-6 animate-in zoom-in">
                <h3 className="font-black text-2xl uppercase italic border-b-4 border-slate-900 pb-2">TICKET MAESTRO IA</h3>
                {filteredMatches.filter(m => m.is_ia_pick).map((m, i) => (
                   <div key={i} className="bg-white border-4 border-slate-900 p-6 rounded-[2rem] shadow-xl mb-4 last:mb-0">
                      <p className="font-black text-xl italic">{m.team_home} vs {m.team_away}</p>
                      <div className="mt-4 bg-slate-900 p-4 rounded-xl border-l-8 border-emerald-500">
                         <span className="text-emerald-400 font-black text-[10px] uppercase">RECOMENDACIÓN</span>
                         <p className="text-white font-black text-xl uppercase italic">JUEGA A: {m.prediction_gana}</p>
                      </div>
                   </div>
                ))}
             </div>
           )}

           <div className="grid gap-10">
              {loading ? (
                 <div className="p-20 text-center font-black animate-pulse text-slate-300">CARGANDO JORNADA...</div>
              ) : filteredMatches.length > 0 ? filteredMatches.map((m, i) => (
                <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl relative">
                   <div className="flex justify-between items-center mb-6 border-b-2 pb-4">
                      <span className="font-black text-[10px] text-slate-400 uppercase italic">{m.event_time} | {m.league}</span>
                   </div>
                   <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                      <p className="font-black text-2xl md:text-5xl uppercase text-slate-900 text-center">{m.team_home}</p>
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white border-2 border-slate-900 shrink-0">VS</div>
                      <p className="font-black text-2xl md:text-5xl uppercase text-slate-900 text-center">{m.team_away}</p>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-900 p-2 rounded-xl text-center"><p className="text-[8px] font-black text-emerald-400 uppercase">Gana</p><p className="text-white font-black text-[10px] uppercase">{m.prediction_gana}</p></div>
                      <div className="bg-slate-900 p-2 rounded-xl text-center"><p className="text-[7px] text-emerald-400 font-black uppercase">Alta/Baja</p><p className="text-white font-black text-[10px] uppercase">{m.prediction_alta_baja}</p></div>
                      <div className="bg-slate-900 p-2 rounded-xl text-center"><p className="text-[7px] text-emerald-400 font-black uppercase">RL/H</p><p className="text-white font-black text-[10px] uppercase">{m.prediction_handicap}</p></div>
                   </div>
                   <div className="mt-6 bg-slate-50 p-4 rounded-xl italic font-black text-[10px] text-slate-500 border-2 border-dashed uppercase text-center">"{m.analysis}"</div>
                </div>
              )) : <div className="py-20 text-center font-black text-slate-300 uppercase italic">No hay juegos automáticos para esta fecha</div>}
           </div>

           {/* MANUAL DEL APOSTADOR */}
           <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-2xl space-y-4 text-left">
              <div className="flex items-center gap-3 border-b-2 pb-2"><BookOpen className="text-emerald-500" /><h4 className="font-black text-xl uppercase italic">Manual del Apostador</h4></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-bold uppercase leading-tight">
                 <p><span className="text-emerald-600">GANA:</span> Apuestas al ganador del juego.</p>
                 <p><span className="text-emerald-600">ALTA/BAJA:</span> Suma total de puntos/goles.</p>
                 <p><span className="text-emerald-600">RUNLINE:</span> Ventaja de 1.5 en Béisbol.</p>
                 <p><span className="text-emerald-600">HÁNDICAP:</span> Ventaja de puntos en Básquet.</p>
              </div>
           </div>
        </div>
      )}

      {/* --- RENDERIZADO HIPISMO --- */}
      {mode === 'hipismo' && (
        <div className="space-y-8 relative z-10 text-slate-900 text-left">
           <Button onClick={() => setShowCuadroIA(!showCuadroIA)} className="w-full h-16 bg-emerald-500 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-lg uppercase italic transition-all"><LayoutGrid className="mr-2" size={24} /> {showCuadroIA ? "CERRAR CUADRO" : "ARMAR CUADRO IA (5y6)"}</Button>
           
           {showCuadroIA && cuadroIA.length > 0 && (
             <div className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[3rem] p-6 shadow-2xl space-y-6 animate-in zoom-in">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {cuadroIA.map((leg, i) => (
                     <div key={i} className="bg-white border-4 border-slate-900 p-4 rounded-[2rem] flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{leg.leg}</span>
                        <div className="flex gap-2">{leg.picks.map(p => <span key={p} className="bg-slate-900 text-emerald-400 w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black border-2 border-slate-700">{p}</span>)}</div>
                        <span className="mt-2 px-3 py-0.5 rounded-full font-black text-[8px] uppercase border-2 bg-emerald-500 text-white border-emerald-700">{leg.tipo}</span>
                     </div>
                   ))}
                </div>
             </div>
           )}

           <div className="grid gap-10">
              {loading ? (
                 <div className="p-20 text-center font-black animate-pulse text-slate-300">CARGANDO PROGRAMA...</div>
              ) : filteredRaces.length > 0 ? filteredRaces.map((r, i) => (
                <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom-6">
                   <div className="flex justify-between items-center mb-8 border-b-4 border-emerald-500 pb-4">
                      <div className="flex items-center gap-3">
                         <div className="bg-slate-900 text-white w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 border-emerald-400"><span className="font-black text-xl">{r.race_number}</span><span className="text-[7px] font-bold uppercase">CARR</span></div>
                         <div><p className="font-black text-lg md:text-2xl uppercase italic">{r.valida_text}</p><p className="text-[9px] font-bold text-slate-400 uppercase">{r.event_time} EST</p></div>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50 border-4 border-emerald-500 p-6 rounded-3xl relative shadow-sm"><span className="absolute -top-3 left-6 bg-emerald-500 text-white px-4 py-0.5 rounded-full font-black text-[8px] md:text-[10px] uppercase">Favorito</span><p className="font-black text-2xl md:text-4xl text-emerald-900 uppercase tracking-tighter">{r.favorite}</p></div>
                      <div className="bg-slate-50 border-4 border-slate-300 p-6 rounded-3xl relative shadow-sm"><span className="absolute -top-3 left-6 bg-slate-400 text-white px-4 py-0.5 rounded-full font-black text-[8px] md:text-[10px] uppercase">Placé</span><p className="font-black text-2xl md:text-4xl text-slate-600 uppercase tracking-tighter">{r.place}</p></div>
                   </div>
                   <p className="mt-6 font-black text-xs text-slate-500 uppercase italic text-center leading-relaxed">"{r.analysis}"</p>
                </div>
              )) : <div className="py-20 text-center font-black text-slate-300 uppercase italic">Esperando programa hípico automático...</div>}
           </div>
        </div>
      )}

      <AdBanner slotId="deportes" />
    </div>
  );
}
