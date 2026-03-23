import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Trash2, Wallet, CheckCircle2, Star, Lock, Loader2, RefreshCw, Calculator, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// 🛡️ FUNCIÓN PARA JALAR ANIMALES 3D (NUEVA ADICIÓN PARA FOTO 7)
const getAnimalImageUrl = (code: string | number): string => {
  const str = String(code).trim();
  const normalized = (str === '0' || str === '00') ? str : str.padStart(2, '0');
  return `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${normalized}.png`;
};

const IMG_BASE = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/";
const LOTERIAS = [
  { id: "lotto_activo", label: "LOTTO ACTIVO", img: `${IMG_BASE}logo-lotto-activo.png` },
  { id: "la_granjita", label: "LA GRANJITA", img: `${IMG_BASE}logo-granjita.png` },
  { id: "guacharo", label: "GUÁCHARO", img: `${IMG_BASE}logo-guacharito.png` }, 
  { id: "guacharito", label: "GUACHARITO", img: `${IMG_BASE}logo-guacharo.png` },
  { id: "lotto_rey", label: "LOTTO REY", img: `${IMG_BASE}logo-lotto-rey.png` },
  { id: "selva_plus", label: "SELVA PLUS", img: `${IMG_BASE}logo-selva-plus.png` },
];

const ANIMALS_MASTER: any = { '0': 'DELFÍN', '00': 'BALLENA', '01': 'CARNERO', '02': 'TORO', '03': 'CIEMPIÉS', '04': 'ALACRÁN', '05': 'LEÓN', '06': 'RANA', '07': 'PERICO', '08': 'RATÓN', '09': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO', '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO', '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA', '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO', '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO', '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA', '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO', '42': 'TUCÁN', '43': 'MARIPOSA', '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN', '49': 'PEREZOSO', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL', '54': 'GRILLO', '55': 'OSO HORMIGUERO', '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN', '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN', '65': 'ARAÑA', '66': 'LOBO', '67': 'AVESTRUZ', '68': 'JAGUAR', '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA', '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO', '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE', '79': 'CALAMAR', '80': 'MURCIÉLAGO', '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO', '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY', '87': 'CABRA', '88': 'ERIZO DE MAR', '89': 'ANGUILA', '90': 'HURÓN', '91': 'MORROCOY', '92': 'CISNE', '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO', '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO', '99': 'GUACHARITO' };

interface ModuloJugadasProps { forcedAgency?: any; }

