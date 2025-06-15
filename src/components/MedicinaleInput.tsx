
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MedicinaleInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const MedicinaleInput: React.FC<MedicinaleInputProps> = ({
  value,
  onChange,
  onAdd,
  onKeyDown,
}) => (
  <div className="flex gap-2 mb-1 flex-col sm:flex-row items-stretch sm:items-center">
    <Input
      type="text"
      placeholder="Aggiungi nuovo medicinale"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className="bg-white/70 px-3 py-2 rounded-lg flex-1 text-base sm:text-sm"
      style={{ minHeight: 40 }}
      maxLength={50}
    />
    <Button
      type="button"
      variant="secondary"
      className="rounded-full px-2 py-2 flex-shrink-0"
      onClick={onAdd}
      aria-label="Aggiungi"
      style={{ minHeight: 40, minWidth: 40 }}
    >
      <Plus className="w-5 h-5" />
    </Button>
  </div>
);

export default MedicinaleInput;

