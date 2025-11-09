import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import GraficoMedicinali from "./GraficoMedicinali";

const Andamento = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-lg mx-auto min-h-screen py-8">
      <div className="flex justify-between items-center mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Link>
        <LanguageSwitcher />
      </div>
      <h1 className="text-2xl font-bold mb-4 text-blue-800">{t('chart.weeklyProgress')}</h1>
      <div className="bg-gradient-to-br from-blue-100 via-teal-100 to-green-100 p-5 rounded-xl shadow-2xl">
        <GraficoMedicinali />
      </div>
    </div>
  );
};

export default Andamento;
