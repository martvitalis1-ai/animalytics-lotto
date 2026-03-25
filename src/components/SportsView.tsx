import { useState, useMemo } from 'react';
import { 
  Trophy, Activity, Star, Info, Sparkles, CheckCircle2, 
  Search, Calendar, Clock, Zap, Target, Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdBanner } from "./AdBanner";

// 📊 DATA DEPORTIVA MAESTRA (PARLEY COMPLETO)
const DEPORTES_PARLEY = {
  "Fútbol": {
    ligas: ["Champions League", "La Liga", "Premier League", "Serie A", "Liga FUTVE"],
    juegos: [
      { liga: "Champions League", t1: "Real Madrid", t2: "Man City", time: "03:00 PM", gana: "Local", alta_baja: "Alta 2.5", handicap: "-0.5", analisis: "Duelo de titanes. Madrid en casa es letal en transiciones. La IA detecta valor en la alta." },
      { liga: "Liga FUTVE", t1: "Caracas FC", t2: "Táchira", time: "05:00 PM", gana: "Empate", alta_baja: "Baja 2.0", handicap: "+0.5 Tách", analisis: "Clásico nacional. Defensas muy cerradas y mucha presión en el medio campo." }
    ]
  },
  "Béisbol": {
    ligas: ["MLB (USA)", "LVBP (VEN)", "Serie del Caribe"],
    juegos: [
      { liga: "MLB (USA)", t1: "Yankees", t2: "Red Sox", time: "07:05 PM", gana: "Local", alta_baja: "Alta 8.5", handicap: "RL -1.5", analisis: "Gerrit Cole en la lomita garantiza dominio. Yankees vienen de racha ganadora." }
    ]
  },
  "Básquet": {
    ligas: ["NBA", "Euroliga", "SPB (VEN)"],
    juegos: [
      { liga: "NBA", t1: "Lakers", t2: "Suns", time: "10:30 PM", gana: "Visitante", alta_baja: "Alta 228.5", handicap: "Suns -4.5", analisis: "Durant promedia 30 pts contra Lakers. Ofensiva imparable de Phoenix." }
    ]
  },
  "Hockey (Jockey)": {
    ligas: ["NHL", "KHL"],
    juegos: [
      { liga: "NHL", t1: "Bruins", t2: "Lightning", time: "07:30 PM", gana: "Local", alta_baja: "Baja 5.5", handicap: "-1.5", analisis: "Boston tiene la mejor defensa de la liga actualmente. Juego de pocos goles." }
    ]
  },
  "Fútbol Americano": {
    ligas: ["NFL", "NCAA"],
    juegos: [
      { liga: "NFL", t1: "Chiefs", t2: "Eagles", time: "08:15 PM", gana: "Local", alta_baja: "Alta 48.5", handicap: "Chiefs -3.5", analisis: "Mahomes en horario estelar rara vez falla. Ofensiva explosiva." }
    ]
  }
};

// 🐎 DATA HÍPICA PROFESIONAL
const HIPISMO_DATA = {
  "La Rinconada (VEN)": {
    "2026-03-29": [
      { num: 1, valida: "1ra Carrera (No Válida)", hora: "01:30 PM", fav: "EL DE FROIX (04)", place: "PAPA PEDRO (02)", analisis: "El mejor caballo del hipódromo. Viene de ganar sobrado y mantiene condición." },
      { num: 5, valida: "5ta Carrera (1ra Válida 5y6)", hora: "03:15 PM", fav: "LUNA NUEVA (05)", place: "STRENGHT MASK (01)", analisis: "Monta de lujo con Capriles. El entrenador García tiene 40% de efectividad en este tiro." }
    ]
  },
  "Gulfstream Park (USA)": {
    "2026-03-25": [
      { num: 4, valida: "Race 4 (Claiming)", hora: "02:40 PM", fav: "GLOBAL SENSATION (02)", place: "SPEEDY BOY (06)", analisis: "Baja de lote drásticamente. Irad Ortiz Ortiz es garantía en esta distancia." }
    ]
  }
};

