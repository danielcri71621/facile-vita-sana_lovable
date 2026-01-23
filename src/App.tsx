import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Medicinali from "./pages/Medicinali";
import Andamento from "./pages/Andamento";
import ChatAssistant from "./components/ChatAssistant";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Listener per quando l'utente clicca sulla notifica
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Notifica cliccata:', notification);
        
        // Naviga alla pagina Medicinali (Gestione Quotidiana)
        navigate('/medicinali');
      });
    }
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/medicinali" element={<Medicinali />} />
        <Route path="/andamento" element={<Andamento />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatAssistant />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;