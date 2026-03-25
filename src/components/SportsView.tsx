import { useState, useMemo } from 'react';
import { 
  Trophy, Activity, Star, Info, Sparkles, CheckCircle2, 
  Clock, Zap, Target, LayoutGrid, Calculator, BookOpen, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdBanner } from "./AdBanner";

const DEPORTES_PARLEY = {
  "Fútbol": {
    ligas: ["Champions League", "La Liga", "Premier League", "Serie A", "Liga FUTVE"],
    juegos: [
      { liga: "Champions League", t1: "Real Madrid", t2: "Man City", time: "03:00 PM", gana: "Local", alta_baja: "Alta 2.5", handicap: "-0.5", analisis: "Madrid en casa es letal en transiciones." },
      { liga: "Premier League", t1: "Liverpool", t2: "Brighton", time: "09:00 AM", gana: "Local", alta_baja: "Alta 3.5", handicap: "-1.5", analisis: "Anfield es una fortaleza inexpugnable." }
    ]
  },
  "Béisbol": {
    ligas: ["MLB (USA)", "LVBP (VEN)"],
    juegos: [
      { liga: "MLB (USA)", t1: "Yankees", t2: "Red Sox", time: "07:05 PM", gana: "Local", alta_baja: "Alta 8.5", handicap: "RL -1.5", analisis: "Cole domina a Boston." }
    ]
  }
};

