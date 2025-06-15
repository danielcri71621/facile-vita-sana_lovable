
import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import MedicinaliList, { Medicinale, StatoMedicinale } from "@/components/MedicinaliList";
import MedicinaleInput from "@/components/MedicinaleInput";

// Default list, now modifiable.
const defaultMedicinaliList = [
  { id: 1, nome: "Aspirina" },
  { id: 2, nome: "Metformina" },
  { id: 3, nome: "Ramipril" },
];

interface MedicinaleData {
  [id: number]: StatoMedicinale;
}

interface RegistroData {
  medicinaliList: { id: number; nome: string }[];
  medicinaliStato: MedicinaleData;
  pressione: string;
  glicemia: string;
}

// Helper: chiave locale per ogni data
const getKey = (date: Date | undefined) => {
  if (!date) return "registroMedicinali:unknown";
  return `registroMedicinali:${format(date, "yyyy-MM-dd")}`;
};

const RegistroMedicinaliForm = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [medicinaliList, setMedicinaliList] = useState(defaultMedicinaliList);
  const [medicinaliStato, setMedicinaliStato] = useState<MedicinaleData>({});
  const [pressione, setPressione] = useState("");
  const [glicemia, setGlicemia] = useState("");
  const [nuovoMedicinale, setNuovoMedicinale] = useState("");

  // Trova prossimo id per nuovi medicinali
  const nextMedicinaleId = React.useMemo(() => {
    return (
      (medicinaliList.length > 0
        ? Math.max(...medicinaliList.map((m) => m.id))
        : 0) + 1
    );
  }, [medicinaliList]);

  // Quando la data cambia, carica da localStorage
  useEffect(() => {
    if (!date) return;
    const key = getKey(date);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const data: RegistroData = JSON.parse(raw);
        setMedicinaliList(data.medicinaliList || defaultMedicinaliList);
        setMedicinaliStato(data.medicinaliStato || {});
        setPressione(data.pressione || "");
        setGlicemia(data.glicemia || "");
      } catch {
        setMedicinaliList(defaultMedicinaliList);
        setMedicinaliStato({});
        setPressione("");
        setGlicemia("");
      }
    } else {
      setMedicinaliList(defaultMedicinaliList);
      setMedicinaliStato({});
      setPressione("");
      setGlicemia("");
    }
  }, [date]);

  // Quando i dati cambiano, salva in localStorage per la data attuale
  useEffect(() => {
    if (!date) return;
    const key = getKey(date);
    const data: RegistroData = {
      medicinaliList,
      medicinaliStato,
      pressione,
      glicemia,
    };
    localStorage.setItem(key, JSON.stringify(data));
  }, [date, medicinaliList, medicinaliStato, pressione, glicemia]);

  const handleToggle = (id: number) => {
    setMedicinaliStato((prev) => ({
      ...prev,
      [id]: prev[id] === "preso" ? "non preso" : "preso",
    }));
  };

  // Funzione per eliminare un medicinale dalla lista corrente
  const handleDeleteMedicinale = (id: number) => {
    setMedicinaliList((prev) => prev.filter((m) => m.id !== id));
    setMedicinaliStato((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    toast({
      title: "Medicinale eliminato",
      description: "Il medicinale è stato rimosso dalla lista.",
    });
  };

  const handleSalva = () => {
    toast({
      title: "Salvato!",
      description: (
        <span>
          Dati salvati per il {date ? format(date, "dd/MM/yyyy", { locale: it }) : ""}:<br />
          {medicinaliList.map((m) => (
            <div key={m.id}>
              {m.nome}: <b>{medicinaliStato[m.id] === "preso" ? "Preso" : "Non preso"}</b>
            </div>
          ))}
          <div>
            Pressione sanguigna: <b>{pressione || "-"}</b>
          </div>
          <div>
            Glicemia: <b>{glicemia || "-"}</b>
          </div>
        </span>
      ),
    });
  };

  const aggiungiMedicinale = () => {
    const nomeTrimmed = nuovoMedicinale.trim();
    if (!nomeTrimmed) return;
    // Se già presente, non aggiunge
    if (medicinaliList.some((med) => med.nome.toLowerCase() === nomeTrimmed.toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Medicinale già presente",
        description: `${nomeTrimmed} è già nella lista.`,
      });
      return;
    }
    setMedicinaliList((prev) => [
      ...prev,
      { id: nextMedicinaleId, nome: nomeTrimmed },
    ]);
    setNuovoMedicinale("");
  };

  // Premere ENTER aggiunge medicinale
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      aggiungiMedicinale();
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-xl mx-auto bg-gradient-to-br from-blue-100 via-teal-100 to-green-100 p-5 rounded-xl shadow-2xl",
        "sm:p-7",
        "md:max-w-lg",
        "flex flex-col gap-1",
      )}
      style={{ boxSizing: "border-box" }}
    >
      <label className="block mb-2 text-base sm:text-sm font-medium text-cyan-800 drop-shadow mt-2 sm:mt-0">
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
            style={{ minHeight: 44 }}
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

      <div className="space-y-3 mb-6 sm:mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="font-semibold text-base text-green-700 tracking-wide">
            Medicinali
          </div>
        </div>

        {/* Campo aggiunta nuovo medicinale */}
        <MedicinaleInput
          value={nuovoMedicinale}
          onChange={setNuovoMedicinale}
          onAdd={aggiungiMedicinale}
          onKeyDown={onInputKeyDown}
        />

        {/* Lista dinamica dei medicinali */}
        <MedicinaliList
          medicinali={medicinaliList}
          medicinaliStato={medicinaliStato}
          onToggle={handleToggle}
          onDelete={handleDeleteMedicinale}
        />
      </div>
      <div className="mb-3">
        <label className="block text-base sm:text-sm font-medium mb-1 text-blue-900">
          Pressione sanguigna (mmHg)
        </label>
        <Input
          type="text"
          placeholder="Es: 120/80"
          value={pressione}
          onChange={(e) => setPressione(e.target.value)}
          className="bg-blue-50/50 focus:bg-white/90 text-base sm:text-sm px-3 py-2 rounded-lg"
          style={{ minHeight: 44 }}
        />
      </div>
      <div className="mb-5 sm:mb-6">
        <label className="block text-base sm:text-sm font-medium mb-1 text-green-900">
          Glicemia (mg/dl)
        </label>
        <Input
          type="number"
          placeholder="Es: 90"
          value={glicemia}
          onChange={(e) => setGlicemia(e.target.value)}
          className="bg-green-50/50 focus:bg-white/90 text-base sm:text-sm px-3 py-2 rounded-lg"
          style={{ minHeight: 44 }}
        />
      </div>
      <Button
        className="w-full text-lg sm:text-base py-3 rounded-xl font-semibold shadow-lg bg-gradient-to-tr from-cyan-400 via-blue-400 to-green-300 text-white hover:from-cyan-500 hover:to-green-400 hover:scale-[1.03] transition-all duration-300"
        style={{ minHeight: 52 }}
        onClick={handleSalva}
      >
        Salva
      </Button>
      <Toaster />
    </div>
  );
};

export default RegistroMedicinaliForm;

