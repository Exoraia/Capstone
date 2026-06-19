import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';

const FileTreeNode = ({ node }) => {
  const [isOpen, setIsOpen] = useState(node.isOpen || false);
  const navigate = useNavigate(); // Hook untuk pindah halaman

  const handleFolderClick = () => {
    // 1. Arahkan ke halaman folder
    navigate(`/folder/${node.id}`);
    // 2. Buka isi folder di sidebar (opsional)
    setIsOpen(true); 
  };

  if (node.type === 'folder') {
    return (
      <div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#4161FF]/10 rounded-md cursor-pointer text-[#B2B2B2] hover:text-white transition-colors group">
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-0.5 hover:bg-[#313131] rounded">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          {/* Bagian teks dan ikon folder yang diklik akan memicu navigasi */}
          <div className="flex items-center gap-2 flex-1" onClick={handleFolderClick}>
            <Folder size={14} className="text-[#4161FF]" />
            <span className="text-xs font-semibold">{node.name}</span>
          </div>
        </div>
        
        {isOpen && node.children && (
          <div className="ml-4 pl-2 border-l border-[#B2B2B2]/20 mt-1 space-y-0.5">
            {node.children.map(child => (
              <FileTreeNode key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Tampilan untuk File (jika bukan folder)
  return (
    <div className="flex items-center gap-2 px-6 py-1.5 hover:bg-[#4161FF]/10 rounded-md cursor-pointer text-[#B2B2B2] hover:text-white transition-colors">
      <File size={14} className="text-[#B2B2B2]/70" />
      <span className="text-xs font-medium">{node.name}</span>
    </div>
  );
};

export default FileTreeNode;