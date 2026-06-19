import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FolderOpen, FileText, Image as ImageIcon, Code, 
  MoreHorizontal, Plus, Search, Clock, Edit2, Check, X, Save
} from 'lucide-react';

// --- DUMMY INITIAL DATA ---
const INITIAL_COLUMNS = [
  { id: 'col-1', title: 'Documents' },
  { id: 'col-2', title: 'Media Assets' },
  { id: 'col-3', title: 'Source Code' },
];

const INITIAL_FILES = [
  { id: 'f1', colId: 'col-1', name: 'Brainstorming.txt', type: 'doc', date: '2 hrs ago', size: '12 KB' },
  { id: 'f2', colId: 'col-1', name: 'Database_Schema.pdf', type: 'doc', date: 'Yesterday', size: '2.4 MB' },
  { id: 'f3', colId: 'col-2', name: 'App_Flowchart.png', type: 'img', date: 'Yesterday', size: '1.1 MB' },
  { id: 'f5', colId: 'col-3', name: 'Auth_Logic.js', type: 'code', date: '5 days ago', size: '8 KB' },
];

const FolderPage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();

  // --- STATES ---
  const [folderName, setFolderName] = useState('Project Alpha');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(folderName);

  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const [files, setFiles] = useState(INITIAL_FILES);
  const [searchQuery, setSearchQuery] = useState('');

  // --- STATES UNTUK TEXT EDITOR MODAL ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeFile, setActiveFile] = useState(null);
  const [editorContent, setEditorContent] = useState('');

  const editInputRef = useRef(null);

  useEffect(() => {
    if (isEditingName && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditingName]);

  // --- HANDLERS AUTENTIK / FILE SYSTEM ---
  const handleOpenFile = async (file) => {
    // Batasi penyuntingan hanya untuk file teks (.txt) demi keamanan ekstensi
    if (file.type !== 'doc' || !file.name.endsWith('.txt')) {
      alert("Format file ini hanya dapat dibaca. Untuk saat ini, fitur edit langsung dikhususkan untuk file teks (.txt).");
      return;
    }

    setActiveFile(file);
    setIsEditorOpen(true);
    setEditorContent('Loading content from local drive...');

    try {
      if (window.electron && window.electron.ipcRenderer) {
        // Panggil IPC main process untuk membaca file asli
        const response = await window.electron.ipcRenderer.invoke('read-txt-file', file.name);
        if (response.success) {
          setEditorContent(response.content);
        } else {
          alert("Gagal memuat isi file: " + response.error);
        }
      } else {
        // Fallback untuk mode browser development simulasi
        const localData = localStorage.getItem(`file_${file.id}`) || 'Ini adalah isi teks simulasi awal dari ' + file.name;
        setEditorContent(localData);
      }
    } catch (err) {
      console.error("Error IPC Read:", err);
    }
  };

  const handleSaveFileContent = async () => {
    if (!activeFile) return;

    try {
      if (window.electron && window.electron.ipcRenderer) {
        // Kirim konten editor ke main process untuk disimpan secara fisik
        const response = await window.electron.ipcRenderer.invoke('save-txt-file', {
          fileName: activeFile.name,
          content: editorContent
        });

        if (response.success) {
          // Hitung ukuran file dinamis
          const sizeInKb = (new Blob([editorContent]).size / 1024).toFixed(1);
          setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, size: `${sizeInKb} KB`, date: 'Just now' } : f));
          setIsEditorOpen(false);
        } else {
          alert("Gagal menyimpan file: " + response.error);
        }
      } else {
        // Fallback simpan di browser
        localStorage.setItem(`file_${activeFile.id}`, editorContent);
        const sizeInKb = (new Blob([editorContent]).size / 1024).toFixed(1);
        setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, size: `${sizeInKb} KB`, date: 'Just now' } : f));
        setIsEditorOpen(false);
      }
    } catch (err) {
      console.error("Error IPC Write:", err);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim() !== '') {
      setFolderName(tempName);
      setIsEditingName(false);
    }
  };

  const handleAddColumn = (e) => {
    if (e.key === 'Enter' && newColumnTitle.trim() !== '') {
      const newCol = {
        id: `col-${Date.now()}`,
        title: newColumnTitle.trim()
      };
      setColumns([...columns, newCol]);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    } else if (e.key === 'Escape') {
      setIsAddingColumn(false);
      setNewColumnTitle('');
    }
  };

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="bg-white min-h-full rounded-2xl p-8 shadow-sm border border-[#313131]/10 animate-in fade-in duration-500 flex flex-col relative">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-[#313131]/10 pb-6 mb-8 flex-shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 text-[#313131]/60 text-sm font-bold">
              <span className="cursor-pointer hover:text-[#4161FF]" onClick={() => navigate('/dashboard')}>Workspace</span>
              <span>/</span>
              <span>Folders</span>
            </div>
            
            <div className="flex items-center gap-3 group">
              <FolderOpen size={28} className="text-[#4161FF] flex-shrink-0" />
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="text-3xl font-bold text-[#313131] border-b-2 border-[#4161FF] outline-none bg-transparent w-full max-w-md"
                  />
                  <button onClick={handleSaveName} className="p-2 bg-[#4161FF] text-white rounded-md hover:bg-[#313131] transition-colors">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setIsEditingName(false)} className="p-2 text-[#313131]/40 hover:text-red-500">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-[#313131] tracking-wide">{folderName}</h1>
                  <button 
                    onClick={() => { setTempName(folderName); setIsEditingName(true); }}
                    className="p-1.5 text-[#313131]/30 hover:text-[#4161FF] hover:bg-[#4161FF]/10 rounded-md transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* SEARCH & ADD CATEGORY */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#313131]/40" />
              <input 
                type="text" 
                placeholder="Search files..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#B2B2B2]/10 border border-[#313131]/10 rounded-lg text-sm text-[#313131] focus:outline-none focus:ring-2 focus:ring-[#4161FF] transition-all w-60 font-medium"
              />
            </div>

            {isAddingColumn ? (
              <input
                autoFocus
                type="text"
                placeholder="Category name..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={handleAddColumn}
                onBlur={() => setIsAddingColumn(false)}
                className="px-3 py-2 bg-white border-2 border-[#4161FF] rounded-lg text-sm text-[#313131] outline-none transition-all w-40 font-bold shadow-sm"
              />
            ) : (
              <button 
                onClick={() => setIsAddingColumn(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#4161FF] text-white hover:bg-[#313131] rounded-lg transition-all font-bold text-sm shadow-sm whitespace-nowrap"
              >
                <Plus size={16} /> Category
              </button>
            )}
          </div>
        </div>

        {/* BOARD LAYOUT */}
        <div className="flex gap-6 flex-1 overflow-x-auto hide-scrollbar pb-4 items-start">
          {columns.map((col) => (
            <BoardColumn 
              key={col.id} 
              title={col.title} 
              count={files.filter(f => f.colId === col.id).length}
            >
              {files
                .filter(f => f.colId === col.id && f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(file => {
                  let Icon = FileText;
                  let color = "text-blue-500";
                  if (file.type === 'img') { Icon = ImageIcon; color = "text-purple-500"; }
                  if (file.type === 'code') { Icon = Code; color = "text-orange-500"; }
                  
                  return (
                    <FileCard 
                      key={file.id} 
                      file={file} 
                      icon={Icon} 
                      color={color} 
                      onClick={() => handleOpenFile(file)} // Triger buka file
                    />
                  );
                })
              }
            </BoardColumn>
          ))}
        </div>

        {/* ================= MODAL TEXT EDITOR CUSTOM PRESET ================= */}
        {isEditorOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Topbar Editor */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">{activeFile?.name}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Editing file locally inside Documents/WorkNet_Files</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Text Area Canvas */}
              <div className="flex-1 p-6 bg-white">
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="Mulai ketik berkas catatan atau tugas kode Anda di sini..."
                  className="w-full h-full resize-none outline-none font-mono text-sm text-gray-700 bg-transparent leading-relaxed"
                />
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 font-bold text-sm text-gray-600 rounded-xl transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveFileContent}
                  className="flex items-center gap-2 px-5 py-2 bg-[#4161FF] hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/10"
                >
                  <Save size={16} /> Simpan Perubahan
                </button>
              </div>

            </div>
          </div>
        )}
        {/* =================================================================== */}

      </div>
    </>
  );
};

