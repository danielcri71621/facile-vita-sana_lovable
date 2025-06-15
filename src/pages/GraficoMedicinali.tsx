
import * as React from "react";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartBar } from "lucide-react";

const mockData = [
  { giorno: "lun", pressione: 120, glicemia: 95 },
  { giorno: "mar", pressione: 125, glicemia: 102 },
  { giorno: "mer", pressione: 119, glicemia: 87 },
  { giorno: "gio", pressione: 134, glicemia: 91 },
  { giorno: "ven", pressione: 123, glicemia: 98 },
  { giorno: "sab", pressione: 130, glicemia: 100 },
  { giorno: "dom", pressione: 128, glicemia: 93 },
];

const GraficoMedicinali = () => {
  return (
    <div className="h-[340px] w-full">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ChartBar className="h-5 w-5" /> Andamento pressione e glicemia
      </h2>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="giorno" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pressione" stroke="#2563eb" name="Pressione" />
          <Line type="monotone" dataKey="glicemia" stroke="#16a34a" name="Glicemia" />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-xs text-muted-foreground mt-3">
        Dati degli ultimi 7 giorni (esempio)
      </div>
    </div>
  );
};

export default GraficoMedicinali;
