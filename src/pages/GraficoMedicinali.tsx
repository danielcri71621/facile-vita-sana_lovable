import * as React from "react";
import { useState, useEffect } from "react";
import { format, subDays, parseISO } from "date-fns";
import { it, enUS, ro } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartBar } from "lucide-react";

interface InserimentoMedicinale {
  id: number;
  nomeMedicinale: string;
  data: string;
  orario: string;
  timestamp: number;
}

interface ParametriVitali {
  data: string;
  pressione: string;
  glicemia: string;
}

const chartConfig = {
  pressione: {
    label: "Pressione",
  },
  glicemia: {
    label: "Glicemia",
  },
};

const GraficoMedicinali = () => {
  const { t, i18n } = useTranslation();
  const [datiGrafico, setDatiGrafico] = useState<any[]>([]);

  const getLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'ro': return ro;
      default: return it;
    }
  };

  useEffect(() => {
    // Carica i dati dal localStorage
    const inserimentiSalvati = localStorage.getItem("inserimentiMedicinali");
    const parametriSalvati = localStorage.getItem("parametriVitali");
    
    let inserimenti: InserimentoMedicinale[] = [];
    let parametri: ParametriVitali[] = [];
    
    if (inserimentiSalvati) {
      try {
        inserimenti = JSON.parse(inserimentiSalvati);
      } catch (error) {
        console.error("Errore nel caricamento inserimenti:", error);
      }
    }
    
    if (parametriSalvati) {
      try {
        parametri = JSON.parse(parametriSalvati);
      } catch (error) {
        console.error("Errore nel caricamento parametri:", error);
      }
    }

    // Genera i dati per gli ultimi 7 giorni
    const oggi = new Date();
    const datiUltimi7Giorni = [];
    
    for (let i = 6; i >= 0; i--) {
      const data = subDays(oggi, i);
      const dataString = format(data, "yyyy-MM-dd");
      const giornoCorto = format(data, "EEE", { locale: getLocale() });
      
      // Trova i parametri per questa data
      const parametriGiorno = parametri.find(p => p.data === dataString);
      
      // Conta i medicinali presi in questa data
      const numMedicinali = inserimenti.filter(i => i.data === dataString).length;
      
      // Estrai valori numerici dalla pressione (es: "120/80" -> 120)
      let pressioneSistolica = null;
      if (parametriGiorno?.pressione) {
        const match = parametriGiorno.pressione.match(/(\d+)/);
        if (match) {
          pressioneSistolica = parseInt(match[1]);
        }
      }
      
      // Estrai valore numerico dalla glicemia
      let glicemiaValore = null;
      if (parametriGiorno?.glicemia) {
        glicemiaValore = parseInt(parametriGiorno.glicemia);
      }
      
      datiUltimi7Giorni.push({
        giorno: giornoCorto,
        pressione: pressioneSistolica,
        glicemia: glicemiaValore,
        medicinali: numMedicinali,
        data: dataString
      });
    }
    
    setDatiGrafico(datiUltimi7Giorni);
  }, []);

  const hasData = datiGrafico.some(d => d.pressione !== null || d.glicemia !== null);

  if (!hasData) {
    return (
      <div className="h-[250px] w-full">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ChartBar className="h-5 w-5" /> {t('chart.weeklyProgress')}
        </h2>
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <ChartBar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-base font-medium">{t('chart.noData')}</p>
            <p className="text-xs">{t('chart.noDataDesc')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ChartBar className="h-5 w-5" /> {t('chart.weeklyProgress')}
      </h2>
      <ChartContainer config={chartConfig} className="h-[80%]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datiGrafico} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="giorno" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
            <YAxis style={{ fontSize: '10px' }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="pressione" 
              stroke="#2563eb" 
              name={t('chart.pressure')}
              connectNulls={false}
              dot={{ fill: "#2563eb", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="glicemia" 
              stroke="#16a34a" 
              name={t('chart.glucose')}
              connectNulls={false}
              dot={{ fill: "#16a34a", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="text-xs text-muted-foreground mt-3 text-center">
        {t('chart.description')}
      </div>
    </div>
  );
};

export default GraficoMedicinali;