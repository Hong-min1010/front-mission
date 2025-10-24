'use client';

import { useEffect, useState } from 'react';
import instance from '../axiosInstance';

let cachedCategories: Record<string, string> | null = null;

export default function useCategories() {
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (cachedCategories) {
      setLabels(cachedCategories);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await instance.get('/boards/categories');
        const data = (res?.data ?? {}) as Record<string, string>;
        if (!mounted) return;
        setLabels(data);
        cachedCategories = data;
      } catch (e) {
        setError('카테고리를 불러오지 못했습니다.');
        setLabels({});
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const keys = Object.keys(labels);

  return { labels, keys, loading, error };
}
