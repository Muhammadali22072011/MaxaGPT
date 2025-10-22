import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUser = authService.getLoggedInUser();
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
  };

  const register = async (email: string, password: string) => {
    const registeredUser = await authService.register(email, password);
    setUser(registeredUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) throw new Error("User not authenticated");
    await authService.changePassword(user.id, oldPassword, newPassword);
    // No need to setUser as user object itself doesn't change
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, changePassword, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};