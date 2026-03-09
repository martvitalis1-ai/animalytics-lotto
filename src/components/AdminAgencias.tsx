import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
    if (data) setAgencias(data);
  };

  useEffect(() => { fetchAgencias(); }, []);

  const handleUploadLogo = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('logos_agencias').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('logos_agencias').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!nombre || !whatsapp) return toast.error("Completa los datos");
    setLoading(true);
    try {
      let url = null;
      if (file) url = await handleUploadLogo(file);
      
      const { error } = await supabase.from('agencias').insert({
        nombre,
        whatsapp,
        logo_url: url
      });

      if (error) throw error;
      toast.success("Agencia agregada");
      setNombre(""); setWhatsapp(""); setFile(null);
      fetchAgencias();
    } catch (e) {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const deleteAgencia = async (id: string) => {
    await supabase.from('agencias').delete().eq('id', id);
    fetchAgencias();
    toast.success("Agencia eliminada");
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader><CardTitle>Gestionar Agencias</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Nombre de la Agencia" value={nombre} onChange={e => setNombre(e.target.value)} />
            <Input placeholder="WhatsApp (Ej: 58412...)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="cursor-pointer" />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />} Agregar Agencia
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agencias.map(ag => (
          <div key={ag.id} className="p-4 bg-card border rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              {ag.logo_url && <img src={ag.logo_url} className="w-12 h-12 rounded-lg object-cover" />}
              <div>
                <p className="font-bold">{ag.nombre}</p>
                <p className="text-xs text-muted-foreground">{ag.whatsapp}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteAgencia(ag.id)}>
              <Trash2 className="text-destructive w-5 h-5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
