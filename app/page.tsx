'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import DocTree from '@/app/components/DocTree';
import DocView from '@/app/components/DocViewer';

// 递归扁平化树，提取所有文件节点（保持顺序）
function flattenFiles(nodes: any[]): any[] {
  let files: any[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      files.push(node);
    } else if (node.children) {
      files = files.concat(flattenFiles(node.children));
    }
  }
  return files;
}

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

  // 当前文档内容
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

  // 扁平文件列表（用于翻页）
  const fileList = useMemo(() => flattenFiles(tree), [tree]);
  const currentIndex = useMemo(() => fileList.findIndex(f => f.path === currentPath), [fileList, currentPath]);
  const prevFile = currentIndex > 0 ? fileList[currentIndex - 1] : null;
  const nextFile = currentIndex < fileList.length - 1 ? fileList[currentIndex + 1] : null;

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
          <div className="doc-scroll">
            <DocView content={content} loading={loading} />
          </div>
          <div className="nav-footer">
            <button
              className="nav-btn"
              disabled={!prevFile}
              onClick={() => prevFile && handleSelect(prevFile.path)}
            >
              <span>◀</span>
              <span className="label">上一篇</span>
              {prevFile && <span className="title">{prevFile.title}</span>}
            </button>
            <span style={{ color: 'var(--text-secondary)' }}>
              {currentIndex >= 0 ? `${currentIndex + 1} / ${fileList.length}` : ''}
            </span>
            <button
              className="nav-btn"
              disabled={!nextFile}
              onClick={() => nextFile && handleSelect(nextFile.path)}
            >
              {nextFile && <span className="title">{nextFile.title}</span>}
              <span className="label">下一篇</span>
              <span>▶</span>
            </button>
          </div>
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