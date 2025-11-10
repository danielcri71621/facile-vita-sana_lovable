import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import GraficoMedicinali from "./GraficoMedicinali";

const Andamento = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-lg mx-auto min-h-screen py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-semibold shadow-sm hover:shadow-md px-3 py-2 rounded-lg bg-card border border-border"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Link>
        <LanguageSwitcher />
      </div>
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('chart.weeklyProgress')}</h1>
      <div className="bg-gradient-to-br from-card via-primary/5 to-secondary/5 p-6 rounded-2xl shadow-2xl border border-border">
        <GraficoMedicinali />
      </div>
    </div>
  );
};

export default Andamento;
