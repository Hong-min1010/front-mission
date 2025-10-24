'use client'

import { useState, useEffect } from "react";
import useIsMobile from "../hooks/useIsMobile";
import LoginModal from "../login/page";
import Link from "next/link";

export default function Header() {
  const { isXs, isSm, isMd, isLg, isMobile, isTablet } = useIsMobile();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
  }

  return (
    <header className={`${isMobile ? 'px-5 py-2' : 'px-20 py-4'} border-b border-gray-300 w-full flex items-center justify-between`}>
      <Link href='/'>
        <img src="/assets/bigs_logo.png" alt="Logo" width={100} height={100} />
      </Link>
      <div className="flex items-end justify-end gap-5">
        {!isLoggedIn ? (
          <>
            <div className="text-black text-lg border-b">
              <button className="cursor-pointer" onClick={() => setIsLoginModalOpen(true)}>
                Login
              </button>
              <LoginModal 
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              onLoginSuccess= {() => setIsLoggedIn(true)}/>
            </div>
            <Link href='/signup'>
              <button className="text-black text-lg cursor-pointer border-b">
                Signup
              </button>
            </Link>
          </>
        ) : (
          <button
            className="text-black text-lg font-bold cursor-pointer border-b"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
        <span className="material-symbols-outlined cursor-pointer !text-[32px] text-black">menu</span>
      </div>
    </header>
  );
}