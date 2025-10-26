'use client';

import { useEffect, useMemo, useState } from 'react';
import instance from '../axiosInstance';
import { useAuth } from '../auth/AuthContext';

type ColorMap = Record<string, { bg: string; text: string }>;

export default function useCategories() {
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<string[]>([]);
  const { tokenReady } = useAuth();

  const DEFAULT_PALETTE: ColorMap = useMemo(() => ({
    NOTICE: { bg: '#ead0d1', text: '#000000' },
    FREE:   { bg: '#d5ebd6', text: '#000000' },
    QNA:    { bg: '#f8f5c6', text: '#000000' },
    ETC:    { bg: '#e3f6f4', text: '#000000' },
  }), []);

  const colorFromKey = (key: string): string => {
    let hash = 0;
    for (let i = 0; i < key.length; i++)
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 85%)`;
  };

  useEffect(() => {
    if(!tokenReady) {
      setLabels({});
      setKeys([]);
      setLoading(false);
      setError(null);
    }

    let cancel = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await instance.get('/boards/categories');
        if (cancel) return;
        const data = res.data || {};
        setLabels(data);
        setLoading(false);
        setKeys(Object.keys(data));
      } catch (e) {
        if (cancel) return;
        setLabels({});
        setKeys([]);
        setError('카테고리 로딩 실패');
        setLoading(false);
      }
    })();
    return (() => {
      cancel = true;
    })
  }, [tokenReady])

  const colors: ColorMap = useMemo(() => {
    const out: ColorMap = { ...DEFAULT_PALETTE };
    for (const k of keys) {
      if (!out[k]) {
        const bg = colorFromKey(k);
        out[k] = { bg, text: '#000000' };
      }
    }
    return out;
  }, [keys, DEFAULT_PALETTE]);

  const badgeStyle = (key: string) => {
    const c = colors[key];
    if (!c) return undefined;
    return {
      background: c.bg,
      color: c.text,
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: '0.5rem',
    } as React.CSSProperties;
  };

    const colorOf = (key: string) => {
    const c = colors[key];
    return c ? c.bg : '#e5e7eb'; // gray-200 fallback
  };
  
  return { labels, keys, loading, error, colors, badgeStyle, colorOf };
}