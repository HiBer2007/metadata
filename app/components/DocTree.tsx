'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface DocNode {
  type: 'file' | 'directory';
  name: string;
  title: string;
  path: string;
  children?: DocNode[];
}

interface DocTreeProps {
  tree: DocNode[];
  currentPath: string;
  onSelect: (path: string) => void;
}

// 递归查找节点路径（父级链）
function findNodePath(tree: DocNode[], targetPath: string): string[] | null {
  for (const node of tree) {
    if (node.type === 'file' && node.path === targetPath) {
      return [node.path];
    }
    if (node.type === 'directory' && node.children) {
      const childPath = findNodePath(node.children, targetPath);
      if (childPath) {
        return [node.path, ...childPath];
      }
    }
  }
  return null;
}

function TreeNode({
  node,
  currentPath,
  onSelect,
  level = 0,
  expandedPaths,
  onToggle,
  nodeRefs,
}: {
  node: DocNode;
  currentPath: string;
  onSelect: (path: string) => void;
  level?: number;
  expandedPaths: Set<string>;
  onToggle: (path: string, expanded: boolean) => void;
  nodeRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}) {
  const [expanded, setExpanded] = useState(level < 1); // 初始展开第一级

  // 当外部 expandedPaths 变化时，更新展开状态
  useEffect(() => {
    const isExpanded = expandedPaths.has(node.path);
    setExpanded(isExpanded);
  }, [expandedPaths, node.path]);

  const handleToggle = () => {
    const newState = !expanded;
    setExpanded(newState);
    onToggle(node.path, newState);
  };

  if (node.type === 'directory') {
    const isActive = currentPath.startsWith(node.path);
    return (
      <div style={{ marginLeft: level * 16 + 2 }}>
        <div
          style={{
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
            fontWeight: 500,
          }}
          onClick={handleToggle}
        >
          <span style={{ marginRight: '6px', fontSize: '12px' }}>{expanded ? '🔽' : '▶️'}</span>
          {node.title}
        </div>
        {expanded &&
          node.children?.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              currentPath={currentPath}
              onSelect={onSelect}
              level={level + 1}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              nodeRefs={nodeRefs}
            />
          ))}
      </div>
    );
  }

  const isActive = currentPath === node.path;
  const refCallback = useCallback(
    (el: HTMLDivElement | null) => {
      if (el && isActive) {
        nodeRefs.current.set(node.path, el);
      }
    },
    [node.path, isActive, nodeRefs]
  );

  return (
    <div
      ref={refCallback}
      style={{
        marginLeft: level * 16 + 0,
        cursor: 'pointer',
        padding: '2px 8px',
        borderRadius: '4px',
        background: isActive ? 'rgba(88, 166, 255, 0.2)' : 'transparent',
        color: isActive ? '#58a6ff' : 'inherit',
        fontWeight: isActive ? 'bold' : 'normal',
      }}
      onClick={() => onSelect(node.path)}
    >
      📄 {node.title}
    </div>
  );
}

export default function DocTree({ tree, currentPath, onSelect }: DocTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // 当 currentPath 变化时，计算需要展开的路径，并滚动到目标节点
  useEffect(() => {
    if (!tree.length || !currentPath) return;

    // 查找节点路径
    const pathChain = findNodePath(tree, currentPath);
    if (!pathChain) return;

    // 展开所有父级目录（不包括文件本身）
    const newExpanded = new Set<string>();
    for (const p of pathChain) {
      if (p !== currentPath) {
        newExpanded.add(p);
      }
    }
    setExpandedPaths(newExpanded);

    // 滚动到目标文件节点
    const targetEl = nodeRefs.current.get(currentPath);
    if (targetEl) {
      // 延迟执行确保DOM更新
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [tree, currentPath]);

  const handleToggle = (path: string, expanded: boolean) => {
    setExpandedPaths((prev) => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(path);
      } else {
        newSet.delete(path);
      }
      return newSet;
    });
  };

  return (
    <nav style={{ overflowY: 'auto', height: '100%', padding: '8px 0' }}>
      {tree.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          currentPath={currentPath}
          onSelect={onSelect}
          level={0}
          expandedPaths={expandedPaths}
          onToggle={handleToggle}
          nodeRefs={nodeRefs}
        />
      ))}
    </nav>
  );
}