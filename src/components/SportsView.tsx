import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  Trophy, Activity, Star, Info, Sparkles, CheckCircle2, 
  Clock, Zap, Target, LayoutGrid, BookOpen, HelpCircle, Dumbbell, Calendar
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

  // 🛡️ Nombres internos para que el match sea perfecto
  const [sport, setSport] = useState("Beisbol");
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

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-1000 relative min-h-screen text-slate-900">
      <div className={`fixed inset-0 pointer-events-none opacity-[0.06] grayscale transition-all duration-700 ${mode === 'deportes' ? 'bg-[url("https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000")] bg-cover' : 'bg-[url("https://images.unsplash.com/photo-1599201948464-966904945437?q=80&w=1000")] bg-cover'}`} />

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative z-10 text-left">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
           {mode === 'deportes' ? <Trophy className="text-yellow-400" /> : <Zap className="text-emerald-400" />}
           {mode === 'deportes' ? "BÚNKER DEPORTIVO" : "SISTEMA HÍPICO PRO"}
        </h2>
        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 ml-1 italic">Sincronización Maestra • {date}</p>
      </div>

      <div className="flex bg-white border-4 border-slate-900 rounded-full p-2 shadow-2xl max-w-md mx-auto relative z-10">
         <button onClick={() => setMode('deportes')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'deportes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>PARLEY</button>
         <button onClick={() => setMode('hipismo')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'hipismo' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>CABALLOS</button>
      </div>

      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-4 relative z-10">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="font-black text-[9px] uppercase text-slate-400 ml-2">Fecha</label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-14 rounded-2xl font-black" /></div>
            <div className="space-y-1">
               <label className="font-black text-[9px] uppercase text-slate-400 ml-2">{mode === 'deportes' ? 'Deporte' : 'Hipódromo'}</label>
               {mode === 'deportes' ? (
                 <Select value={sport} onValueChange={setSport}>
                    <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-4 border-slate-900 z-[250]">
                       <SelectItem value="Futbol" className="font-black uppercase">Fútbol</SelectItem>
                       <SelectItem value="Beisbol" className="font-black uppercase">Béisbol</SelectItem>
                       <SelectItem value="Basquet" className="font-black uppercase">Básquet</SelectItem>
                       <SelectItem value="Hockey" className="font-black uppercase">Hockey (Jockey)</SelectItem>
                       <SelectItem value="Americano" className="font-black uppercase">Fútbol Americano</SelectItem>
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

      {mode === 'deportes' && (
        <div className="space-y-10 relative z-10 text-left">
           <Button onClick={() => setShowIA(!showIA)} className="w-full h-16 bg-emerald-500 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-lg uppercase italic transition-all"><Sparkles size={20} className="mr-2"/> {showIA ? "OCULTAR TICKETS IA" : "GENERAR TICKETS MAESTROS IA"}</Button>
           
           <div className="grid gap-10">
              {loading ? (
                 <div className="p-20 text-center font-black animate-pulse text-slate-300">CARGANDO JORNADA...</div>
              ) : Object.entries(groupedSports).length > 0 ? Object.entries(groupedSports).map(([leagueName, games]) => (
                <div key={leagueName} className="space-y-6">
                   <h3 className="font-black text-2xl uppercase italic tracking-tighter text-slate-900 border-l-8 border-emerald-500 pl-4">{leagueName}</h3>
                   {games.map((m, i) => (
                     <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-8 shadow-2xl relative animate-in zoom-in">
                        <div className="flex justify-between items-center mb-6 border-b-2 pb-4">
                           <span className="font-black text-[10px] text-slate-400 uppercase italic">{m.event_time}</span>
                           <span className="bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter">Estudio Activo</span>
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
              )) : <div className="py-20 text-center font-black text-slate-300 uppercase italic bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">No hay jornada para este deporte hoy</div>}
           </div>

           <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-4 text-left">
              <div className="flex items-center gap-3 border-b-2 pb-2"><BookOpen className="text-emerald-500" /><h4 className="font-black text-xl uppercase italic text-slate-900">Manual del Apostador</h4></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-bold uppercase leading-tight text-slate-600">
                 <p><span className="text-emerald-600">GANA:</span> Directo al ganador.</p>
                 <p><span className="text-emerald-600">ALTA/BAJA:</span> Total puntos/goles.</p>
                 <p><span className="text-emerald-600">RUNLINE:</span> Ventaja 1.5 en Béisbol.</p>
                 <p><span className="text-emerald-600">HÁNDICAP:</span> Ventaja puntos Básquet.</p>
              </div>
           </div>
        </div>
      )}

      {/* RENDER HIPISMO (DATA REAL) */}
      {mode === 'hipismo' && (
        <div className="space-y-10 relative z-10 text-slate-900 text-left">
           <div className="grid gap-10">
              {filteredRaces.length > 0 ? filteredRaces.map((r, i) => (
                <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom-6">
                   <div className="flex justify-between items-center mb-8 border-b-4 border-emerald-500 pb-4">
                      <div className="flex items-center gap-3">
                         <div className="bg-slate-900 text-white w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 border-emerald-400"><span className="font-black text-xl">{r.race_number}</span><span className="text-[7px] font-bold uppercase">CARR</span></div>
                         <div><p className="font-black text-lg md:text-2xl uppercase italic">{r.valida_text}</p><p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{r.event_time} EST</p></div>
                      </div>
                      <Target className="text-slate-100 hidden md:block" size={40} />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50 border-4 border-emerald-500 p-6 rounded-3xl relative shadow-sm"><span className="absolute -top-3 left-6 bg-emerald-500 text-white px-4 py-0.5 rounded-full font-black text-[9px] uppercase">Favorito Maestro</span><p className="font-black text-2xl md:text-4xl text-emerald-900 uppercase tracking-tighter">{r.favorite}</p></div>
                      <div className="bg-slate-50 border-4 border-slate-300 p-6 rounded-3xl relative shadow-sm"><span className="absolute -top-3 left-6 bg-slate-400 text-white px-4 py-0.5 rounded-full font-black text-[9px] uppercase">Placé / Enemigo</span><p className="font-black text-2xl md:text-4xl text-slate-600 uppercase tracking-tighter">{r.place}</p></div>
                   </div>
                   <div className="mt-8 bg-slate-900 text-emerald-400 p-6 rounded-[2rem] border-l-8 border-emerald-600 shadow-xl leading-relaxed italic text-xs uppercase font-bold text-center">"{r.analysis}"</div>
                </div>
              )) : <div className="py-20 text-center font-black text-slate-300 uppercase italic bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">No hay programa hípico automático para esta fecha</div>}
           </div>
        </div>
      )}

      <AdBanner slotId="deportes" />
    </div>
  );
}