export function ModuloJugadas({ forcedAgency }: ModuloJugadasProps) {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState("lotto_activo"); 
  const [selectedNum, setSelectedNum] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [monto, setMonto] = useState("10");
  const [loading, setLoading] = useState(true);
  
  const [isVip, setIsVip] = useState(false);
  const [passVip, setPassVip] = useState("");
  const [datoVip, setDatoVip] = useState<any>(null);
  const [iaLoading, setIaLoading] = useState(false);

  const [userPM, setUserPM] = useState("");
  const [userCedula, setUserCedula] = useState("");
  const [userBanco, setUserBanco] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        if (forcedAgency) setSelectedAgencia(forcedAgency);
        else {
          const { data } = await supabase.from('agencias').select('*').eq('activa', true);
          if (data) setAgencias(data);
        }
        setUserPM(localStorage.getItem('u_pm_tlf') || "");
        setUserCedula(localStorage.getItem('u_pm_cedula') || "");
        setUserBanco(localStorage.getItem('u_pm_banco') || "");
        if(localStorage.getItem('vip_active') === 'true') setIsVip(true);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    init();
  }, [forcedAgency]);

  const cargarDatoIA = async () => {
    if (!selectedLot) return;
    setIaLoading(true);
    try {
      const { data } = await supabase.rpc('obtener_dato_vip_blindado', { lot_name: selectedLot });
      if (data && data.length > 0) {
        const info = data[0];
        let idReal = info.animal_id.toString(); 
        if (idReal !== "0" && idReal !== "00" && idReal.length === 1) idReal = "0" + idReal;
        setDatoVip({ ...info, animal_id: idReal, animal_nombre: ANIMALS_MASTER[idReal] || "SINCRONIZANDO" });
      }
    } catch (e) { console.error(e); } finally { setIaLoading(false); }
  };

  useEffect(() => { cargarDatoIA(); }, [selectedLot]);

  const validarVip = async () => {
    if (!passVip) return toast.error("Ingresa código");
    try {
      const { data } = await supabase.from('codigos_vip').select('*').eq('codigo', passVip.toUpperCase().trim()).eq('activo', true).single();
      if (data) {
        setIsVip(true);
        localStorage.setItem('vip_active', 'true');
        toast.success("¡BÚNKER DESBLOQUEADO!");
      } else { toast.error("Código inválido"); }
    } catch (err) { toast.error("Fallo de conexión"); }
  };

  const filteredNumbers = useMemo(() => {
    const base = ["00", "0"];
    const rest = Array.from({length: 99}, (_, i) => {
        const num = (i + 1).toString();
        return num.length === 1 ? "0" + num : num;
    });
    const all = [...base, ...rest];
    return all.filter(n => {
      if (selectedLot === "guacharito") return true; 
      if (selectedLot === "guacharo") return n === "00" || n === "0" || parseInt(n) <= 75;
      return n === "00" || n === "0" || parseInt(n) <= 36;
    });
  }, [selectedLot]);

  const horas = useMemo(() => {
    const p = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
    const m = ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"];
    return (selectedLot === "guacharito" || selectedLot === "lotto_rey") ? m : p;
  }, [selectedLot]);

  const agregar = () => {
    if (!selectedNum || !monto || selectedHours.length === 0) return toast.error("Faltan datos");
    const lotLabel = LOTERIAS.find(l => l.id === selectedLot)?.label || selectedLot;
    setCurrentJugadas([...currentJugadas, { loteria: lotLabel, numero: selectedNum, animal: ANIMALS_MASTER[selectedNum], monto: parseFloat(monto), horas: [...selectedHours] }]);
    setSelectedNum(null);
  };

  const msgUrl = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";
    let tlf = selectedAgencia.whatsapp?.toString().replace(/\D/g, '');
    tlf = tlf.startsWith('58') ? tlf : '58' + tlf.replace(/^0/, '');
    let msg = `SOLICITUD DE JUGADA\n--------------------------\nDATOS DE COBRO:\n🏦 BANCO: ${userBanco}\n📞 TLF: ${userPM}\n🆔 CI: ${userCedula}\n--------------------------\n\n`;
    currentJugadas.forEach(j => { msg += `${j.loteria.toUpperCase()}\nAnimal: ${j.numero} - ${j.animal}\nHoras: ${j.horas.join(", ")}\nBs ${j.monto} x sorteo\n----------\n`; });
    msg += `\nTOTAL A PAGAR: ${currentJugadas.reduce((a, c) => a + (c.monto * (c.horas?.length || 0)), 0).toFixed(2)} Bs\n\nAnimalytics Pro: Gestion técnica entre usuario y banca.`;
    return `https://wa.me/${tlf}?text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  if (loading) return <div className="p-20 text-center font-black bg-white text-slate-900">Sincronizando Búnker...</div>;

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen text-slate-900 pb-40 overflow-x-hidden text-center flex flex-col items-center">
      
      {!forcedAgency && (
        <div className="w-full bg-[#0F172A] p-6 lg:p-10 text-white shadow-2xl rounded-b-[3rem] mb-10 flex flex-col items-center text-center text-white">
          <p className="text-[10px] font-black uppercase text-emerald-400 mb-6 tracking-[0.4em] italic text-center">PASO 1: SELECCIONA TU AGENCIA</p>
          <div className="flex flex-wrap gap-4 justify-center max-w-4xl mx-auto text-white">
            {agencias.map(ag => (
              <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`flex items-center gap-2 px-8 py-4 rounded-3xl font-black uppercase text-[12px] transition-all border-2 ${selectedAgencia?.id === ag.id ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg scale-105' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {selectedAgencia?.id === ag.id && <CheckCircle2 size={20} />} {ag.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {forcedAgency && (
        <div className="w-full bg-[#0F172A] p-6 lg:p-10 text-white shadow-2xl rounded-b-[3rem] mb-10 text-center">
           <h1 className="text-emerald-400 font-black uppercase tracking-widest text-xl italic">{forcedAgency.nombre}</h1>
           <p className="text-slate-400 text-[10px] font-bold uppercase mt-2">Punto de Jugada Oficial Protegido por Animalytics</p>
        </div>
      )}

      <div className="max-w-[1600px] w-full grid lg:grid-cols-[1fr_450px] gap-8 px-4 lg:px-10">
        <div className="space-y-10">
          
          <Card className="p-8 lg:p-12 bg-emerald-600 text-white rounded-[3.5rem] shadow-2xl border-none relative overflow-hidden flex flex-col items-center text-center text-white">
             <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Wallet size={150}/></div>
             <div className="relative z-10 w-full max-w-2xl space-y-8">
                <h2 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter leading-tight text-white text-center">¿DÓNDE TE ENVIAMOS TU PAGO?</h2>
                <div className="grid grid-cols-1 gap-4 w-full">
                  <Input value={userBanco} onChange={e => {setUserBanco(e.target.value); localStorage.setItem('u_pm_banco', e.target.value)}} placeholder="Tu Banco" className="bg-white/20 border-none text-white h-16 rounded-3xl font-black text-xl placeholder:text-white/40 text-center" />
                  <Input value={userPM} onChange={e => {setUserPM(e.target.value); localStorage.setItem('u_pm_tlf', e.target.value)}} placeholder="Teléfono Pago Móvil" className="bg-white/20 border-none text-white h-16 rounded-3xl font-black text-xl placeholder:text-white/40 text-center" />
                  <Input value={userCedula} onChange={e => {setUserCedula(e.target.value); localStorage.setItem('u_pm_cedula', e.target.value)}} placeholder="Cédula de Identidad" className="bg-white/20 border-none text-white h-16 rounded-3xl font-black text-xl placeholder:text-white/40 text-center" />
                </div>
             </div>
          </Card>

          <Card className="p-8 lg:p-12 bg-slate-900 border-none shadow-2xl rounded-[4rem] overflow-hidden relative border-t-[12px] border-emerald-500 text-center">
             <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 text-emerald-400"><Star size={200} fill="currentColor"/></div>
             <div className="relative z-10 space-y-8 text-white text-center">
                <div className="flex justify-between items-center px-4">
                  <span className="bg-emerald-500 text-slate-900 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest animate-pulse text-[10px]">DATOS VIP BÚNKER</span>
                  <button onClick={cargarDatoIA} className="text-emerald-400 hover:rotate-180 transition-all duration-500"><RefreshCw size={24}/></button>
                </div>
                <div className="text-center py-6">
                   {isVip ? (
                        <div className="space-y-6 animate-in zoom-in-95 duration-700">
                           <div className="text-6xl lg:text-8xl font-black tracking-tighter flex flex-col items-center gap-4 leading-none text-center">
                              {/* 🛡️ FOTO 7: ANIMAL 3D EN VIP */}
                              <img src={getAnimalImageUrl(datoVip?.animal_id || "0")} className="w-40 h-40 lg:w-56 lg:h-56 object-contain drop-shadow-2xl" alt="VIP" />
                              {datoVip?.animal_id || "--"} - {datoVip?.animal_nombre || "CALCULANDO"}
                           </div>
                           <div className="flex flex-wrap justify-center gap-3">
                              <span className="bg-emerald-500/20 text-emerald-400 px-5 py-2 rounded-2xl font-black text-[10px] lg:text-sm uppercase italic tracking-widest flex items-center gap-2 text-center text-center">
                                <Plus size={16}/> MÉTODO: {datoVip?.metodo}
                              </span>
                              <span className="bg-white/10 text-white px-5 py-2 rounded-2xl font-black text-[10px] lg:text-sm uppercase italic tracking-widest text-center">🔥 {datoVip?.probabilidad || "0"}% ÉXITO</span>
                           </div>
                        </div>
                   ) : (
                     <div className="flex flex-col items-center gap-8 text-center">
                        <Lock size={80} className="text-white/20 text-center" />
                        <p className="text-white font-black text-2xl uppercase tracking-[0.2em]">DATO BLOQUEADO</p>
                        
                        <div className="w-full max-w-sm flex flex-col gap-4 text-center text-center">
                           <Button 
                             onClick={() => window.open('https://t.me/+1NfML7kPFeliNDE5', '_blank')} 
                             className="w-full h-16 bg-[#229ED9] hover:bg-[#1e8ec5] text-white font-black uppercase rounded-2xl shadow-xl flex items-center justify-center gap-3 text-center"
                           >
                             <Send size={24} className="fill-white text-center"/> VER EN TELEGRAM
                           </Button>
                           
                           <div className="flex gap-2 bg-white/5 p-2 rounded-3xl border border-white/10 text-center">
                              <Input 
                                value={passVip} 
                                onChange={e => setPassVip(e.target.value)} 
                                placeholder="Código VIP..." 
                                className="bg-transparent border-none text-white font-black text-center text-lg h-14 rounded-2xl placeholder:text-white/20 text-center" 
                              />
                              <Button 
                                onClick={validarVip} 
                                className="bg-emerald-500 text-slate-900 rounded-2xl px-6 font-black h-14 uppercase text-center"
                              >
                                ACTIVAR
                              </Button>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </Card>

          <Card className="bg-white p-6 lg:p-10 rounded-[3.5rem] shadow-xl border-none flex justify-center text-center text-center">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 lg:gap-10 items-center justify-items-center">
              {LOTERIAS.map(lot => (
                <button key={lot.id} onClick={() => { setSelectedLot(lot.id); setSelectedHours([]); setSelectedNum(null); }} className={`flex flex-col items-center gap-3 transition-all ${selectedLot === lot.id ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-100'}`}>
                  <div className={`w-20 h-20 lg:w-28 lg:h-28 rounded-full border-4 ${selectedLot === lot.id ? 'border-emerald-500 shadow-2xl' : 'border-slate-100'} overflow-hidden bg-black p-1.5 flex items-center justify-center transition-all text-center`}>
                    <img src={lot.img} alt={lot.id} className="w-full h-full object-contain text-center" crossOrigin="anonymous" />
                  </div>
                  <span className={`text-[9px] lg:text-[11px] font-black uppercase text-center ${selectedLot === lot.id ? 'text-emerald-600 underline decoration-4' : 'text-slate-500'} text-center text-center text-center`}>{lot.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 lg:p-12 bg-white rounded-[3.5rem] shadow-2xl border-none text-slate-900 text-center text-center text-center">
           // Dentro del mapeo de animales, use este tamaño para teléfono:
<div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-6">
  {filteredNumbers.map(n => (
    <button key={n} className="flex flex-col items-center justify-center p-4 rounded-[2.5rem] border-4 border-slate-900 bg-white h-44 md:h-52 shadow-xl hover:scale-105 transition-all">
       <img src={getAnimalImageUrl(n)} className="w-28 h-28 md:w-36 md:h-36 object-contain" />
       <span className="font-black text-2xl mt-2 italic">#{n}</span>
    </button>
  ))}
</div>

          <Card className="p-8 bg-white rounded-[3.5rem] shadow-2xl border-none text-center text-center">
            <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 text-center">
              {horas.map(h => (
                <button key={h} onClick={() => setSelectedHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])} className={`h-14 lg:h-16 rounded-2xl text-[12px] lg:text-[14px] font-black border-2 transition-all ${selectedHours.includes(h) ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xl' : 'bg-[#F8FAFC] border-transparent text-slate-500 hover:bg-slate-200'} text-center`}>{h}</button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8 flex flex-col items-center w-full text-slate-900 text-center">
          <div className="lg:sticky lg:top-10 space-y-8 w-full text-center">
            {selectedAgencia && (
              <Card className="p-8 bg-white rounded-[3rem] shadow-xl border-2 border-slate-100 flex flex-col gap-6 items-center">
                 <div className="grid grid-cols-2 gap-3 w-full text-center text-center">
                    <Button onClick={() => selectedAgencia.instagram_url ? window.open(selectedAgencia.instagram_url, '_blank') : toast.error("Sin Instagram")} className="h-16 rounded-3xl font-black text-xs uppercase bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white shadow-lg text-center text-center">Instagram</Button>
                    <Button onClick={() => window.open(`https://wa.me/${(selectedAgencia.whatsapp || "").replace(/\D/g, '')}?text=Hola, necesito realizar un reclamo`, '_blank')} className="h-16 rounded-3xl font-black text-xs uppercase bg-amber-500 text-white shadow-lg text-center text-center text-center">Reclamos</Button>
                 </div>
                 <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] text-center w-full text-slate-900 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic text-center text-center">DATOS PAGO AGENCIA</p>
                    <p className="text-[14px] font-black text-slate-700 uppercase italic leading-tight text-center text-center">{selectedAgencia.banco_nombre}</p>
                    <p className="text-[12px] font-bold text-slate-500 mt-2 text-center text-center text-center">Tlf: {selectedAgencia.banco_telefono} | CI: {selectedAgencia.banco_cedula}</p>
                 </div>
              </Card>
            )}

            <Card className="p-10 bg-white rounded-[4rem] shadow-2xl border-none space-y-4 text-center">
              <label className="text-[11px] font-black uppercase opacity-40 italic tracking-widest text-center text-center">MONTO POR SORTEO (BS)</label>
              <Input type="number" value={monto} onChange={e => setMonto(e.target.value)} className="h-24 text-center text-7xl font-black bg-slate-50 border-none rounded-[3rem] shadow-inner focus:ring-0 text-slate-900 text-center" />
              <Button onClick={agregar} className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-[2.5rem] text-xl lg:text-2xl shadow-xl mt-4 text-center"><Plus size={32} className="mr-3 text-center" /> AÑADIR JUGADA</Button>
            </Card>

            <div className="bg-white p-8 lg:p-12 font-mono shadow-2xl rounded-[4rem] border-t-[18px] border-emerald-600 min-h-[500px] flex flex-col text-slate-900 text-center text-center">
              <h4 className="text-center font-black uppercase text-lg border-b border-slate-100 pb-4 mb-8 italic leading-none text-center text-slate-900 text-center">RESUMEN TICKET</h4>
              <div className="flex-1 space-y-5 overflow-y-auto max-h-[350px] no-scrollbar text-center text-slate-900">
                {currentJugadas.map((j, i) => (
                  <div key={i} className="border-b border-slate-50 pb-5 flex flex-col items-center justify-center text-center text-slate-900 text-center">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 text-center text-center">{j.loteria}</p>
                    <p className="font-black text-xl italic text-slate-800 leading-none text-center text-center">#{j.numero} - {j.animal}</p>
                    <div className="flex items-center gap-4 mt-2 text-slate-900 text-center text-center">
                       <span className="font-black text-lg text-center">{(j.monto * (j.horas?.length || 0)).toFixed(2)} Bs</span>
                       <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 bg-red-50 p-2 rounded-2xl text-center"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t-4 border-double border-slate-900 flex justify-between items-center font-black text-3xl italic mb-10 tracking-tighter text-slate-900 text-right text-center text-center">
                <span className="text-sm uppercase opacity-40 text-slate-900 text-center text-center">TOTAL:</span>
                <span className="underline decoration-emerald-500 decoration-8 text-slate-900 text-center text-center">{currentJugadas.reduce((a, c) => a + (c.monto * (c.horas?.length || 0)), 0).toFixed(2)} Bs</span>
              </div>

              <div className="mt-4 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-3xl text-center text-center text-center text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 italic text-center flex items-center justify-center gap-1 text-center text-center">
                  <ShieldCheck size={12} className="text-emerald-500 text-center" /> CLÁUSULA DE SEGURIDAD
                </p>
                <p className="text-[10px] leading-tight text-slate-500 font-medium text-center text-center">
                  El compromiso de pago y cobro es <span className="text-emerald-600 font-bold text-center text-center text-center">exclusivo entre usted y la agencia</span>. Animalytics Pro no gestiona fondos.
                </p>
              </div>

              <Button onClick={() => { if (!userPM || !userBanco || !userCedula) return toast.error("¡Faltan tus datos de pago!"); window.open(msgUrl, '_blank'); }} className={`w-full h-24 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[3.5rem] font-black text-2xl shadow-xl active:scale-95 leading-none ${currentJugadas.length === 0 ? 'opacity-20 pointer-events-none grayscale' : ''} text-center text-center text-center`}><Send size={32} className="mr-3 text-center" /> ENVIAR A AGENCIA</Button>
            </div>
          </div>
        </div>
      </div>

      {selectedAgencia?.publicidad_url && (
        <div className="max-w-[1600px] w-full mx-auto mt-24 px-6 pb-40 text-center flex flex-col items-center text-center text-center">
           <p className="text-[11px] font-black text-slate-400 uppercase mb-8 tracking-[0.6em] italic text-center text-center text-center text-center">ESPACIO PUBLICITARIO</p>
           <div className="relative w-full group text-center text-center">
             <img src={selectedAgencia.publicidad_url} alt="Publicidad Agencia" className="w-full h-auto object-contain max-h-[800px] mx-auto rounded-[4rem] lg:rounded-[5.5rem] shadow-2xl border-[8px] lg:border-[16px] border-white bg-white transition-transform duration-700 group-hover:scale-[1.01] text-center" crossOrigin="anonymous" />
             <div className="absolute inset-0 rounded-[4rem] lg:rounded-[5.5rem] shadow-[inset_0_0_100px_rgba(0,0,0,0.05)] pointer-events-none text-center"></div>
           </div>
        </div>
      )}
      
    </div>
