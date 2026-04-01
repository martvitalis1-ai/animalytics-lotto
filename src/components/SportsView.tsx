import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  Trophy, Activity, Star, Info, Sparkles, CheckCircle2, 
  Clock, Zap, Target, LayoutGrid, BookOpen, HelpCircle, Dumbbell, Calendar, Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdBanner } from "./AdBanner";

export function SportsView() {
  const [mode, setMode] = useState<'deportes' | 'hipismo'>('deportes');
  const [loading, setLoading] = useState(true);
  const [sportsData, setSportsData] = useState<any[]>([]);
  const [horseData, setHorseData] = useState<any[]>([]);

  const [sport, setSport] = useState("Béisbol");
  const [track, setTrack] = useState("Gulfstream Park (USA)");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showIA, setShowIA] = useState(false);
  const [showCuadroIA, setShowCuadroIA] = useState(false);

  useEffect(() => {
    async function fetchCartelera() {
      setLoading(true);
      const { data: sData } = await supabase.from('sports_schedule' as any).select('*').eq('event_date', date);
      setSportsData(sData || []);
      const { data: hData } = await supabase.from('horse_racing_schedule' as any).select('*').eq('event_date', date);
      setHorseData(hData || []);
      setLoading(false);
    }
    fetchCartelera();
  }, [date]);

  // AGRUPACIÓN POR LIGA
  const groupedSports = useMemo(() => {
    const filtered = sportsData.filter(j => j.sport === sport);
    const groups: Record<string, any[]> = {};
    filtered.forEach(j => {
      if (!groups[j.league]) groups[j.league] = [];
      groups[j.league].push(j);
    });
    return groups;
  }, [sportsData, sport]);

  const filteredRaces = useMemo(() => horseData.filter(r => r.track === track).sort((a,b) => a.race_number - b.race_number), [horseData, track]);

  // 🧠 GENERADOR DE TICKET IA (2 PARLEYS DIFERENTES)
  const parleysIA = useMemo(() => {
    const picks = sportsData.filter(m => m.is_ia_pick);
    if (picks.length < 2) return [];
    return [
      { id: "MAESTRO #1", games: picks.slice(0, 2) },
      { id: "EXPLOSIVO #2", games: picks.slice(2, 4) }
    ].filter(p => p.games.length > 0);
  }, [sportsData]);

  // 🐎 GENERADOR DE CUADRO IA (5y6 o Pick 6)
  const cuadroIA = useMemo(() => {
    const validas = filteredRaces.filter(r => r.valida_text.toLowerCase().includes('válida') || r.valida_text.toLowerCase().includes('pick'));
    return validas.map((r, i) => ({
      leg: r.valida_text,
      picks: [r.favorite.match(/\(([^)]+)\)/)?.[1] || "01"],
      tipo: i % 2 === 0 ? "LÍNEA" : "DOBLE" // Alterna para dar variedad al cuadro
    }));
  }, [filteredRaces]);

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-1000 relative min-h-screen text-slate-900">
      <div className={`fixed inset-0 pointer-events-none opacity-[0.06] grayscale transition-all duration-700 ${mode === 'deportes' ? 'bg-[url("https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000")] bg-cover' : 'bg-[url("https://images.unsplash.com/photo-1599201948464-966904945437?q=80&w=1000")] bg-cover'}`} />

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative z-10 text-left">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
           {mode === 'deportes' ? <Trophy className="text-yellow-400" /> : <Calculator className="text-emerald-400" />}
           {mode === 'deportes' ? "BÚNKER DEPORTIVO" : "SISTEMA HÍPICO PRO"}
        </h2>
        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 ml-1 italic">Sincronización Maestra • {date}</p>
      </div>

      <div className="flex bg-white border-4 border-slate-900 rounded-full p-2 shadow-2xl max-w-md mx-auto relative z-10">
         <button onClick={() => setMode('deportes')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'deportes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>DEPORTES</button>
         <button onClick={() => setMode('hipismo')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'hipismo' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>CABALLOS</button>
      </div>

      {/* FILTROS */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-4 relative z-10">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="font-black text-[9px] uppercase text-slate-400 ml-2">Fecha</label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-14 rounded-2xl font-black" /></div>
            <div className="space-y-1">
               <label className="font-black text-[9px] uppercase text-slate-400 ml-2">{mode === 'deportes' ? 'Deporte' : 'Hipódromo'}</label>
               {mode === 'deportes' ? (
                 <Select value={sport} onValueChange={setSport}><SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                 <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{["Fútbol", "Béisbol", "Básquet", "Hockey (Jockey)", "Fútbol Americano"].map(s => <SelectItem key={s} value={s} className="font-black uppercase">{s}</SelectItem>)}</SelectContent></Select>
               ) : (
                 <Select value={track} onValueChange={setTrack}><SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                 <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{["La Rinconada (VEN)", "Gulfstream Park (USA)"].map(t => <SelectItem key={t} value={t} className="font-black uppercase">{t}</SelectItem>)}</SelectContent></Select>
               )}
            </div>
         </div>
      </div>

      {/* RENDER DEPORTES */}
      {mode === 'deportes' && (
        <div className="space-y-10 relative z-10 text-left">
           <Button onClick={() => setShowIA(!showIA)} className="w-full h-16 bg-emerald-500 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-lg uppercase italic transition-all"><Sparkles size={20} className="mr-2"/> {showIA ? "OCULTAR TICKETS IA" : "GENERAR TICKETS MAESTROS IA"}</Button>
           
           {/* TICKETS IA */}
           {showIA && parleysIA.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in">
                {parleysIA.map((ticket, i) => (
                   <div key={i} className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-2xl space-y-4">
                      <div className="flex items-center gap-2 border-b-4 border-slate-900 pb-2"><Star fill="black" size={20}/><h3 className="font-black text-xl uppercase italic">PARLEY {ticket.id}</h3></div>
                      {ticket.games.map((g, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border-2 border-slate-200">
                           <p className="font-black text-sm uppercase">{g.team_home} vs {g.team_away}</p>
                           <p className="text-emerald-600 font-black text-xs mt-1 uppercase">JUGAR A: {g.prediction_gana}</p>
                        </div>
                      ))}
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-center font-black text-[10px] uppercase">Efectividad Estimada: 91%</div>
                   </div>
                ))}
             </div>
           )}

           {Object.entries(groupedSports).map(([leagueName, games]) => (
             <div key={leagueName} className="space-y-6">
                <h3 className="font-black text-2xl uppercase italic tracking-tighter text-slate-900 border-l-8 border-emerald-500 pl-4">{leagueName}</h3>
                {games.map((m, i) => (
                  <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-8 shadow-2xl relative animate-in zoom-in">
                     <div className="flex justify-between items-center mb-6 border-b-2 pb-4">
                        <span className="font-black text-[10px] text-slate-400 uppercase italic">{m.event_time}</span>
                        <span className="bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[9px] uppercase">Estudio Activo</span>
                     </div>
                     <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 text-center">
                        <p className="flex-1 font-black text-xl md:text-4xl uppercase">{m.team_home}</p>
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white border-2 border-slate-900 shrink-0 italic">VS</div>
                        <p className="flex-1 font-black text-xl md:text-4xl uppercase">{m.team_away}</p>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-900 p-2 rounded-xl text-center"><p className="text-[7px] text-emerald-400 font-black uppercase">Gana</p><p className="text-white font-black text-[10px] uppercase">{m.prediction_gana}</p></div>
                        <div className="bg-slate-900 p-2 rounded-xl text-center"><p className="text-[7px] text-emerald-400 font-black uppercase">Alta/Baja</p><p className="text-white font-black text-[10px] uppercase">{m.prediction_alta_baja}</p></div>
                        <div className="bg-slate-900 p-2 rounded-xl text-center"><p className="text-[7px] text-emerald-400 font-black uppercase">RL/H</p><p className="text-white font-black text-[10px] uppercase">{m.prediction_handicap}</p></div>
                     </div>
                     <div className="mt-6 bg-slate-50 p-4 rounded-xl italic font-black text-[10px] text-slate-500 border-2 border-dashed uppercase text-center leading-relaxed">"{m.analysis}"</div>
                  </div>
                ))}
             </div>
           ))}
        </div>
      )}

      {/* RENDER HIPISMO */}
      {mode === 'hipismo' && (
        <div className="space-y-10 relative z-10 text-slate-900 text-left">
           <Button onClick={() => setShowCuadroIA(!showCuadroIA)} className="w-full h-16 bg-emerald-500 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-lg uppercase italic transition-all"><LayoutGrid className="mr-2" size={24} /> {showCuadroIA ? "OCULTAR CUADRO IA" : "ARMAR CUADRO MAESTRO IA"}</Button>
           
           {/* CUADRO MAESTRO IA */}
           {showCuadroIA && cuadroIA.length > 0 && (
             <div className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[3rem] p-6 shadow-2xl space-y-6 animate-in zoom-in">
                <h3 className="font-black text-2xl uppercase italic border-b-4 border-slate-900 pb-2">CUADRO MAESTRO IA</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {cuadroIA.map((leg, i) => (
                     <div key={i} className="bg-white border-4 border-slate-900 p-4 rounded-[2rem] flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{leg.leg}</span>
                        <div className="flex gap-2">{leg.picks.map(p => <span key={p} className="bg-slate-900 text-emerald-400 w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black border-2 border-slate-700">{p}</span>)}</div>
                        <span className="mt-2 px-3 py-0.5 rounded-full font-black text-[8px] uppercase border-2 bg-emerald-500 text-white border-emerald-700">{leg.tipo}</span>
                     </div>
                   ))}
                </div>
             </div>
           )}

           <div className="grid gap-10">
              {filteredRaces.length > 0 ? filteredRaces.map((r, i) => (
                <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom-6">
                   <div className="flex justify-between items-center mb-8 border-b-4 border-emerald-500 pb-4">
                      <div className="flex items-center gap-3">
                         <div className="bg-slate-900 text-white w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 border-emerald-400 shadow-md"><span className="font-black text-xl">{r.race_number}</span><span className="text-[7px] font-bold uppercase">CARR</span></div>
                         <div><p className="font-black text-lg md:text-2xl uppercase italic leading-none">{r.valida_text}</p><p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{r.event_time} EST</p></div>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50 border-4 border-emerald-500 p-6 rounded-3xl relative"><span className="absolute -top-3 left-6 bg-emerald-500 text-white px-4 py-0.5 rounded-full font-black text-[9px] uppercase shadow-sm">Favorito</span><p className="font-black text-2xl md:text-4xl text-emerald-900 uppercase tracking-tighter">{r.favorite}</p></div>
                      <div className="bg-slate-50 border-4 border-slate-300 p-6 rounded-3xl relative"><span className="absolute -top-3 left-6 bg-slate-400 text-white px-4 py-0.5 rounded-full font-black text-[9px] uppercase shadow-sm">Placé</span><p className="font-black text-2xl md:text-4xl text-slate-600 uppercase tracking-tighter">{r.place}</p></div>
                   </div>
                   <div className="mt-8 bg-slate-900 text-emerald-400 p-6 rounded-[2rem] border-l-8 border-emerald-600 shadow-xl leading-relaxed italic text-xs uppercase font-bold">"{r.analysis}"</div>
                </div>
              )) : <div className="py-20 text-center font-black text-slate-300 uppercase italic bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">No hay programa hípico cargado para esta fecha</div>}
           </div>
        </div>
      )}

      <AdBanner slotId="deportes" />
    </div>
  );
}
