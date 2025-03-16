
import { useAuth as useAuthFromModule } from '@/lib/auth';

// Re-export the hook to maintain consistent imports across the app
export const useAuth = useAuthFromModule;
