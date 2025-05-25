import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip"; // Si TooltipProvider sí existe
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RoutesPage from "./pages/Routes";
import Users from "./pages/Users";
import Buses from "./pages/Buses";
import Roles from "./pages/Roles";
import Companies from "./pages/Companies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/users" element={<Users />} />
          <Route path="/buses" element={<Buses />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

