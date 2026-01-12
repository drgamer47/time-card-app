import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type UserName = 'macray' | 'yenna';

interface UserContextType {
  currentUser: UserName | null;
  setCurrentUser: (user: UserName) => void;
  theme: 'walmart' | 'yenna';
  setThemeForUser: (user: UserName, theme: 'walmart' | 'yenna') => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<UserName | null>(null);
  const [theme, setTheme] = useState<'walmart' | 'yenna'>('walmart');

  const loadUserTheme = (user: UserName) => {
    // Load saved theme from localStorage, or use default
    const savedTheme = localStorage.getItem(`theme_${user}`) as 'walmart' | 'yenna' | null;
    const defaultTheme = user === 'macray' ? 'walmart' : 'yenna';
    const themeToUse = savedTheme || defaultTheme;
    setTheme(themeToUse);
    
    // Apply theme to document for CSS variables
    document.documentElement.setAttribute('data-theme', themeToUse);
    
    // Force CSS variable update immediately - set ALL variables
    const root = document.documentElement;
    if (themeToUse === 'walmart') {
      root.style.setProperty('--color-primary', '#0072CE');
      root.style.setProperty('--color-primary-10', 'rgba(0, 114, 206, 0.1)');
      root.style.setProperty('--color-primary-20', 'rgba(0, 114, 206, 0.2)');
      root.style.setProperty('--color-primary-30', 'rgba(0, 114, 206, 0.3)');
      root.style.setProperty('--color-primary-90', 'rgba(0, 114, 206, 0.9)');
      root.style.setProperty('--color-accent', '#14B8A6');
      root.style.setProperty('--color-accent-10', 'rgba(20, 184, 166, 0.1)');
      root.style.setProperty('--color-accent-20', 'rgba(20, 184, 166, 0.2)');
      root.style.setProperty('--color-success', '#10B981');
      root.style.setProperty('--color-success-10', 'rgba(16, 185, 129, 0.1)');
      root.style.setProperty('--color-success-20', 'rgba(16, 185, 129, 0.2)');
      root.style.setProperty('--color-success-30', 'rgba(16, 185, 129, 0.3)');
      root.style.setProperty('--color-success-40', 'rgba(16, 185, 129, 0.4)');
    } else {
      root.style.setProperty('--color-primary', '#C8A2C8');
      root.style.setProperty('--color-primary-10', 'rgba(200, 162, 200, 0.1)');
      root.style.setProperty('--color-primary-20', 'rgba(200, 162, 200, 0.2)');
      root.style.setProperty('--color-primary-30', 'rgba(200, 162, 200, 0.5)');
      root.style.setProperty('--color-primary-90', 'rgba(200, 162, 200, 0.9)');
      root.style.setProperty('--color-accent', '#FFB6C1');
      root.style.setProperty('--color-accent-10', 'rgba(255, 182, 193, 0.1)');
      root.style.setProperty('--color-accent-20', 'rgba(255, 182, 193, 0.2)');
      root.style.setProperty('--color-success', '#D4A017');
      root.style.setProperty('--color-success-10', 'rgba(212, 160, 23, 0.1)');
      root.style.setProperty('--color-success-20', 'rgba(212, 160, 23, 0.2)');
      root.style.setProperty('--color-success-30', 'rgba(212, 160, 23, 0.3)');
      root.style.setProperty('--color-success-40', 'rgba(212, 160, 23, 0.4)');
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    // Set default theme immediately
    const root = document.documentElement;
    root.setAttribute('data-theme', 'walmart');
    root.style.setProperty('--color-primary', '#0072CE');
    root.style.setProperty('--color-primary-10', 'rgba(0, 114, 206, 0.1)');
    root.style.setProperty('--color-primary-20', 'rgba(0, 114, 206, 0.2)');
    root.style.setProperty('--color-primary-30', 'rgba(0, 114, 206, 0.3)');
    root.style.setProperty('--color-primary-90', 'rgba(0, 114, 206, 0.9)');
    root.style.setProperty('--color-accent', '#14B8A6');
    root.style.setProperty('--color-accent-10', 'rgba(20, 184, 166, 0.1)');
    root.style.setProperty('--color-accent-20', 'rgba(20, 184, 166, 0.2)');
    root.style.setProperty('--color-success', '#10B981');
    root.style.setProperty('--color-success-10', 'rgba(16, 185, 129, 0.1)');
    root.style.setProperty('--color-success-20', 'rgba(16, 185, 129, 0.2)');
    root.style.setProperty('--color-success-30', 'rgba(16, 185, 129, 0.3)');
    root.style.setProperty('--color-success-40', 'rgba(16, 185, 129, 0.4)');
    
    const savedUser = localStorage.getItem('currentUser') as UserName | null;
    if (savedUser && (savedUser === 'macray' || savedUser === 'yenna')) {
      setCurrentUserState(savedUser);
      loadUserTheme(savedUser);
    }
  }, []);

