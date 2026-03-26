import { useState, useMemo } from 'react';
import { 
  Trophy, Activity, Star, Info, Sparkles, CheckCircle2, 
  Clock, Zap, Target, LayoutGrid, Calculator,
  BookOpen, HelpCircle, Dumbbell, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdBanner } from "./AdBanner";

// 📊 CARTELERA REAL - JORNADA 26 DE MARZO 2026
const DEPORTES_PARLEY = {
  "Fútbol": {
    ligas: ["Eliminatorias Mundial", "Liga FUTVE (VEN)", "Amistosos FIFA"],
    juegos: [
      { liga: "Eliminatorias Mundial", t1: "Venezuela", t2: "Ecuador", time: "06:00 PM", gana: "Local", alta_baja: "Baja 2.5", handicap: "-0.5 VEN", analisis: "La Vinotinto llega con plantel completo al Monumental de Maturín. Defensa sólida." },
      { liga: "Eliminatorias Mundial", t1: "Colombia", t2: "Brasil", time: "07:30 PM", gana: "Visitante", alta_baja: "Alta 2.5", handicap: "+0.5 COL", analisis: "Brasil urgido de puntos. Colombia fuerte en Barranquilla pero Brasil tiene más pegada." },
      { liga: "Liga FUTVE (VEN)", t1: "Caracas FC", t2: "Dep. Táchira", time: "05:00 PM", gana: "Empate", alta_baja: "Baja 1.5", handicap: "PK", analisis: "Clásico nacional. Juego de mucha estrategia y pocos goles por la presión." },
      { liga: "Liga FUTVE (VEN)", t1: "Portuguesa FC", t2: "Metropolitanos", time: "03:00 PM", gana: "Local", alta_baja: "Alta 2.0", handicap: "-0.5", analisis: "El 'Penta' en casa es muy difícil de batir." }
    ]
  },
  "Béisbol": {
    ligas: ["MLB (Opening Week)", "LVBP (Post-Season)"],
    juegos: [
      { liga: "MLB (USA)", t1: "Yankees", t2: "Red Sox", time: "01:05 PM", gana: "Local", alta_baja: "Alta 8.5", handicap: "RL -1.5", analisis: "Gerrit Cole domina a Boston. Yankees con ofensiva renovada." },
      { liga: "MLB (USA)", t1: "Dodgers", t2: "Giants", time: "04:10 PM", gana: "Local", alta_baja: "Baja 7.5", handicap: "RL -1.5", analisis: "Duelo de pitcheo élite. Ohtani será el factor clave en el cierre." },
      { liga: "MLB (USA)", t1: "Braves", t2: "Mets", time: "07:20 PM", gana: "Local", alta_baja: "Alta 9.0", handicap: "RL -1.5", analisis: "Atlanta tiene la ofensiva más poderosa del inicio de temporada." }
    ]
  },
  "Básquet": {
    ligas: ["NBA", "SPB (VEN)"],
    juegos: [
      { liga: "NBA", t1: "Lakers", t2: "Celtics", time: "08:00 PM", gana: "Visitante", alta_baja: "Alta 228.5", handicap: "-4.5 CEL", analisis: "Boston llega con racha de 5 victorias. Lakers sufren en la pintura." },
      { liga: "NBA", t1: "Suns", t2: "Nuggets", time: "10:30 PM", gana: "Visitante", alta_baja: "Baja 224.5", handicap: "Jokic ML", analisis: "Denver domina las segundas oportunidades. Phoenix depende del triple." }
    ]
  },
  "Hockey (Jockey)": {
    ligas: ["NHL"],
    juegos: [
      { liga: "NHL", t1: "Bruins", t2: "Leafs", time: "07:00 PM", gana: "Local", alta_baja: "Baja 5.5", handicap: "-1.5", analisis: "Boston tiene la mejor defensa de la liga actualmente." }
    ]
  },
  "Fútbol Americano": {
    ligas: ["NFL (Pre-Season)"],
    juegos: [
      { liga: "NFL (USA)", t1: "Chiefs", t2: "Bengals", time: "08:15 PM", gana: "Local", alta_baja: "Alta 44.5", handicap: "-3.5", analisis: "Mahomes en casa bajo las luces es casi imbatible." }
    ]
  }
};

