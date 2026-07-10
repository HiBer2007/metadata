'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import DocTree from '@/app/components/DocTree';
import DocView from '@/app/components/DocViewer';

function DocPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = searchParams.get('path') || 'index.md';

  const [tree, setTree] = useState([]);
  const [content, setContent] = useState('# 加载中...');
  const [loading, setLoading] = useState(true);

  // 加载文档树
  useEffect(() => {
    fetch('/api/docs/tree')
      .then((res) => res.json())
      .then((data) => setTree(data))
      .catch(() => setTree([]));
  }, []);

  // 加载文档内容
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
    <>
      <header className="header-bar">
        <h1>📚 HiBerNET 元数据服务</h1>
      </header>
      <div className="main-container">
        <aside className="sidebar">
          <div style={{ paddingBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            文档目录
          </div>
          {tree.length > 0 ? (
            <DocTree tree={tree} currentPath={currentPath} onSelect={handleSelect} />
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>暂无文档</p>
          )}
        </aside>
        <main className="content-area">
          <DocView content={content} loading={loading} />
        </main>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>⏳ 加载文档中...</div>}>
      <DocPageContent />
    </Suspense>
  );
}