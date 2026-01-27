import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
// Temporarily commented out for under construction page
// import Index from "./pages/Index";
// import Contact from "./pages/Contact";
// import TermsAndConditions from "./pages/TermsAndConditions";
// import PrivacyPolicy from "./pages/PrivacyPolicy";
// import RefundPolicy from "./pages/RefundPolicy";
// import ListEvents from "./pages/ListEvents";
// import GetStarted from "./pages/GetStarted";
// import AccountSetup from "./pages/AccountSetup";
// import NotFound from "./pages/NotFound";
import UnderConstruction from "./components/UnderConstruction";

const queryClient = new QueryClient();

// Temporary: Show under construction page
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UnderConstruction />
    </TooltipProvider>
  </QueryClientProvider>
);

/* Original App code - Restore this when ready to go live
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/list-events" element={<ListEvents />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/account-setup" element={<AccountSetup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
*/

export default App;
