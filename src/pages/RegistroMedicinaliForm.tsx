
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

      <div className="space-y-2 mb-6">
        <div className="font-medium mb-1">Medicinali</div>
        {medicinaliList.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex items-center justify-between p-2 rounded border",
              medicinaliStato[m.id] === "preso"
                ? "border-green-400 bg-green-50"
                : medicinaliStato[m.id] === "non preso"
                ? "border-red-400 bg-red-50"
                : "border-gray-300"
            )}
          >
            <span>{m.nome}</span>
            <Button
              size="sm"
              variant={medicinaliStato[m.id] === "preso" ? "default" : "outline"}
              onClick={() => handleToggle(m.id)}
            >
              {medicinaliStato[m.id] === "preso" ? (
                <>
                  <Check className="mr-1 h-4 w-4" /> Preso
                </>
              ) : (
                <>
                  <X className="mr-1 h-4 w-4" /> Non preso
                </>
              )}
            </Button>
          </div>
        ))}
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
      <Button className="w-full" onClick={handleSalva}>
        Salva
      </Button>
      <Toaster />
    </div>
  );
};

export default RegistroMedicinaliForm;
