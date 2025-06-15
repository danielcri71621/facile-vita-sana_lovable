
import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const medicinaliList = [
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
  const [medicinaliStato, setMedicinaliStato] = useState<MedicinaleData>({});
  const [pressione, setPressione] = useState("");
  const [glicemia, setGlicemia] = useState("");

  const handleToggle = (id: number) => {
    setMedicinaliStato((prev) => ({
      ...prev,
      [id]:
        prev[id] === "preso" ? "non preso" : "preso",
    }));
  };

  const handleSalva = () => {
    toast({
      title: "Salvato!",
      description: (
        <span>
          Dati salvati per il {date ? format(date, "dd/MM/yyyy") : ""}:<br />
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

  return (
    <div>
      <label className="block mb-2 text-sm font-medium">Seleziona data</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal mb-4",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Scegli una data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className={cn("p-3 pointer-events-auto")}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="space-y-3 mb-7">
        <div className="font-medium mb-1 text-base">Medicinali</div>
        {medicinaliList.map((m) => {
          const stato = medicinaliStato[m.id];
          const isPreso = stato === "preso";
          return (
            <div
              key={m.id}
              className={cn(
                "flex items-center justify-between transition-all duration-300 group border-2 shadow-sm rounded-xl px-3 py-4",
                isPreso
                  ? "bg-green-500/90 border-green-600"
                  : stato === "non preso"
                  ? "bg-red-500/90 border-red-600"
                  : "bg-white border-gray-300",
                "hover:shadow-md hover:scale-[1.02]"
              )}
              style={{ minHeight: 72 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full transition-colors duration-300",
                    isPreso
                      ? "bg-white text-green-600"
                      : stato === "non preso"
                      ? "bg-white text-red-600"
                      : "bg-gray-100 text-gray-500",
                    "w-10 h-10 shadow"
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
                  "font-semibold text-lg",
                  isPreso ? "text-white" : stato === "non preso" ? "text-white" : "text-gray-800"
                )}>{m.nome}</span>
              </div>
              <Button
                size="sm"
                variant={isPreso ? "secondary" : "outline"}
                className={cn(
                  "rounded-full font-bold transition-all",
                  isPreso
                    ? "bg-white text-green-600 border-white hover:bg-green-100 hover:text-green-700"
                    : stato === "non preso"
                    ? "bg-white text-red-600 border-white hover:bg-red-100 hover:text-red-700"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                )}
                onClick={() => handleToggle(m.id)}
              >
                {isPreso ? "Preso" : "Non preso"}
              </Button>
            </div>
          );
        })}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Pressione sanguigna (mmHg)</label>
        <Input
          type="text"
          placeholder="Es: 120/80"
          value={pressione}
          onChange={(e) => setPressione(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Glicemia (mg/dl)</label>
        <Input
          type="number"
          placeholder="Es: 90"
          value={glicemia}
          onChange={(e) => setGlicemia(e.target.value)}
        />
      </div>
      <Button className="w-full text-base py-3 rounded-xl font-semibold shadow-sm" onClick={handleSalva}>
        Salva
      </Button>
      <Toaster />
    </div>
  );
};

export default RegistroMedicinaliForm;
