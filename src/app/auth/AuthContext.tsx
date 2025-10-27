'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback, useMemo } from "react";
import decodeJWT from "@/app/utils/decodeJWT";
import instance from "../axiosInstance";
import { tokenStore } from "../utils/tokenStore";
import { usePathname, useRouter } from "next/navigation";
import LoginModal from "../components/LoginModal";
import { ToastProvider } from "../components/Toast";

type User = { email?: string; name?: string } | null;

type AuthContextType = {
  user: User;
  tokenReady: boolean;
  login: (accessToken: string, refreshToken?: string, remember?: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [refreshRetry, setRefreshRetry] = useState(0);
  const router = useRouter();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const pathname = usePathname();
  const forceAuthModal = pathname === '/' && !tokenReady;
  const isModalOpen = forceAuthModal || isAuthModalOpen;

  useEffect(() => {
    if (pathname === '/' && !tokenReady) {
      setAuthModalOpen(true);
    } else {
      setAuthModalOpen(false);
    }
  }, [pathname, tokenReady]);


  const refreshTimer = useRef<number | null>(null);
  const clearTimer = () => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  };

  const getExpMs = (accessToken: string) => {
    const d = decodeJWT(accessToken) as { exp?: number; name?: string; username?: string } | null;
    return d?.exp ? d.exp * 1000 : null;
  };

  const scheduleRefresh = (accessToken: string) => {
    clearTimer();
    const expMs = getExpMs(accessToken);
    if (!expMs) return;
    const skew = 60_000;
    const delay = Math.max(expMs - Date.now() - skew, 5_000);
    refreshTimer.current = window.setTimeout(refreshNow, delay);
  };

  const refreshNow = async () => {
    let rt = tokenStore.getRefresh();
    if (!rt && typeof window !== 'undefined') {
      await new Promise(res => setTimeout(res, 200)); 
      rt = tokenStore.getRefresh();
    }
    if (!rt) {
    console.warn('[Auth] refreshNow: refresh token missing, skip logout.');
    return;
    }
    try {
      const res = await instance.post<{ accessToken: string; refreshToken?: string }>(
        "/auth/refresh",
        { refreshToken: rt },
        { headers: { "Content-Type": "application/json" } }
      );

      const { accessToken: newAT, refreshToken: newRT } = res.data;
      if (!newAT) throw new Error("No access token in refresh");

      tokenStore.setRespectActive(newAT, newRT);

      const d = decodeJWT(newAT) as { name?: string; username?: string } | null;
      setUser({ email: d?.username || "알 수 없음", name: d?.name || "User" });
      setTokenReady(true);
      scheduleRefresh(newAT);
      setRefreshRetry(0);
    } catch {
      if (refreshRetry < 3) {
      setRefreshRetry(n => n + 1);
      setTimeout(refreshNow, 10_000);
      }
    }
  };

  useEffect(() => {
    const at = tokenStore.getAccess();
    if (at) {
      const decoded = decodeJWT(at) as { name?: string; username?: string } | null;
      setUser({ email: decoded?.username || "알 수 없음", name: decoded?.name || "User" });
      setTokenReady(true);
      scheduleRefresh(at);
    } else {
      setUser(null);
      setTokenReady(false);
      clearTimer();
    }

    const onFocus = () => {
      const cur = tokenStore.getAccess();
      if (!cur) return;
      const exp = getExpMs(cur);
      if (exp && exp - Date.now() < 90_000) refreshNow();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onFocus);
      clearTimer();
    };
  }, []);

  const login = (accessToken: string, refreshToken?: string, remember = false) => {
    tokenStore.set(accessToken, refreshToken, remember);
    const d = decodeJWT(accessToken) as { name?: string; username?: string } | null;
    setUser({ email: d?.username || "알 수 없음", name: d?.name || "User" });
    setTokenReady(true);
    scheduleRefresh(accessToken);
  };

  const logout = () => {
    clearTimer();
    tokenStore.clear();
    setUser(null);
    setTokenReady(false);
    const CLEAR_KEYS = [
    'lastCat',
    'lastSort',
    'comingBackExpect',
    'catIntent',
  ];
  try {
    CLEAR_KEYS.forEach(k => sessionStorage.removeItem(k));
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('lastPage:')) {
        sessionStorage.removeItem(key);
        i--;
      }
    }
  } catch {}
    router.replace('/');
    setAuthModalOpen(true);
  };

  const ctxValue = useMemo(
    () => ({ user, tokenReady, login, logout }),
    [user, tokenReady]
  );

  return (
    <AuthContext.Provider value={ctxValue}>
      <ToastProvider>
        {children}
        <LoginModal
          isOpen={false}
          onClose={() => {
          if (tokenReady || forceAuthModal) setAuthModalOpen(false); }}
          onGoSignup={() => {
            setAuthModalOpen(false);
            router.push('/signup');
          }}
        />
      </ToastProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