// 🐎 PROGRAMA HÍPICO COMPLETO 26 DE MARZO
const HIPISMO_DATA = {
  "La Rinconada (VEN)": {
    "2026-03-26": {
      carreras: [
        { num: 1, valida: "No Válida", hora: "01:00 PM", fav: "EL DE FROIX (04)", place: "PAPA PEDRO (02)", analisis: "Superior por clase. Debe ganar galopando." },
        { num: 5, valida: "1ra Válida 5y6", hora: "03:00 PM", fav: "LUNA NUEVA (05)", place: "STRENGHT MASK (01)", analisis: "Línea nacional con la monta de Capriles." },
        { num: 10, valida: "6ta Válida 5y6", hora: "05:30 PM", fav: "EL GRAN BRICEÑO (09)", place: "CANDY CUMMINGS (04)", analisis: "Cierre complicado, el 9 remata fuerte." }
      ],
      cuadroIA: [
        { leg: "1ra Válida", picks: ["05"], tipo: "LÍNEA" },
        { leg: "2da Válida", picks: ["07", "02"], tipo: "DOBLE" },
        { leg: "3ra Válida", picks: ["03"], tipo: "LÍNEA" },
        { leg: "4ta Válida", picks: ["01", "06"], tipo: "DOBLE" },
        { leg: "5ta Válida", picks: ["04"], tipo: "LÍNEA" },
        { leg: "6ta Válida", picks: ["09", "04"], tipo: "DOBLE" }
      ]
    }
  },
  "Gulfstream Park (USA)": {
    "2026-03-26": {
      carreras: [
        { num: 1, valida: "Race 1", hora: "12:10 PM", fav: "SPEEDY (01)", place: "MAGIC (05)", analisis: "Baja de lote drásticamente." },
        { num: 4, valida: "Race 4 (Pick 6)", hora: "01:40 PM", fav: "GLOBAL SENSATION (02)", place: "FLYING (08)", analisis: "Monta de Irad Ortiz. 42% efectividad." }
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
  const [league, setLeague] = useState("Eliminatorias Mundial");
  const [showIA, setShowIA] = useState(false);
  const [track, setTrack] = useState("La Rinconada (VEN)");
  const [date, setDate] = useState("2026-03-26");
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
           {mode === 'deportes' ? <Trophy className="text-yellow-400" /> : <Calculator className="text-emerald-400" />}
           {mode === 'deportes' ? "BÚNKER DEPORTIVO" : "SISTEMA HÍPICO PRO"}
        </h2>
        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 ml-1 italic">Inteligencia Mundial • 26 de Marzo 2026</p>
      </div>

      {/* SELECTOR DE MÓDULO */}
      <div className="flex bg-white border-4 border-slate-900 rounded-full p-2 shadow-2xl max-w-md mx-auto relative z-10">
         <button onClick={() => setMode('deportes')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'deportes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>PARLEY / JUEGOS</button>
         <button onClick={() => setMode('hipismo')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'hipismo' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>CARRERAS CABALLOS</button>
      </div>

      {/* --- SECCIÓN DEPORTES (TOTALMENTE INTEGRAL) --- */}
      {mode === 'deportes' && (
        <div className="space-y-8 relative z-10 text-slate-900">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6 text-left">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="font-black text-[9px] uppercase text-slate-400 ml-2">Deporte</label>
                   <Select value={sport} onValueChange={(v) => {setSport(v); setLeague(DEPORTES_PARLEY[v as keyof typeof DEPORTES_PARLEY].ligas[0])}}>
                      <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{Object.keys(DEPORTES_PARLEY).map(s => <SelectItem key={s} value={s} className="font-black uppercase">{s}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
                <div className="space-y-1">
                   <label className="font-black text-[9px] uppercase text-slate-400 ml-2">Liga</label>
                   <Select value={league} onValueChange={setLeague}>
                      <SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-4 border-slate-900 z-[250]">{DEPORTES_PARLEY[sport as keyof typeof DEPORTES_PARLEY]?.ligas.map(l => <SelectItem key={l} value={l} className="font-black uppercase">{l}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
             </div>
             <Button onClick={() => setShowIA(!showIA)} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-lg uppercase italic transition-all"><Sparkles size={20} className="mr-2"/> {showIA ? "OCULTAR TICKET" : "VER TICKET MAESTRO IA"}</Button>
          </div>

          {/* TICKET IA */}
          {showIA && matches.length > 0 && (
            <div className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-8 animate-in zoom-in duration-500 relative overflow-hidden">
               <div className="absolute opacity-5 -right-10 -top-10 rotate-12"><Target size={250} /></div>
               <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-slate-900 pb-6 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="bg-slate-900 p-3 rounded-2xl shadow-lg"><Star className="text-yellow-400 fill-yellow-400" size={32} /></div>
                     <h3 className="font-black text-2xl md:text-4xl uppercase italic tracking-tighter">TICKET MAESTRO IA</h3>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="bg-white border-4 border-slate-900 p-6 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
                     <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sugerencia Principal</span><p className="font-black text-xl uppercase italic mt-1">{matches[0].t1} vs {matches[0].t2}</p></div>
                     <div className="mt-6 bg-slate-900 p-4 rounded-2xl border-l-8 border-emerald-500"><span className="text-emerald-400 font-black text-[10px] uppercase italic">¿QUÉ APOSTAR?</span><p className="text-white font-black text-xl uppercase italic">JUEGA A: {matches[0].gana}</p></div>
                  </div>
                  {matches[1] && (
                    <div className="bg-white border-4 border-slate-900 p-6 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
                       <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sugerencia Refuerzo</span><p className="font-black text-xl uppercase italic mt-1">{matches[1].t1} vs {matches[1].t2}</p></div>
                       <div className="mt-6 bg-slate-900 p-4 rounded-2xl border-l-8 border-orange-500"><span className="text-orange-400 font-black text-[10px] uppercase italic">¿QUÉ APOSTAR?</span><p className="text-white font-black text-xl uppercase italic">JUEGA A: {matches[1].alta_baja}</p></div>
                    </div>
                  )}
               </div>
            </div>
          )}

          <div className="grid gap-10">
             {matches.length > 0 ? matches.map((m, i) => (
               <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[4rem] p-6 md:p-10 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-8 border-b-2 pb-4 border-slate-100">
                     <span className="font-black text-[9px] md:text-xs text-slate-400 uppercase italic"> {m.time} | {m.liga}</span>
                     <span className="bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter">Estudio Analítico</span>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                     <div className="flex-1 text-center"><p className="font-black text-2xl md:text-5xl uppercase tracking-tighter">{m.t1}</p></div>
                     <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white border-4 border-slate-900 shadow-lg shrink-0 italic">VS</div>
                     <div className="flex-1 text-center"><p className="font-black text-2xl md:text-5xl uppercase tracking-tighter">{m.t2}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                     <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">Gana</p><p className="font-black text-[10px] md:text-sm text-white uppercase">{m.gana}</p></div>
                     <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">Alta/Baja</p><p className="font-black text-[10px] md:text-sm text-white uppercase">{m.alta_baja}</p></div>
                     <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">RL/H</p><p className="font-black text-[10px] md:text-sm text-white uppercase">{m.handicap}</p></div>
                  </div>
                  <div className="mt-8 bg-slate-50 border-2 border-dashed border-slate-300 p-4 rounded-xl italic font-black text-[10px] md:text-xs text-slate-500 uppercase leading-relaxed text-center">"{m.analisis}"</div>
               </div>
             )) : (
               <div className="py-20 text-center bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">
                  <p className="font-black text-slate-300 uppercase italic">No hay encuentros disponibles para esta liga hoy.</p>
               </div>
             )}
          </div>

          {/* MANUAL DEL APOSTADOR */}
          <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-6 text-left">
             <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                <BookOpen className="text-emerald-500" />
                <h4 className="font-black text-xl uppercase italic">Manual del Apostador Maestro</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                   <div className="flex items-start gap-3"><HelpCircle className="text-slate-400 shrink-0 mt-1" size={16}/><p className="text-[11px] font-bold uppercase leading-tight"><span className="text-emerald-600">GANA:</span> Apuestas directamente a quién ganará.</p></div>
                   <div className="flex items-start gap-3"><HelpCircle className="text-slate-400 shrink-0 mt-1" size={16}/><p className="text-[11px] font-bold uppercase leading-tight"><span className="text-emerald-600">EMPATE:</span> El juego termina igualado.</p></div>
                   <div className="flex items-start gap-3"><HelpCircle className="text-slate-400 shrink-0 mt-1" size={16}/><p className="text-[11px] font-bold uppercase leading-tight"><span className="text-emerald-600">ALTA / BAJA:</span> Suma total de puntos o goles.</p></div>
                </div>
                <div className="space-y-3">
                   <div className="flex items-start gap-3"><HelpCircle className="text-slate-400 shrink-0 mt-1" size={16}/><p className="text-[11px] font-bold uppercase leading-tight"><span className="text-emerald-600">RUNLINE:</span> Ventaja o desventaja de 1.5 carreras.</p></div>
                   <div className="flex items-start gap-3"><HelpCircle className="text-slate-400 shrink-0 mt-1" size={16}/><p className="text-[11px] font-bold uppercase leading-tight"><span className="text-emerald-600">HÁNDICAP:</span> Ventaja de puntos dada a un equipo.</p></div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- SECCIÓN HIPISMO --- */}
      {mode === 'hipismo' && (
        <div className="space-y-8 relative z-10 text-slate-900">
           <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Select value={track} onValueChange={setTrack}><SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger><SelectContent className="bg-white border-4 border-slate-900 z-[250]">{Object.keys(HIPISMO_DATA).map(t => <SelectItem key={t} value={t} className="font-black uppercase">{t}</SelectItem>)}</SelectContent></Select>
                 <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-14 rounded-2xl font-black shadow-inner" />
              </div>
              <Button onClick={() => setShowCuadroIA(!showCuadroIA)} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-lg uppercase italic transition-all"><LayoutGrid className="mr-2" size={24} /> {showCuadroIA ? "CERRAR CUADRO" : "ARMAR CUADRO IA (5y6)"}</Button>
           </div>
           
           {/* CUADRO IA HÍPICO */}
           {showCuadroIA && (
             <div className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-8 animate-in zoom-in duration-500 relative overflow-hidden">
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

           <div className="grid gap-10">
              {races.map((r, i) => (
                <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl relative">
                   <div className="flex justify-between items-center mb-8 border-b-4 border-emerald-500 pb-4">
                      <div className="flex items-center gap-3">
                         <div className="bg-slate-900 text-white w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 border-emerald-400"><span className="font-black text-xl">{r.num}</span><span className="text-[7px] font-bold uppercase tracking-widest">CARR</span></div>
                         <div><p className="font-black text-lg md:text-2xl uppercase italic tracking-tighter">{r.valida}</p><p className="text-[9px] font-bold text-slate-400 uppercase">{r.hora} EST</p></div>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50 border-4 border-emerald-500 p-6 rounded-3xl relative shadow-md"><span className="absolute -top-3 left-6 bg-emerald-500 text-white px-4 py-0.5 rounded-full font-black text-[8px] md:text-[10px] uppercase shadow-sm">Favorito Maestro</span><p className="font-black text-2xl md:text-4xl text-emerald-900 uppercase tracking-tighter">{r.fav}</p></div>
                      <div className="bg-slate-50 border-4 border-slate-300 p-6 rounded-3xl relative shadow-md"><span className="absolute -top-3 left-6 bg-slate-400 text-white px-4 py-0.5 rounded-full font-black text-[8px] md:text-[10px] uppercase shadow-sm">Placé</span><p className="font-black text-2xl md:text-4xl text-slate-600 uppercase tracking-tighter">{r.place}</p></div>
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
