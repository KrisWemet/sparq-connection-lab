// This is a proxy file that simply re-exports the useAuth hook from the auth-provider
// to keep imports consistent throughout the application

import { useAuth as useAuthProvider } from '@/lib/auth-provider';

export const useAuth = useAuthProvider;
