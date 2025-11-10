import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center max-w-md px-6">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {t('home.title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t('home.subtitle')}
          </p>
        </div>
        <div className="space-y-4">
          <Link
            to="/medicinali"
            className="block bg-gradient-to-r from-primary to-info text-primary-foreground px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
          >
            {t('home.dailyEntry')}
          </Link>
          <Link
            to="/andamento"
            className="block bg-gradient-to-r from-secondary to-accent text-secondary-foreground px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
          >
            {t('home.viewProgress')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
