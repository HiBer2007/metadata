'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

// 复制按钮 SVG 图标（双方块叠加）
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export default function DocView({ content, loading = false, currentPath }: DocViewProps) {
  const router = useRouter();
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setFadeKey((prev) => prev + 1);
    }
  }, [content, loading]);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });
  };

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
              try {
                resolvedPath = decodeURIComponent(resolvedPath);
              } catch {
                // ignore
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
          code({ className, children, ...props }) {
            // 检查是否为行内代码（没有 className 或不是 language-xxx）
            const isInline = !className || !className.startsWith('language-');
            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            // 提取语言
            const language = className.replace(/^language-/, '');
            const codeString = String(children).replace(/\n$/, '');

            return (
              <div style={{ position: 'relative', margin: '1rem 0', borderRadius: '6px', overflow: 'hidden' }}>
                {/* 语言标签 - 左上角 */}
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'rgba(255,255,255,0.5)',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '2px 10px',
                    borderRadius: '4px',
                    zIndex: 5,
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  {language || 'text'}
                </span>

                {/* 复制按钮 - 右上角 */}
                <button
                  onClick={() => handleCopy(codeString)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '12px',
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s, color 0.2s',
                    zIndex: 5,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }}
                  title="复制代码"
                  aria-label="复制代码"
                >
                  <CopyIcon />
                </button>

                <SyntaxHighlighter
                  language={language || 'text'}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: '6px',
                    fontSize: '14px',
                    padding: '2rem 1rem 1rem 1rem', // 顶部留出空间给标签和按钮
                    background: 'var(--code-bg)',
                  }}
                  showLineNumbers={false}
                  wrapLines={false}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}