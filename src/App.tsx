
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ui/protected-route";

// Pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Signup from "@/pages/Signup";
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
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={
              <ProtectedRoute requiresOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/goals" element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            } />
            <Route path="/journeys" element={
              <ProtectedRoute>
                <Journeys />
              </ProtectedRoute>
            } />
            <Route 
              path="/journeys/:journeyId" 
              element={
                <ProtectedRoute>
                  <JourneyTemplate 
                    journeyId="" 
                    title="Journey"
                    totalDays={1}
                    conceptItems={[]}
                    backPath="/journeys"
                  />
                </ProtectedRoute>
              } 
            />
            <Route path="/path-to-together" element={
              <ProtectedRoute>
                <PathToTogether />
              </ProtectedRoute>
            } />
            <Route path="/quiz" element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } />
            <Route path="/daily-questions" element={
              <ProtectedRoute>
                <DailyQuestions />
              </ProtectedRoute>
            } />
            <Route path="/daily-activity" element={
              <ProtectedRoute>
                <DailyActivity />
              </ProtectedRoute>
            } />
            <Route path="/date-ideas" element={
              <ProtectedRoute>
                <DateIdeas />
              </ProtectedRoute>
            } />
            <Route path="/ai-therapist" element={
              <ProtectedRoute>
                <AITherapist />
              </ProtectedRoute>
            } />
            <Route path="/messaging" element={
              <ProtectedRoute>
                <Messaging />
              </ProtectedRoute>
            } />
            <Route path="/reflect" element={
              <ProtectedRoute>
                <Reflect />
              </ProtectedRoute>
            } />
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
