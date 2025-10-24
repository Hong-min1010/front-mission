'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import instance from '../../axiosInstance';
import Sidebar from '../../components/Sidebar';
import decodeJWT from '../../utils/decodeJWT';
import useIsMobile from '../../hooks/useIsMobile';

const CATEGORY_LABEL = {
  NOTICE: '공지',
  FREE: '자유',
  QNA: 'Q&A',
  ETC: '기타',
} as const;

const CATEGORY_COLOR = {
  NOTICE: 'bg-[#ead0d1]',
  FREE: 'bg-[#d5ebd6]',
  QNA: 'bg-[#f8f5c6]',
  ETC: 'bg-[#e3f6f4]',
} as const;

type CategoryKey = keyof typeof CATEGORY_LABEL;

interface BoardDetail {
  id: number;
  title: string;
  content: string;
  boardCategory: CategoryKey;
  imageUrl?: string | null;
  createdAt: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://front-mission.bigs.or.kr';

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isSm } = useIsMobile();

  const [user, setUser] = useState<{ email?: string; name?: string }>({});
  const [detail, setDetail] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isResponsive = isSm;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = decodeJWT(token);
      setUser(
        decoded
          ? { email: decoded.username || '알 수 없음', name: decoded.name || 'User' }
          : { name: 'Guest', email: '로그인 필요' }
      );
    }
  }, []);

  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await instance.get(`/boards/${params.id}`);
        setDetail(res.data as BoardDetail);
      } catch (e) {
        console.error(e);
        setErrorMsg('게시글을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id]);

  const formattedDate = useMemo(() => {
    if (!detail?.createdAt) return '';
    const d = new Date(detail.createdAt);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }, [detail?.createdAt]);

  const resolvedImageUrl = useMemo(() => {
    if (!detail?.imageUrl) return null;
    return detail.imageUrl.startsWith('http')
      ? detail.imageUrl
      : `${API_BASE}${detail.imageUrl}`;
  }, [detail?.imageUrl]);

  return (
    <div className="flex flex-row h-screen bg-gray-700 text-white">
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

      <main className="flex flex-col w-full relative p-5 items-center overflow-auto">
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex px-4 py-2 gap-2 justify-center rounded-lg bg-white text-gray-800 hover:bg-gray-200 cursor-pointer"
            >
              <span className="material-symbols-outlined">keyboard_backspace</span>
              뒤로가기
            </button>
          </div>

          {loading && <div className="w-full bg-gray-600 animate-pulse rounded-xl h-40" />}
          {errorMsg && <div className="w-full p-4 rounded-xl bg-red-500">{errorMsg}</div>}

          {!loading && !errorMsg && detail && (
            <article className="w-full bg-white text-gray-900 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${CATEGORY_COLOR[detail.boardCategory]}`}
                >
                  {CATEGORY_LABEL[detail.boardCategory]}
                </span>
                <span className="text-sm text-gray-500">{formattedDate}</span>
              </div>

              <h1 className="text-3xl font-extrabold mb-4 break-words">{detail.title}</h1>

              {resolvedImageUrl && (
                <div className="w-full mb-5">
                  <img
                    src={resolvedImageUrl}
                    alt="첨부 이미지"
                    className="max-h-[420px] w-full object-contain rounded-lg bg-gray-50"
                  />
                </div>
              )}

              <div className="prose max-w-none whitespace-pre-wrap leading-7 text-lg">
                {detail.content}
              </div>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}
