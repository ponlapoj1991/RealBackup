import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SocialListeningDashboard from "./SocialListeningDashboard";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/SettingsPage";
import { AIProvider } from "./contexts/AIContext";
import { DashboardProvider } from "./contexts/DashboardContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AIProvider>
          <DashboardProvider>
            <Routes>
              <Route path="/" element={<SocialListeningDashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardProvider>
        </AIProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
