import { useState, useEffect } from "react";

const SMALL_MOBILE_BREAKPOINT = 360;
const MOBILE_BREAKPOINT = 1000;
const TABLET_BREAKPOINT = 1280;

interface UseIsMobileReturn {
  isMobile: boolean;
  isTablet: boolean;
  isSmallMobile: boolean;
}

export default function useIsMobile(): UseIsMobileReturn {
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false);
  const [isTablet, setIsTablet] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth > MOBILE_BREAKPOINT && window.innerWidth <= TABLET_BREAKPOINT : false);
  const [isSmallMobile, setIsSmallMobile] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth <= SMALL_MOBILE_BREAKPOINT : false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallMobile(window.innerWidth <= SMALL_MOBILE_BREAKPOINT);
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
      setIsTablet(window.innerWidth > MOBILE_BREAKPOINT && window.innerWidth <= TABLET_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, isTablet, isSmallMobile };
}