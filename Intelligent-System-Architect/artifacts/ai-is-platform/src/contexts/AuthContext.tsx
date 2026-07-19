import React, { createContext, useContext } from 'react';
import { useGetAuthMe, getGetAuthMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextValue {
  user: { id: number; username: string; email: string; createdAt: string } | null;
  isLoading: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue>({ user: null, isLoading: true, refetch: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetAuthMe({
    query: {
      queryKey: getGetAuthMeQueryKey(),
      retry: false,
      throwOnError: false,
    }
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
