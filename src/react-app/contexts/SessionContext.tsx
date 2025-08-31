import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession } from '@/shared/types';

interface SessionContextType {
  session: UserSession | null;
  setSession: (session: UserSession | null) => void;
  isGameMaster: boolean;
  isPlayer: boolean;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSessionState] = useState<UserSession | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('rpg-session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSessionState(parsed);
      } catch (error) {
        console.error('Failed to parse saved session:', error);
        localStorage.removeItem('rpg-session');
      }
    }
  }, []);

  const setSession = (newSession: UserSession | null) => {
    setSessionState(newSession);
    if (newSession) {
      localStorage.setItem('rpg-session', JSON.stringify(newSession));
    } else {
      localStorage.removeItem('rpg-session');
    }
  };

  const logout = () => {
    setSession(null);
  };

  const isGameMaster = session?.role === 'master';
  const isPlayer = session?.role === 'player';

  return (
    <SessionContext.Provider value={{
      session,
      setSession,
      isGameMaster,
      isPlayer,
      logout,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
