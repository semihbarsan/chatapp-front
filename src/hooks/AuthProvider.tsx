import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const userData: User = {
          id: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'],
          username: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        };
        setUser(userData);
      } catch (error) {
        console.error("Token çözümleme hatası:", error);
        localStorage.removeItem('userToken');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      const token = response.data.token;
      localStorage.setItem('userToken', token);
      
      const decodedToken: any = jwtDecode(token);
      const userData: User = {
        id: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'],
        username: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      };
      setUser(userData);
      
      setIsLoading(false);
      navigate('/chat');
      return true;
    } catch (error: any) {
      setIsLoading(false);
      console.error('Giriş hatası:', error.response?.data || error.message);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authService.register({ username, email, password, confirmPassword: password });
      setIsLoading(false);
      navigate('/login');
      return true;
    } catch (error: any) {
      setIsLoading(false);
      console.error('Kayıt hatası:', error.response?.data || error.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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