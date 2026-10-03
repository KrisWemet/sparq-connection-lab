import { useRouter } from 'next/router';
import { useEffect } from "react";
import Link from 'next/link';

const NotFound = () => {
  const router = useRouter();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      router.pathname
    );
  }, [router.pathname]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <Link href="/" className="text-primary-emphasis hover:text-brand-hover underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
