// src/contexts/AuthContext.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, ReactNode, useEffect, useState } from 'react';
import { API_URL, fetchJson, getAuthHeader, getStoredToken, setStoredToken } from '../lib/api';
import type { Branch, User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  branch: Branch | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe(token?: string | null) {
    const t = token ?? getStoredToken();
    if (!t) {
      setUser(null);
      setBranch(null);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchJson<User>(`${API_URL}/me`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });

      setUser(data ?? null);
      setBranch((data as any)?.branch ?? null);
    } catch (err) {
      console.warn('Failed to load /me', err);
      setUser(null);
      setBranch(null);
      setStoredToken(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadMe();
      setLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const payload = { email, password };
      const res = await fetchJson<{ user: User; token: string }>(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const token = res.token ?? (res as any).access_token ?? null;
      const userObj = res.user ?? (res as any);

      if (!token) throw new Error('No token received from server');

      setStoredToken(token);
      setUser(userObj ?? null);
      setBranch((userObj as any)?.branch ?? null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // call logout endpoint (protected)
      await fetchJson(`${API_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
    } catch (err) {
      console.warn('Logout error', err);
    } finally {
      setStoredToken(null);
      setUser(null);
      setBranch(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, branch, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
