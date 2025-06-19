
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RegistroMedicinaliForm from "./RegistroMedicinaliForm";
import GraficoMedicinali from "./GraficoMedicinali";
import AnalisiForm from "./AnalisiForm";
import GestioneQuotidianaMedicinali from "./GestioneQuotidianaMedicinali";

const Medicinali = () => {
  return (
    <div className="max-w-lg mx-auto min-h-screen py-8">
      <h1 className="text-2xl font-bold mb-4">Tracciamento Salute</h1>
      <Tabs defaultValue="quotidiana" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="quotidiana" className="w-1/4">Quotidiana</TabsTrigger>
          <TabsTrigger value="registro" className="w-1/4">Registro</TabsTrigger>
          <TabsTrigger value="grafico" className="w-1/4">Andamento</TabsTrigger>
          <TabsTrigger value="analisi" className="w-1/4">Analisi</TabsTrigger>
        </TabsList>
        <TabsContent value="quotidiana">
          <GestioneQuotidianaMedicinali />
        </TabsContent>
        <TabsContent value="registro">
          <RegistroMedicinaliForm />
        </TabsContent>
        <TabsContent value="grafico">
          <GraficoMedicinali />
        </TabsContent>
        <TabsContent value="analisi">
          <AnalisiForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Medicinali;
