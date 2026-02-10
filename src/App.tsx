import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SubscriptionProvider } from "@/lib/subscription-provider";

// Public pages
import Auth from "@/pages/Auth";
import Signup from "@/pages/Signup";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

// Protected pages
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import DailyQuestions from "@/pages/DailyQuestions";
import JoinPartner from "@/pages/JoinPartner";
import Profile from "@/pages/Profile";
import DateIdeas from "@/pages/DateIdeas";
import Quiz from "@/pages/Quiz";
import Journeys from "@/pages/Journeys";
import JourneyDetails from "@/pages/JourneyDetails";
import JourneyStart from "@/pages/JourneyStart";
import PathToTogether from "@/pages/PathToTogether";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";
import AICoach from "@/pages/AITherapist";
import Admin from "@/pages/Admin";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <ThemeProvider defaultTheme="light" storageKey="sparq-connect-theme">
            <Router>
              <Toaster position="top-center" richColors closeButton />
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/landing" element={<Index />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/daily-questions"
                  element={
                    <ProtectedRoute>
                      <DailyQuestions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-invite"
                  element={
                    <ProtectedRoute>
                      <JoinPartner />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-invite/:inviteCode"
                  element={
                    <ProtectedRoute>
                      <JoinPartner />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/date-ideas"
                  element={
                    <ProtectedRoute>
                      <DateIdeas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz"
                  element={
                    <ProtectedRoute>
                      <Quiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/journeys"
                  element={
                    <ProtectedRoute>
                      <Journeys />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/journey/:id"
                  element={
                    <ProtectedRoute>
                      <JourneyDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/journey/:id/start"
                  element={
                    <ProtectedRoute>
                      <JourneyStart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/path-to-together"
                  element={
                    <ProtectedRoute>
                      <PathToTogether />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <Subscription />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-coach"
                  element={
                    <ProtectedRoute>
                      <AICoach />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </ThemeProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
