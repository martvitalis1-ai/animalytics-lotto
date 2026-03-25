import { useState, useMemo } from 'react';
import { 
  Trophy, Activity, Star, Info, Sparkles, CheckCircle2, 
  Clock, Zap, Target, Dumbbell, Beer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdBanner } from "./AdBanner";

// 📊 CARTELERA COMPLETA DE DEPORTES (FULL SLATE)
const DEPORTES_PARLEY = {
  "Fútbol": {
    ligas: ["Champions League", "La Liga", "Premier League", "Serie A"],
    juegos: [
      { liga: "Champions League", t1: "Real Madrid", t2: "Man City", time: "03:00 PM", gana: "Local", alta_baja: "Alta 2.5", handicap: "-0.5", analisis: "Duelo de titanes. Madrid en casa es letal en transiciones." },
      { liga: "Champions League", t1: "Arsenal", t2: "Bayern", time: "03:00 PM", gana: "Local", alta_baja: "Alta 2.5", handicap: "-0.5", analisis: "El Emirates será una caldera. Arsenal viene en racha goleadora." },
      { liga: "La Liga", t1: "Barcelona", t2: "Las Palmas", time: "04:00 PM", gana: "Local", alta_baja: "Baja 3.5", handicap: "-1.5", analisis: "Dominio total blaugrana esperado, pero Las Palmas defiende bien." },
      { liga: "La Liga", t1: "Valencia", t2: "Mallorca", time: "01:30 PM", gana: "Empate", alta_baja: "Baja 2.5", handicap: "+0.5 Mall", analisis: "Juego de mucha fricción en el medio campo." },
      { liga: "Premier League", t1: "Liverpool", t2: "Brighton", time: "09:00 AM", gana: "Local", alta_baja: "Alta 3.5", handicap: "-1.5", analisis: "Anfield no perdona. Salah está en su mejor momento físico." },
      { liga: "Premier League", t1: "Man Utd", t2: "Brentford", time: "03:00 PM", gana: "Visitante", alta_baja: "Alta 2.5", handicap: "PK", analisis: "United viene con muchas bajas en defensa. Sorpresa en camino." }
    ]
  },
  "Béisbol": {
    ligas: ["MLB (USA)", "LVBP (VEN)"],
    juegos: [
      { liga: "MLB (USA)", t1: "Yankees", t2: "Red Sox", time: "07:05 PM", gana: "Local", alta_baja: "Alta 8.5", handicap: "-1.5", analisis: "Cole domina a Boston históricamente. El viento sopla hacia afuera." },
      { liga: "MLB (USA)", t1: "Dodgers", t2: "Padres", time: "10:10 PM", gana: "Local", alta_baja: "Baja 7.5", handicap: "-1.5", analisis: "Duelo de pitcheo de alto nivel. Ohtani será el factor clave." },
      { liga: "MLB (USA)", t1: "Braves", t2: "Mets", time: "07:20 PM", gana: "Local", alta_baja: "Alta 9.0", handicap: "-1.5", analisis: "Atlanta tiene la ofensiva más poderosa de la liga este mes." },
      { liga: "MLB (USA)", t1: "Astros", t2: "Rangers", time: "08:05 PM", gana: "Visitante", alta_baja: "Alta 8.5", handicap: "+1.5", analisis: "Duelo texano. Rangers batea muy bien el pitcheo zurdo." }
    ]
  },
  "Básquet": {
    ligas: ["NBA", "Euroliga"],
    juegos: [
      { liga: "NBA", t1: "Lakers", t2: "Warriors", time: "10:00 PM", gana: "Visitante", alta_baja: "Alta 232.5", handicap: "Warriors -2.5", analisis: "Curry vs LeBron. La banca de Golden State es superior hoy." },
      { liga: "NBA", t1: "Celtics", t2: "Bucks", time: "07:30 PM", gana: "Local", alta_baja: "Baja 224.5", handicap: "-5.5", analisis: "Boston es invencible en casa. Milwaukee sufre sin Antetokounmpo." },
      { liga: "NBA", t1: "Suns", t2: "Nuggets", time: "09:00 PM", gana: "Visitante", alta_baja: "Alta 228.0", handicap: "Jokic ML", analisis: " Denver domina la pintura. Phoenix depende demasiado del triple." }
    ]
  },
  "Hockey (NHL)": {
    ligas: ["NHL"],
    juegos: [
      { liga: "NHL", t1: "Bruins", t2: "Rangers", time: "07:00 PM", gana: "Local", alta_baja: "Baja 5.5", handicap: "-1.5", analisis: "Boston tiene el mejor portero de la temporada. Juego cerrado." },
      { liga: "NHL", t1: "Leafs", t2: "Panthers", time: "07:30 PM", gana: "Alta", alta_baja: "Alta 6.5", handicap: "Over Goles", analisis: "Dos de las ofensivas más explosivas frente a frente." }
    ]
  }
};

