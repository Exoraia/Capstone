import React, { useState } from 'react';
import { ChevronRight, Folder, File } from 'lucide-react';

const FileTreeNode = ({ node, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(node.isOpen);

  const toggleFolder = (e) => {
    e.stopPropagation();
    if (node.type === 'folder') setIsOpen(!isOpen);
  };

  return (
    <div>
      <div 
        onClick={toggleFolder} 
        className="flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer text-sm text-[#cccccc] hover:bg-[#2a2d2e] transition-colors" 
        style={{ paddingLeft: `${(depth * 12) + 8}px` }}
      >
        {node.type === 'folder' ? (
          <>
            <ChevronRight size={14} className={`text-[#8a8a8a] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            <Folder size={14} className="text-blue-400" />
          </>
        ) : (
          <>
            <span className="w-[14px]"></span>
            <File size={14} className="text-[#8a8a8a]" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map(childNode => (
            <FileTreeNode key={childNode.id} node={childNode} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;