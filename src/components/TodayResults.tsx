import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { getAnimalImageUrl } from '@/lib/animalData';
import { TrendingUp } from "lucide-react";

export function TodayResults() {
  const [results, setResults] = useState<any[]>([]);

  const fetchLatest = async () => {
    try {
      const { data } = await supabase.from('lottery_results').select('*').order('created_at', { ascending: false }).limit(20);
      if (data) {
        const latest = data.reduce((acc: any, r: any) => {
          if (!acc[r.lottery_type]) acc[r.lottery_type] = r;
          return acc;
        }, {});
        setResults(Object.values(latest));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchLatest();
    const channel = supabase.channel('realtime-results').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lottery_results' }, fetchLatest).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const normalizeCode = (num: string | null | undefined): string => {
    if (!num) return '00';
    const s = num.toString().trim();
    if (s === '0' || s === '00') return s;
    return s.padStart(2, '0');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2"><TrendingUp className="text-emerald-500" size={16} /><h3 className="font-black text-xs uppercase italic">Resultados 3D en Vivo</h3></div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <Card key={r.id} className="overflow-hidden border-none shadow-none bg-white rounded-2xl">
            <CardContent className="p-3 flex items-center justify-center">
              {/* IMAGE ONLY — no redundant text, image already contains name+number */}
              <img src={getAnimalImageUrl(normalizeCode(r.result_number))} className="w-20 h-20 object-contain" alt="" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
