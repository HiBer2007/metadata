'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';

interface DocViewProps {
  content: string;
  loading?: boolean;
}

export default function DocView({ content, loading = false }: DocViewProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ color: 'var(--text-secondary)' }}>⏳ 加载中...</p>
      </div>
    );
  }

  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href && (href.endsWith('.md') || href.includes('.md?'))) {
              const [path, anchor] = href.split('#');
              const handleClick = (e: React.MouseEvent) => {
                e.preventDefault();
                router.push(`/?path=${encodeURIComponent(path)}${anchor ? '#' + anchor : ''}`);
              };
              // 保留所有属性，让 CSS 控制样式
              return (
                <a href={href} onClick={handleClick} {...props}>
                  {children}
                </a>
              );
            }
            // 外部链接，新窗口打开
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