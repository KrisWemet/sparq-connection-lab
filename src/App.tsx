import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import DateIdeas from "@/pages/DateIdeas";
import Quiz from "@/pages/Quiz";
import Journeys from "@/pages/Journeys";
import JourneyDetails from "@/pages/JourneyDetails";
import JourneyStart from "@/pages/JourneyStart";
import PartnerProfile from "@/pages/PartnerProfile";
import JoinPartner from "@/pages/JoinPartner";
import PathToTogether from "@/pages/PathToTogether";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="sparq-connect-theme">
        <Router>
          <Toaster position="top-center" richColors closeButton />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/partner-profile"
              element={
                <ProtectedRoute>
                  <PartnerProfile />
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
              path="/path-to-together"
              element={
                <ProtectedRoute>
                  <PathToTogether />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