const HIPISMO_DATA = {
  "La Rinconada (VEN)": {
    "2026-03-29": {
      carreras: [
        { num: 1, valida: "1ra Carrera", hora: "01:00 PM", fav: "EL DE FROIX (04)", place: "PAPA PEDRO (02)", analisis: "Superior en los papeles." },
        { num: 2, valida: "2da Carrera", hora: "01:25 PM", fav: "FUTURO (01)", place: "BRAVUCÓN (05)", analisis: "Viene de gran fogueo." },
        { num: 3, valida: "3ra Carrera", hora: "01:50 PM", fav: "PHILOMENA (03)", place: "LA SENSACIONAL (06)", analisis: "Velocista pura." },
        { num: 4, valida: "4ta Carrera", hora: "02:15 PM", fav: "LIANDRO (08)", place: "BARTOLOMEO (02)", analisis: "Atención con el aprendiz." },
        { num: 5, valida: "1ra Válida (5y6)", hora: "03:00 PM", fav: "LUNA NUEVA (05)", place: "STRENGHT MASK (01)", analisis: "La línea nacional." },
        { num: 6, valida: "2da Válida (5y6)", hora: "03:30 PM", fav: "AMELIARE (07)", place: "TURQUESA (02)", analisis: "Speed rating alto." },
        { num: 7, valida: "3ra Válida (5y6)", hora: "04:00 PM", fav: "MY TITICO MATE (03)", place: "DORAL SEGUNDO (04)", analisis: "Si salta bien, gana." },
        { num: 8, valida: "4ta Válida (5y6)", hora: "04:30 PM", fav: "CATIRE PEDRO (01)", place: "IL FILANGIERI (06)", analisis: "Duelo de jinetes." },
        { num: 9, valida: "5ta Válida (5y6)", hora: "05:00 PM", fav: "SHARAPOVA (04)", place: "AVASALLANTE (02)", analisis: "La campeona regresa." },
        { num: 10, valida: "6ta Válida (5y6)", hora: "05:30 PM", fav: "EL GRAN BRICEÑO (09)", place: "CANDY CUMMINGS (04)", analisis: "El cierre de la jornada." }
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
    "2026-03-25": {
      carreras: [
        { num: 1, valida: "Race 1", hora: "12:10 PM", fav: "SPEEDY (01)", place: "MAGIC (05)", analisis: "Baja de lote." },
        { num: 2, valida: "Race 2", hora: "12:40 PM", fav: "BIG BOSS (04)", place: "LITTLE JOE (02)", analisis: "Debutante estrella." },
        { num: 3, valida: "Race 3", hora: "01:10 PM", fav: "GREEN WAVE (06)", place: "SEA BREEZE (03)", analisis: "Especialista en grama." },
        { num: 4, valida: "Race 4", hora: "01:40 PM", fav: "GLOBAL SENSATION (02)", place: "FLYING (08)", analisis: "Monta de Irad Ortiz." }
      ],
      cuadroIA: [
        { leg: "Race 4", picks: ["02"], tipo: "LÍNEA" },
        { leg: "Race 5", picks: ["01", "05"], tipo: "DOBLE" },
        { leg: "Race 6", picks: ["08"], tipo: "LÍNEA" }
      ]
    }
  }
};

export function SportsView() {
  const [mode, setMode] = useState<'deportes' | 'hipismo'>('deportes');
  const [sport, setSport] = useState("Fútbol");
  const [league, setLeague] = useState("Champions League");
  const [showIA, setShowIA] = useState(false);
  const [track, setTrack] = useState("La Rinconada (VEN)");
  const [date, setDate] = useState("2026-03-29");
  const [showCuadroIA, setShowCuadroIA] = useState(false);

  const matches = useMemo(() => DEPORTES_PARLEY[sport as keyof typeof DEPORTES_PARLEY]?.juegos.filter(j => j.liga === league) || [], [sport, league]);
  const hipismoInfo = useMemo(() => HIPISMO_DATA[track as keyof typeof HIPISMO_DATA]?.[date], [track, date]);
  const races = hipismoInfo?.carreras || [];
  const cuadroIA = hipismoInfo?.cuadroIA || [];

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-1000 relative min-h-screen">
      <div className={`fixed inset-0 pointer-events-none opacity-[0.06] grayscale transition-all duration-700 ${mode === 'deportes' ? 'bg-[url("https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000")] bg-cover' : 'bg-[url("https://images.unsplash.com/photo-1599201948464-966904945437?q=80&w=1000")] bg-cover'}`} />

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative z-10">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
           {mode === 'deportes' ? <Trophy className="text-yellow-400" /> : <Calculator className="text-emerald-400" />}
           {mode === 'deportes' ? "BÚNKER DEPORTIVO" : "SISTEMA HÍPICO PRO"}
        </h2>
      </div>

      <div className="flex bg-white border-4 border-slate-900 rounded-full p-2 shadow-2xl max-w-md mx-auto relative z-10">
         <button onClick={() => setMode('deportes')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'deportes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>DEPORTES</button>
         <button onClick={() => setMode('hipismo')} className={`flex-1 py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all ${mode === 'hipismo' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>HIPISMO</button>
      </div>

      {mode === 'deportes' && (
        <div className="space-y-8 relative z-10">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6 text-slate-900">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={sport} onValueChange={(v) => {setSport(v); setLeague(DEPORTES_PARLEY[v as keyof typeof DEPORTES_PARLEY].ligas[0])}}><SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger><SelectContent className="bg-white border-4 border-slate-900">{Object.keys(DEPORTES_PARLEY).map(s => <SelectItem key={s} value={s} className="font-black uppercase">{s}</SelectItem>)}</SelectContent></Select>
                <Select value={league} onValueChange={setLeague}><SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger><SelectContent className="bg-white border-4 border-slate-900">{DEPORTES_PARLEY[sport as keyof typeof DEPORTES_PARLEY]?.ligas.map(l => <SelectItem key={l} value={l} className="font-black uppercase">{l}</SelectItem>)}</SelectContent></Select>
             </div>
             <Button onClick={() => setShowIA(!showIA)} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-2xl font-black text-slate-900 text-xl shadow-lg uppercase italic transition-all"><Sparkles size={20} className="mr-2"/> {showIA ? "OCULTAR JUGADA" : "VER TICKET IA"}</Button>
          </div>

          {showIA && matches.length > 0 && (
            <div className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-8 animate-in zoom-in duration-500 text-slate-900 relative overflow-hidden">
               <h3 className="font-black text-2xl md:text-4xl uppercase italic tracking-tighter border-b-4 border-slate-900 pb-4">TICKET MAESTRO IA</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border-4 border-slate-900 p-6 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
                     <div><span className="text-[10px] font-black text-slate-400 uppercase">Juego</span><p className="font-black text-xl uppercase italic leading-none mt-1">{matches[0].t1} vs {matches[0].t2}</p></div>
                     <div className="mt-6 bg-slate-900 p-4 rounded-2xl border-l-8 border-emerald-500"><p className="text-white font-black text-xl uppercase italic">JUEGA A: {matches[0].gana}</p></div>
                  </div>
               </div>
            </div>
          )}

          {matches.map((m, i) => (
            <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[4rem] p-6 md:p-10 shadow-2xl relative text-slate-900">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                  <div className="flex-1 text-center"><p className="font-black text-2xl md:text-5xl uppercase tracking-tighter">{m.t1}</p></div>
                  <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white border-4 border-slate-900 shadow-lg shrink-0 italic">VS</div>
                  <div className="flex-1 text-center"><p className="font-black text-2xl md:text-5xl uppercase tracking-tighter">{m.t2}</p></div>
               </div>
               <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">Gana</p><p className="font-black text-xs text-white uppercase">{m.gana}</p></div>
                  <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">Alta/Baja</p><p className="font-black text-xs text-white uppercase">{m.alta_baja}</p></div>
                  <div className="bg-slate-900 border-2 border-slate-900 p-3 rounded-2xl text-center shadow-lg"><p className="text-[8px] font-black text-emerald-400 uppercase">RL</p><p className="font-black text-xs text-white uppercase">{m.handicap}</p></div>
               </div>
            </div>
          ))}
        </div>
      )}

      {mode === 'hipismo' && (
        <div className="space-y-8 relative z-10 text-slate-900">
           <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Select value={track} onValueChange={setTrack}><SelectTrigger className="border-4 border-slate-900 h-14 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger><SelectContent className="bg-white border-4 border-slate-900">{Object.keys(HIPISMO_DATA).map(t => <SelectItem key={t} value={t} className="font-black uppercase">{t}</SelectItem>)}</SelectContent></Select>
                 <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-14 rounded-2xl font-black shadow-inner" />
              </div>
              <Button onClick={() => setShowCuadroIA(!showCuadroIA)} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-3xl font-black text-slate-900 text-xl shadow-lg uppercase italic transition-all"><LayoutGrid className="mr-2" size={24} /> {showCuadroIA ? "CERRAR CUADRO" : "ARMAR CUADRO IA (5y6)"}</Button>
           </div>
           
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
                      <div className="bg-emerald-50 border-4 border-emerald-500 p-6 rounded-3xl relative shadow-md"><span className="absolute -top-3 left-6 bg-emerald-500 text-white px-4 py-0.5 rounded-full font-black text-[8px] md:text-[10px] uppercase shadow-sm">Favorito Maestro</span><p className="font-black text-2xl md:text-5xl text-emerald-900 uppercase tracking-tighter">{r.fav}</p></div>
                      <div className="bg-slate-50 border-4 border-slate-300 p-6 rounded-3xl relative shadow-md"><span className="absolute -top-3 left-6 bg-slate-400 text-white px-4 py-0.5 rounded-full font-black text-[8px] md:text-[10px] uppercase shadow-sm">Placé</span><p className="font-black text-2xl md:text-5xl text-slate-600 uppercase tracking-tighter">{r.place}</p></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <AdBanner slotId="deportes" />
    </div>
  );
}
