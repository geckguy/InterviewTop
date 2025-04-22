// src/hooks/useAuth.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { currentUser } from '@/api/auth';

interface AuthCtxShape {
  isAuthenticated: boolean;
  user: any;
  login: (token: string) => void;
  logout: () => void;
}

const AuthCtx = createContext<AuthCtxShape>({} as AuthCtxShape);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token') || null,
  );
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('[Auth] useEffect ➞ token =', token);
    if (!token) {
      console.log('[Auth] no token, skipping /me');
      setLoading(false);
      return;
    }

    currentUser()
      .then((res) => {
        console.log('[Auth] /me success ➞', res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.warn('[Auth] /me failed ➞', err);
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => {
        console.log('[Auth] done loading');
        setLoading(false);
      });
  }, [token]);

  const login = (newToken: string) => {
    console.log('[Auth] login ➞ setting token');
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setLoading(true); // re‑trigger /me
  };

  const logout = () => {
    console.log('[Auth] logout');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  console.log('[Auth] render ➞ loading =', loading, 'isAuth =', !!token);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading…
      </div>
    );
  }

  return (
    <AuthCtx.Provider
      value={{ isAuthenticated: !!token, user, login, logout }}
    >
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