  const setCurrentUser = (user: UserName) => {
    setCurrentUserState(user);
    localStorage.setItem('currentUser', user);
    loadUserTheme(user);
  };

  const setThemeForUser = (user: UserName, newTheme: 'walmart' | 'yenna') => {
    localStorage.setItem(`theme_${user}`, newTheme);
    if (currentUser === user) {
      setTheme(newTheme);
      // Apply theme immediately
      const root = document.documentElement;
      root.setAttribute('data-theme', newTheme);
      
      // Force CSS variable update (in case CSS doesn't pick up the attribute change immediately)
      // Set ALL variables to ensure complete theme switch
      if (newTheme === 'walmart') {
        root.style.setProperty('--color-primary', '#0072CE');
        root.style.setProperty('--color-primary-10', 'rgba(0, 114, 206, 0.1)');
        root.style.setProperty('--color-primary-20', 'rgba(0, 114, 206, 0.2)');
        root.style.setProperty('--color-primary-30', 'rgba(0, 114, 206, 0.3)');
        root.style.setProperty('--color-primary-90', 'rgba(0, 114, 206, 0.9)');
        root.style.setProperty('--color-accent', '#14B8A6');
        root.style.setProperty('--color-accent-10', 'rgba(20, 184, 166, 0.1)');
        root.style.setProperty('--color-accent-20', 'rgba(20, 184, 166, 0.2)');
        root.style.setProperty('--color-success', '#10B981');
        root.style.setProperty('--color-success-10', 'rgba(16, 185, 129, 0.1)');
        root.style.setProperty('--color-success-20', 'rgba(16, 185, 129, 0.2)');
        root.style.setProperty('--color-success-30', 'rgba(16, 185, 129, 0.3)');
        root.style.setProperty('--color-success-40', 'rgba(16, 185, 129, 0.4)');
      } else {
        root.style.setProperty('--color-primary', '#C8A2C8');
        root.style.setProperty('--color-primary-10', 'rgba(200, 162, 200, 0.1)');
        root.style.setProperty('--color-primary-20', 'rgba(200, 162, 200, 0.2)');
        root.style.setProperty('--color-primary-30', 'rgba(200, 162, 200, 0.5)');
        root.style.setProperty('--color-primary-90', 'rgba(200, 162, 200, 0.9)');
        root.style.setProperty('--color-accent', '#FFB6C1');
        root.style.setProperty('--color-accent-10', 'rgba(255, 182, 193, 0.1)');
        root.style.setProperty('--color-accent-20', 'rgba(255, 182, 193, 0.2)');
        root.style.setProperty('--color-success', '#D4A017');
        root.style.setProperty('--color-success-10', 'rgba(212, 160, 23, 0.1)');
        root.style.setProperty('--color-success-20', 'rgba(212, 160, 23, 0.2)');
        root.style.setProperty('--color-success-30', 'rgba(212, 160, 23, 0.3)');
        root.style.setProperty('--color-success-40', 'rgba(212, 160, 23, 0.4)');
      }
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, theme, setThemeForUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

