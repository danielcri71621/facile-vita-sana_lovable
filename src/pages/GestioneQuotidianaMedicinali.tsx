
import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Bell, BellRing, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface StatoMedicinale {
  id: number;
  stato: "preso" | "non preso" | "in attesa";
  timestampStato: number;
}

const GestioneQuotidianaMedicinali = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [inserimenti, setInserimenti] = useState<InserimentoMedicinale[]>([]);
  const [statiMedicinali, setStatiMedicinali] = useState<Record<number, StatoMedicinale>>({});
  const [notificheAbilitate, setNotificheAbilitate] = useState(true);

  // Carica inserimenti dal localStorage
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

  // Carica stati medicinali dal localStorage
  useEffect(() => {
    const savedStati = localStorage.getItem("statiMedicinali");
    if (savedStati) {
      try {
        setStatiMedicinali(JSON.parse(savedStati));
      } catch (error) {
        console.error("Errore nel caricamento stati:", error);
      }
    }
  }, []);

  // Salva stati medicinali nel localStorage
  useEffect(() => {
    localStorage.setItem("statiMedicinali", JSON.stringify(statiMedicinali));
  }, [statiMedicinali]);

  // Controllo orari e notifiche
  useEffect(() => {
    if (!notificheAbilitate) return;

    const checkOrari = () => {
      const now = new Date();
      const currentTime = format(now, "HH:mm");
      const currentDate = format(now, "yyyy-MM-dd");

      inserimentiOggi.forEach((inserimento) => {
        const stato = statiMedicinali[inserimento.id];
        
        // Se non è ancora stato preso e l'orario è passato
        if ((!stato || stato.stato === "in attesa") && inserimento.orario <= currentTime) {
          // Suona notifica
          playNotificationSound();
          
          toast({
            title: "Promemoria Medicinale",
            description: `È ora di prendere: ${inserimento.nomeMedicinale}`,
            variant: "default",
          });

          // Aggiorna stato se non esiste
          if (!stato) {
            setStatiMedicinali(prev => ({
              ...prev,
              [inserimento.id]: {
                id: inserimento.id,
                stato: "in attesa",
                timestampStato: Date.now()
              }
            }));
          }
        }
      });
    };

    const interval = setInterval(checkOrari, 60000); // Controlla ogni minuto
    checkOrari(); // Controlla subito

    return () => clearInterval(interval);
  }, [inserimenti, statiMedicinali, notificheAbilitate, date]);

  const playNotificationSound = () => {
    // Crea un suono di notifica semplice
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const cambiaStato = (id: number, nuovoStato: "preso" | "non preso") => {
    setStatiMedicinali(prev => ({
      ...prev,
      [id]: {
        id,
        stato: nuovoStato,
        timestampStato: Date.now()
      }
    }));

    const inserimento = inserimenti.find(i => i.id === id);
    if (inserimento) {
      toast({
        title: nuovoStato === "preso" ? "Medicinale preso!" : "Medicinale non preso",
        description: `${inserimento.nomeMedicinale} - ${nuovoStato}`,
        variant: nuovoStato === "preso" ? "default" : "destructive",
      });
    }
  };

  // Filtra inserimenti per la data selezionata
  const inserimentiOggi = inserimenti.filter(i => 
    i.data === (date ? format(date, "yyyy-MM-dd") : "")
  ).sort((a, b) => a.orario.localeCompare(b.orario));

  const getStatoColore = (stato: "preso" | "non preso" | "in attesa" | undefined) => {
    switch (stato) {
      case "preso": return "bg-green-100 border-green-300";
      case "non preso": return "bg-red-100 border-red-300";
      case "in attesa": return "bg-yellow-100 border-yellow-300";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  const getIconaStato = (stato: "preso" | "non preso" | "in attesa" | undefined) => {
    switch (stato) {
      case "preso": return <Check className="h-5 w-5 text-green-600" />;
      case "non preso": return <X className="h-5 w-5 text-red-600" />;
      case "in attesa": return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-5 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-800">
          Gestione Quotidiana
        </h2>
        <Button
          variant={notificheAbilitate ? "default" : "outline"}
          size="sm"
          onClick={() => setNotificheAbilitate(!notificheAbilitate)}
          className="flex items-center gap-2"
        >
          {notificheAbilitate ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {notificheAbilitate ? "ON" : "OFF"}
        </Button>
      </div>

      {/* Selezione Data */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-indigo-800">
          Seleziona data
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-medium bg-white/60 shadow-md hover:bg-indigo-50/60",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: it }) : <span>Scegli una data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              locale={it}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Lista Medicinali */}
      <div className="space-y-3">
        {inserimentiOggi.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nessun medicinale programmato per oggi</p>
            <p className="text-sm">Vai alla tab "Registro" per aggiungere medicinali</p>
          </div>
        ) : (
          inserimentiOggi.map((inserimento) => {
            const stato = statiMedicinali[inserimento.id]?.stato;
            return (
              <div
                key={inserimento.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                  getStatoColore(stato)
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow">
                    {getIconaStato(stato)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {inserimento.nomeMedicinale}
                    </div>
                    <div className="text-sm text-gray-600">
                      ore {inserimento.orario}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={stato === "preso" ? "default" : "outline"}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => cambiaStato(inserimento.id, "preso")}
                  >
                    Preso
                  </Button>
                  <Button
                    size="sm"
                    variant={stato === "non preso" ? "destructive" : "outline"}
                    onClick={() => cambiaStato(inserimento.id, "non preso")}
                  >
                    Non preso
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Toaster />
    </div>
  );
};

export default GestioneQuotidianaMedicinali;
