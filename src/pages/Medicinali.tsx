import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import RegistroMedicinaliForm from "./RegistroMedicinaliForm";
import GraficoMedicinali from "./GraficoMedicinali";
import AnalisiForm from "./AnalisiForm";
import GestioneQuotidianaMedicinali from "./GestioneQuotidianaMedicinali";

const Medicinali = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-lg mx-auto min-h-screen py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('medicine.title')}</h1>
        <LanguageSwitcher />
      </div>
      <Tabs defaultValue="quotidiana" className="w-full">
        <div className="overflow-x-auto mb-6">
          <TabsList className="inline-flex min-w-full w-max">
            <TabsTrigger value="quotidiana" className="flex-shrink-0 px-4 py-2 whitespace-nowrap">
              {t('tabs.daily')}
            </TabsTrigger>
            <TabsTrigger value="registro" className="flex-shrink-0 px-4 py-2 whitespace-nowrap">
              {t('tabs.registry')}
            </TabsTrigger>
            <TabsTrigger value="grafico" className="flex-shrink-0 px-4 py-2 whitespace-nowrap">
              {t('tabs.progress')}
            </TabsTrigger>
            <TabsTrigger value="analisi" className="flex-shrink-0 px-4 py-2 whitespace-nowrap">
              {t('tabs.analysis')}
            </TabsTrigger>
          </TabsList>
        </div>
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
