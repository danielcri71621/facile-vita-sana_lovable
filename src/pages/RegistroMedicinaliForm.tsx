
import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Default list, now modifiable.
const defaultMedicinaliList = [
  { id: 1, nome: "Aspirina" },
  { id: 2, nome: "Metformina" },
  { id: 3, nome: "Ramipril" },
];

type StatoMedicinale = "preso" | "non preso";

interface MedicinaleData {
  [id: number]: StatoMedicinale;
}

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

  const handleToggle = (id: number) => {
    setMedicinaliStato((prev) => ({
      ...prev,
      [id]: prev[id] === "preso" ? "non preso" : "preso",
    }));
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
        <div className="flex gap-2 mb-1 flex-col sm:flex-row items-stretch sm:items-center">
          <Input
            type="text"
            placeholder="Aggiungi nuovo medicinale"
            value={nuovoMedicinale}
            onChange={(e) => setNuovoMedicinale(e.target.value)}
            onKeyDown={onInputKeyDown}
            className="bg-white/70 px-3 py-2 rounded-lg flex-1 text-base sm:text-sm"
            style={{ minHeight: 40 }}
            maxLength={50}
          />
          <Button
            type="button"
            variant="secondary"
            className="rounded-full px-2 py-2 flex-shrink-0"
            onClick={aggiungiMedicinale}
            aria-label="Aggiungi"
            style={{ minHeight: 40, minWidth: 40 }}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Lista dinamica dei medicinali */}
        {medicinaliList.map((m) => {
          const stato = medicinaliStato[m.id];
          const isPreso = stato === "preso";
          return (
            <div
              key={m.id}
              className={cn(
                "flex items-center justify-between transition-all duration-300 group border-2 rounded-xl px-2 py-3 sm:px-3 sm:py-4 backdrop-blur-sm bg-opacity-80 shadow-md hover:shadow-lg hover:scale-[1.02]",
                "gap-2 sm:gap-3",
                isPreso
                  ? "bg-gradient-to-tr from-green-400/80 via-green-300/90 to-green-200/90 border-green-600/80"
                  : stato === "non preso"
                  ? "bg-gradient-to-tr from-red-400/80 via-red-300/90 to-red-200/90 border-red-600/80"
                  : "bg-white/80 border-blue-200/70",
              )}
              style={{ minHeight: 66 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full transition-colors duration-300 shadow",
                    isPreso
                      ? "bg-white text-green-600 ring-2 ring-green-400/60"
                      : stato === "non preso"
                      ? "bg-white text-red-600 ring-2 ring-red-400/60"
                      : "bg-gray-100 text-gray-500 ring-2 ring-blue-200/30",
                    "w-10 h-10"
                  )}
                >
                  {isPreso ? (
                    <Check className="w-7 h-7" strokeWidth={3}/>
                  ) : stato === "non preso" ? (
                    <X className="w-7 h-7" strokeWidth={3}/>
                  ) : (
                    <span className="font-bold text-xl">?</span>
                  )}
                </div>
                <span className={cn(
                  "font-semibold text-base sm:text-lg drop-shadow",
                  isPreso ? "text-white" : stato === "non preso" ? "text-white" : "text-gray-800"
                )}>{m.nome}</span>
              </div>
              <Button
                size="sm"
                variant={isPreso ? "secondary" : "outline"}
                className={cn(
                  "rounded-full font-bold transition-all drop-shadow px-3 py-1 text-base sm:text-base",
                  isPreso
                    ? "bg-white text-green-600 border-white hover:bg-green-100 hover:text-green-700"
                    : stato === "non preso"
                    ? "bg-white text-red-600 border-white hover:bg-red-100 hover:text-red-700"
                    : "bg-gradient-to-tr from-cyan-100 to-blue-100 text-cyan-700 border-blue-100 hover:bg-cyan-50"
                )}
                style={{ minWidth: 90, minHeight: 40 }}
                onClick={() => handleToggle(m.id)}
              >
                {isPreso ? "Preso" : "Non preso"}
              </Button>
            </div>
          );
        })}
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
