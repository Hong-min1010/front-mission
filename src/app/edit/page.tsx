'use client';

import { Suspense } from 'react';
import EditPageInner from './EditPageInner';

export const dynamic = 'force-dynamic';

export default function EditPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">로딩 중…</div>}>
      <EditPageInner />
    </Suspense>
  );
}
