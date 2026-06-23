import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../api";
import { setAuthToken, setUnauthorizedHandler } from "../api/axios";
import { normalizeRole } from "../utils/roles";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "laikipia-auth-session";

function getStoredSession() {
  if (typeof window === "undefined") return { user: null, token: null };

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null, token: null };

    const parsed = JSON.parse(raw);
    return {
      user: parsed?.user || null,
      token: parsed?.token || null,
    };
  } catch {
    return { user: null, token: null };
  }
}

const initialSession = getStoredSession();
if (initialSession.token) {
  setAuthToken(initialSession.token);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialSession.user);
  const [token, setToken] = useState(initialSession.token);
  const [loading, setLoading] = useState(false);

  const persistSession = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    setAuthToken(nextToken);

    if (typeof window === "undefined") return;

    if (nextUser && nextToken) {
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: nextUser, token: nextToken }),
      );
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    persistSession(null, null);
  }, [persistSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      try {
        const { data } = await authApi.login(email, password);
        const role = normalizeRole(data.role);
        const nextUser = { email: data.email, role };
        persistSession(nextUser, data.token);
        return nextUser;
      } finally {
        setLoading(false);
      }
    },
    [persistSession],
  );

  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      await authApi.register(formData);
      return { email: formData.email };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      logout,
      register,
    }),
    [user, token, loading, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
