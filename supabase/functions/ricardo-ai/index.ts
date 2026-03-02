import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, lottery_type = 'lotto_activo', conversationHistory = [], memoryContext = '' } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. CONSULTA DIRECTA a lottery_results - últimos 200 resultados
    const { data: recentResults } = await supabase
      .from('lottery_results')
      .select('*')
      .order('draw_date', { ascending: false })
      .order('draw_time', { ascending: false })
      .limit(200);

    // 2. Dato Ricardo predictions for today
    const today = new Date().toISOString().split('T')[0];
    const { data: ricardoPreds } = await supabase
      .from('dato_ricardo_predictions')
      .select('*')
      .eq('prediction_date', today);

    // 3. Admin picks for today
    const { data: adminPicks } = await supabase
      .from('admin_picks')
      .select('*')
      .eq('pick_date', today);

    // 4. Bot memory context
    const { data: botMemories } = await supabase
      .from('bot_memory')
      .select('content')
      .eq('is_active', true)
      .limit(20);

    // Build frequency analysis from results
    let frequencyAnalysis = "";
    if (recentResults && recentResults.length > 0) {
      const freqMap: Record<string, number> = {};
      const lotteryResults = recentResults.filter(r => r.lottery_type === lottery_type);
      
      lotteryResults.forEach(r => {
        freqMap[r.result_number] = (freqMap[r.result_number] || 0) + 1;
      });

      const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
      const top5 = sorted.slice(0, 5);
      const cold5 = sorted.slice(-5).reverse();
      
      const lastResults = lotteryResults.slice(0, 10);

      frequencyAnalysis = `
DATOS REALES DE LA BASE DE DATOS (${lotteryResults.length} resultados de ${lottery_type}):
- Top 5 más frecuentes: ${top5.map(([n, c]) => `${n}(${c}x)`).join(', ')}
- Top 5 más fríos: ${cold5.map(([n, c]) => `${n}(${c}x)`).join(', ')}
- Últimos 10 resultados: ${lastResults.map(r => `${r.result_number}(${r.draw_time})`).join(', ')}
- Total registros en BD: ${recentResults.length}
`;
    }

    // Admin picks context
    let adminPicksContext = "";
    if (adminPicks && adminPicks.length > 0) {
      adminPicksContext = `\nDATOS EXPLOSIVOS DEL ADMIN HOY: ${adminPicks.map(p => `${p.animal_code}-${p.animal_name}(${p.pick_type})`).join(', ')}`;
    }

    // Ricardo predictions context
    let ricardoContext = "";
    if (ricardoPreds && ricardoPreds.length > 0) {
      ricardoContext = `\nDATOS RICARDO HOY: ${ricardoPreds.map(p => `${p.lottery_type} ${p.draw_time}: ${p.predicted_numbers.join(',')}`).join(' | ')}`;
    }

    // Memory context
    const memoryStr = botMemories?.map(m => m.content).join('\n') || '';

    const systemPrompt = `
Eres Ricardo, el analista de loterías más efectivo de Venezuela. 
Tu meta absoluta es dar análisis basado en datos reales.

REGLAS DE ORO:
1. SIEMPRE basa tus respuestas en los datos reales que recibes.
2. Habla como un venezolano carismático: "¡Epa mi pana!", "¡Mándale plomo!", "Taquilla segura".
3. NUNCA expliques fórmulas ni cálculos internos.
4. Sé breve y ejecutivo. No divagues.
5. 0=Delfín, 00=Ballena, 99=Guacharito.

${frequencyAnalysis}
${adminPicksContext}
${ricardoContext}

MEMORIA ADMINISTRATIVA:
${memoryStr}
${memoryContext}
`;

    // Build messages array
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-6),
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    return new Response(JSON.stringify({ response: aiData.choices?.[0]?.message?.content || "¡Epa! No pude procesar eso, intenta de nuevo." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: corsHeaders });
  }
});
