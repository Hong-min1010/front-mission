'use client'

import { useState } from "react";
import SearchBar from "./components/SearchBar";
import useIsMobile from "./hooks/useIsMobile";

export default function Home() {
  const [touched, setTouched] = useState(false);
  const [search, setSearch] = useState("");
  const { isMobile, isTablet, isXs, isSm, isMd, isLg } = useIsMobile();

  const isResponsive = isSm;

  return (
    <div className="flex flex-row h-screen bg-gray-700 text-white">
      {!isResponsive && (
        <div className='flex flex-col w-fit h-full border-r-2 border-black bg-gray-600 items-center justify-start px-1'>
          <div className="flex flex-col items-center gap-5 px-6 py-2">
            <img 
              src="/assets/profile.png"
              alt="commonProfile"
              width={100}
              height={100}
              className="mb-5"
            />
            <div>UserEmail@gmail.com</div>
            <div>UserName</div>
          </div>
          <div className="w-full bg-white rounded-lg px-2 py-2">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSubmit={() => {}}
              touched={touched}
              errorMessage="해당 게시글이 존재하지 않습니다."
            />
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="flex flex-col w-full relative">
        <div className="flex flex-row pt-8 pb-2 px-6 justify-end gap-3">
          <div className="cursor-pointer px-1 rounded-lg border border-white">공지</div>
          <div className="cursor-pointer px-1 rounded-lg border border-white">자유</div>
          <div className="cursor-pointer px-1 rounded-lg border border-white">Q&A</div>
          <div className="cursor-pointer px-1 rounded-lg border border-white">기타</div>
        </div>
        
        {isResponsive && (
          <div className="w-full px-4 pt-2">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSubmit={() => {}}
              touched={touched}
              errorMessage="해당 게시글이 존재하지 않습니다."
            />
          </div>
        )}
        {isResponsive && (
          <div className="fixed right-4 bottom-4 z-50 group">
            <img
              src="/assets/profile.png"
              alt="commonProfile"
              width={48}
              height={48}
              className="rounded-full shadow-lg cursor-pointer"
            />
            <div className="absolute bottom-14 right-0 bg-white text-black rounded-lg px-3 py-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto min-w-[150px]">
              <div className="font-semibold">UserName</div>
              <div className="text-sm">UserEmail@gmail.com</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
