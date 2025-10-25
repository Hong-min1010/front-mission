'use client'

import { useState, useEffect } from "react";
import useIsMobile from "../hooks/useIsMobile";
import LoginModal from "./LoginModal";
import Link from "next/link";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { isXs, isSm, isMd, isLg, isMobile, isTablet } = useIsMobile();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, logout, tokenReady } = useAuth();

  return (
    <header className={`${isMobile ? 'px-5 py-2' : 'px-20 py-4'} border-b border-gray-300 w-full flex items-center justify-between`}>
      <Link href='/'>
        <img src="/assets/bigs_logo.png" alt="Logo" width={100} height={100} />
      </Link>
      <div className="flex items-end justify-end gap-5">
        {!tokenReady ? (
          <>
            <div className="text-black text-lg border-b">
              <button className="cursor-pointer" onClick={() => setIsLoginModalOpen(true)}>
                Login
              </button>
              <LoginModal 
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              onLoginSuccess= {() => setIsLoginModalOpen(false)}/>
            </div>
            <Link href='/signup'>
              <button className="text-black text-lg cursor-pointer border-b">
                Signup
              </button>
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="text-black text-lg font-bold cursor-pointer border-b"
            >
              Logout
            </button>
          </div>)}
      </div>
    </header>
  );
}