
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboardingRedirect } from "@/hooks/useOnboardingRedirect";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Custom hooks
  useAnalytics('dashboard');
  const { isChecking } = useOnboardingRedirect();
  const { 
    loading, 
    showSocialProof, 
    showConfetti,
    streakCount,
    badges,
    relationshipLevel,
    relationshipPoints,
    pointsToNextLevel
  } = useDashboardData();
  
  // Combine loading states
  const isLoading = isChecking || loading;
  
  return (
    <DashboardLayout isLoading={isLoading}>
      <DashboardContent 
        showConfetti={showConfetti}
        showSocialProof={showSocialProof}
        streakCount={streakCount}
        badges={badges}
        relationshipLevel={relationshipLevel}
        relationshipPoints={relationshipPoints}
        pointsToNextLevel={pointsToNextLevel}
      />
    </DashboardLayout>
  );
}
