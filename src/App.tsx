
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Subscription from "@/pages/Subscription";
import Settings from "@/pages/Settings";
import Goals from "@/pages/Goals";
import Journeys from "@/pages/Journeys";
import JourneyTemplate from "@/pages/journeys/JourneyTemplate";
import PathToTogether from "@/pages/PathToTogether";
import Quiz from "@/pages/Quiz";
import DailyQuestions from "@/pages/DailyQuestions";
import DailyActivity from "@/pages/DailyActivity";
import DateIdeas from "@/pages/DateIdeas";
import AITherapist from "@/pages/AITherapist";
import Messaging from "@/pages/Messaging";
import Reflect from "@/pages/Reflect";
import JoinPartner from "@/pages/JoinPartner";
import TestPage from "@/pages/TestPage";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="sparq-ui-theme">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/journeys" element={<Journeys />} />
              <Route 
                path="/journeys/:journeyId" 
                element={
                  <JourneyTemplate 
                    journeyId="" 
                    title="Journey"
                    totalDays={1}
                    conceptItems={[]}
                    backPath="/journeys"
                  />
                } 
              />
              <Route path="/path-to-together" element={<PathToTogether />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/daily-questions" element={<DailyQuestions />} />
              <Route path="/daily-activity" element={<DailyActivity />} />
              <Route path="/date-ideas" element={<DateIdeas />} />
              <Route path="/ai-therapist" element={<AITherapist />} />
              <Route path="/messaging" element={<Messaging />} />
              <Route path="/reflect" element={<Reflect />} />
            </Route>
            <Route path="/join/:inviteCode" element={<JoinPartner />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
