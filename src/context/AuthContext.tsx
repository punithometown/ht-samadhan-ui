import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_USERS = [
  { email: 'ho@hometown.in', password: 'password123', name: 'HO Administrator', role: Role.HO, location: 'Central HO' },
  { email: 'store@hometown.in', password: 'password123', name: 'Mumbai Store Lead', role: Role.STORE_CSD, location: 'Mumbai Worli' },
  { email: 'warehouse@hometown.in', password: 'password123', name: 'Logistics Head', role: Role.WAREHOUSE, location: 'Bhiwandi Hub' },
  { email: 'delivery@hometown.in', password: 'password123', name: 'Delivery Supervisor', role: Role.DELIVERY, location: 'Mumbai Hub' },
  { email: 'fitter@hometown.in', password: 'password123', name: 'Technical Head', role: Role.FITTER, location: 'Field Services' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('hometown_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const validUser = VALID_USERS.find(u => u.email === email && u.password === password);

    if (validUser) {
      const authUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: validUser.name,
        role: validUser.role,
        email: validUser.email,
        location: validUser.location
      };
      setUser(authUser);
      localStorage.setItem('hometown_user', JSON.stringify(authUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hometown_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
