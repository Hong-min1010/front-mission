'use client'

import { useState } from "react";
import useIsMobile from "../hooks/useIsMobile";
import LoginModal from "../login/page";

export default function Header() {
const { isXs, isSm, isMd, isLg, isMobile, isTablet } = useIsMobile();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <header className={`${isMobile ? 'px-5 py-2' : 'px-20 py-4'} border-b border-gray-300 w-full flex items-center justify-between`}>
      <img src="/assets/bigs_logo.png" alt="Logo" width={100} height={100} />
      <div className="flex items-end justify-end gap-5">
        <div className="text-black text-lg border-b">
          <button className="cursor-pointer" onClick={() => setIsLoginModalOpen(true)}>
            Login
          </button>
          <LoginModal 
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}/>
        </div>
        <div className="text-black text-lg cursor-pointer border-b">
          Signup
        </div>
        <span className="material-symbols-outlined cursor-pointer !text-[32px] text-black">menu</span>
      </div>
    </header>
  );
}