'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface DocViewProps {
  content: string;
  loading?: boolean;
  currentPath: string;
}

function resolveRelativePath(currentPath: string, linkPath: string): string {
  if (linkPath.startsWith('/')) {
    return linkPath.slice(1);
  }
  if (linkPath.startsWith('./') || linkPath.startsWith('../')) {
    const parts = currentPath.split('/');
    const currentDir = parts.slice(0, -1).join('/');
    let resolved = currentDir ? currentDir + '/' + linkPath : linkPath;
    const segments = resolved.split('/');
    const stack: string[] = [];
    for (const seg of segments) {
      if (seg === '..') stack.pop();
      else if (seg !== '.' && seg !== '') stack.push(seg);
    }
    return stack.join('/');
  }
  const parts = currentPath.split('/');
  const currentDir = parts.slice(0, -1).join('/');
  return currentDir ? currentDir + '/' + linkPath : linkPath;
}

export default function DocView({ content, loading = false, currentPath }: DocViewProps) {
  const router = useRouter();
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setFadeKey((prev) => prev + 1);
    }
  }, [content, loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="spinner" />
        <p className="loading-pulse" style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          加载中...
        </p>
      </div>
    );
  }

  return (
    <article className="markdown-body fade-enter" key={fadeKey}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href && (href.endsWith('.md') || href.includes('.md?'))) {
              const [linkPath, anchor] = href.split('#');
              let resolvedPath = resolveRelativePath(currentPath, linkPath);
              
              // 🔧 关键修复：对路径进行解码，防止双重编码
              try {
                resolvedPath = decodeURIComponent(resolvedPath);
              } catch {
                // 如果解码失败，保持原样
              }

              const handleClick = (e: React.MouseEvent) => {
                e.preventDefault();
                const targetPath = `/?path=${encodeURIComponent(resolvedPath)}${anchor ? '#' + anchor : ''}`;
                router.push(targetPath, { scroll: false });
              };
              return (
                <a href={href} onClick={handleClick} {...props}>
                  {children}
                </a>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}