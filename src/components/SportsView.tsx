import { useState, useMemo } from 'react';
import { 
  Trophy, Activity, Star, Info, Sparkles, CheckCircle2, 
  Search, Calendar, Clock, Zap, Target, Dumbbell, LayoutGrid, Calculator,
  Dribbble
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdBanner } from "./AdBanner";

// 📊 MEGA CARTELERA DEPORTIVA (TODOS LOS DEPORTES Y LIGAS)
const DEPORTES_PARLEY = {
  "Fútbol": {
    ligas: ["Champions League", "La Liga", "Premier League", "Serie A", "Liga FUTVE"],
    juegos: [
      { liga: "Champions League", t1: "Real Madrid", t2: "Man City", time: "03:00 PM", gana: "Local", alta_baja: "Alta 2.5", handicap: "-0.5", analisis: "Duelo de titanes. Madrid en casa es letal en transiciones." },
      { liga: "Champions League", t1: "Arsenal", t2: "Bayern", time: "03:00 PM", gana: "Local", alta_baja: "Alta 2.5", handicap: "-0.5", analisis: "El Emirates será una caldera. Arsenal viene en racha goleadora." },
      { liga: "Premier League", t1: "Liverpool", t2: "Brighton", time: "09:00 AM", gana: "Local", alta_baja: "Alta 3.5", handicap: "-1.5", analisis: "Anfield no perdona. Salah está encendido." },
      { liga: "Liga FUTVE", t1: "Caracas FC", t2: "Táchira", time: "05:00 PM", gana: "Empate", alta_baja: "Baja 2.0", handicap: "+0.5 Tách", analisis: "Clásico nacional. Defensas cerradas." }
    ]
  },
  "Béisbol": {
    ligas: ["MLB (USA)", "LVBP (VEN)", "Serie del Caribe"],
    juegos: [
      { liga: "MLB (USA)", t1: "Yankees", t2: "Red Sox", time: "07:05 PM", gana: "Local", alta_baja: "Alta 8.5", handicap: "RL -1.5", analisis: "Cole domina a Boston históricamente." },
      { liga: "MLB (USA)", t1: "Dodgers", t2: "Padres", time: "10:10 PM", gana: "Local", alta_baja: "Baja 7.5", handicap: "RL -1.5", analisis: "Duelo de pitcheo de alto nivel. Ohtani factor clave." },
      { liga: "MLB (USA)", t1: "Braves", t2: "Mets", time: "07:20 PM", gana: "Local", alta_baja: "Alta 9.0", handicap: "RL -1.5", analisis: "Atlanta tiene la ofensiva más poderosa hoy." }
    ]
  },
  "Básquet": {
    ligas: ["NBA", "Euroliga", "SPB (VEN)"],
    juegos: [
      { liga: "NBA", t1: "Lakers", t2: "Warriors", time: "10:00 PM", gana: "Visitante", alta_baja: "Alta 232.5", handicap: "Warriors -2.5", analisis: "Curry vs LeBron. La banca de GSW es superior hoy." },
      { liga: "NBA", t1: "Celtics", t2: "Bucks", time: "07:30 PM", gana: "Local", alta_baja: "Baja 224.5", handicap: "-5.5", analisis: "Boston invencible en casa." }
    ]
  },
  "Hockey (NHL)": {
    ligas: ["NHL"],
    juegos: [
      { liga: "NHL", t1: "Bruins", t2: "Lightning", time: "07:30 PM", gana: "Local", alta_baja: "Baja 5.5", handicap: "-1.5", analisis: "Defensa de Boston es la mejor de la liga." }
    ]
  },
  "Fútbol Americano": {
    ligas: ["NFL", "NCAA"],
    juegos: [
      { liga: "NFL", t1: "Chiefs", t2: "Eagles", time: "08:15 PM", gana: "Local", alta_baja: "Alta 48.5", handicap: "Chiefs -3.5", analisis: "Mahomes en horario estelar rara vez falla." }
    ]
  }
};

