import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LoginAgencia = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await supabase.from('agencias').select('*').eq('llave_agencia', code.toUpperCase().trim()).maybeSingle();
      if (data) {
        localStorage.setItem('session_access_code', data.llave_agencia);
        localStorage.setItem('agency_owner_id', data.id);
        toast.success(`BIENVENIDO DUEÑO DE ${data.nombre.toUpperCase()}`);
        window.location.href = "/";
      } else { toast.error("LLAVE DE AGENCIA INVÁLIDA"); }
    } catch (err) { toast.error("ERROR DE CONEXIÓN"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-slate-900 border-none rounded-[3rem] shadow-2xl text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck className="text-emerald-500 w-10 h-10" /></div>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2 text-center">Acceso de Bancas</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Llave de Dueño" className="h-16 bg-white/5 border-none text-white text-center text-xl font-black rounded-2xl" />
          <Button disabled={loading} className="w-full h-16 bg-emerald-600 text-white font-black uppercase rounded-2xl text-lg">{loading ? <Loader2 className="animate-spin" /> : "ENTRAR A MI BANCA"}</Button>
        </form>
      </Card>
    </div>
  );
};
export default LoginAgencia;
