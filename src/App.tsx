import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Medicinali from "./pages/Medicinali";
import Andamento from "./pages/Andamento";
import Auth from "./pages/Auth";
import AnalisiSangue from "./pages/AnalisiSangue";
import AnalisiSangueForm from "./pages/AnalisiSangueForm";
import ChatAssistant from "./components/ChatAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/medicinali" element={<Medicinali />} />
          <Route path="/andamento" element={<Andamento />} />
          <Route path="/analisi-sangue" element={<AnalisiSangue />} />
          <Route path="/analisi-sangue/nuovo" element={<AnalisiSangueForm />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatAssistant />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
