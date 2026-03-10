import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, Wallet, Landmark, ReceiptText, Plus, CheckCircle2, Info, Star, Instagram, MessageCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const IMG_BASE = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/";

const LOTERIAS = [
  { id: "Lotto Activo", label: "LOTTO ACTIVO", img: `${IMG_BASE}logo-lotto-activo.png` },
  { id: "La Granjita", label: "LA GRANJITA", img: `${IMG_BASE}logo-granjita.png` },
  { id: "Guácharo Activo", label: "GUÁCHARO", img: `${IMG_BASE}logo-guacharo.png` },
  { id: "Guacharito", label: "GUACHARITO", img: `${IMG_BASE}logo-guacharito.png` },
  { id: "Lotto Rey", label: "LOTTO REY", img: `${IMG_BASE}logo-lotto-rey.png` },
  { id: "Selva Plus", label: "SELVA PLUS", img: `${IMG_BASE}logo-selva-plus.png` },
];

const ANIMALS_STANDARD: any = { '0': 'DELFÍN', '00': 'BALLENA', '1': 'CARNERO', '2': 'TORO', '3': 'CIEMPIÉS', '4': 'ALACRÁN', '5': 'LEÓN', '6': 'RANA', '7': 'PERICO', '8': 'RATÓN', '9': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO', '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO', '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA', '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO', '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO', '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA' };
const ANIMALS_GUACHARO: any = { ...ANIMALS_STANDARD, '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO', '42': 'TUCÁN', '43': 'MARIPOSA', '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN', '49': 'PEREZOSO', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL', '54': 'GRILLO', '55': 'OSO HORMIGUERO', '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN', '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN', '65': 'ARAÑA', '66': 'LOBO', '67': 'AVESTRUZ', '68': 'JAGUAR', '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA', '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO' };
const ANIMALS_GUACHARITO: any = { ...ANIMALS_GUACHARO, '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE', '79': 'CALAMAR', '80': 'MURCIÉLAGO', '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO', '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY', '87': 'CABRA', '88': 'ERIZO DE MAR', '89': 'ANGUILA', '90': 'HURÓN', '91': 'MORROCOY', '92': 'CISNE', '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO', '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO', '99': 'GUACHARITO' };
const ANIMAL_EMOJIS: any = { "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛", "4": "🦂", "5": "🦁", "6": "🐸", "7": "🦜", "8": "🐭", "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴", "13": "🐵", "14": "🕊️", "15": "🦊", "16": "🐻", "17": "🦃", "18": "🫏", "19": "🐐", "20": "🐷", "21": "🐓", "22": "🐪", "23": "🦓", "24": "🦎", "25": "🐔", "26": "🐄", "27": "🐕", "28": "🦅", "29": "🐘", "30": "🐊", "31": "🦫", "32": "🐿️", "33": "🐟", "34": "🦌", "35": "🦒", "36": "🐍", "37": "🐢", "38": "🦬", "39": "🦉", "40": "🐝", "41": "🦘", "42": "🦜", "43": "🦋", "44": "🦫", "45": "🦩", "46": "🐆", "47": "🦚", "48": "🦔", "49": "🦥", "50": "🐤", "51": "🦅", "52": "🐙", "53": "🐌", "54": "🦗", "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜", "59": "🐆", "60": "🦎", "61": "🐼", "62": "🦔", "63": "🦀", "64": "🦅", "65": "🕷️", "66": "🐺", "67": "🦃", "68": "🐆", "69": "🐰", "70": "🦬", "71": "🦜", "72": "🦍", "73": "🦛", "74": "🐦", "75": "🦅", "76": "🦅", "77": "🐧", "78": "🦌", "79": "🦑", "80": "🦇", "81": "🐦‍⬛", "82": "🪳", "83": "🦉", "84": "🦐", "85": "🐹", "86": "🐂", "87": "🐐", "88": "🐚", "89": "🐚", "90": "🦦", "91": "🐢", "92": "🦢", "93": "🐦", "94": "🦃", "95": "🐞", "96": "🐠", "97": "🦜", "98": "🐊", "99": "🐣" };

const HORAS_PUNTO = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
const HORAS_MEDIA = ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"];

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState("Lotto Activo");
  const [selectedNum, setSelectedNum] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [monto, setMonto] = useState("10");
  const [loading, setLoading] = useState(true);

  const [userPM, setUserPM] = useState("");
  const [userCedula, setUserCedula] = useState("");
  const [userBanco, setUserBanco] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const { data: ag } = await supabase.from('agencias').select('*').eq('activa', true);
        if (ag) {
          setAgencias(ag);
          console.log("Agencias cargadas:", ag); // DEBUG: Mira esto en la consola F12
        }
        setUserPM(localStorage.getItem('u_pm_tlf') || "");
        setUserCedula(localStorage.getItem('u_pm_cedula') || "");
        setUserBanco(localStorage.getItem('u_pm_banco') || "");
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    init();
  }, []);

  const animalitosAMostrar = useMemo(() => {
    if (selectedLot === "Guacharito") return ANIMALS_GUACHARITO;
    if (selectedLot === "Guácharo Activo") return ANIMALS_GUACHARO;
    return ANIMALS_STANDARD;
  }, [selectedLot]);

  const horasAMostrar = useMemo(() => (selectedLot === "Guacharito" || selectedLot === "Lotto Rey") ? HORAS_MEDIA : HORAS_PUNTO, [selectedLot]);

  const agregarJugada = () => {
    if (!selectedNum || !monto || selectedHours.length === 0) return toast.error("Selecciona animal y sorteos");
    const dic: any = animalitosAMostrar;
    setCurrentJugadas([...currentJugadas, {
      loteria: selectedLot, numero: selectedNum, animal: dic[selectedNum], emoji: ANIMAL_EMOJIS[selectedNum], monto: parseFloat(monto), horas: [...selectedHours]
    }]);
    setSelectedNum(null);
  };

  const getCleanPhone = (rawPhone: any) => {
    if (!rawPhone) return "";
    let tlf = rawPhone.toString().replace(/\D/g, '');
    if (tlf.startsWith('0')) tlf = '58' + tlf.substring(1);
    else if (!tlf.startsWith('58')) tlf = '58' + tlf;
    return tlf;
  };

  const msgUrl = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";
    const tlf = getCleanPhone(selectedAgencia.whatsapp);
    let msg = `SOLICITUD DE JUGADA\n--------------------------\nDATOS DE PAGO:\nBANCO: ${userBanco}\nTLF: ${userPM}\nCI: ${userCedula}\n--------------------------\n\n`;
    currentJugadas.forEach(j => {
      msg += `${j.loteria.toUpperCase()}\nAnimal: ${j.numero} - ${j.animal}\nHoras: ${j.horas.join(", ")}\nBs ${j.monto} x sorteo\n----------\n`;
    });
    msg += `\nTOTAL A PAGAR: ${currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs`;
    return `https://wa.me/${tlf}?text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  const reclamoUrl = useMemo(() => {
    if (!selectedAgencia) return "#";
    const tlf = getCleanPhone(selectedAgencia.whatsapp);
    const msg = `HOLA, NECESITO REALIZAR UN RECLAMO O CONSULTA SOBRE MI TICKET.\n\nMIS DATOS:\nCI: ${userCedula}\nTLF: ${userPM}`;
    return `https://wa.me/${tlf}?text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, userPM, userCedula]);

  if (loading) return <div className="p-20 text-center font-black bg-white">Sincronizando...</div>;

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen text-slate-900 pb-20">
      
      {/* 1. SECTOR AGENCIA */}
      <div className="w-full bg-[#0F172A] p-6 lg:p-8 text-white shadow-2xl rounded-b-[4rem] mb-8">
        <p className="text-[10px] font-black uppercase text-emerald-400 mb-4 text-center tracking-[0.4em] italic">PASO 1: SELECCIONA TU AGENCIA</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {agencias.map(ag => (
            <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`flex items-center gap-3 px-10 py-4 rounded-3xl font-black uppercase text-[12px] transition-all border-2 ${selectedAgencia?.id === ag.id ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg scale-105' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              {selectedAgencia?.id === ag.id && <CheckCircle2 size={20} />} {ag.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-[1fr_450px] gap-8 px-6">
        
        <div className="space-y-8">
          {/* DATOS USUARIO */}
          <Card className="p-8 bg-emerald-600 text-white rounded-[3rem] shadow-2xl border-none">
             <h2 className="text-xl font-black uppercase italic mb-6">¿A dónde enviamos tu pago si ganas?</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Input value={userBanco} onChange={e => {setUserBanco(e.target.value); localStorage.setItem('u_pm_banco', e.target.value)}} placeholder="Banco" className="bg-white/10 border-none text-white h-14 rounded-2xl font-black" />
               <Input value={userPM} onChange={e => {setUserPM(e.target.value); localStorage.setItem('u_pm_tlf', e.target.value)}} placeholder="Teléfono" className="bg-white/10 border-none text-white h-14 rounded-2xl font-black" />
               <Input value={userCedula} onChange={e => {setUserCedula(e.target.value); localStorage.setItem('u_pm_cedula', e.target.value)}} placeholder="Cédula" className="bg-white/10 border-none text-white h-14 rounded-2xl font-black" />
             </div>
          </Card>

          {/* LOTERIAS */}
          <Card className="bg-white p-6 lg:p-10 rounded-[3rem] shadow-xl border-none">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {LOTERIAS.map(lot => (
                <button key={lot.id} onClick={() => { setSelectedLot(lot.id); setSelectedHours([]); setSelectedNum(null); }} className={`flex flex-col items-center gap-3 transition-all ${selectedLot === lot.id ? 'scale-110 opacity-100' : 'opacity-40 grayscale-0'}`}>
                  <div className={`w-20 h-20 lg:w-28 lg:h-28 rounded-full border-4 ${selectedLot === lot.id ? 'border-emerald-500 shadow-2xl' : 'border-slate-800'} overflow-hidden bg-black p-1.5 flex items-center justify-center`}>
                    <img src={lot.img} alt={lot.id} className="w-full h-full object-contain" style={{ filter: 'none' }} crossOrigin="anonymous" onError={(e: any) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/126/126501.png"; }} />
                  </div>
                  <span className={`text-[10px] font-black uppercase ${selectedLot === lot.id ? 'text-emerald-600' : 'text-slate-500'}`}>{lot.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* GRILLA ANIMALITOS */}
          <Card className="p-6 lg:p-10 bg-white rounded-[3rem] shadow-2xl border-none">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-9 gap-3">
              {Object.keys(animalitosAMostrar).map(n => (
                <button key={n} onClick={() => setSelectedNum(n)} className={`flex flex-col items-center justify-center p-3 rounded-3xl border-2 transition-all h-28 lg:h-32 ${selectedNum === n ? 'border-emerald-500 bg-emerald-50 shadow-inner scale-110' : 'bg-[#F8FAFC] border-transparent text-slate-600'}`}>
                  <span className="text-3xl lg:text-4xl mb-2">{ANIMAL_EMOJIS[n] || '🎟️'}</span>
                  <span className="text-[16px] lg:text-[18px] font-black text-slate-900 leading-none">{n}</span>
                  <span className="text-[9px] lg:text-[10px] font-bold uppercase truncate w-full text-center mt-2 text-slate-500">{(animalitosAMostrar as any)[n]}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* HORARIOS */}
          <Card className="p-8 bg-white rounded-[3rem] shadow-2xl border-none">
            <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {horasAMostrar.map(h => (
                <button key={h} onClick={() => setSelectedHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])} className={`h-14 lg:h-16 rounded-2xl text-[12px] lg:text-[14px] font-black border-2 transition-all ${selectedHours.includes(h) ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xl' : 'bg-[#F1F5F9] border-transparent text-slate-500'}`}>{h}</button>
              ))}
            </div>
          </Card>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-8">
          <div className="lg:sticky lg:top-32 space-y-8">
            
            {/* BOTONES DE CONTACTO (INSTAGRAM Y RECLAMOS) */}
            {selectedAgencia && (
              <Card className="p-6 bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 flex flex-col gap-4">
                 <p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest italic">SOPORTE Y REDES</p>
                 <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => selectedAgencia.instagram_url ? window.open(selectedAgencia.instagram_url, '_blank') : toast.info("No hay Instagram registrado")}
                      className="h-16 rounded-2xl font-black text-xs uppercase bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white shadow-lg"
                    >
                      <Instagram size={20} className="mr-2"/> Instagram
                    </Button>
                    <Button 
                      onClick={() => window.open(reclamoUrl, '_blank')}
                      className="h-16 rounded-2xl font-black text-xs uppercase bg-amber-500 text-white shadow-lg"
                    >
                      <MessageCircle size={20} className="mr-2"/> Reclamos
                    </Button>
                 </div>
              </Card>
            )}

            <Card className="p-10 bg-white rounded-[4rem] shadow-2xl border-none text-center">
              <label className="text-[12px] font-black uppercase opacity-40 italic tracking-widest">Monto por Sorteo (Bs)</label>
              <Input type="number" value={monto} onChange={e => setMonto(e.target.value)} className="h-24 text-center text-7xl font-black bg-slate-50 border-none rounded-[3rem] text-slate-900 shadow-inner" />
              <Button onClick={agregarJugada} className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-[2.5rem] text-xl shadow-xl mt-6">
                <Plus size={32} className="mr-3" /> AÑADIR JUGADA
              </Button>
            </Card>

            <div className="bg-white p-8 lg:p-12 font-mono shadow-2xl rounded-[3.5rem] border-t-[18px] border-emerald-600 flex flex-col text-slate-900">
              <h4 className="text-center font-black uppercase text-xl italic border-b pb-4 mb-8">TICKET VIRTUAL</h4>
              <div className="flex-1 space-y-5 overflow-y-auto max-h-[350px] no-scrollbar">
                {currentJugadas.map((j, i) => (
                  <div key={i} className="border-b pb-5 flex justify-between items-start text-left">
                    <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{j.loteria}</p>
                      <p className="font-black text-xl italic text-slate-800">#{j.numero} - {j.animal}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{j.horas.join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-xl">{(j.monto * j.horas.length).toFixed(2)} Bs</span>
                      <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 bg-red-50 p-3 rounded-2xl hover:bg-red-100"><Trash2 size={20}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t-4 border-double border-slate-900 flex justify-between items-end font-black text-4xl italic tracking-tighter mb-10">
                <span className="text-sm uppercase opacity-40">Total:</span>
                <span className="underline decoration-emerald-500 decoration-8">{currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs</span>
              </div>
              <Button 
                onClick={() => {
                   if (!userPM || !userBanco || !userCedula) return toast.error("¡Faltan tus datos de pago arriba!");
                   window.open(msgUrl, '_blank');
                }}
                className={`w-full h-24 bg-emerald-600 text-white rounded-[3rem] font-black text-2xl shadow-xl active:scale-95 ${currentJugadas.length === 0 ? 'opacity-20 pointer-events-none' : ''}`}
              >
                <Send size={32} className="mr-3" /> ENVIAR A AGENCIA
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PUBLICIDAD FINAL */}
      {selectedAgencia?.publicidad_url && (
        <div className="max-w-[1600px] mx-auto mt-20 px-6">
           <p className="text-[10px] font-black text-slate-400 uppercase text-center mb-6 tracking-[0.5em] italic">ESPACIO PUBLICITARIO</p>
           <div className="rounded-[4rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.2)] border-8 border-white bg-white">
              <img 
                src={selectedAgencia.publicidad_url} 
                alt="Publicidad" 
                className="w-full h-auto object-contain max-h-[700px] mx-auto"
                onLoad={() => console.log("Imagen cargada con éxito")}
                onError={(e: any) => {
                    console.log("Error cargando publicidad:", selectedAgencia.publicidad_url);
                    e.target.style.display = 'none';
                }}
              />
           </div>
        </div>
      )}

    </div>
  );
}
