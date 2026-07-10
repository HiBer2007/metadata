'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
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
            // 判断是否为内部 Markdown 链接（以 .md 结尾或包含 .md?）
            if (href && (href.endsWith('.md') || href.includes('.md?'))) {
              // 处理可能包含的锚点（#）
              const [path, anchor] = href.split('#');
              // 使用 Next.js 路由跳转，并保留锚点
              const handleClick = (e: React.MouseEvent) => {
                e.preventDefault();
                // 跳转到文档页
                router.push(`/?path=${encodeURIComponent(path)}${anchor ? '#' + anchor : ''}`);
              };
              return (
                <a href={href} onClick={handleClick} {...props}>
                  {children}
                </a>
              );
            }
            // 外部链接或锚点，使用默认行为
            return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}