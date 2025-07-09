'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { authService } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nombre: string, apellido: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Inicializar autenticación
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Intentar obtener usuario del servidor
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            authService.setStoredUser(userData);
          } catch (error) {
            // Si falla, usar datos del localStorage
            const storedUser = authService.getStoredUser();
            if (storedUser) {
              setUser(storedUser);
            } else {
              // Si no hay datos válidos, hacer logout
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await authService.login({ email, password });
      const userData = await authService.getCurrentUser();
      setUser(userData);
      authService.setStoredUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, nombre: string, apellido: string) => {
    try {
      const userData = await authService.register({ email, password, nombre, apellido });
      // Después del registro, hacer login automático
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
