import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import Landing from "./pages/Landing";
import Modes from "./pages/Modes";
import Game from "./pages/Game";
import Trophies from "./pages/Trophies";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ProgressProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/modes" element={<Modes />} />
            <Route path="/play/:difficulty/:language?" element={<Game />} />
            <Route path="/trophies" element={<Trophies />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </ProgressProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
