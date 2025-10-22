'use client'

import useIsMobile from "../hooks/useIsMobile";

export default function Header() {
    const { isTablet, isMobile, isSmallMobile } = useIsMobile();
    
    return (
    <header className={`${isMobile ? 'px-5 py-2' : 'px-20 py-4'} border-b border-gray-300 w-full flex items-center justify-between`}>
      <img src="/assets/bigs_logo.png" alt="Logo" width={100} height={100} />
      <div className="flex items-end justify-end">
        <span className="material-symbols-outlined cursor-pointer !text-[32px] text-black">menu</span>
      </div>
    </header>
  );
}