
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthLoading } = useAuthRedirect("/dashboard");
  
  return (
    <AuthLayout
      title="Login to your account"
      description="Enter your credentials to access your account"
      footer={
        <Button variant="link" onClick={() => navigate("/signup")}>
          Don't have an account? Sign up
        </Button>
      }
    >
      <LoginForm redirectTo="/dashboard" />
    </AuthLayout>
  );
}
