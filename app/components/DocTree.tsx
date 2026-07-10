'use client';

import { useState } from 'react';

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

function TreeNode({ node, currentPath, onSelect, level = 0 }: {
  node: DocNode;
  currentPath: string;
  onSelect: (path: string) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(level < 1);

  if (node.type === 'directory') {
    const isActive = currentPath.startsWith(node.path);
    return (
      <div style={{ marginLeft: level * 16 }}>
        <div
          style={{
            cursor: 'pointer',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '4px',
            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '📂' : '📁'} {node.title}
        </div>
        {expanded && node.children?.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            currentPath={currentPath}
            onSelect={onSelect}
            level={level + 1}
          />
        ))}
      </div>
    );
  }

  const isActive = currentPath === node.path;
  return (
    <div
      style={{
        marginLeft: level * 16 + 8,
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
  return (
    <nav style={{ overflowY: 'auto', height: '100%', padding: '8px 0' }}>
      {tree.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          currentPath={currentPath}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}