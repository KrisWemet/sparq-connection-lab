
import { AuthContext, AuthContextType } from './auth-context';
import { AuthProvider } from './auth-provider';
import { useContext } from 'react';

// Hook to use the auth context
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export { AuthProvider, useAuth };
