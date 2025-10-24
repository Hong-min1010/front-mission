'use client'

import { useState, useMemo, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import useIsMobile from "./hooks/useIsMobile";
import instance from "./axiosInstance";
import decodeJWT from "./utils/decodeJWT";
import Sidebar from "./components/Sidebar";
import Link from "next/link";

const CATEGORY_LABEL = {
  NOTICE: "공지",
  FREE: "자유",
  QNA: "Q&A",
  ETC: "기타",
};

const CATEGORY_COLOR = {
  NOTICE: "bg-[#ead0d1]",
  FREE: "bg-[#d5ebd6]",
  QNA: "bg-[#f8f5c6]",
  ETC: "bg-[#e3f6f4]",
};

interface Post {
  id: number;
  title: string;
  category: keyof typeof CATEGORY_LABEL;
  createdAt: string;
  author?: { name?: string, email?: string } | null;
  authorName?: string;
  authorEmail?: string;
}

export default function Home() {
  const [touched, setTouched] = useState(false);
  const [search, setSearch] = useState("");
  const { isMobile, isTablet, isXs, isSm, isMd, isLg } = useIsMobile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState<{ email?: string; name?: string }>({});

  const isResponsive = isSm;

  const fetchPosts = async (pageNum: number) => {
    try {
      const res = await instance.get(`/boards?page=${pageNum}&size=10`);
      setPosts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      console.log('Posts>>>>', res.data);
      console.log(localStorage.getItem('accessToken'))
    } catch(e) {
      console.log(e);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page])

  const goToPage = (pageNum: number) => {
    if (pageNum >= 0 && pageNum < totalPages) setPage(pageNum);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUser({
          email: decoded.username || "알 수 없음",
          name: decoded.name || "User"
        })
      } else {
        setUser({ name: "Guest", email: "로그인 필요" });
      }
    }
    console.log('user', user)
  }, []);

  return (
    <div className="flex flex-row h-screen bg-gray-700 text-white">
      {!isResponsive && (
        <Sidebar
          user={user}
          search={search}
          setSearch={setSearch}
          touched={touched}
          setTouched={setTouched}
        />
      )}

      {/* MAIN */}
      <main className="flex flex-col w-full relative px-5 items-center">
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
        <div className="flex flex-row w-full justify-end gap-3 max-w-6xl mx-auto my-6">
          <div className="cursor-pointer px-2 py-1 rounded-lg border border-white bg-white text-gray-700">공지</div>
          <div className="cursor-pointer px-2 py-1 rounded-lg border border-white bg-white text-gray-700">자유</div>
          <div className="cursor-pointer px-2 py-1 rounded-lg border border-white bg-white text-gray-700">Q&A</div>
          <div className="cursor-pointer px-2 py-1 rounded-lg border border-white bg-white text-gray-700">기타</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {(posts || []).map((post: Post) => (
            <Link key={post.id} href={`/boards/${post.id}`}>
              <div
                key={post.id}
                className="relative flex flex-row justify-between items-center
                w-full min-w-0
              bg-gray-200 rounded-xl shadow-sm  h-[120px] min-h-[120px] max-h-[120px] overflow-hidden
                cursor-pointer hover:bg-gray-400 sm:min-h-[120px] sm:h-[120px]"
              >
                <div className="flex flex-col px-4 py-3 h-full justify-center">
                  <div className="font-semibold text-black text-xl truncate">{post.title}</div>
                  <div className="text-gray-600 mt-2 text-base">{new Date(post.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}</div>
                </div>
                <div className={`flex items-stretch min-w-[80px] h-full font-bold text-xl justify-center text-black ${CATEGORY_COLOR[post.category as keyof typeof CATEGORY_COLOR]}`}>
                  <span className="flex items-center w-full justify-center h-full">
                    {CATEGORY_LABEL[post.category as keyof typeof CATEGORY_LABEL]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex gap-2 mt-6 mb-10">
          <button onClick={()=>goToPage(page-1)} disabled={page===0} className="px-3 py-1 bg-white text-gray-700 rounded disabled:opacity-50 cursor-pointer">&lt;</button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={()=>goToPage(idx)}
              className={`px-3 py-1 rounded cursor-pointer ${page===idx ? "bg-gray-300 text-black" : "bg-white text-gray-700"}`}
            >
              {idx+1}
            </button>
          ))}
          <button onClick={()=>goToPage(page+1)} disabled={page===totalPages-1} className="px-3 py-1 bg-white text-gray-700 rounded disabled:opacity-50 cursor-pointer">&gt;</button>
        </div>  
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
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm">{user.email}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
