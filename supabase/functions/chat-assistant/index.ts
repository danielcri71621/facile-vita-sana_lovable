import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'it' } = await req.json();
    console.log('Received message:', message, 'Language:', language);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error("AI key not configured");
    }

    const systemPrompts: Record<string, string> = {
      it: `Sei un assistente virtuale per un'app di gestione medicinali. Aiuti gli utenti con:
- Come registrare i medicinali
- Come vedere l'andamento settimanale
- Come usare le varie funzionalità dell'app
- Consigli generali sulla gestione dei medicinali

Rispondi in modo chiaro, conciso e amichevole. Mantieni le risposte brevi e pratiche.`,
      en: `You are a virtual assistant for a medication management app. You help users with:
- How to register medications
- How to view weekly progress
- How to use various app features
- General medication management tips

Respond clearly, concisely and in a friendly manner. Keep answers short and practical.`,
      ro: `Ești un asistent virtual pentru o aplicație de gestionare a medicamentelor. Ajuți utilizatorii cu:
- Cum să înregistreze medicamentele
- Cum să vadă progresul săptămânal
- Cum să utilizeze diverse funcționalități ale aplicației
- Sfaturi generale despre gestionarea medicamentelor

Răspunde clar, concis și prietenos. Păstrează răspunsurile scurte și practice.`
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompts[language] || systemPrompts.it },
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits depleted. Please contact support." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Mi dispiace, non ho potuto elaborare la tua richiesta.";

    console.log('AI response:', reply);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat-assistant function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
