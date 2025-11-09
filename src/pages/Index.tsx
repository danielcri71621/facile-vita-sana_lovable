import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('home.title')}</h1>
        <p className="text-lg text-gray-600 mb-6">
          {t('home.subtitle')}
        </p>
        <div className="space-y-3">
          <Link
            to="/medicinali"
            className="block bg-primary text-primary-foreground px-6 py-3 rounded shadow hover:bg-primary/90 transition"
          >
            {t('home.dailyEntry')}
          </Link>
          <Link
            to="/andamento"
            className="block bg-secondary text-secondary-foreground px-6 py-3 rounded shadow hover:bg-secondary/90 transition"
          >
            {t('home.viewProgress')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
