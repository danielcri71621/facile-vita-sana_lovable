
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Start building your amazing project here!
        </p>
        <Link
          to="/medicinali"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded shadow hover:bg-primary/90 transition"
        >
          Vai al tracciamento medicinali
        </Link>
      </div>
    </div>
  );
};

export default Index;
