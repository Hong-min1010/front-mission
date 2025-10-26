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
      alert('게시글이 등록되었습니다.');
      if(createdId) {
        router.replace(`/boards/${createdId}`);
      } else {
        router.replace('/');
      }

      setTitle('');
      setContent('');
      setCategory('');
      clearFile();
      console.log('created id:', res?.data?.id);
    } catch (e) {
      console.error(e);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-row h-screen bg-gray-700 text-white">
      {!isResponsive && (
        <Sidebar
          user={user}
          search={search}
          setSearch={setSearch}
          touched={touched}
          setTouched={setTouched}
          showSearch={false}
        />
      )}
      {/* MAIN */}
      <main className="flex flex-col w-full relative p-5 items-center pb-10">
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
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center w-full gap-3 sm:gap-6 max-w-5xl mx-auto my-4 sm:my-6">
          <div className="flex flex-row flex-wrap justify-center items-center gap-2 sm:gap-3">
            <div className="font-bold text-lg sm:text-2xl">카테고리를 선택해주세요.</div>
            <div className="font-bold text-lg sm:text-2xl text-red-400">(필수)</div>
          </div>
          {catLoading && <span className="text-sm opacity-80">카테고리 불러오는 중…</span>}
          {catError && <span className="text-sm text-red-300">불러오기 실패</span>}
          {!catLoading && !catError && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2 sm:mt-0">
              {keys.map((k) => {
                const isActive = category === k;
                return (
                  <button
                    key={k}
                    onClick={() => setCategory(k)}
                    className={`cursor-pointer font-bold rounded-lg border transition px-3 py-1 text-sm sm:text-lg ${
                      isActive
                        ? "bg-gray-700 text-white border-white"
                        : "bg-white text-gray-700 hover:bg-gray-200 border-white"
                    }`}
                  >
                    {labels[k]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-col w-full max-w-5xl my-4 sm:my-6">
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex flex-row gap-1 sm:gap-2 items-center">
              <div className="font-bold text-lg sm:text-2xl">첨부파일 등록</div>
              <div className="font-bold text-lg sm:text-2xl text-red-400">(선택)</div>
            </div>
            <button
              onClick={handlePickFile}
              className="bg-white text-black rounded-lg px-4 sm:px-5 py-2 sm:py-3 text-base sm:text-xl font-bold hover:bg-gray-200 cursor-pointer"
            >
              첨부파일 추가하기
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div className="mt-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-32 h-32 sm:w-48 sm:h-48 p-2 sm:p-3 object-cover rounded-md bg-white"
                />
              )}
              <div className="text-base sm:text-lg">
                <div className="font-semibold">{file.name}</div>
                <div className="text-sm opacity-80">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button
                onClick={clearFile}
                className="ml-0 sm:ml-auto bg-red-500 hover:bg-red-600 cursor-pointer rounded-md px-3 py-2 text-white text-sm sm:text-base"
              >
                제거
              </button>
            </div>
          )}
        </div>
        {/* Title */}
        <div className="flex flex-col w-full gap-3 sm:gap-5 mb-4 sm:mb-6 max-w-5xl">
          <CommonInputBox
            placeholder="게시글 제목을 입력해주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            containerClassName="w-full"
            inputClassName="text-lg sm:text-2xl font-bold"
          />
        </div>
        <div className="w-full max-w-5xl">
          <textarea
            placeholder="게시글 내용을 입력해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[240px] sm:min-h-[320px] rounded-xl p-3 sm:p-4 text-base sm:text-xl bg-white text-black outline-none border border-gray-700"
          />
        </div>
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