// --- SUB-COMPONENTS WITH ONCLICK EXTENSION ---
const BoardColumn = ({ title, count, children }) => (
  <div className="flex-shrink-0 w-80 flex flex-col bg-[#B2B2B2]/10 rounded-xl border border-[#313131]/10 max-h-full shadow-sm">
    <div className="flex items-center justify-between p-4 border-b border-[#313131]/10 bg-[#B2B2B2]/5 rounded-t-xl">
      <div className="flex items-center gap-2 text-[#313131] font-extrabold tracking-wide">
        {title} 
        <span className="bg-[#313131] text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
          {count}
        </span>
      </div>
      <button className="text-[#313131]/40 hover:text-[#4161FF] transition-colors"><MoreHorizontal size={18} /></button>
    </div>
    
    <div className="p-3 overflow-y-auto hide-scrollbar flex-1 space-y-3 min-h-[100px]">
      {children}
      <button className="w-full flex items-center gap-2 text-[#313131]/50 hover:text-[#4161FF] p-2.5 hover:bg-white rounded-lg transition-all font-bold text-sm mt-2 border border-transparent hover:border-[#313131]/10">
        <Plus size={16} /> Add File
      </button>
    </div>
  </div>
);

const FileCard = ({ file, icon: Icon, color, onClick }) => (
  <div 
    onClick={onClick} // Pasang event click ke pembungkus kartu
    className="bg-white p-3.5 rounded-lg border border-[#313131]/10 shadow-sm hover:shadow-md hover:border-[#4161FF]/50 cursor-pointer transition-all group"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-md bg-[#B2B2B2]/10 ${color}`}>
        <Icon size={20} />
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); }} // Cegah trigger buka file saat klik opsi
        className="text-[#313131]/30 hover:text-[#313131] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
    <h4 className="font-bold text-[#313131] text-sm mb-1 truncate">{file.name}</h4>
    <div className="flex items-center justify-between text-[#313131]/50 text-[11px] font-bold mt-2">
      <span className="flex items-center gap-1"><Clock size={12} /> {file.date}</span>
      <span>{file.size}</span>
    </div>
  </div>
);

export default FolderPage;