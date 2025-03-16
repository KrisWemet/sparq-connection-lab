
import { useOutlet } from 'react-router-dom';
import { ProtectedRoute as ProtectedRouteComponent } from '@/components/ui/protected-route';

// This is a wrapper component to work with React Router's Outlet
export default function ProtectedRoute() {
  const outlet = useOutlet();

  return (
    <ProtectedRouteComponent>
      {outlet}
    </ProtectedRouteComponent>
  );
}
