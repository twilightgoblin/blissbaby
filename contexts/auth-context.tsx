'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('auth-token');
      if (!token) {
        console.log('No auth token found');
        setIsLoading(false);
        return;
      }

      console.log('Fetching user with token...');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User fetched successfully:', data.user.email);
        setUser(data.user);
      } else {
        console.log('Failed to fetch user, status:', response.status);
        // Token is invalid, remove it
        localStorage.removeItem('auth-token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const setUserDirectly = (newUser: User | null) => {
    setUser(newUser);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshUser,
    setUser: setUserDirectly,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}