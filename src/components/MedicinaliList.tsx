
import React from "react";
import { Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StatoMedicinale = "preso" | "non preso";
export interface Medicinale {
  id: number;
  nome: string;
}
export interface MedicinaliListProps {
  medicinali: Medicinale[];
  medicinaliStato: Record<number, StatoMedicinale>;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const MedicinaliList: React.FC<MedicinaliListProps> = ({
  medicinali,
  medicinaliStato,
  onToggle,
  onDelete
}) => {
  return (
    <div className="space-y-2">
      {medicinali.map((m) => {
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
            <div className="flex items-center gap-1">
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
                onClick={() => onToggle(m.id)}
              >
                {isPreso ? "Preso" : "Non preso"}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="ml-2 text-red-600 hover:bg-red-100"
                title="Elimina"
                aria-label="Elimina medicinale"
                onClick={() => onDelete(m.id)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MedicinaliList;

