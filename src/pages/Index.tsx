
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Diario Salute Giornaliero</h1>
        <p className="text-lg text-gray-600 mb-6">
          Registra i tuoi medicinali e parametri vitali ogni giorno
        </p>
        <div className="space-y-3">
          <Link
            to="/medicinali"
            className="block bg-primary text-primary-foreground px-6 py-3 rounded shadow hover:bg-primary/90 transition"
          >
            Inserimento Giornaliero
          </Link>
          <Link
            to="/andamento"
            className="block bg-secondary text-secondary-foreground px-6 py-3 rounded shadow hover:bg-secondary/90 transition"
          >
            Visualizza Andamento
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
