'use client';

import { useEffect, useState } from 'react';
import instance from '../axiosInstance';
import { useAuth } from '../auth/AuthContext';

export default function useCategories() {
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<string[]>([]);
  const { tokenReady } = useAuth();

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
  
  return { labels, keys, loading, error };
}