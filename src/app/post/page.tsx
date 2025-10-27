'use client'

import { useState, useMemo, useRef, useEffect } from "react";
import instance from "../axiosInstance";
import useIsMobile from "../hooks/useIsMobile";
import decodeJWT from "../utils/decodeJWT";
import Sidebar from "../components/Sidebar";
import CommonInputBox from "../components/CommonInputBox";
import useCategories from "../hooks/useCategories";
import { useAuth } from "../auth/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "../components/Toast";


export default function Write() {
  const [touched, setTouched] = useState(false);
  const [search, setSearch] = useState("");
  const { isMobile, isTablet, isXs, isSm, isMd, isLg } = useIsMobile();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, tokenReady } = useAuth();
  const safeUser = user ?? { name: "", email: "" };
  const router = useRouter();
  const { showToast } = useToast();

  const { labels, keys, loading: catLoading, error: catError } = useCategories();

  const isResponsive = isSm;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(!tokenReady) {
      setTitle("")
      setContent("")
      setCategory("")
      setFile(null)
      setPreviewUrl(null)
    }
  }, [tokenReady]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canSubmit = useMemo(
    () => !!title.trim() && !!content.trim() && !!category && !submitting,
    [title, content, category, submitting]
  );

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      const requestPayload = {
        title: title.trim(),
        content: content.trim(),
        category,
      };

      form.append(
        'request',
        new Blob([JSON.stringify(requestPayload)], { type: 'application/json' })
      );

      if (file) {
        form.append('file', file);
      }

      const res = await instance.post('/boards', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const createdId = res?.data?.id;
      showToast({ type: 'success', message: '게시글이 등록되었습니다.' });
      if(createdId) {
        router.replace(`/boards/${createdId}`);
      } else {
        router.replace('/');
      }

      setTitle('');
      setContent('');
      setCategory('');
      clearFile();
    } catch (e) {
      showToast({ type: 'fail', message: '등록 중 오류가 발생했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-row min-h-dvh bg-gray-700 text-white items-stretch">
      {!isResponsive && (
        <div className="sticky top-0 h-dvh overflow-y-auto overflow-x-hidden shrink-0 border-r border-gray-600">
          <Sidebar
            user={user}
            search={search}
            setSearch={setSearch}
            touched={touched}
            setTouched={setTouched}
            showSearch={false}
          />
        </div>
      )}
      {/* MAIN */}
      <main className="flex flex-col flex-1 relative p-5 items-center pb-10">
        <div className="w-full max-w-5xl flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold">게시글 작성</h1>
          <button
            onClick={() => router.back()}
            className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">keyboard_backspace</span>
            뒤로가기
          </button>
        </div>
        <section className="w-full max-w-5xl">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold">카테고리</h2>
            <span className="text-red-400 font-bold">(필수)</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
            {catLoading && <span className="text-sm opacity-80">카테고리 불러오는 중…</span>}
            {catError && <span className="text-sm text-red-300">불러오기 실패</span>}
            {!catLoading && !catError && keys.map((k) => {
              const isActive = category === k;
              return (
                <button
                  key={k}
                  onClick={() => setCategory(k)}
                  className={`cursor-pointer px-2 py-1 text-lg font-bold rounded-lg border transition-all
                    ${isActive
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-500 border-white"}`}
                >
                  {labels[k]}
                </button>
              );
            })}
          </div>
        </section>
        <section className="w-full max-w-5xl mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold">첨부파일 등록</h2>
            <span className="text-red-400 font-semibold">(선택)</span>
            <button
              onClick={handlePickFile}
              className="ml-auto bg-white text-black rounded-lg px-4 sm:px-5 py-2 sm:py-2.5 text-base font-bold hover:bg-gray-200 cursor-pointer"
            >
              첨부파일 추가하기
            </button>
            <input
              id="attachment" name="attachment" ref={fileInputRef} type="file" accept="image/*"
              className="hidden" onChange={handleFileChange}
            />
          </div>
          {file && (
            <div className="mt-4 flex items-start gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-32 h-32 sm:w-48 sm:h-48 p-2 sm:p-3 object-cover rounded-md bg-white"
                />
              )}
              <div className="flex flex-col">
                <div className="font-semibold break-words">{file.name}</div>
                <button
                  onClick={clearFile}
                  className="mt-3 w-fit bg-red-500 hover:bg-red-600 cursor-pointer rounded-md px-3 py-2 text-white text-sm"
                >
                  제거
                </button>
              </div>
            </div>
          )}
        </section>
        {/* Title */}
        <section className="w-full max-w-5xl mt-8">
          <label htmlFor="postTitle" className="block mb-2 text-xl sm:text-2xl font-semibold">
            제목
          </label>
          <CommonInputBox
            id="postTitle"
            name="postTitle"
            placeholder="게시글 제목을 입력해주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            containerClassName="w-full"
            inputClassName="text-lg sm:text-2xl font-bold"
          />
        </section>
        <section className="w-full max-w-5xl mt-6">
          <label htmlFor="postContent" className="block mb-2 text-xl sm:text-2xl font-semibold">
            내용
          </label>
          <textarea
            id="postContent"
            name="postContent"
            placeholder="게시글 내용을 입력해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[240px] sm:min-h-[320px] rounded-xl p-4 text-base sm:text-xl bg-white text-black outline-none border border-gray-700"
          />
        </section>
        <div className="w-full max-w-5xl flex justify-end pt-5">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-lg sm:text-xl font-bold transition cursor-pointer ${
              canSubmit
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            {submitting ? "작성 중…" : "작성완료"}
          </button>
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
              <div className="font-semibold">{safeUser.name}</div>
              <div className="text-sm">{safeUser.email}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
