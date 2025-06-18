
import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
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

const RegistroMedicinaliForm = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [orario, setOrario] = useState("");
  const [nomeMedicinale, setNomeMedicinale] = useState("");
  const [pressione, setPressione] = useState("");
  const [glicemia, setGlicemia] = useState("");
  const [inserimenti, setInserimenti] = useState<InserimentoMedicinale[]>([]);

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

  const aggiungiInserimento = () => {
    if (!nomeMedicinale.trim() || !date || !orario) {
      toast({
        variant: "destructive",
        title: "Campi mancanti",
        description: "Completa tutti i campi: medicinale, data e orario.",
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
    setNomeMedicinale("");
    setOrario("");
    
    toast({
      title: "Inserimento salvato!",
      description: `${nomeMedicinale} registrato per il ${format(date, "dd/MM/yyyy", { locale: it })} alle ${orario}`,
    });
  };

  const rimuoviInserimento = (id: number) => {
    setInserimenti(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Inserimento rimosso",
      description: "L'inserimento è stato eliminato.",
    });
  };

  const salvaGiornata = () => {
    toast({
      title: "Giornata salvata!",
      description: (
        <span>
          Dati salvati per il {date ? format(date, "dd/MM/yyyy", { locale: it }) : ""}:<br />
          {inserimenti.filter(i => i.data === (date ? format(date, "yyyy-MM-dd") : "")).length} inserimenti medicinali<br />
          <div>Pressione: <b>{pressione || "-"}</b></div>
          <div>Glicemia: <b>{glicemia || "-"}</b></div>
        </span>
      ),
    });
  };

  // Filtra inserimenti per la data selezionata
  const inserimentiOggi = inserimenti.filter(i => 
    i.data === (date ? format(date, "yyyy-MM-dd") : "")
  ).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div
      className={cn(
        "w-full max-w-xl mx-auto bg-gradient-to-br from-blue-100 via-teal-100 to-green-100 p-5 rounded-xl shadow-2xl",
        "sm:p-7",
        "md:max-w-lg",
        "flex flex-col gap-4",
      )}
      style={{ boxSizing: "border-box" }}
    >
      <h2 className="text-xl font-bold text-center text-blue-800 mb-4">
        Inserimento Giornaliero Medicinali
      </h2>

      {/* Selezione Data */}
      <div>
        <label className="block mb-2 text-base sm:text-sm font-medium text-cyan-800">
          Seleziona data
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
              {date ? format(date, "PPP", { locale: it }) : <span>Scegli una data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className={cn("p-3 pointer-events-auto")}
              initialFocus
              locale={it}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Inserimento Medicinale */}
      <div className="bg-white/50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-700 mb-3">Nuovo Inserimento</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nome medicinale
            </label>
            <Input
              type="text"
              placeholder="Es: Aspirina"
              value={nomeMedicinale}
              onChange={(e) => setNomeMedicinale(e.target.value)}
              className="bg-white/70"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Orario assunzione
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

          <Button
            onClick={aggiungiInserimento}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            Aggiungi Inserimento
          </Button>
        </div>
      </div>

      {/* Lista Inserimenti del Giorno */}
      {inserimentiOggi.length > 0 && (
        <div className="bg-white/50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-700 mb-3">
            Inserimenti di oggi ({inserimentiOggi.length})
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
                    ore {inserimento.orario}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => rimuoviInserimento(inserimento.id)}
                >
                  Rimuovi
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
            Pressione sanguigna (mmHg)
          </label>
          <Input
            type="text"
            placeholder="Es: 120/80"
            value={pressione}
            onChange={(e) => setPressione(e.target.value)}
            className="bg-blue-50/50 focus:bg-white/90"
          />
        </div>
        
        <div>
          <label className="block text-base sm:text-sm font-medium mb-1 text-green-900">
            Glicemia (mg/dl)
          </label>
          <Input
            type="number"
            placeholder="Es: 90"
            value={glicemia}
            onChange={(e) => setGlicemia(e.target.value)}
            className="bg-green-50/50 focus:bg-white/90"
          />
        </div>
      </div>

      <Button
        className="w-full text-lg sm:text-base py-3 rounded-xl font-semibold shadow-lg bg-gradient-to-tr from-cyan-400 via-blue-400 to-green-300 text-white hover:from-cyan-500 hover:to-green-400 hover:scale-[1.03] transition-all duration-300"
        onClick={salvaGiornata}
      >
        Salva Giornata
      </Button>
      
      <Toaster />
    </div>
  );
};

export default RegistroMedicinaliForm;
