import { useState, useMemo } from 'react';
import { 
  Trophy, Activity, Star, Info, Sparkles, CheckCircle2, 
  Search, Calendar, Clock, Zap, Target, Dumbbell, LayoutGrid, Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdBanner } from "./AdBanner";

// 📊 DATA DE DEPORTES (MERCADOS COMPLETOS)
const DEPORTES_PARLEY = {
  "Fútbol": {
    ligas: ["Champions League", "La Liga", "Premier League", "Serie A", "Liga FUTVE"],
    juegos: [
      { liga: "Champions League", t1: "Real Madrid", t2: "Man City", time: "03:00 PM", gana: "Local", alta_baja: "Alta 2.5", handicap: "-0.5", analisis: "Duelo de titanes. Madrid en casa es letal en transiciones." },
      { liga: "Liga FUTVE", t1: "Caracas FC", t2: "Táchira", time: "05:00 PM", gana: "Empate", alta_baja: "Baja 2.0", handicap: "+0.5 Tách", analisis: "Clásico nacional. Defensas cerradas." }
    ]
  },
  "Béisbol": {
    ligas: ["MLB (USA)", "LVBP (VEN)"],
    juegos: [
      { liga: "MLB (USA)", t1: "Yankees", t2: "Red Sox", time: "07:05 PM", gana: "Local", alta_baja: "Alta 8.5", handicap: "RL -1.5", analisis: "Gerrit Cole domina históricamente a Boston." }
    ]
  }
};

