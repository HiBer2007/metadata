'use client';

import { Suspense, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DocTree from '@/app/components/DocTree';
import DocView from '@/app/components/DocViewer';

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

  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

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

  const fileList = useMemo(() => flattenFiles(tree), [tree]);
  const currentIndex = useMemo(() => fileList.findIndex(f => f.path === currentPath), [fileList, currentPath]);
  const prevFile = currentIndex > 0 ? fileList[currentIndex - 1] : null;
  const nextFile = currentIndex < fileList.length - 1 ? fileList[currentIndex + 1] : null;

  const handleSelect = (path: string) => {
    router.push(`/?path=${encodeURIComponent(path)}`, { scroll: false });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startX.current;
    let newWidth = startWidth.current + delta;
    if (newWidth < 60) newWidth = 60;
    if (newWidth > 500) newWidth = 500;
    setSidebarWidth(newWidth);
    if (newWidth < 100 && !isSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    } else if (newWidth >= 100 && isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const toggleSidebar = () => {
    if (isSidebarCollapsed) {
      setSidebarWidth(280);
      setIsSidebarCollapsed(false);
    } else {
      setSidebarWidth(0);
      setIsSidebarCollapsed(true);
    }
  };

  const actualWidth = isSidebarCollapsed ? 0 : sidebarWidth;

  return (
    <>
      <header className="header-bar">
        <h1>📚 HiBerNET 元数据服务</h1>
      </header>
      <div className="main-container">
        <aside
          ref={sidebarRef}
          className="sidebar"
          style={{ width: actualWidth, minWidth: actualWidth }}
        >
          {!isSidebarCollapsed && (
            <>
              <div style={{ paddingBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                文档目录
              </div>
              {tree.length > 0 ? (
                <DocTree tree={tree} currentPath={currentPath} onSelect={handleSelect} />
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>暂无文档</p>
              )}
            </>
          )}
        </aside>

        <div
          style={{
            width: '6px',
            flexShrink: 0,
            cursor: 'col-resize',
            background: 'var(--border-color)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseDown={handleMouseDown}
        >
          <button
            onClick={toggleSidebar}
            style={{
              position: 'absolute',
              right: '-12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '2px 4px',
              fontSize: '12px',
              zIndex: 10,
              lineHeight: 1,
            }}
          >
            <span className={`sidebar-toggle-icon ${isSidebarCollapsed ? 'collapsed' : ''}`}>
              {isSidebarCollapsed ? '◀' : '▶'}
            </span>
          </button>
        </div>

        <main className="content-area">
          <div className="doc-scroll">
            <DocView content={content} loading={loading} currentPath={currentPath} />
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