// 🐎 DATA HÍPICA CON LÓGICA DE CUADRO (5y6 / Pick 6)
const HIPISMO_DATA = {
  "La Rinconada (VEN)": {
    "2026-03-29": {
      carreras: [
        { num: 1, valida: "No Válida", hora: "01:30 PM", fav: "EL DE FROIX (04)", place: "PAPA PEDRO (02)", analisis: "Superior en los papeles. Debe ganar por clase." },
        { num: 5, valida: "1ra Válida", hora: "03:15 PM", fav: "LUNA NUEVA (05)", place: "STRENGHT MASK (01)", analisis: "Línea nacional. Capriles la conoce a la perfección." },
        { num: 10, valida: "6ta Válida", hora: "05:35 PM", fav: "CANDY CUMMINGS (09)", place: "MAXIMUS FORTUNE (12)", analisis: "Cierre complicado. Asegurar con el favorito." }
      ],
      cuadroIA: [
        { leg: "1ra Válida", picks: ["05"], tipo: "LÍNEA" },
        { leg: "2da Válida", picks: ["07", "02"], tipo: "DOBLE" },
        { leg: "3ra Válida", picks: ["03"], tipo: "LÍNEA" },
        { leg: "4ta Válida", picks: ["01", "08"], tipo: "DOBLE" },
        { leg: "5ta Válida", picks: ["04"], tipo: "LÍNEA" },
        { leg: "6ta Válida", picks: ["09", "12"], tipo: "DOBLE" }
      ]
    }
  },
  "Gulfstream Park (USA)": {
    "2026-03-25": {
      carreras: [
        { num: 4, valida: "Race 4 (Pick 6)", hora: "02:40 PM", fav: "GLOBAL SENSATION (02)", place: "SPEEDY BOY (06)", analisis: "Pletcher baja de lote. Irad Ortiz es garantía." }
      ],
      cuadroIA: [
        { leg: "Race 4", picks: ["02"], tipo: "LÍNEA" },
        { leg: "Race 5", picks: ["01", "05"], tipo: "DOBLE" },
        { leg: "Race 6", picks: ["08"], tipo: "LÍNEA" },
        { leg: "Race 7", picks: ["04", "06"], tipo: "DOBLE" },
        { leg: "Race 8", picks: ["02"], tipo: "LÍNEA" },
        { leg: "Race 9", picks: ["03", "07"], tipo: "DOBLE" }
      ]
    }
  }
};