export function SportsView() {
  const [mode, setMode] = useState<'deportes' | 'hipismo'>('deportes');
  const [sport, setSport] = useState("Fútbol");
  const [league, setLeague] = useState("Champions League");
  const [track, setTrack] = useState("La Rinconada (VEN)");
  const [date, setDate] = useState("2026-03-29");
  const [showIA, setShowIA] = useState(false);

  const matches = useMemo(() => {
    const data = DEPORTES_PARLEY[sport as keyof typeof DEPORTES_PARLEY];
    return data?.juegos.filter(j => j.liga === league) || [];
  }, [sport, league]);

  const races = useMemo(() => HIPISMO_DATA[track as keyof typeof HIPISMO_DATA]?.[date] || [], [track, date]);

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-1000 relative min-h-screen">
      
      {/* 🖼️ FONDO TEMÁTICO SEMITRANSPARENTE */}
      <div className={`fixed inset-0 pointer-events-none opacity-[0.06] grayscale transition-all duration-700 ${mode === 'deportes' ? 'bg-[url("https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000")] bg-cover' : 'bg-[url("https://images.unsplash.com/photo-1599201948464-966904945437?q=80&w=1000")] bg-cover'}`} />

      {/* HEADER */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden z-10">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
           {mode === 'deportes' ? <Trophy className="text-yellow-400" size={40} /> : <Zap className="text-emerald-400" size={40} />}
           {mode === 'deportes' ? "BÚNKER DEPORTIVO" : "SISTEMA HÍPICO PRO"}
        </h2>
        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 ml-1">Análisis Profesional de Inteligencia Mundial</p>
      </div>

      {/* SELECTOR DE MÓDULO */}
      <div className="flex bg-white border-4 border-slate-900 rounded-full p-2 shadow-2xl max-w-md mx-auto relative z-10">
         <button onClick={() => setMode('deportes')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'deportes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>PARLEY / DEPORTES</button>
         <button onClick={() => setMode('hipismo')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'hipismo' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>CARRERAS CABALLOS</button>
      </div>

      {/* --- SECCIÓN DEPORTES --- */}
      {mode === 'deportes' && (
        <div className="space-y-8 relative z-10">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="font-black text-[10px] uppercase text-slate-500 ml-2">Deporte</label>
                   <Select value={sport} onValueChange={(v) => {setSport(v); setLeague(DEPORTES_PARLEY[v as keyof typeof DEPORTES_PARLEY].ligas[0])}}>
                      <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{Object.keys(DEPORTES_PARLEY).map(s => <SelectItem key={s} value={s} className="font-black uppercase">{s}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="font-black text-[10px] uppercase text-slate-500 ml-2">Liga</label>
                   <Select value={league} onValueChange={setLeague}>
                      <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{DEPORTES_PARLEY[sport as keyof typeof DEPORTES_PARLEY]?.ligas.map(l => <SelectItem key={l} value={l} className="font-black uppercase">{l}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
             </div>
             <Button onClick={() => setShowIA(!showIA)} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase italic"><Sparkles size={20} className="mr-2"/> Propuesta IA Ganadora</Button>
          </div>

          <div className="grid gap-10">
             {matches.map((m, i) => (
               <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[4rem] p-6 md:p-10 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-8 border-b-2 pb-4 border-slate-100">
                     <span className="font-black text-[10px] md:text-xs text-slate-400 uppercase italic"><Clock className="inline mr-1" size={14}/> {m.time} | {m.liga}</span>
                     <span className="bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter">Estudio Analítico</span>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                     <div className="flex-1 text-center"><p className="font-black text-2xl md:text-5xl uppercase tracking-tighter text-slate-900">{m.t1}</p></div>
                     <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white border-4 border-slate-900 shadow-lg shrink-0 italic">VS</div>
                     <div className="flex-1 text-center"><p className="font-black text-2xl md:text-5xl uppercase tracking-tighter text-slate-900">{m.t2}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                     <div className="bg-slate-50 border-2 border-slate-900 p-3 rounded-2xl text-center"><p className="text-[8px] font-black text-slate-400 uppercase">Gana</p><p className="font-black text-[10px] md:text-sm text-slate-900 uppercase">{m.gana}</p></div>
                     <div className="bg-slate-50 border-2 border-slate-900 p-3 rounded-2xl text-center"><p className="text-[8px] font-black text-slate-400 uppercase">Alta/Baja</p><p className="font-black text-[10px] md:text-sm text-slate-900 uppercase">{m.alta_baja}</p></div>
                     <div className="bg-slate-50 border-2 border-slate-900 p-3 rounded-2xl text-center"><p className="text-[8px] font-black text-slate-400 uppercase">RL/Handicap</p><p className="font-black text-[10px] md:text-sm text-slate-900 uppercase">{m.handicap}</p></div>
                  </div>
                  <div className="mt-8 bg-amber-50 border-2 border-slate-900 p-4 rounded-xl italic font-black text-[10px] text-slate-700 uppercase leading-relaxed">" {m.analisis} "</div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* --- SECCIÓN HIPISMO --- */}
      {mode === 'hipismo' && (
        <div className="space-y-8 relative z-10 text-slate-900">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="font-black text-[10px] uppercase text-slate-500 ml-2">Pista / Hipódromo</label>
                   <Select value={track} onValueChange={setTrack}>
                      <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{Object.keys(HIPISMO_DATA).map(t => <SelectItem key={t} value={t} className="font-black uppercase">{t}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="font-black text-[10px] uppercase text-slate-500 ml-2">Fecha del Evento</label>
                   <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-14 rounded-2xl font-black" />
                </div>
             </div>
          </div>

          <div className="grid gap-10">
             {races.length > 0 ? races.map((r, i) => (
               <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[4rem] p-6 md:p-10 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-8 border-b-4 border-emerald-500 pb-4">
                     <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 border-emerald-400">
                           <span className="font-black text-xl">{r.num}</span>
                           <span className="text-[7px] font-bold uppercase">CARR</span>
                        </div>
                        <div>
                           <p className="font-black text-lg md:text-xl text-slate-900 uppercase italic tracking-tighter">{r.valida}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase"><Clock className="inline mr-1" size={10}/> {r.hora} EST</p>
                        </div>
                     </div>
                     <Target className="text-slate-200 hidden md:block" size={40} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-emerald-50 border-4 border-emerald-500 p-6 rounded-3xl relative shadow-md">
                        <span className="absolute -top-3 left-6 bg-emerald-500 text-white px-4 py-0.5 rounded-full font-black text-[8px] md:text-[10px] uppercase">Favorito Maestro</span>
                        <p className="font-black text-2xl md:text-4xl text-emerald-900 uppercase tracking-tighter">{r.fav}</p>
                     </div>
                     <div className="bg-slate-50 border-4 border-slate-300 p-6 rounded-3xl relative shadow-md">
                        <span className="absolute -top-3 left-6 bg-slate-400 text-white px-4 py-0.5 rounded-full font-black text-[8px] md:text-[10px] uppercase">Placé / Enemigo</span>
                        <p className="font-black text-2xl md:text-4xl text-slate-600 uppercase tracking-tighter">{r.place}</p>
                     </div>
                  </div>

                  <div className="mt-8 bg-slate-900 text-emerald-400 p-6 rounded-[2rem] border-l-8 border-emerald-600 shadow-xl">
                     <p className="font-bold text-xs md:text-sm uppercase leading-relaxed italic"><Info className="inline mr-2" size={16}/> {r.analisis}</p>
                  </div>
               </div>
             )) : (
               <div className="py-20 text-center bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">
                  <p className="font-black text-slate-300 uppercase italic">No hay registros cargados para esta fecha.</p>
               </div>
             )}
          </div>
        </div>
      )}

      <AdBanner slotId="deportes" />
    </div>
  );
}
