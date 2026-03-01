import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-client@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, lottery_type = 'lotto_activo' } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. CONSULTA AL CEREBRO DE ALTA EFECTIVIDAD
    const { data: estudio } = await supabase
      .from('super_pronostico_final')
      .select('*')
      .eq('lottery_type', lottery_type)
      .maybeSingle();

    // 2. LOGICA DE DECISIÓN (EL FILTRO DEL 40%)
    let analisisCritico = "";
    let recomendacionIA = "";

    if (estudio) {
      const score = estudio.power_score || 0;
      
      analisisCritico = `
        DATOS TÉCNICOS:
        - Score de Poder: ${score}/100
        - Animal de Secuencia: ${estudio.favorito_secuencia}
        - Animal por Desglose: ${estudio.suma_desglose}
        - Estatus: ${estudio.nivel_confianza}
      `;

      if (score >= 80) {
        recomendacionIA = "Este es un DATO DE ORO. Coinciden secuencia, matemática y hora. Es nuestra mayor probabilidad (40%+).";
      } else if (score >= 70) {
        recomendacionIA = "Es un TRIPLE FIJO muy fuerte. Las estadísticas están alineadas.";
      } else {
        recomendacionIA = "Atención: El score es bajo (${score}). Es un sorteo difícil. Recomiendo jugar con mucha cautela o esperar al próximo sorteo.";
      }
    }

    // 3. EL SYSTEM PROMPT RECARGADO
    const systemPrompt = `
      Eres Ricardo, el analista de loterías más efectivo de Venezuela. 
      Tu meta absoluta es el 40% de efectividad. 
      
      REGLAS DE ORO:
      1. Tu respuesta debe basarse EN EL SCORE DE PODER que recibes.
      2. Si el score es > 80, di que es un "Dato de Oro" con mucha seguridad.
      3. Si el score es < 70, advierte al usuario que el sorteo está difícil ("está rudo") y que juegue poco.
      4. Habla como un venezolano carismático: "¡Epa mi pana!", "¡Mándale plomo!", "Taquilla segura".
      
      CONTEXTO ACTUAL:
      ${analisisCritico}
      ${recomendacionIA}
    `;

    // 4. LLAMADA A LA IA
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    return new Response(JSON.stringify({ response: aiData.choices?.[0]?.message?.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