// 🐎 PROGRAMA HÍPICO COMPLETO (TODAS LAS CARRERAS)
const HIPISMO_DATA = {
  "La Rinconada (VEN)": {
    "2026-03-29": [
      { num: 1, valida: "1ra Carrera (No Válida)", hora: "01:00 PM", fav: "EL DE FROIX (04)", place: "PAPA PEDRO (02)", analisis: "Superior en los papeles. Debe ganar por la clase que ostenta." },
      { num: 2, valida: "2da Carrera (No Válida)", hora: "01:25 PM", fav: "FUTURO (01)", place: "BRAVUCÓN (05)", analisis: "Viene de gran fogueo. El puesto 1 le favorece para saltar en punta." },
      { num: 3, valida: "3ra Carrera (No Válida)", hora: "01:50 PM", fav: "PHILOMENA (03)", place: "LA SENSACIONAL (06)", analisis: "Las yeguas de punta dominan este tiro de 1.200m." },
      { num: 4, valida: "4ta Carrera (No Válida)", hora: "02:15 PM", fav: "LIANDRO (08)", place: "BARTOLOMEO (02)", analisis: "Atención con el descargo del jinete aprendiz." },
      { num: 5, valida: "5ta Carrera (1ra Válida)", hora: "03:00 PM", fav: "LUNA NUEVA (05)", place: "STRENGHT MASK (01)", analisis: "La línea del 5y6 nacional. Capriles no debería perder esta." },
      { num: 6, valida: "6ta Carrera (2da Válida)", hora: "03:30 PM", fav: "AMELIARE (07)", place: "TURQUESA (02)", analisis: "Cuadro cerrado entre estas dos. Mejor speed rating para la 7." },
      { num: 10, valida: "10ma Carrera (6ta Válida)", hora: "05:30 PM", fav: "EL GRAN BRICEÑO (09)", place: "CANDY CUMMINGS (04)", analisis: "El cierre de la jornada. Un animal que remata duro en los 200 finales." }
    ]
  },
  "Gulfstream Park (USA)": {
    "2026-03-25": [
      { num: 1, valida: "Race 1 (Claiming)", hora: "12:10 PM", fav: "SPEEDY (01)", place: "MAGIC (05)", analisis: "Baja de lote. Irad Ortiz es el jinete a vencer aquí." },
      { num: 2, valida: "Race 2 (Maiden)", hora: "12:40 PM", fav: "BIG BOSS (04)", place: "LITTLE JOE (02)", analisis: "Debutante con excelentes briseos matutinos." },
      { num: 3, valida: "Race 3 (Turf)", hora: "01:10 PM", fav: "GREEN WAVE (06)", place: "SEA BREEZE (03)", analisis: "Especialista en grama. Puesto de afuera le beneficia." },
      { num: 9, valida: "Race 9 (Feature)", hora: "04:20 PM", fav: "GLOBAL SENSATION (02)", place: "FLYING (08)", analisis: "Pletcher tiene efectividad de 42% en carreras de fondo." }
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

      {/* HEADER MAESTRO */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden z-10">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
           {mode === 'deportes' ? <Trophy className="text-yellow-400" size={40} /> : <Zap className="text-emerald-400" size={40} />}
           {mode === 'deportes' ? "BÚNKER DEPORTIVO" : "SISTEMA HÍPICO PRO"}
        </h2>
        <p className="text-emerald-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mt-2 ml-1">Estudio Profesional de Inteligencia Mundial</p>
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
                   <label className="font-black text-[10px] uppercase text-slate-500 ml-2 italic">1. Elija Deporte</label>
                   <Select value={sport} onValueChange={(v) => {setSport(v); setLeague(DEPORTES_PARLEY[v as keyof typeof DEPORTES_PARLEY].ligas[0])}}>
                      <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{Object.keys(DEPORTES_PARLEY).map(s => <SelectItem key={s} value={s} className="font-black uppercase">{s}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="font-black text-[10px] uppercase text-slate-500 ml-2 italic">2. Elija la Liga</label>
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
                     <span className="font-black text-[9px] md:text-xs text-slate-400 uppercase italic"> {m.time} | {m.liga}</span>
                     <span className="bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter shadow-md">Cartelera Activa</span>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                     <div className="flex-1 text-center"><p className="font-black text-2xl md:text-5xl uppercase tracking-tighter text-slate-900">{m.t1}</p></div>
                     <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white border-4 border-slate-900 shadow-lg shrink-0 italic">VS</div>
                     <div className="flex-1 text-center"><p className="font-black text-2xl md:text-5xl uppercase tracking-tighter text-slate-900">{m.t2}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                     <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">Gana</p><p className="font-black text-[10px] md:text-sm text-white uppercase">{m.gana}</p></div>
                     <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">Alta/Baja</p><p className="font-black text-[10px] md:text-sm text-white uppercase">{m.alta_baja}</p></div>
                     <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">Hándicap</p><p className="font-black text-[10px] md:text-sm text-white uppercase">{m.handicap}</p></div>
                  </div>
                  <div className="mt-8 bg-slate-50 border-2 border-dashed border-slate-300 p-4 rounded-xl italic font-black text-[10px] md:text-xs text-slate-500 uppercase leading-relaxed text-center">"{m.analisis}"</div>
               </div>
             )) : (
               <div className="py-20 text-center bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">
                  <p className="font-black text-slate-300 uppercase italic">No hay encuentros disponibles</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* --- SECCIÓN HIPISMO --- */}
      {mode === 'hipismo' && (
        <div className="space-y-8 relative z-10 text-slate-900">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="font-black text-[10px] uppercase text-slate-500 ml-2 italic tracking-widest">1. Hipódromo</label>
                   <Select value={track} onValueChange={setTrack}>
                      <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{Object.keys(HIPISMO_DATA).map(t => <SelectItem key={t} value={t} className="font-black uppercase">{t}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="font-black text-[10px] uppercase text-slate-500 ml-2 italic tracking-widest">2. Fecha</label>
                   <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-14 rounded-2xl font-black" />
                </div>
             </div>
          </div>

          <div className="grid gap-10">
             {races.length > 0 ? races.map((r, i) => (
               <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[4rem] p-6 md:p-10 shadow-2xl relative animate-in slide-in-from-bottom-6 duration-500">
                  <div className="flex justify-between items-center mb-8 border-b-4 border-emerald-500 pb-4">
                     <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 border-emerald-400 shadow-lg">
                           <span className="font-black text-xl">{r.num}</span>
                           <span className="text-[7px] font-bold uppercase tracking-widest">CARR</span>
                        </div>
                        <div>
                           <p className="font-black text-lg md:text-2xl text-slate-900 uppercase italic tracking-tighter">{r.valida}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.hora} EST</p>
                        </div>
                     </div>
                     <Target className="text-slate-100 hidden md:block" size={50} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-emerald-50 border-4 border-emerald-500 p-6 rounded-3xl relative shadow-md">
                        <span className="absolute -top-3 left-6 bg-emerald-500 text-white px-4 py-0.5 rounded-full font-black text-[8px] md:text-[10px] uppercase shadow-sm">Favorito Maestro</span>
                        <p className="font-black text-2xl md:text-5xl text-emerald-900 uppercase tracking-tighter">{r.fav}</p>
                     </div>
                     <div className="bg-slate-50 border-4 border-slate-300 p-6 rounded-3xl relative shadow-md">
                        <span className="absolute -top-3 left-6 bg-slate-400 text-white px-4 py-0.5 rounded-full font-black text-[8px] md:text-[10px] uppercase shadow-sm">Placé / Enemigo</span>
                        <p className="font-black text-2xl md:text-5xl text-slate-600 uppercase tracking-tighter">{r.place}</p>
                     </div>
                  </div>

                  <div className="mt-8 bg-slate-900 text-emerald-400 p-6 rounded-[2rem] border-l-8 border-emerald-600 shadow-xl">
                     <p className="font-bold text-xs md:text-base uppercase leading-relaxed italic text-center md:text-left">
                        <Info className="inline mr-2" size={18}/> {r.analisis}
                     </p>
                  </div>
               </div>
             )) : (
               <div className="py-20 text-center bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">
                  <p className="font-black text-slate-300 uppercase italic">No hay carreras programadas para esta fecha.</p>
               </div>
             )}
          </div>
        </div>
      )}

      <AdBanner slotId="deportes" />
    </div>
  );
}
