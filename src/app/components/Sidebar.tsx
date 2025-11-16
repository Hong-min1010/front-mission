'use client';
import Image from "next/image";
import SearchBar from "./SearchBar";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import useCategories from "../hooks/useCategories";

// 게시글 타입 지정
type Post = { id: number; title: string; category: string; createdAt: string };

// props의 Type 지정
interface SidebarProps {
  user?: { name?: string; email?: string } | null;
  search?: string;
  setSearch?: (value: string) => void;
  touched: boolean;
  setTouched?: (value: boolean) => void;
  showSearch?: boolean;
  posts?: Post[];
}

export default function Sidebar({
  user,
  search,
  setSearch,
  touched,
  setTouched,
  showSearch = true,
  posts = [],
}: SidebarProps) {
  // 사용자 정보를 부모 컴포넌트인 Main에서 props로 전달 받음
  // uesr 객체나 null이나 undefined라면 빈 객체 반환
  const { name = "", email = "" } = user ?? {};
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState<string>(search ?? "");
  const { labels, badgeStyle } = useCategories();

  useEffect(() => setQ(search ?? ""), [search]);
  useEffect(() => {
    const id = setTimeout(() => setSearch?.(q), 200);
    return () => clearTimeout(id);
  }, [q, setSearch]);

  const results = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    if (!term) return [];
    return posts
      .filter(p => p.title?.toLowerCase().includes(term))
      .slice(0, 8);
  }, [q, posts]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(prev => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const picked = results[activeIdx];
      setFocused(false);
      setActiveIdx(-1);
    }
  };

  const open = focused && q.trim().length > 0 && results.length > 0;

  return (
    <aside className="flex flex-col h-full border-r-2 pt-5 border-black bg-gray-600 items-center justify-start px-1 w-[260px] md:w-[280px] lg:w-[320px] xl:w-[360px]">
      <div className="flex flex-col items-center gap-5 px-6 py-2">
        <Image
          src="/assets/profile.png"
          alt="프로필 이미지"
          width={100}
          height={100}
          className="mt-5"
        />
        <div className="font-bold">Name : {name}</div>
        <div className="font-bold">Email: {email}</div>
      </div>
      {showSearch && (
        <div ref={wrapRef} className="w-full relative">
          <div className="bg-white rounded-lg px-2 py-2">
            <SearchBar
              value={q}
              onChange={(e) => {
                setTouched?.(true);
                setQ(e.target.value);
              }}
              onSubmit={() => {}}
              touched={touched ?? false}
              errorMessage="해당 게시글이 존재하지 않습니다."
              placeholder="제목으로 검색하세요"
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setTimeout(() => setFocused(false), 120);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          {open && (
            <div className="absolute left-0 right-0 z-30 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-auto">
              {results.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/boards/${p.id}`}
                  onClick={(e) => {
                    setFocused(false);
                    setActiveIdx(-1);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-100 ${
                    i === activeIdx ? "bg-gray-100" : ""
                  }`}
                >
                  <span className="material-symbols-outlined text-gray-500">article</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{p.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </div>
                  </div>
                  <span
                    style={badgeStyle(p.category)}
                    className="text-[11px] px-2 py-1 whitespace-nowrap transition group-hover:brightness-90"
                  >
                    {labels?.[p.category] ?? p.category}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
