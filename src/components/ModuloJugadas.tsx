import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, Wallet, Landmark, CheckCircle2, Instagram, MessageCircle, Plus, Star, Key, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

// --- RUTA GITHUB ---
const IMG_BASE = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/";
const LOTERIAS = [
  { id: "Lotto Activo", label: "LOTTO ACTIVO", img: `${IMG_BASE}logo-lotto-activo.png` },
  { id: "La Granjita", label: "LA GRANJITA", img: `${IMG_BASE}logo-granjita.png` },
  { id: "Guácharo Activo", label: "GUÁCHARO", img: `${IMG_BASE}logo-guacharito.png` }, // LOGO DADOS
  { id: "Guacharito", label: "GUACHARITO", img: `${IMG_BASE}logo-guacharo.png` },    // LOGO PÁJARO
  { id: "Lotto Rey", label: "LOTTO REY", img: `${IMG_BASE}logo-lotto-rey.png` },
  { id: "Selva Plus", label: "SELVA PLUS", img: `${IMG_BASE}logo-selva-plus.png` },
];

// --- DICCIONARIO MAESTRO ---
const ANIMALS_MASTER: any = { '0': 'DELFÍN', '00': 'BALLENA', '1': 'CARNERO', '2': 'TORO', '3': 'CIEMPIÉS', '4': 'ALACRÁN', '5': 'LEÓN', '6': 'RANA', '7': 'PERICO', '8': 'RATÓN', '9': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO', '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO', '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA', '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO', '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO', '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA', '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO', '42': 'TUCÁN', '43': 'MARIPOSA', '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN', '49': 'PEREZOSO', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL', '54': 'GRILLO', '55': 'OSO HORMIGUERO', '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN', '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN', '65': 'ARAÑA', '66': 'LOBO', '67': 'AVESTRUZ', '68': 'JAGUAR', '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA', '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO', '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE', '79': 'CALAMAR', '80': 'MURCIÉLAGO', '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO', '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY', '87': 'CABRA', '88': 'ERIZO DE MAR', '89': 'ANGUILA', '90': 'HURÓN', '91': 'MORROCOY', '92': 'CISNE', '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO', '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO', '99': 'GUACHARITO' };
const ANIMAL_EMOJIS: any = { "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛", "4": "🦂", "5": "🦁", "6": "🐸", "7": "🦜", "8": "🐭", "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴", "13": "🐵", "14": "🕊️", "15": "🦊", "16": "🐻", "17": "🦃", "18": "🫏", "19": "🐐", "20": "🐷", "21": "🐓", "22": "🐪", "23": "🦓", "24": "🦎", "25": "🐔", "26": "🐄", "27": "🐕", "28": "🦅", "29": "🐘", "30": "🐊", "31": "🦫", "32": "🐿️", "33": "🐟", "34": "🦌", "35": "🦒", "36": "🐍", "37": "🐢", "38": "🦬", "39": "🦉", "40": "🐝", "41": "🦘", "42": "🦜", "43": "🦋", "44": "🦫", "45": "🦩", "46": "🐆", "47": "🦚", "48": "🦔", "49": "🦥", "50": "🐤", "51": "🦅", "52": "🐙", "53": "🐌", "54": "🦗", "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜", "59": "🐆", "60": "🦎", "61": "🐼", "62": "🦔", "63": "🦀", "64": "🦅", "65": "🕷️", "66": "🐺", "67": "🦃", "68": "🐆", "69": "🐰", "70": "🦬", "71": "🦜", "72": "🦍", "73": "🦛", "74": "🐦", "75": "🦅", "76": "🦏", "77": "🐧", "78": "🦌", "79": "🦑", "80": "🦇", "81": "🐦‍⬛", "82": "🪳", "83": "🦉", "84": "🦐", "85": "🐹", "86": "🐂", "87": "🐐", "88": "🐚", "89": "🐍", "90": "🦦", "91": "🐢", "92": "🦢", "93": "🐦", "94": "🦃", "95": "🐞", "96": "🐠", "97": "🦜", "98": "🐊", "99": "🐣" };

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState("Lotto Activo");
  const [selectedNum, setSelectedNum] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [monto, setMonto] = useState("10");
  const [loading, setLoading] = useState(true);

  // VIP States
  const [isVip, setIsVip] = useState(false);
  const [passVip, setPassVip] = useState("");
  const [datoVip, setDatoVip] = useState<any>(null);
  const [validando, setValidando] = useState(false);

  // User States
  const [userPM, setUserPM] = useState("");
  const [userCedula, setUserCedula] = useState("");
  const [userBanco, setUserBanco] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.from('agencias').select('*').eq('activa', true);
        if (data) setAgencias(data);
        setUserPM(localStorage.getItem('u_pm_tlf') || "");
        setUserCedula(localStorage.getItem('u_pm_cedula') || "");
        setUserBanco(localStorage.getItem('u_pm_banco') || "");
        if(localStorage.getItem('vip_active') === 'true') setIsVip(true);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    init();
  }, []);

  // ✅ MOTOR DE IA CON FILTRO POR LOTERÍA REAL
  const cargarDatoIA = async () => {
    try {
      if (!selectedLot) return;
      setDatoVip(null); 
      const { data, error } = await supabase.rpc('generar_dato_maestro_vip', {
        lot_name: selectedLot, proxima_hora: "SIGUIENTE"
      });
      if (data && data.length > 0) setDatoVip(data[0]);
    } catch (e) { console.warn("IA esperando datos"); }
  };

  useEffect(() => { cargarDatoIA(); }, [selectedLot]);

  const validarVip = async () => {
    if (!passVip) return toast.error("Ingresa código");
    setValidando(true);
    try {
      const { data } = await supabase.from('codigos_vip').select('*').eq('codigo', passVip.toUpperCase().trim()).eq('activo', true).single();
      if (data) {
        setIsVip(true);
        localStorage.setItem('vip_active', 'true');
        toast.success("¡BÚNKER DESBLOQUEADO!");
      } else { toast.error("Código no válido"); }
    } catch (err) { toast.error("Fallo de conexión"); }
    finally { setValidando(false); }
  };

  const filteredNumbers = useMemo(() => {
    const all = ["00", "0", ...Array.from({length: 99}, (_, i) => (i + 1).toString())];
    return all.filter(n => {
      if (selectedLot === "Guacharito") return true;
      if (selectedLot === "Guácharo Activo") return n === "00" || n === "0" || parseInt(n) <= 75;
      return n === "00" || n === "0" || parseInt(n) <= 36;
    });
  }, [selectedLot]);

  const horas = useMemo(() => {
    const p = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
    const m = ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"];
    return (selectedLot === "Guacharito" || selectedLot === "Lotto Rey") ? m : p;
  }, [selectedLot]);

  const agregar = () => {
    if (!selectedNum || !monto || selectedHours.length === 0) return toast.error("Faltan datos");
    setCurrentJugadas([...currentJugadas, { loteria: selectedLot, numero: selectedNum, animal: ANIMALS_MASTER[selectedNum], monto: parseFloat(monto), horas: [...selectedHours] }]);
    setSelectedNum(null);
  };

  const msgUrl = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";
    let tlf = selectedAgencia.whatsapp?.toString().replace(/\D/g, '') || "";
    tlf = tlf.startsWith('58') ? tlf : '58' + tlf.replace(/^0/, '');
    let msg = `SOLICITUD DE JUGADA\n--------------------------\nDATOS DE COBRO:\n🏦 BANCO: ${userBanco}\n📞 TLF: ${userPM}\n🆔 CI: ${userCedula}\n--------------------------\n\n`;
    currentJugadas.forEach(j => { msg += `${j.loteria.toUpperCase()}\nAnimal: ${j.numero} - ${j.animal}\nHoras: ${j.horas.join(", ")}\nBs ${j.monto} x sorteo\n----------\n`; });
    msg += `\nTOTAL A PAGAR: ${currentJugadas.reduce((a, c) => a + (c.monto * (c.horas?.length || 0)), 0).toFixed(2)} Bs`;
    return `https://wa.me/${tlf}?text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  if (loading) return <div className="p-20 text-center font-black bg-white">Sincronizando Búnker...</div>;

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen text-slate-900 pb-40 overflow-x-hidden text-center flex flex-col items-center">
      
      {/* 1. SECTOR AGENCIA */}
      <div className="w-full bg-[#0F172A] p-6 lg:p-10 text-white shadow-2xl rounded-b-[3rem] mb-10">
        <p className="text-[10px] font-black uppercase text-emerald-400 mb-6 tracking-[0.4em] italic text-center">PASO 1: SELECCIONA TU AGENCIA</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {(agencias || []).map(ag => (
            <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`flex items-center gap-2 px-8 py-4 rounded-3xl font-black uppercase text-[12px] transition-all border-2 ${selectedAgencia?.id === ag.id ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg scale-105' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {selectedAgencia?.id === ag.id && <CheckCircle2 size={20} />} {ag.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1600px] w-full grid lg:grid-cols-[1fr_450px] gap-8 px-4 lg:px-10">
        <div className="space-y-10">
          {/* PASO 1: DATOS COBRO */}
          <Card className="p-8 lg:p-12 bg-emerald-600 text-white rounded-[3.5rem] shadow-2xl border-none relative overflow-hidden flex flex-col items-center">
             <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Wallet size={150}/></div>
             <div className="relative z-10 w-full max-w-2xl space-y-8">
                <h2 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-center leading-tight text-white">¿DÓNDE TE ENVIAMOS TU PAGO?</h2>
                <div className="grid grid-cols-1 gap-4 w-full">
                  <Input value={userBanco} onChange={e => {setUserBanco(e.target.value); localStorage.setItem('u_pm_banco', e.target.value)}} placeholder="Tu Banco" className="bg-white/20 border-none text-white h-16 rounded-3xl font-black text-xl placeholder:text-white/40 text-center" />
                  <Input value={userPM} onChange={e => {setUserPM(e.target.value); localStorage.setItem('u_pm_tlf', e.target.value)}} placeholder="Teléfono Pago Móvil" className="bg-white/20 border-none text-white h-16 rounded-3xl font-black text-xl placeholder:text-white/40 text-center" />
                  <Input value={userCedula} onChange={e => {setUserCedula(e.target.value); localStorage.setItem('u_pm_cedula', e.target.value)}} placeholder="Cédula de Identidad" className="bg-white/20 border-none text-white h-16 rounded-3xl font-black text-xl placeholder:text-white/40 text-center" />
                </div>
             </div>
          </Card>

          {/* TARJETA VIP BÚNKER */}
          <Card className="p-8 lg:p-12 bg-slate-900 border-none shadow-2xl rounded-[4rem] overflow-hidden relative border-t-[12px] border-emerald-500">
             <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 text-emerald-400"><Star size={200} fill="currentColor"/></div>
             <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-center px-4 text-white">
                  <span className="bg-emerald-500 text-slate-900 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest animate-pulse">PRÓXIMO DATO VIP</span>
                  <span className="text-emerald-400 font-black text-2xl italic tracking-tighter uppercase underline decoration-2">{selectedLot}</span>
                </div>
                <div className="text-center py-6 text-white">
                   {isVip ? (
                     <div className="space-y-6 animate-in zoom-in-95 duration-700">
                        <div className="text-6xl lg:text-8xl font-black tracking-tighter flex flex-col items-center gap-4">
                           <span className="text-5xl">{ANIMAL_EMOJIS[datoVip?.animal_id] || "🎲"}</span>
                           {datoVip?.animal_id || "--"} - {datoVip?.animal_nombre || "CALCULANDO"}
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                           <span className="bg-emerald-500/20 text-emerald-400 px-5 py-2 rounded-2xl font-black text-sm uppercase italic tracking-widest">🎯 {datoVip?.metodo || "Fórmula Maestra"}</span>
                           <span className="bg-white/10 text-white px-5 py-2 rounded-2xl font-black text-sm uppercase italic tracking-widest">🔥 {datoVip?.probabilidad || "95"}% ÉXITO</span>
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center gap-8 text-center">
                        <div className="bg-white/5 backdrop-blur-xl p-14 rounded-full border-4 border-dashed border-white/10 relative"><Lock size={80} className="text-white/20" /></div>
                        <p className="text-white font-black text-2xl uppercase tracking-[0.2em]">DATO BLOQUEADO</p>
                        <div className="w-full max-w-sm flex flex-col gap-4">
                           <div className="flex gap-2 bg-white/5 p-2 rounded-3xl border border-white/10">
                              <Input value={passVip} onChange={e => setPassVip(e.target.value)} placeholder="Código VIP..." className="bg-transparent border-none text-white font-black text-center text-lg h-14" />
                              <Button onClick={validarVip} disabled={validando} className="bg-emerald-500 text-slate-900 rounded-2xl px-6 font-black h-14 uppercase">ACTIVAR</Button>
                           </div>
                           <Button onClick={() => window.open(`https://wa.me/584242542797?text=Quiero comprar un código VIP para el Búnker`, '_blank')} className="w-full h-20 bg-amber-500 text-slate-900 font-black text-xl rounded-3xl uppercase italic shadow-2xl">SOLICITAR CÓDIGO VIP</Button>
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </Card>

          <Card className="bg-white p-6 lg:p-10 rounded-[3.5rem] shadow-xl border-none flex justify-center">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 lg:gap-10 items-center justify-items-center">
              {LOTERIAS.map(lot => (
                <button key={lot.id} onClick={() => { setSelectedLot(lot.id); setSelectedHours([]); setSelectedNum(null); }} className={`flex flex-col items-center gap-3 transition-all ${selectedLot === lot.id ? 'scale-110 opacity-100' : 'opacity-40 grayscale-0'}`}>
                  <div className={`w-20 h-20 lg:w-28 lg:h-28 rounded-full border-4 ${selectedLot === lot.id ? 'border-emerald-500 shadow-2xl' : 'border-slate-100'} overflow-hidden bg-black p-1.5 flex items-center justify-center transition-all`}>
                    <img src={lot.img} alt={lot.id} className="w-full h-full object-contain" crossOrigin="anonymous" style={{ filter: 'none !important' }} />
                  </div>
                  <span className={`text-[9px] lg:text-[11px] font-black uppercase text-center ${selectedLot === lot.id ? 'text-emerald-600 underline' : 'text-slate-500'}`}>{lot.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 lg:p-12 bg-white rounded-[3.5rem] shadow-2xl border-none text-slate-900">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {(filteredNumbers || []).map(n => (
                <button key={n} onClick={() => setSelectedNum(n)} className={`flex flex-col items-center justify-center p-3 rounded-[2rem] border-2 transition-all h-32 lg:h-40 ${selectedNum === n ? 'border-emerald-500 bg-emerald-50 shadow-inner scale-110 z-10' : 'bg-[#F8FAFC] border-transparent text-slate-600 hover:bg-slate-200'}`}>
                  <span className="text-3xl lg:text-5xl mb-1 leading-none">{ANIMAL_EMOJIS[n] || "🎲"}</span>
                  <span className="text-[18px] lg:text-[22px] font-black leading-none">{n}</span>
                  <div className="mt-1 w-full px-1 flex items-center justify-center min-h-[30px] overflow-hidden text-slate-400">
                    <span className="text-[8px] lg:text-[10px] font-black uppercase text-center leading-tight">{ANIMALS_MASTER[n]}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-white rounded-[3.5rem] shadow-2xl border-none">
            <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {(horas || []).map(h => (
                <button key={h} onClick={() => setSelectedHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])} className={`h-14 lg:h-16 rounded-2xl text-[12px] lg:text-[14px] font-black border-2 transition-all ${selectedHours.includes(h) ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xl' : 'bg-[#F8FAFC] border-transparent text-slate-500 hover:bg-slate-200'}`}>{h}</button>
              ))}
            </div>
          </Card>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-8 flex flex-col items-center w-full">
          <div className="lg:sticky lg:top-32 space-y-8 w-full text-slate-900 text-center">
            {selectedAgencia && (
              <Card className="p-8 bg-white rounded-[3rem] shadow-xl border-2 border-slate-100 flex flex-col gap-6 items-center">
                 <div className="grid grid-cols-2 gap-3 w-full">
                    <Button onClick={() => selectedAgencia.instagram_url ? window.open(selectedAgencia.instagram_url, '_blank') : toast.error("Sin Instagram")} className="h-16 rounded-3xl font-black text-xs uppercase bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white shadow-lg">Instagram</Button>
                    <Button onClick={() => window.open(`https://wa.me/${(selectedAgencia.whatsapp || "").replace(/\D/g, '')}?text=Hola, necesito realizar un reclamo`, '_blank')} className="h-16 rounded-3xl font-black text-xs uppercase bg-amber-500 text-white shadow-lg">Reclamos</Button>
                 </div>
                 <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] text-left w-full">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic text-center leading-none">DATOS PAGO AGENCIA</p>
                    <p className="text-[14px] font-black text-slate-700 uppercase italic leading-tight">{selectedAgencia.banco_nombre}</p>
                    <p className="text-[12px] font-bold text-slate-500 mt-2">Tlf: {selectedAgencia.banco_telefono} | CI: {selectedAgencia.banco_cedula}</p>
                 </div>
              </Card>
            )}

            <Card className="p-10 bg-white rounded-[4rem] shadow-2xl border-none space-y-4 text-center">
              <label className="text-[11px] font-black uppercase opacity-40 italic tracking-widest text-center text-slate-900">MONTO POR SORTEO (BS)</label>
              <Input type="number" value={monto} onChange={e => setMonto(e.target.value)} className="h-24 text-center text-7xl font-black bg-slate-50 border-none rounded-[3rem] shadow-inner focus:ring-0 text-slate-900" />
              <Button onClick={agregar} className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-[2.5rem] text-xl lg:text-2xl shadow-xl mt-4"><Plus size={32} className="mr-3" /> AÑADIR JUGADA</Button>
            </Card>

            <div className="bg-white p-8 lg:p-12 font-mono shadow-2xl rounded-[4rem] border-t-[18px] border-emerald-600 min-h-[500px] flex flex-col text-slate-900">
              <h4 className="text-center font-black uppercase text-lg border-b border-slate-100 pb-4 mb-8 italic text-center">RESUMEN TICKET</h4>
              <div className="flex-1 space-y-5 overflow-y-auto max-h-[350px] no-scrollbar">
                {(currentJugadas || []).map((j, i) => (
                  <div key={i} className="border-b border-slate-50 pb-5 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{j.loteria}</p>
                    <p className="font-black text-xl italic text-slate-800 leading-none">#{j.numero} - {j.animal}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="font-black text-lg">{(j.monto * (j.horas?.length || 0)).toFixed(2)} Bs</span>
                       <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 bg-red-50 p-2 rounded-2xl"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t-4 border-double border-slate-900 flex justify-between items-center font-black text-3xl italic mb-10 text-right tracking-tighter">
                <span className="text-sm uppercase opacity-40">TOTAL:</span>
                <span className="underline decoration-emerald-500 decoration-8">{currentJugadas.reduce((a, c) => a + (c.monto * (c.horas?.length || 0)), 0).toFixed(2)} Bs</span>
              </div>
              <Button onClick={() => { if (!userPM || !userBanco || !userCedula) return toast.error("¡Faltan tus datos de pago!"); window.open(msgUrl, '_blank'); }} className={`w-full h-24 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[3.5rem] font-black text-2xl shadow-xl active:scale-95 leading-none ${currentJugadas.length === 0 ? 'opacity-20 pointer-events-none grayscale' : ''}`}><Send size={32} className="mr-3" /> ENVIAR A AGENCIA</Button>
            </div>
          </div>
        </div>
      </div>

      {selectedAgencia?.publicidad_url && (
        <div className="max-w-[1600px] w-full mx-auto mt-24 px-6 pb-20 text-center flex flex-col items-center">
           <p className="text-[11px] font-black text-slate-400 uppercase mb-8 tracking-[0.6em] italic text-center">ESPACIO PUBLICITARIO</p>
           <img src={selectedAgencia.publicidad_url} alt="Publicidad" className="w-full h-auto object-contain max-h-[800px] mx-auto rounded-[5rem] shadow-2xl border-[12px] border-white bg-white" />
        </div>
      )}
    </div>
  );
}
