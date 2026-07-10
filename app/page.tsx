'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DocTree from '@/components/DocTree';
import DocView from '@/components/DocView';

interface DocNode {
  type: 'file' | 'directory';
  name: string;          // 原始文件名（无扩展名）或目录名
  title: string;         // 显示标题（文件取自 # 标题，目录仍用 name）
  path: string;
  children?: DocNode[];
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = searchParams.get('path') || 'index.md';

  const [tree, setTree] = useState<DocNode[]>([]);
  const [content, setContent] = useState<string>('# 加载中...');
  const [loading, setLoading] = useState(true);

  // 加载文档树
  useEffect(() => {
    fetch('/api/docs/tree')
      .then((res) => res.json())
      .then((data) => setTree(data))
      .catch(() => setTree([]));
  }, []);

  // 加载当前文档内容
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

  // 路径变化时加载内容
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
      {/* 左侧目录树 */}
      <aside
        style={{
          width: '280px',
          minWidth: '280px',
          maxHeight: '100%',
          overflowY: 'auto',
          borderRight: '1px solid var(--border-color)',
          paddingRight: '1rem',
        }}
      >
        <h3 style={{ marginTop: 0, padding: '0.5rem 0', color: 'var(--text-primary)' }}>
          📚 文档目录
        </h3>
        {tree.length > 0 ? (
          <DocTree tree={tree} currentPath={currentPath} onSelect={handleSelect} />
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>暂无文档</p>
        )}
      </aside>

      {/* 右侧文档内容 */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem' }}>
        <DocView content={content} loading={loading} />
      </main>
    </div>
  );
}