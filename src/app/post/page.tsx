'use client'

import { useState, useMemo, useRef, useEffect } from "react";
import instance from "../axiosInstance";
import useIsMobile from "../hooks/useIsMobile";
import decodeJWT from "../utils/decodeJWT";
import Sidebar from "../components/Sidebar";
import CommonInputBox from "../components/CommonInputBox";

const CATEGORY_LABEL = {
  NOTICE: "공지",
  FREE: "자유",
  QNA: "Q&A",
  ETC: "기타",
} as const;

const CATEGORY_COLOR = {
  NOTICE: "bg-[#ead0d1]",
  FREE: "bg-[#d5ebd6]",
  QNA: "bg-[#f8f5c6]",
  ETC: "bg-[#e3f6f4]",
} as const;

type CategoryKey = keyof typeof CATEGORY_LABEL;

export default function Write() {
  const [touched, setTouched] = useState(false);
  const [search, setSearch] = useState("");
  const { isMobile, isTablet, isXs, isSm, isMd, isLg } = useIsMobile();
  const [user, setUser] = useState<{ email?: string; name?: string }>({});
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryKey | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);



  const isResponsive = isSm;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        category: category as CategoryKey,
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

      setTitle('');
      setContent('');
      setCategory('');
      clearFile();
      alert('게시글이 등록되었습니다.');
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
        <div className="flex flex-row w-full justify-center items-center gap-3 max-w-6xl mx-auto my-6">
          <div className="flex flex-row gap-2 mr-5">
            <div className="font-bold text-2xl">카테고리를 선택해주세요.</div>
            <div className="font-bold text-2xl text-red-400">(필수)</div>
          </div>

          {(['NOTICE', 'FREE', 'QNA', 'ETC'] as CategoryKey[]).map((key) => {
            const active = category === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={
                  `cursor-pointer font-bold px-3 py-1 rounded-lg border border-black bg-white text-gray-700 text-2xl hover:bg-gray-200 transition ` +
                  (active ? `${CATEGORY_COLOR[key]} ring-2 ring-black` : '')
                }
                aria-pressed={active}
              >
                {CATEGORY_LABEL[key]}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col w-full my-6 max-w-6xl">
          <div className="flex flex-row gap-4 items-center">
            <div className="font-bold text-2xl">첨부파일 등록</div>
            <div className="font-bold text-2xl text-red-400">(선택)</div>

            <button
              type="button"
              onClick={handlePickFile}
              className="bg-white text-black rounded-lg h-[48px] px-5 text-xl font-bold hover:bg-gray-200"
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
            <div className="mt-3 flex items-center gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-48 h-48 p-3 object-cover rounded-md bg-white"
                />
              )}
              <div className="text-lg">
                <div className="font-semibold">{file.name}</div>
                <div className="text-sm opacity-80">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="ml-auto bg-red-500 hover:bg-red-600 cursor-pointer rounded-md px-3 py-2 text-white"
              >
                제거
              </button>
            </div>
          )}
        </div>
        {/* Title */}
        <div className="flex flex-row w-full gap-10 mb-5 max-w-6xl">
          <CommonInputBox 
            placeholder="게시글 제목을 입력해주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            containerClassName="flex-1 h-fit"
            inputClassName="text-2xl font-bold"
          />
        </div>
        <div className="w-full max-w-6xl">
          <textarea
            placeholder="게시글 내용을 입력해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[280px] rounded-xl p-4 text-xl bg-white text-black outline-none border border-gray-700"
          />
        </div>
        <div className="w-full max-w-6xl flex justify-end pt-5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-5 py-3 rounded-lg text-xl font-bold transition
              ${canSubmit ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
          >
            {submitting ? '작성 중…' : '작성완료'}
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
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm">{user.email}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
