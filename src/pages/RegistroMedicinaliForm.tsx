
import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { it, enUS, ro } from "date-fns/locale";
import { CalendarIcon, Clock, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

const RegistroMedicinaliForm = () => {
  const { t, i18n } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [orario, setOrario] = useState("");
  const [nomeMedicinale, setNomeMedicinale] = useState("");
  const [pressione, setPressione] = useState("");
  const [glicemia, setGlicemia] = useState("");
  const [inserimenti, setInserimenti] = useState<InserimentoMedicinale[]>([]);
  const [parametriVitali, setParametriVitali] = useState<ParametriVitali[]>([]);

  const getLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'ro': return ro;
      default: return it;
    }
  };

  // Carica inserimenti dal localStorage al caricamento
  useEffect(() => {
    const saved = localStorage.getItem("inserimentiMedicinali");
    if (saved) {
      try {
        setInserimenti(JSON.parse(saved));
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
      }
    }
  }, []);

  // Salva inserimenti nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem("inserimentiMedicinali", JSON.stringify(inserimenti));
  }, [inserimenti]);

  // Carica parametri vitali dal localStorage
  useEffect(() => {
    const savedParametri = localStorage.getItem("parametriVitali");
    if (savedParametri) {
      try {
        setParametriVitali(JSON.parse(savedParametri));
      } catch (error) {
        console.error("Errore nel caricamento parametri vitali:", error);
      }
    }
  }, []);

  // Salva parametri vitali nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem("parametriVitali", JSON.stringify(parametriVitali));
  }, [parametriVitali]);

  const aggiungiInserimento = () => {
    if (!nomeMedicinale.trim() || !date || !orario) {
      toast({
        variant: "destructive",
        title: t('errors.missingFields'),
        description: t('errors.completeFields'),
      });
      return;
    }

    const nuovoInserimento: InserimentoMedicinale = {
      id: Date.now(),
      nomeMedicinale: nomeMedicinale.trim(),
      data: format(date, "yyyy-MM-dd"),
      orario: orario,
      timestamp: Date.now()
    };

    setInserimenti(prev => [...prev, nuovoInserimento]);
    // Non pulire il nome del medicinale per facilitare inserimenti multipli
    setOrario("");
    
    toast({
      title: t('notifications.entrySaved'),
      description: t('notifications.entrySavedDesc', { 
        name: nomeMedicinale, 
        date: format(date, "dd/MM/yyyy", { locale: getLocale() }), 
        time: orario 
      }),
    });
  };

  const rimuoviInserimento = (id: number) => {
    setInserimenti(prev => prev.filter(item => item.id !== id));
    toast({
      title: t('notifications.entryRemoved'),
      description: t('notifications.entryRemovedDesc'),
    });
  };

  const salvaGiornata = () => {
    if (!date) return;
    
    const dataString = format(date, "yyyy-MM-dd");
    
    // Salva o aggiorna i parametri vitali per questa data
    if (pressione || glicemia) {
      setParametriVitali(prev => {
        const existing = prev.filter(p => p.data !== dataString);
        return [...existing, {
          data: dataString,
          pressione: pressione.trim(),
          glicemia: glicemia.trim()
        }];
      });
    }
    
    toast({
      title: t('registry.daySaved'),
      description: t('registry.daySavedDesc', {
        date: format(date, "dd/MM/yyyy", { locale: getLocale() }),
        count: inserimentiOggi.length,
        pressure: pressione || "-",
        glucose: glicemia || "-"
      }),
    });
  };

  const pulisciCampi = () => {
    setNomeMedicinale("");
    setOrario("");
  };

  // Filtra inserimenti per la data selezionata
  const inserimentiOggi = inserimenti.filter(i => 
    i.data === (date ? format(date, "yyyy-MM-dd") : "")
  ).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div
      className={cn(
        "w-full max-w-xl mx-auto bg-gradient-to-br from-card via-accent/5 to-info/5 p-6 rounded-2xl shadow-2xl border border-border",
        "sm:p-8",
        "md:max-w-lg",
        "flex flex-col gap-5",
      )}
      style={{ boxSizing: "border-box" }}
    >
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
        {t('registry.title')}
      </h2>

      {/* Selezione Data */}
      <div>
        <label className="block mb-2 text-base sm:text-sm font-medium text-cyan-800">
          {t('registry.selectDate')}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-medium mb-4 bg-white/60 shadow-md hover:bg-blue-50/60 hover:shadow-lg text-base rounded-lg h-12 sm:h-10 px-4",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-5 w-5 text-cyan-600" />
              {date ? format(date, "PPP", { locale: getLocale() }) : <span>{t('registry.chooseDate')}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className={cn("p-3 pointer-events-auto")}
              initialFocus
              locale={getLocale()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Inserimento Medicinale */}
      <div className="bg-gradient-to-br from-card to-accent/5 p-5 rounded-xl shadow-lg border border-border">
        <h3 className="font-bold text-accent text-lg mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {t('medicine.addNew')}
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {t('medicine.name')}
            </label>
            <Input
              type="text"
              placeholder={t('medicine.namePlaceholder')}
              value={nomeMedicinale}
              onChange={(e) => setNomeMedicinale(e.target.value)}
              className="bg-white/70"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {t('medicine.intakeTime')}
            </label>
            <div className="relative">
              <Input
                type="time"
                value={orario}
                onChange={(e) => setOrario(e.target.value)}
                className="bg-white/70 pl-10"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={aggiungiInserimento}
              className="flex-1 bg-gradient-to-r from-success to-accent hover:from-success/90 hover:to-accent/90 text-success-foreground shadow-lg font-semibold"
            >
              {t('common.add')}
            </Button>
            <Button
              onClick={pulisciCampi}
              variant="outline"
              className="bg-card border-2 shadow-md font-semibold"
            >
              {t('common.clear')}
            </Button>
          </div>
          
          <div className="text-xs text-blue-600 bg-blue-50/80 p-2 rounded">
            {t('medicine.tipMultiple')}
          </div>
        </div>
      </div>

      {/* Lista Inserimenti del Giorno */}
      {inserimentiOggi.length > 0 && (
        <div className="bg-white/50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-700 mb-3">
            {t('medicine.todayEntries')} ({inserimentiOggi.length})
          </h3>
          <div className="space-y-2">
            {inserimentiOggi.map((inserimento) => (
              <div
                key={inserimento.id}
                className="flex justify-between items-center bg-white/80 p-3 rounded-lg shadow-sm"
              >
                <div>
                  <div className="font-medium text-gray-800">
                    {inserimento.nomeMedicinale}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('common.time')} {inserimento.orario}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => rimuoviInserimento(inserimento.id)}
                >
                  {t('common.remove')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parametri Vitali */}
      <div className="space-y-3">
        <div>
          <label className="block text-base sm:text-sm font-medium mb-1 text-blue-900">
            {t('vitals.pressure')}
          </label>
          <Input
            type="text"
            placeholder={t('vitals.pressurePlaceholder')}
            value={pressione}
            onChange={(e) => setPressione(e.target.value)}
            className="bg-blue-50/50 focus:bg-white/90"
          />
        </div>
        
        <div>
          <label className="block text-base sm:text-sm font-medium mb-1 text-green-900">
            {t('vitals.glucose')}
          </label>
          <Input
            type="number"
            placeholder={t('vitals.glucosePlaceholder')}
            value={glicemia}
            onChange={(e) => setGlicemia(e.target.value)}
            className="bg-green-50/50 focus:bg-white/90"
          />
        </div>
      </div>

      <Button
        className="w-full text-lg sm:text-base py-4 rounded-xl font-bold shadow-xl bg-gradient-to-r from-primary via-info to-accent text-primary-foreground hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
        onClick={salvaGiornata}
      >
        {t('registry.saveDay')}
      </Button>
      
      <Toaster />
    </div>
  );
};

export default RegistroMedicinaliForm;
