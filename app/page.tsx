'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import DocTree from '@/app/components/DocTree';
import DocView from '@/app/components/DocViewer'; // 请根据实际文件名调整

function DocPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = searchParams.get('path') || 'index.md';

  const [tree, setTree] = useState([]);
  const [content, setContent] = useState('# 加载中...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/docs/tree')
      .then((res) => res.json())
      .then((data) => setTree(data))
      .catch(() => setTree([]));
  }, []);

  const loadContent = useCallback((path: string) => {
    setLoading(true);
    fetch(`/api/docs/content?path=${encodeURIComponent(path)}`)
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setContent('# 加载失败\n\n请刷新重试。');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (currentPath) {
      loadContent(currentPath);
    }
  }, [currentPath, loadContent]);

  const handleSelect = (path: string) => {
    router.push(`/?path=${encodeURIComponent(path)}`, { scroll: false });
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: '2rem' }}>
      <aside style={{ width: '280px', minWidth: '280px', maxHeight: '100%', overflowY: 'auto', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
        <h3 style={{ marginTop: 0, padding: '0.5rem 0', color: 'var(--text-primary)' }}>
          📚 文档目录
        </h3>
        {tree.length > 0 ? (
          <DocTree tree={tree} currentPath={currentPath} onSelect={handleSelect} />
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>暂无文档</p>
        )}
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem' }}>
        <DocView content={content} loading={loading} />
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>⏳ 加载文档中...</div>}>
      <DocPageContent />
    </Suspense>
  );
}