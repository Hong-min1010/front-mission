'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import instance from '../axiosInstance';
import decodeJWT from '../utils/decodeJWT';
import Sidebar from '../components/Sidebar';
import CommonInputBox from '../components/CommonInputBox';
import useIsMobile from '../hooks/useIsMobile';
import useCategories from '../hooks/useCategories';

interface BoardDetail {
  id: number;
  title: string;
  content: string;
  boardCategory: string;
  imageUrl?: string | null;
  createdAt: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://front-mission.bigs.or.kr';

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardId = searchParams.get('id');

  const { isSm } = useIsMobile();
  const isResponsive = isSm;

  const [user, setUser] = useState<{ email?: string; name?: string }>({});
  const [detail, setDetail] = useState<BoardDetail | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { labels, keys, loading: catLoading, error: catError } = useCategories();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUser({
          email: decoded.username || '알 수 없음',
          name: decoded.name || 'User',
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!boardId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await instance.get(`/boards/${boardId}`);
        const data = res.data as BoardDetail;
        setDetail(data);
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.boardCategory);
        if (data.imageUrl) {
          const resolved = data.imageUrl.startsWith('http')
            ? data.imageUrl
            : `${API_BASE}${data.imageUrl}`;
          setPreviewUrl(resolved);
        }
      } catch (e) {
        console.error(e);
        alert('게시글 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [boardId]);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handlePickFile = () => fileInputRef.current?.click();
  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!boardId) return;
    if (!title.trim() || !content.trim() || !category) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

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
      if (file) form.append('file', file);

      await instance.patch(`/boards/${boardId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('게시글이 수정되었습니다.');
      router.push(`/boards/${boardId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-row h-screen bg-gray-700 text-white overflow-hidden">
      {!isResponsive && (
        <Sidebar
          user={user}
          search={''}
          setSearch={() => {}}
          touched={false}
          setTouched={() => {}}
          showSearch={false}
        />
      )}

      <main className="flex flex-col flex-1 min-h-0 overflow-y-auto relative p-5 items-center">
        <div className="w-full max-w-5xl flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold">게시글 수정</h1>
            <button
              onClick={() => router.back()}
              className="bg-white text-gray-700 px-4 flex items-center cursor-pointer py-2 rounded-lg hover:bg-gray-200"
            >
              <span className="material-symbols-outlined">keyboard_backspace</span>
              뒤로가기
            </button>
          </div>

          {loading && (
            <div className="w-full bg-gray-600 animate-pulse rounded-xl h-40" />
          )}

          {!loading && detail && (
            <>
              <div className="flex flex-wrap gap-3 my-2">
                {catLoading && (
                  <span className="text-sm opacity-80">카테고리 불러오는 중…</span>
                )}
                {catError && (
                  <span className="text-sm text-red-300">
                    카테고리를 불러오지 못했습니다.
                  </span>
                )}
                {!catLoading &&
                  !catError &&
                  keys.map((k) => {
                    const isActive = category === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setCategory(k)}
                        className={`cursor-pointer font-bold px-3 py-1 rounded-lg border transition text-base sm:text-xl
                          ${isActive ? 'bg-gray-700 text-white border-white' : 'bg-white text-gray-700 hover:bg-gray-200 border-white'}`}
                      >
                        {labels[k]}
                      </button>
                    );
                  })}
              </div>
              <CommonInputBox
                placeholder="게시글 제목을 입력해주세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                containerClassName="w-full text-black"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="게시글 내용을 입력해주세요."
                className="w-full min-h-[280px] rounded-xl p-4 text-xl bg-white text-black outline-none border border-gray-700"
              />
              <div className="flex flex-col gap-2">
                <div className="flex gap-3 items-center">
                  <button
                    onClick={handlePickFile}
                    className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                  >
                    이미지 선택
                  </button>
                  {file && (
                    <button
                      onClick={clearFile}
                      className="bg-red-500 px-3 py-2 rounded-lg text-white hover:bg-red-600"
                    >
                      제거
                    </button>
                  )}
                </div>
                {(previewUrl || detail.imageUrl) && (
                  <div className="w-full max-w-[420px] sm:max-w-[480px]">
                    <img
                      src={previewUrl || detail.imageUrl || ''}
                      alt="미리보기"
                      className="w-full h-auto max-h-[50vh] object-contain rounded-lg bg-white mt-2"
                    />
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`px-6 py-3 rounded-lg text-xl font-bold transition cursor-pointer ${
                      submitting
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {submitting ? '수정 중…' : '수정 완료'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
