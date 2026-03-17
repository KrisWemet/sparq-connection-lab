
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useRouter } from "next/router";

export default function Auth() {
  const router = useRouter();
  const { isAuthLoading } = useAuthRedirect("/dashboard");
  
  return (
    <AuthLayout
      title="Login to your account"
      description="Enter your credentials to access your account"
      footer={
        <Button variant="link" onClick={() => router.push("/signup")}>
          Don&apos;t have an account? Sign up
        </Button>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}

export const getServerSideProps = async () => ({ props: {} });