export function SportsView() {
  const [mode, setMode] = useState<'deportes' | 'hipismo'>('deportes');
  
  // Estados Deportes
  const [sport, setSport] = useState("Fútbol");
  const [league, setLeague] = useState("Champions League");
  const [showIA, setShowIA] = useState(false);

  // Estados Hipismo
  const [track, setTrack] = useState("La Rinconada (VEN)");
  const [date, setDate] = useState("2026-03-29");
  const [showCuadroIA, setShowCuadroIA] = useState(false);

  const matches = useMemo(() => DEPORTES_PARLEY[sport as keyof typeof DEPORTES_PARLEY]?.juegos.filter(j => j.liga === league) || [], [sport, league]);
  const hipismoInfo = useMemo(() => HIPISMO_DATA[track as keyof typeof HIPISMO_DATA]?.[date], [track, date]);
  const races = hipismoInfo?.carreras || [];
  const cuadroIA = hipismoInfo?.cuadroIA || [];

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-1000 relative min-h-screen">
      
      {/* 🖼️ FONDO TEMÁTICO SEMITRANSPARENTE */}
      <div className={`fixed inset-0 pointer-events-none opacity-[0.06] grayscale transition-all duration-700 ${mode === 'deportes' ? 'bg-[url("https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000")] bg-cover' : 'bg-[url("https://images.unsplash.com/photo-1599201948464-966904945437?q=80&w=1000")] bg-cover'}`} />

      {/* HEADER MAESTRO */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden z-10">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
           {mode === 'deportes' ? <Trophy className="text-yellow-400" size={40} /> : <Calculator className="text-emerald-400" size={40} />}
           {mode === 'deportes' ? "BÚNKER DEPORTIVO" : "SISTEMA HÍPICO PRO"}
        </h2>
        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 ml-1 italic">Inteligencia de Predicción Mundial</p>
      </div>

      {/* SELECTOR DE MÓDULO */}
      <div className="flex bg-white border-4 border-slate-900 rounded-full p-2 shadow-2xl max-w-md mx-auto relative z-10">
         <button onClick={() => setMode('deportes')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'deportes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>DEPORTES / PARLEY</button>
         <button onClick={() => setMode('hipismo')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'hipismo' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>CARRERAS CABALLOS</button>
      </div>

      {/* --- SECCIÓN DEPORTES (RESTAURADA TOTALMENTE) --- */}
      {mode === 'deportes' && (
        <div className="space-y-8 relative z-10">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-900">
                <div className="space-y-1">
                   <label className="font-black text-[9px] uppercase text-slate-400 ml-2">1. Seleccione Deporte</label>
                   <Select value={sport} onValueChange={(v) => {setSport(v); setLeague(DEPORTES_PARLEY[v as keyof typeof DEPORTES_PARLEY].ligas[0])}}>
                      <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{Object.keys(DEPORTES_PARLEY).map(s => <SelectItem key={s} value={s} className="font-black uppercase">{s}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
                <div className="space-y-1">
                   <label className="font-black text-[9px] uppercase text-slate-400 ml-2">2. Seleccione Liga</label>
                   <Select value={league} onValueChange={setLeague}>
                      <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{DEPORTES_PARLEY[sport as keyof typeof DEPORTES_PARLEY]?.ligas.map(l => <SelectItem key={l} value={l} className="font-black uppercase">{l}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
             </div>
             <Button onClick={() => setShowIA(!showIA)} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-2xl font-black text-slate-900 text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase italic"><Sparkles size={20} className="mr-2"/> Propuesta IA del Día</Button>
          </div>

          <div className="grid gap-10">
             {matches.length > 0 ? matches.map((m, i) => (
               <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[4rem] p-6 md:p-10 shadow-2xl relative animate-in zoom-in duration-500">
                  <div className="flex justify-between items-center mb-8 border-b-2 pb-4 border-slate-100">
                     <span className="font-black text-[9px] md:text-xs text-slate-400 uppercase italic"><Clock className="inline mr-1" size={14}/> {m.time} | {m.liga}</span>
                     <span className="bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter shadow-md">Cartelera Activa</span>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 text-slate-900">
                     <div className="flex-1 text-center"><p className="font-black text-2xl md:text-5xl uppercase tracking-tighter">{m.t1}</p><span className="text-[10px] font-bold text-slate-300 uppercase">Local</span></div>
                     <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white border-4 border-slate-900 shadow-lg shrink-0 italic">VS</div>
                     <div className="flex-1 text-center"><p className="font-black text-2xl md:text-5xl uppercase tracking-tighter">{m.t2}</p><span className="text-[10px] font-bold text-slate-300 uppercase">Visitante</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                     <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">Gana</p><p className="font-black text-[10px] md:text-sm text-white uppercase">{m.gana}</p></div>
                     <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">Alta/Baja</p><p className="font-black text-[10px] md:text-sm text-white uppercase">{m.alta_baja}</p></div>
                     <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">Hándicap</p><p className="font-black text-[10px] md:text-sm text-white uppercase">{m.handicap}</p></div>
                  </div>
                  <div className="mt-8 bg-slate-50 border-2 border-dashed border-slate-300 p-4 rounded-xl italic font-black text-[10px] md:text-xs text-slate-500 uppercase leading-relaxed text-center">"{m.analisis}"</div>
               </div>
             )) : (
               <div className="py-20 text-center bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">
                  <p className="font-black text-slate-300 uppercase italic">No hay encuentros disponibles para esta liga</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* --- SECCIÓN HIPISMO (ESTÁ BIEN) --- */}
      {mode === 'hipismo' && (
        <div className="space-y-8 relative z-10">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6 text-slate-900">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={track} onValueChange={setTrack}>
                   <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue placeholder="Pista" /></SelectTrigger>
                   <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{Object.keys(HIPISMO_DATA).map(t => <SelectItem key={t} value={t} className="font-black uppercase">{t}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-14 rounded-2xl font-black shadow-inner" />
             </div>
             <Button onClick={() => setShowCuadroIA(!showCuadroIA)} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase italic transition-all"><LayoutGrid className="mr-2" size={24} /> {showCuadroIA ? "CERRAR CUADRO" : "ARMAR CUADRO IA (5y6)"}</Button>
          </div>

          {/* CUADRO IA */}
          {showCuadroIA && (
            <div className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-8 animate-in zoom-in duration-500 relative overflow-hidden text-slate-900">
               <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-slate-900 pb-6 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="bg-slate-900 p-3 rounded-2xl"><Sparkles className="text-yellow-400" size={32} /></div>
                     <h3 className="font-black text-3xl uppercase italic tracking-tighter">CUADRO MAESTRO IA</h3>
                  </div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                  {cuadroIA.map((leg, i) => (
                    <div key={i} className="bg-white border-4 border-slate-900 p-4 rounded-[2rem] shadow-lg flex flex-col items-center">
                       <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{leg.leg}</span>
                       <div className="flex gap-2">{leg.picks.map(p => <span key={p} className="bg-slate-900 text-emerald-400 w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black border-2 border-slate-700 shadow-md">{p}</span>)}</div>
                       <span className={`mt-2 px-3 py-0.5 rounded-full font-black text-[8px] uppercase border-2 ${leg.tipo === 'LÍNEA' ? 'bg-emerald-500 text-white border-emerald-700' : 'bg-orange-500 text-white border-orange-700'}`}>{leg.tipo}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* LISTADO CARRERAS */}
          <div className="grid gap-8">
             {races.map((r, i) => (
               <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl relative animate-in slide-in-from-bottom-6">
                  <div className="flex justify-between items-center mb-8 border-b-4 border-emerald-500 pb-4 text-slate-900">
                     <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 border-emerald-400 shadow-lg"><span className="font-black text-xl">{r.num}</span><span className="text-[7px] font-bold uppercase">CARR</span></div>
                        <div><p className="font-black text-lg md:text-2xl uppercase italic tracking-tighter">{r.valida}</p><p className="text-[9px] font-bold text-slate-400 uppercase">{r.hora} EST</p></div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-emerald-50 border-4 border-emerald-500 p-6 rounded-3xl relative"><span className="absolute -top-3 left-6 bg-emerald-500 text-white px-4 py-0.5 rounded-full font-black text-[9px] uppercase shadow-sm">Favorito Maestro</span><p className="font-black text-2xl md:text-4xl text-emerald-900 uppercase tracking-tighter">{r.fav}</p></div>
                     <div className="bg-slate-50 border-4 border-slate-300 p-6 rounded-3xl relative"><span className="absolute -top-3 left-6 bg-slate-400 text-white px-4 py-0.5 rounded-full font-black text-[9px] uppercase shadow-sm">Placé</span><p className="font-black text-2xl md:text-4xl text-slate-600 uppercase tracking-tighter">{r.place}</p></div>
                  </div>
                  <p className="mt-6 font-black text-xs text-slate-500 uppercase italic leading-relaxed text-center">"{r.analisis}"</p>
               </div>
             ))}
          </div>
        </div>
      )}

      <AdBanner slotId="deportes" />
    </div>
  );
}
