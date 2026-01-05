
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { it, enUS, ro } from "date-fns/locale";
import { CalendarIcon, Bell, BellRing, Check, X, Clock, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

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
  const { t, i18n } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [inserimenti, setInserimenti] = useState<InserimentoMedicinale[]>([]);
  const [statiMedicinali, setStatiMedicinali] = useState<Record<number, StatoMedicinale>>({});
  const [notificheAbilitate, setNotificheAbilitate] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const notifiedMedicinesRef = useRef<Set<number>>(new Set());

  const getLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'ro': return ro;
      default: return it;
    }
  };

  // Inizializza AudioContext e richiedi permessi notifiche
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setAudioUnlocked(true);
    };

    // Sblocca audio al primo click/touch
    const unlockAudio = () => {
      initAudio();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    // Richiedi permessi notifiche native
    const requestNotificationPermissions = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const result = await LocalNotifications.requestPermissions();
          console.log('Permessi notifiche:', result);
        } catch (error) {
          console.error('Errore richiesta permessi:', error);
        }
      }
    };

    requestNotificationPermissions();

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

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

  // Schedula notifiche native per i medicinali
  useEffect(() => {
    const scheduleNativeNotifications = async () => {
      if (!Capacitor.isNativePlatform() || !notificheAbilitate) return;

      try {
        // Cancella notifiche esistenti
        await LocalNotifications.cancel({ notifications: inserimentiOggi.map(i => ({ id: i.id })) });

        const now = new Date();
        const notifications = inserimentiOggi
          .filter(inserimento => {
            const stato = statiMedicinali[inserimento.id];
            if (stato && stato.stato !== "in attesa") return false;
            
            const [hours, minutes] = inserimento.orario.split(':').map(Number);
            const scheduleDate = new Date(now);
            scheduleDate.setHours(hours, minutes, 0, 0);
            return scheduleDate > now;
          })
          .map(inserimento => {
            const [hours, minutes] = inserimento.orario.split(':').map(Number);
            const scheduleDate = new Date();
            scheduleDate.setHours(hours, minutes, 0, 0);
            
            return {
              id: inserimento.id,
              title: t('notifications.timeToTake'),
              body: inserimento.nomeMedicinale,
              schedule: { at: scheduleDate },
              sound: 'default',
              smallIcon: 'ic_launcher',
              largeIcon: 'ic_launcher',
            };
          });

        if (notifications.length > 0) {
          await LocalNotifications.schedule({ notifications });
          console.log('Notifiche schedulate:', notifications.length);
        }
      } catch (error) {
        console.error('Errore scheduling notifiche:', error);
      }
    };

    scheduleNativeNotifications();
  }, [inserimenti, statiMedicinali, notificheAbilitate, date, t]);

  // Controllo orari e notifiche in-app
  useEffect(() => {
    if (!notificheAbilitate) return;

    const checkOrari = () => {
      const now = new Date();
      const currentTime = format(now, "HH:mm");

      inserimentiOggi.forEach((inserimento) => {
        const stato = statiMedicinali[inserimento.id];
        
        // Se non è ancora stato preso e l'orario è passato
        if ((!stato || stato.stato === "in attesa") && inserimento.orario <= currentTime) {
          // Evita notifiche duplicate
          if (notifiedMedicinesRef.current.has(inserimento.id)) return;
          notifiedMedicinesRef.current.add(inserimento.id);

          // Suona notifica
          playNotificationSound();
          
          toast({
            title: t('notifications.timeToTake'),
            description: `${inserimento.nomeMedicinale}`,
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

    const interval = setInterval(checkOrari, 60000);
    checkOrari();

    return () => clearInterval(interval);
  }, [inserimenti, statiMedicinali, notificheAbilitate, date, t]);

  // Reset notifiche giornaliere
  useEffect(() => {
    notifiedMedicinesRef.current.clear();
  }, [date]);

  const playNotificationSound = () => {
    try {
      // Usa AudioContext se sbloccato
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);
        
        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.5);
      }
    } catch (error) {
      console.error('Errore riproduzione suono:', error);
    }
  };

  // Testa il suono manualmente
  const testSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        setAudioUnlocked(true);
        playNotificationSound();
      });
    } else {
      setAudioUnlocked(true);
      playNotificationSound();
    }
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
        title: nuovoStato === "preso" ? t('notifications.medicineTaken') : t('notifications.medicineNotTaken'),
        description: t(nuovoStato === "preso" ? 'notifications.medicineTakenDesc' : 'notifications.medicineNotTakenDesc', { name: inserimento.nomeMedicinale }),
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
    <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-card via-primary/5 to-secondary/5 p-6 rounded-2xl shadow-2xl border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t('tabs.daily')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testSound}
            className="flex items-center gap-2 shadow-md"
            title="Test suono"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button
            variant={notificheAbilitate ? "default" : "outline"}
            size="sm"
            onClick={() => setNotificheAbilitate(!notificheAbilitate)}
            className="flex items-center gap-2 shadow-md"
          >
            {notificheAbilitate ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {notificheAbilitate ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      {/* Selezione Data */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-semibold text-foreground">
          {t('registry.selectDate')}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-medium bg-card shadow-lg hover:shadow-xl border-2 hover:border-primary/50 transition-all",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
              {date ? format(date, "PPP", { locale: getLocale() }) : <span>{t('registry.chooseDate')}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              locale={getLocale()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Lista Medicinali */}
      <div className="space-y-3">
        {inserimentiOggi.length === 0 ? (
          <div className="text-center py-12 bg-card/50 rounded-xl border-2 border-dashed border-border">
            <Clock className="h-16 w-16 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-medium">{t('medicine.noScheduled')}</p>
            <p className="text-sm text-muted-foreground">{t('tabs.registry')}</p>
          </div>
        ) : (
          inserimentiOggi.map((inserimento) => {
            const stato = statiMedicinali[inserimento.id]?.stato;
            return (
              <div
                key={inserimento.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all shadow-md hover:shadow-lg",
                  stato === "preso" && "bg-success/10 border-success/30",
                  stato === "non preso" && "bg-destructive/10 border-destructive/30",
                  stato === "in attesa" && "bg-warning/10 border-warning/30",
                  !stato && "bg-card border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full shadow-md",
                    stato === "preso" && "bg-success/20",
                    stato === "non preso" && "bg-destructive/20",
                    stato === "in attesa" && "bg-warning/20",
                    !stato && "bg-muted"
                  )}>
                    {getIconaStato(stato)}
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-lg">
                      {inserimento.nomeMedicinale}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      ore {inserimento.orario}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={stato === "preso" ? "default" : "outline"}
                    className={cn(
                      "font-semibold shadow-md",
                      stato !== "preso" && "bg-success hover:bg-success/90 text-success-foreground border-success"
                    )}
                    onClick={() => cambiaStato(inserimento.id, "preso")}
                  >
                    {t('medicine.taken')}
                  </Button>
                  <Button
                    size="sm"
                    variant={stato === "non preso" ? "destructive" : "outline"}
                    className="font-semibold shadow-md"
                    onClick={() => cambiaStato(inserimento.id, "non preso")}
                  >
                    {t('medicine.notTaken')}
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