// 🐎 DATA HÍPICA CON LÓGICA DE CUADRO (5y6 / Pick 6)
const HIPISMO_DATA = {
  "La Rinconada (VEN)": {
    "2026-03-29": {
      carreras: [
        { num: 1, valida: "No Válida", hora: "01:30 PM", fav: "EL DE FROIX (04)", place: "PAPA PEDRO (02)", analisis: "El mejor caballo del patio. No debería tener problemas." },
        { num: 5, valida: "1ra Válida", hora: "03:15 PM", fav: "LUNA NUEVA (05)", place: "STRENGHT MASK (01)", analisis: "Línea nacional para muchos. Capriles la conoce a la perfección." },
        { num: 6, valida: "2da Válida", hora: "03:45 PM", fav: "AMELIARE (07)", place: "TURQUESA (02)", analisis: "Viene de ganar en este mismo tiro. Es la yegua a vencer." },
        { num: 7, valida: "3ra Válida", hora: "04:10 PM", fav: "MY TITICO MATE (03)", place: "DORAL SEGUNDO (06)", analisis: "Velocista puro. Si salta bien, se les viene de tiro a tiro." },
        { num: 8, valida: "4ta Válida", hora: "04:35 PM", fav: "CATIRE PEDRO (01)", place: "EL GRAN BRICEÑO (08)", analisis: "Duelo de jinetes. El 1 lleva la ventaja por el puesto de pista." },
        { num: 9, valida: "5ta Válida", hora: "05:05 PM", fav: "SHARAPOVA (04)", place: "AVASALLANTE (02)", analisis: "La campeona regresa en gran forma. Es la fija del Búnker." },
        { num: 10, valida: "6ta Válida", hora: "05:35 PM", fav: "CANDY CUMMINGS (09)", place: "MAXIMUS FORTUNE (12)", analisis: "Carrera de cierre complicada. Recomendamos asegurar con el favorito." }
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
  const [sport, setSport] = useState("Fútbol");
  const [league, setLeague] = useState("Champions League");
  const [track, setTrack] = useState("La Rinconada (VEN)");
  const [date, setDate] = useState("2026-03-29");
  const [showCuadroIA, setShowCuadroIA] = useState(false);

  const matches = useMemo(() => DEPORTES_PARLEY[sport as keyof typeof DEPORTES_PARLEY]?.juegos.filter(j => j.liga === league) || [], [sport, league]);
  const hipismoInfo = useMemo(() => HIPISMO_DATA[track as keyof typeof HIPISMO_DATA]?.[date], [track, date]);
  const races = hipismoInfo?.carreras || [];
  const cuadroIA = hipismoInfo?.cuadroIA || [];

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-1000 relative min-h-screen">
      
      {/* 🖼️ FONDO TEMÁTICO */}
      <div className={`fixed inset-0 pointer-events-none opacity-[0.06] grayscale transition-all duration-700 ${mode === 'deportes' ? 'bg-[url("https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000")] bg-cover' : 'bg-[url("https://images.unsplash.com/photo-1599201948464-966904945437?q=80&w=1000")] bg-cover'}`} />

      {/* HEADER MAESTRO */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden z-10">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
           {mode === 'deportes' ? <Trophy className="text-yellow-400" size={40} /> : <Zap className="text-emerald-400" size={40} />}
           {mode === 'deportes' ? "BÚNKER DEPORTIVO" : "SISTEMA HÍPICO PRO"}
        </h2>
        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2">Sincronización Maestra</p>
      </div>

      {/* SELECTOR DE MÓDULO */}
      <div className="flex bg-white border-4 border-slate-900 rounded-full p-2 shadow-2xl max-w-md mx-auto relative z-10">
         <button onClick={() => setMode('deportes')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'deportes' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>PARLEY</button>
         <button onClick={() => setMode('hipismo')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'hipismo' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>HIPISMO</button>
      </div>

      {/* --- SECCIÓN DEPORTES --- */}
      {mode === 'deportes' && (
        <div className="space-y-8 relative z-10">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-900">
                <Select value={sport} onValueChange={(v) => {setSport(v); setLeague(DEPORTES_PARLEY[v as keyof typeof DEPORTES_PARLEY].ligas[0])}}>
                   <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue placeholder="Deporte" /></SelectTrigger>
                   <SelectContent className="bg-white border-4 border-slate-900">{Object.keys(DEPORTES_PARLEY).map(s => <SelectItem key={s} value={s} className="font-black uppercase">{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={league} onValueChange={setLeague}>
                   <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue placeholder="Liga" /></SelectTrigger>
                   <SelectContent className="bg-white border-4 border-slate-900">{DEPORTES_PARLEY[sport as keyof typeof DEPORTES_PARLEY]?.ligas.map(l => <SelectItem key={l} value={l} className="font-black uppercase">{l}</SelectItem>)}</SelectContent>
                </Select>
             </div>
          </div>
          {matches.map((m, i) => (
            <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl relative">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 text-slate-900">
                  <div className="flex-1 text-center"><p className="font-black text-3xl md:text-5xl uppercase tracking-tighter">{m.t1}</p></div>
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white border-4 border-slate-900 shadow-lg shrink-0 italic">VS</div>
                  <div className="flex-1 text-center"><p className="font-black text-3xl md:text-5xl uppercase tracking-tighter">{m.t2}</p></div>
               </div>
               <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center"><p className="text-[8px] font-black text-emerald-400 uppercase">Gana</p><p className="font-black text-xs text-white uppercase">{m.gana}</p></div>
                  <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center"><p className="text-[8px] font-black text-emerald-400 uppercase">Alta/Baja</p><p className="font-black text-xs text-white uppercase">{m.alta_baja}</p></div>
                  <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center"><p className="text-[8px] font-black text-emerald-400 uppercase">RL</p><p className="font-black text-xs text-white uppercase">{m.handicap}</p></div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SECCIÓN HIPISMO: CON LÓGICA DE CUADRO --- */}
      {mode === 'hipismo' && (
        <div className="space-y-8 relative z-10">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6 text-slate-900">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={track} onValueChange={setTrack}>
                   <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue placeholder="Pista" /></SelectTrigger>
                   <SelectContent className="bg-white border-4 border-slate-900">{Object.keys(HIPISMO_DATA).map(t => <SelectItem key={t} value={t} className="font-black uppercase">{t}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-14 rounded-2xl font-black shadow-inner" />
             </div>
             
             {/* 🛡️ BOTÓN MAESTRO: ARMAR CUADRO IA */}
             <Button 
                onClick={() => setShowCuadroIA(!showCuadroIA)}
                className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase italic transition-all"
             >
                <LayoutGrid className="mr-2" size={24} /> {showCuadroIA ? "CERRAR CUADRO" : "ARMAR CUADRO IA (5y6)"}
             </Button>
          </div>

          {/* 🛡️ EL CUADRO DE LA IA (VISUALIZACIÓN) */}
          {showCuadroIA && (
            <div className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-8 animate-in zoom-in duration-500 relative overflow-hidden">
               <div className="absolute opacity-5 -right-10 -top-10 rotate-12"><Calculator size={200} /></div>
               <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-slate-900 pb-6 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="bg-slate-900 p-3 rounded-2xl"><Sparkles className="text-yellow-400" size={32} /></div>
                     <h3 className="font-black text-3xl uppercase italic tracking-tighter text-slate-900">CUADRO MAESTRO IA</h3>
                  </div>
                  <div className="bg-slate-900 text-white px-6 py-2 rounded-full font-black text-xs uppercase italic border-2 border-emerald-500">Sugerencia para: {track}</div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                  {cuadroIA.map((leg, i) => (
                    <div key={i} className="bg-white border-4 border-slate-900 p-5 rounded-[2rem] shadow-lg flex flex-col items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{leg.leg}</span>
                       <div className="flex gap-2">
                          {leg.picks.map(p => (
                            <span key={p} className="bg-slate-900 text-emerald-400 w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black border-2 border-slate-700 shadow-md">{p}</span>
                          ))}
                       </div>
                       <span className={`mt-3 px-4 py-1 rounded-full font-black text-[9px] uppercase border-2 ${leg.tipo === 'LÍNEA' ? 'bg-emerald-500 text-white border-emerald-700' : 'bg-orange-500 text-white border-orange-700'}`}>
                          {leg.tipo}
                       </span>
                    </div>
                  ))}
               </div>

               <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] border-l-8 border-emerald-500">
                  <p className="font-black text-sm md:text-xl uppercase leading-relaxed italic text-center">
                    "ESTE CUADRO HA SIDO CALCULADO MEDIANTE EL SPEED RATING Y EL CICLO DE EFECTIVIDAD JINETE/ENTRENADOR. INCLUYE 3 LÍNEAS Y 3 DOBLES PARA MÁXIMA RENTABILIDAD."
                  </p>
               </div>
            </div>
          )}

          {/* LISTADO DE CARRERAS INDIVIDUALES */}
          <div className="grid gap-8">
             {races.map((r, i) => (
               <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl relative animate-in slide-in-from-bottom-6">
                  <div className="flex justify-between items-center mb-8 border-b-4 border-emerald-500 pb-4">
                     <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 border-emerald-400">
                           <span className="font-black text-xl">{r.num}</span>
                           <span className="text-[7px] font-bold uppercase tracking-widest">CARR</span>
                        </div>
                        <div>
                           <p className="font-black text-lg md:text-2xl text-slate-900 uppercase italic tracking-tighter">{r.valida}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase"><Clock className="inline mr-1" size={10}/> {r.hora} EST</p>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-emerald-50 border-4 border-emerald-500 p-6 rounded-3xl relative">
                        <span className="absolute -top-3 left-6 bg-emerald-500 text-white px-4 py-0.5 rounded-full font-black text-[9px] uppercase">Fijazo Maestro</span>
                        <p className="font-black text-2xl md:text-4xl text-emerald-900 uppercase tracking-tighter">{r.fav}</p>
                     </div>
                     <div className="bg-slate-50 border-4 border-slate-300 p-6 rounded-3xl relative">
                        <span className="absolute -top-3 left-6 bg-slate-400 text-white px-4 py-0.5 rounded-full font-black text-[9px] uppercase">Placé</span>
                        <p className="font-black text-2xl md:text-4xl text-slate-600 uppercase tracking-tighter">{r.place}</p>
                     </div>
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
