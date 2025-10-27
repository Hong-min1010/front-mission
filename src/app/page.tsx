'use client'

import { useState, useEffect, useRef, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import useIsMobile from "./hooks/useIsMobile";
import instance from "./axiosInstance";
import Sidebar from "./components/Sidebar";
import Link from "next/link";
import useCategories from "./hooks/useCategories";
import { useAuth } from "./auth/AuthContext";

interface Post {
  id: number;
  title: string;
  createdAt: string;
  category: string;
}

type PageResp = { content: Post[]; totalPages: number };
type SortOrder = 'latest' | 'oldest';

export default function Home() {
  const [touched, setTouched] = useState(false);
  const [search, setSearch] = useState("");
  const { isMobile, isTablet, isXs, isSm, isMd, isLg } = useIsMobile();
  const [page, setPage] = useState(0);
  const { labels, keys, loading: catLoading, error: catError, badgeStyle } = useCategories();
  const [selectedCat, setSelectedCat] = useState('');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const { user, tokenReady } = useAuth();
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const PAGE_KEY = 'lastPage';
  const CAT_KEY  = 'lastCat';
  const SORT_KEY = 'lastSort';
  const COMING_BACK = 'comingBackExpect';
  const CAT_INTENT  = 'catIntent';

  const pageKeyFor = (cat: string, sort: SortOrder) =>
    `${PAGE_KEY}:${cat || 'ALL'}:${sort}`;

  const safeUser = user ?? { name: "", email: "" };

  const isResponsive = isSm;

  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if(!tokenReady) {
      const key = "loginModalShown";
      if(!sessionStorage.getItem(key)) {
        window.dispatchEvent(new Event("OPEN_LOGIN_MODAL"));
        sessionStorage.setItem(key, "1");
      }
    }
  }, [tokenReady]);

  useEffect(() => {
    if (!tokenReady) {
      setAllPosts([]);
      return;
    };
    
    (async () => {
      try {
        const first = await fetchPage(0);
        let merged = first.content ?? [];
        for (let p = 1; p < (first.totalPages ?? 1); p++) {
          const next = await fetchPage(p);
          merged = merged.concat(next.content ?? []);
        }
        setAllPosts(merged);
      } catch {
        setAllPosts([]);
      }
    })();
  }, [tokenReady]);

  const fetchPage = async (pageNum: number): Promise<PageResp> => {
    const res = await instance.get("/boards", {
      params: { page: pageNum, size: 50 },
    });
    return res.data as PageResp;
  };

  useEffect(() => {
    if(!tokenReady) return;
    (async () => {
      try {
        const first = await fetchPage(0);
        let merged = first.content ?? [];
        for (let p = 1; p < (first.totalPages ?? 1); p++) {
          const next = await fetchPage(p);
          merged = merged.concat(next.content ?? []);
        }
        setAllPosts(merged);
      } catch (e) {
        setAllPosts([]);
      }
    })();
  }, [tokenReady]);

  useEffect(() => {
    const savedCat  = sessionStorage.getItem(CAT_KEY);
    const savedSort = sessionStorage.getItem(SORT_KEY);
    if (savedCat) setSelectedCat(savedCat);
    if (savedSort === 'latest' || savedSort === 'oldest') {
      setSortOrder(savedSort as SortOrder);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(CAT_KEY, selectedCat);
  }, [selectedCat]);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    sessionStorage.setItem(pageKeyFor(selectedCat, sortOrder), String(page));
  }, [page, selectedCat, sortOrder]);

  useEffect(() => {
    sessionStorage.setItem(SORT_KEY, sortOrder);
  }, [sortOrder]);


  const PAGE_SIZE = 10;
  const term = search.trim().toLowerCase();
  let filtered = selectedCat
    ? allPosts.filter((p) => p.category === selectedCat)
    : allPosts;

  if(term) {
    filtered = filtered.filter((p) => p.title?.toLowerCase().includes(term));
  }

  const sorted = [...filtered].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return sortOrder === 'latest' ? (tb - ta) : (ta - tb);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const visible = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    const intent = sessionStorage.getItem(CAT_INTENT);
    const comingBack = sessionStorage.getItem(COMING_BACK) === '1';

    const listReady = allPosts.length > 0;

    if(!listReady) {
      return;
    }

    if (intent === 'user' && !comingBack) {
      setPage(0);
      hasRestoredRef.current = true;
    } else {
      const saved = sessionStorage.getItem(pageKeyFor(selectedCat, sortOrder));
      const maxPage = Math.max(0, Math.ceil(sorted.length / PAGE_SIZE) - 1);
      const target = Math.min(saved ? Number(saved) : 0, maxPage);
      setPage(target);
      hasRestoredRef.current = true;
    }
    sessionStorage.removeItem(CAT_INTENT);
    sessionStorage.removeItem(COMING_BACK);
  }, [selectedCat, sortOrder, allPosts, search, PAGE_SIZE]);

  const goToPage = (pageNum: number) => {
    if (pageNum >= 0 && pageNum < totalPages) setPage(pageNum);
  };

  return (
    <div className="flex flex-row min-h-dvh bg-gray-700 text-white items-stretch">
      {!isResponsive && (
        <div className="sticky top-0 h-dvh overflow-y-auto overflow-x-hidden shrink-0 border-r border-gray-600">
          <Sidebar
            user={safeUser}
            search={search}
            setSearch={setSearch}
            touched={touched} 
            setTouched={setTouched} 
            showSearch
            posts={allPosts}
          />
        </div>
      )}

      {/* MAIN */}
      <main className="flex flex-col flex-1 relative px-5 items-center">
        {isResponsive && (
          <div className="w-full px-4 pt-2">
            <SearchBar
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setTouched(true)
                setPage(0)
              }}
              onSubmit={() => {
                setTouched(true);
                setPage(0);
              }}
              touched={touched}
              errorMessage="해당 게시글이 존재하지 않습니다."
            />
          </div>
        )}
        {tokenReady && (
          <>
            <div className="flex flex-row w-full justify-end gap-3 max-w-6xl mx-auto my-6">
              <button
                onClick={() => {
                  sessionStorage.setItem(CAT_INTENT, 'user');
                  setSelectedCat("");
                }}
                disabled={!tokenReady}
                className={`cursor-pointer px-2 py-1 text-lg font-bold rounded-lg border transition-all
                  ${selectedCat === ""
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-500 border-white"}`}
              >
                전체
              </button>
              {catLoading && (
                <div className="text-sm opacity-80">카테고리 불러오는 중…</div>
              )}
              {catError && (
                <div className="text-lg text-red-300 flex items-center">로그인 후 이용해주세요.</div>
              )}
              {!catLoading && !catError && keys.map((k) => {
                const isActive = selectedCat === k;
                return (
                  <button
                    key={k}
                    onClick={() => {
                      sessionStorage.setItem(CAT_INTENT, 'user');
                      setSelectedCat(k);
                    }}
                    className={`cursor-pointer px-2 py-1 text-lg font-bold hover:bg-gray-500 rounded-lg border border-white text-gray-700
                    ${isActive ? "bg-gray-700 text-white" : "bg-white text-gray-700 hover:bg-gray-500 border-white" } `}
                  >
                    {labels[k]}
                  </button>
                )
              })}
            </div>
          </>
        )}
        {tokenReady && (
          <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 -mt-2 mb-4 flex items-center justify-end gap-5">
            <div className="relative">
              <select
                id="sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                aria-label="정렬"
                className="peer w-fit appearance-none bg-white/95 backdrop-blur text-gray-800 rounded-xl border border-gray-300 shadow-sm px-4 pr-10 py-2 outline-none"
              >
                <option value="latest">최신글</option>
                <option value="oldest">오래된글</option>
              </select>
              <span className="pointer-events-none material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                expand_more
              </span>
            </div>

            <Link
              href="/post"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 hover:bg-gray-200 font-bold cursor-pointer"
            >
              글쓰기
              <span className="material-symbols-outlined text-base">edit</span>
            </Link>
          </div>
        )}
        {tokenReady && (
          <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto px-3 sm:px-4">
            {(visible || []).map((post: Post) => (
              <Link
                key={post.id}
                href={`/boards/${post.id}`}
                onClick={() => {
                  sessionStorage.setItem(CAT_KEY, selectedCat);
                  sessionStorage.setItem(SORT_KEY, sortOrder);
                  sessionStorage.setItem(pageKeyFor(selectedCat, sortOrder), String(page));
                  sessionStorage.setItem(COMING_BACK, '1');
                }}
              >
                <div
                  className="relative w-full min-w-0
                bg-gray-200 rounded-xl shadow-sm
                  cursor-pointer hover:bg-gray-400
                  flex items-stretch
                  h-[100px] sm:h-[120px] overflow-hidden
                  group"
                >
                  <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-center">
                    <div className="font-semibold text-black text-base sm:text-xl truncate">{post.title}</div>
                    <div className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-base truncate">{new Date(post.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-center 
                    font-bold text-sm sm:text-lg md:text-xl 
                    text-black w-16 sm:w-20 md:w-24 lg:w-28 
                    h-full px-2 flex-shrink-0 transition
                    group-hover:brightness-90 
                    rounded-none rounded-r-xl"
                    style={{...badgeStyle(post.category),
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderTopRightRadius: '0.75rem',
                      borderBottomRightRadius: '0.75rem',
                    }}
                  >
                    <span className="whitespace-nowrap">
                      {labels[post.category] ?? post.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {tokenReady && (
          <div className="flex gap-2 mt-6 mb-10">
            <button onClick={()=>goToPage(page-1)} disabled={page===0} aria-disabled={page === 0} tabIndex={page === 0 ? -1 : 0} 
            type="button"
            className="px-3 py-1 rounded bg-white text-gray-700 cursor-pointer
              focus:outline-none active:translate-y-0">&lt;</button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const isCurrent = page === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToPage(idx)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`px-3 py-1 rounded cursor-pointer focus:outline-none active:translate-y-0
                    ${isCurrent ? "bg-gray-300 text-black" : "bg-white text-gray-700 hover:bg-gray-200"}`}
                >
                  {idx + 1}
                </button>
              );
            })}
            <button onClick={()=>goToPage(page+1)} disabled={page===totalPages-1} aria-disabled={page === totalPages -1} tabIndex={page === totalPages -1 ? -1 : 0} 
            type="button"
            className="px-3 py-1 rounded bg-white text-gray-700 cursor-pointer
              focus:outline-none active:translate-y-0">&gt;</button>
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
              <div className="font-semibold">{safeUser.name}</div>
              <div className="text-sm">{safeUser.email}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
