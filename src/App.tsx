import { Routes, Route } from "react-router";
import { Analytics } from "@vercel/analytics/react";
import { HomePage } from "./pages/HomePage";
import { ScanPage } from "./pages/ScanPage";
import { ResultsPage } from "./pages/ResultsPage";
import { ReviewPage } from "./pages/ReviewPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Analytics />
    </>
  );
}
