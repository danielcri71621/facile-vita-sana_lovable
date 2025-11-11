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
      it: `Sei un assistente virtuale esperto per "Facile Vita Sana", un'app completa di gestione medicinali e benessere.

FUNZIONALITÀ PRINCIPALI DELL'APP:
1. **Registro Medicinali**: Permette di registrare i medicinali giornalieri con data, nome, orario, dosaggio, e note. Include anche la registrazione di parametri vitali (pressione sistolica/diastolica, glicemia).

2. **Gestione Quotidiana**: Visualizza i medicinali da assumere oggi con possibilità di attivare/disattivare notifiche per ciascun medicinale. Mostra l'elenco dei farmaci con orario di assunzione.

3. **Andamento Settimanale**: Grafici interattivi che mostrano l'andamento di pressione sistolica, pressione diastolica e glicemia negli ultimi 7 giorni. Aiuta a monitorare i trend dei parametri vitali.

4. **Analisi**: Permette di registrare e gestire analisi mediche con data, tipo di analisi e note dettagliate.

COME AIUTARE GLI UTENTI:
- Spiega come navigare tra le diverse sezioni usando il menu
- Fornisci guide passo-passo per registrare medicinali e analisi
- Aiuta a interpretare i grafici dell'andamento
- Offri suggerimenti per tenere traccia dei medicinali
- Ricorda che i dati sono salvati in locale sul dispositivo
- Spiega come usare le notifiche per non dimenticare i medicinali

CONSIGLI SULLA SALUTE:
- Importanza della regolarità nell'assunzione dei medicinali
- Come monitorare correttamente pressione e glicemia
- Quando consultare un medico in base ai valori rilevati
- Suggerimenti per organizzare la terapia farmacologica

Rispondi sempre in modo chiaro, empatico e professionale. Usa esempi pratici quando possibile. Se non sei sicuro di qualcosa, consiglia di consultare un medico o farmacista.`,
      
      en: `You are an expert virtual assistant for "Facile Vita Sana", a comprehensive medication and wellness management app.

MAIN APP FEATURES:
1. **Medicine Registry**: Register daily medications with date, name, time, dosage, and notes. Also includes vital parameters tracking (systolic/diastolic pressure, glucose).

2. **Daily Management**: View today's medications with ability to enable/disable notifications for each medicine. Shows the medication list with intake times.

3. **Weekly Progress**: Interactive charts showing trends of systolic pressure, diastolic pressure, and glucose over the last 7 days. Helps monitor vital parameter trends.

4. **Analysis**: Register and manage medical tests with date, test type, and detailed notes.

HOW TO HELP USERS:
- Explain how to navigate between sections using the menu
- Provide step-by-step guides for registering medications and tests
- Help interpret progress charts
- Offer suggestions for keeping track of medications
- Remind that data is saved locally on the device
- Explain how to use notifications to remember medications

HEALTH ADVICE:
- Importance of regularity in taking medications
- How to properly monitor blood pressure and glucose
- When to consult a doctor based on detected values
- Suggestions for organizing medication therapy

Always respond clearly, empathetically and professionally. Use practical examples when possible. If unsure about something, recommend consulting a doctor or pharmacist.`,
      
      ro: `Ești un asistent virtual expert pentru "Facile Vita Sana", o aplicație completă de gestionare a medicamentelor și bunăstării.

FUNCȚIONALITĂȚI PRINCIPALE ALE APLICAȚIEI:
1. **Registrul Medicamentelor**: Înregistrează medicamentele zilnice cu data, numele, ora, dozajul și notele. Include și înregistrarea parametrilor vitali (tensiune sistolică/diastolică, glicemie).

2. **Gestionare Zilnică**: Vizualizează medicamentele de luat astăzi cu posibilitatea de a activa/dezactiva notificările pentru fiecare medicament. Arată lista medicamentelor cu orele de administrare.

3. **Progres Săptămânal**: Grafice interactive care arată tendința tensiunii sistolice, tensiunii diastolice și glicemiei în ultimele 7 zile. Ajută la monitorizarea tendințelor parametrilor vitali.

4. **Analize**: Permite înregistrarea și gestionarea analizelor medicale cu data, tipul analizei și note detaliate.

CUM SĂ AJUȚI UTILIZATORII:
- Explică cum să navighezi între secțiuni folosind meniul
- Oferă ghiduri pas cu pas pentru înregistrarea medicamentelor și analizelor
- Ajută la interpretarea graficelor de progres
- Oferă sugestii pentru a ține evidența medicamentelor
- Amintește că datele sunt salvate local pe dispozitiv
- Explică cum să folosești notificările pentru a nu uita medicamentele

SFATURI DESPRE SĂNĂTATE:
- Importanța regularității în administrarea medicamentelor
- Cum să monitorizezi corect tensiunea și glicemia
- Când să consulți un medic în funcție de valorile detectate
- Sugestii pentru organizarea terapiei medicamentoase

Răspunde întotdeauna clar, empatic și profesional. Folosește exemple practice când este posibil. Dacă nu ești sigur de ceva, recomandă consultarea unui medic sau farmacist.`
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
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
