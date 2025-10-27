'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import instance from '../../axiosInstance';
import Sidebar from '../../components/Sidebar';
import decodeJWT from '../../utils/decodeJWT';
import useIsMobile from '../../hooks/useIsMobile';
import { useToast } from '@/app/components/Toast';
import useCategories from '@/app/hooks/useCategories';

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

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isSm } = useIsMobile();

  const [user, setUser] = useState<{ email?: string; name?: string }>({});
  const [detail, setDetail] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();
  const { labels, badgeStyle, loading: catLoading, error: catError } = useCategories();

  const isResponsive = isSm;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = decodeJWT(token);
      setUser(
        decoded
          ? { email: decoded.username || '알 수 없음', name: decoded.name || 'User' }
          : { name: '', email: '' }
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
        setErrorMsg('게시글을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id]);

  const handleClickDelete = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await instance.delete(`/boards/${params.id}`);
      showToast({ type: 'success', message: '게시글이 삭제되었습니다.' });
      setConfirmOpen(false);
      router.replace('/');
    } catch(e) {
      setConfirmOpen(false);
      showToast({ type: 'fail', message: '삭제에 실패했습니다. 다시 시도해주세요.' })
    } finally {
      setDeleting(false);
    }
  };

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

  const onEdit = () => {
    router.push(`/edit?id=${params.id}`);
  };

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
            <div className='flex gap-2'>
              <button
                onClick={onEdit}
                disabled={loading}
                className={`px-4 py-2 rounded-lg ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'} `}
              >
                수정
              </button>
              <button
                onClick={handleClickDelete}
                disabled={loading || deleting}
                className={`px-4 py-2 rounded-lg ${loading || deleting ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 cursor-pointer'} `}
              >
                {deleting ? '삭제 중' : '삭제'}
              </button>
            </div>
          </div>

          {loading && <div className="w-full bg-gray-600 animate-pulse rounded-xl h-40" />}
          {errorMsg && <div className="w-full p-4 rounded-xl bg-red-500">{errorMsg}</div>}

          {!loading && !errorMsg && detail && (
            <article className="w-full bg-white text-gray-900 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className='px-3 py-1 rounded-lg text-sm font-semibold'
                  style={badgeStyle(detail.boardCategory)}
                >
                  {labels[detail.boardCategory] ?? detail.boardCategory}
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
        {catLoading && <div className="mt-4 text-sm opacity-80">카테고리 불러오는 중…</div>}
        {catError && <div className="mt-4 text-sm text-red-300">카테고리 로딩 실패</div>}

        {confirmOpen && (
          <div
            className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setConfirmOpen(false);
            }}
          >
            <div className="relative w-[min(92vw,360px)] rounded-xl bg-white shadow-xl border border-black/10 p-5">
              <button
                aria-label="닫기"
                className="absolute right-3 top-3 text-black/70 hover:text-black transition cursor-pointer"
                onClick={() => setConfirmOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="mt-2 mb-5 text-center text-black font-semibold">
                정말 삭제하시겠습니까 ?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className={`flex-1 h-10 rounded-lg text-white font-bold transition cursor-pointer ${
                    deleting ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  삭제
                </button>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 text-black font-bold transition cursor-pointer"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
