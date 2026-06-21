// Lokasi: src/renderer/src/components/PersonalProjectView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Circle, Plus, ExternalLink, FileText, 
  Video, Code, Trash2, ArrowLeft, Edit2, 
  Check, X, Link as LinkIcon, Folder, Image as ImageIcon,
  File, Search, FolderOpen, AlertCircle
} from 'lucide-react';

const PersonalProjectView = ({ projectId }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const editTitleRef = useRef(null);

  const [newEmbedUrl, setNewEmbedUrl] = useState('');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // States Modal
  const [folderPrompt, setFolderPrompt] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [filePrompt, setFilePrompt] = useState({ isOpen: false, targetFolderId: null });
  const [fileNameInput, setFileNameInput] = useState('');
  const [embedPrompt, setEmbedPrompt] = useState({ isOpen: false, url: '' });
  const [embedTitleInput, setEmbedTitleInput] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', action: null });

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('worknet_projects') || '[]');
    const currentProject = savedProjects.find(p => p.id === projectId);

    if (currentProject) {
      setTodos(currentProject.todos || [{ id: Date.now(), text: 'Pahami deskripsi tugas', completed: false }]);
      setProject({
        ...currentProject,
        embeds: currentProject.embeds || [],
        references: currentProject.references || []
      });
    }
  }, [projectId]);

  useEffect(() => {
    if (isEditingTitle && editTitleRef.current) editTitleRef.current.focus();
  }, [isEditingTitle]);

  const saveProjectUpdate = (updatedFields) => {
    const updatedProject = { ...project, ...updatedFields };
    setProject(updatedProject);
    const savedProjects = JSON.parse(localStorage.getItem('worknet_projects') || '[]');
    const newSaved = savedProjects.map(p => p.id === projectId ? updatedProject : p);
    localStorage.setItem('worknet_projects', JSON.stringify(newSaved));
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim() !== '') {
      saveProjectUpdate({ title: tempTitle.trim() });
      setIsEditingTitle(false);
    }
  };

  const updateTodoProgress = (updatedTodos) => {
    setTodos(updatedTodos);
    const total = updatedTodos.length;
    const completed = updatedTodos.filter(t => t.completed).length;
    const newProgress = total === 0 ? 0 : Math.round((completed / total) * 100);
    saveProjectUpdate({ todos: updatedTodos, progress: newProgress });
  };

  const handleAddTodo = (e) => {
    if (e.key === 'Enter' && newTodo.trim() !== '') {
      updateTodoProgress([...todos, { id: Date.now(), text: newTodo.trim(), completed: false }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (todoId) => {
    updateTodoProgress(todos.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (todoId) => {
    updateTodoProgress(todos.filter(t => t.id !== todoId));
  };

  const handleAddEmbedClick = (e) => {
    if (e.key === 'Enter' && newEmbedUrl.trim() !== '') {
      let url = newEmbedUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
      setEmbedPrompt({ isOpen: true, url });
      setNewEmbedUrl('');
    }
  };

  const confirmAddEmbed = () => {
    const title = embedTitleInput.trim() || "Tautan Tersimpan";
    let type = 'link';
    if (embedPrompt.url.includes('docs.google.com')) type = 'docs';
    else if (embedPrompt.url.includes('youtube.com') || embedPrompt.url.includes('youtu.be')) type = 'youtube';
    else if (embedPrompt.url.includes('github.com')) type = 'github';

    saveProjectUpdate({ embeds: [...(project.embeds || []), { title, url: embedPrompt.url, type }] });
    setEmbedPrompt({ isOpen: false, url: '' });
    setEmbedTitleInput('');
  };

  const deleteEmbed = (index) => {
    const newEmbeds = [...project.embeds];
    newEmbeds.splice(index, 1);
    saveProjectUpdate({ embeds: newEmbeds });
  };

  const confirmAddFolder = () => {
    if (folderNameInput.trim()) {
      const newFolder = { id: `folder-${Date.now()}`, name: folderNameInput.trim(), files: [] };
      saveProjectUpdate({ references: [...(project.references || []), newFolder] });
      setFolderPrompt(false);
      setFolderNameInput('');
    }
  };

  const handleDeleteFolderClick = (folderId) => {
    setConfirmDialog({
      isOpen: true,
      message: "Apakah Anda yakin ingin menghapus folder ini beserta isinya secara permanen?",
      action: () => {
        const updatedRefs = project.references.filter(f => f.id !== folderId);
        saveProjectUpdate({ references: updatedRefs });
        setSelectedFolderId(null);
        setConfirmDialog({ isOpen: false, message: '', action: null });
      }
    });
  };

  const confirmAddFile = () => {
    if (fileNameInput.trim() && filePrompt.targetFolderId) {
      let type = 'file';
      const nameLower = fileNameInput.toLowerCase();
      if (nameLower.endsWith('.png') || nameLower.endsWith('.jpg')) type = 'image';
      else if (nameLower.endsWith('.pdf')) type = 'pdf';

      const newFile = { id: `file-${Date.now()}`, name: fileNameInput.trim(), type };
      const updatedRefs = project.references.map(folder => {
        if (folder.id === filePrompt.targetFolderId) return { ...folder, files: [...folder.files, newFile] };
        return folder;
      });
      saveProjectUpdate({ references: updatedRefs });
      setFilePrompt({ isOpen: false, targetFolderId: null });
      setFileNameInput('');
    }
  };

  const handleDeleteFile = (folderId, fileId) => {
    const updatedRefs = project.references.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, files: folder.files.filter(f => f.id !== fileId) };
      }
      return folder;
    });
    saveProjectUpdate({ references: updatedRefs });
  };

  const getFilteredReferences = () => {
    const query = fileSearchQuery.toLowerCase();
    if (!query) return project.references || [];
    return (project.references || []).map(folder => {
      if (folder.name.toLowerCase().includes(query)) return folder;
      const matchingFiles = folder.files.filter(f => f.name.toLowerCase().includes(query));
      return { ...folder, files: matchingFiles };
    }).filter(folder => folder.files.length > 0 || folder.name.toLowerCase().includes(query));
  };

  if (!project) return null;

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  let statusText = "Planning";
  let statusColors = "bg-[#B2B2B2]/20 text-[#313131] border-[#313131]/10";
  if (project.progress === 100) {
    statusText = "Completed";
    statusColors = "bg-green-100 text-green-700 border-green-200";
  } else if (project.progress > 0) {
    statusText = "Ongoing";
    statusColors = "bg-blue-100 text-blue-700 border-blue-200";
  }

  const filteredReferences = getFilteredReferences();
  const activeFolder = project.references?.find(f => f.id === selectedFolderId);

  return (
    <>
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #B2B2B2; border-radius: 10px; }
        .custom-scroll:hover::-webkit-scrollbar-thumb { background-color: #313131; }
      `}</style>

      <div className="animate-in fade-in duration-500 max-w-6xl mx-auto pb-10 relative">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#313131]/60 hover:text-[#4161FF] font-bold text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Kembali
        </button>

        {/* HEADER AREA */}
        <div className="bg-white rounded-2xl p-8 border border-[#313131]/10 shadow-sm mb-8 relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${project.progress === 100 ? 'bg-green-500' : 'bg-[#4161FF]'}`}></div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-md border ${statusColors}`}>{statusText}</span>
              </div>
              
              {isEditingTitle ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    ref={editTitleRef} type="text" value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    className="text-3xl font-bold text-[#313131] border-b-2 border-[#4161FF] outline-none bg-transparent w-full max-w-md py-1"
                  />
                  <button onClick={handleSaveTitle} className="p-2 bg-[#4161FF] text-white rounded-md hover:bg-[#313131]"><Check size={18} /></button>
                  <button onClick={() => setIsEditingTitle(false)} className="p-2 text-[#313131]/40 hover:text-red-500"><X size={18} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-1 group">
                  <h1 className="text-3xl font-bold text-[#313131] tracking-wide">{project.title}</h1>
                  <button onClick={() => { setTempTitle(project.title); setIsEditingTitle(true); }} className="p-1.5 text-[#313131]/30 hover:text-[#4161FF] hover:bg-[#4161FF]/10 rounded-md transition-all opacity-0 group-hover:opacity-100">
                    <Edit2 size={18} />
                  </button>
                </div>
              )}
              
              <p className="text-sm font-semibold text-[#313131]/50 mt-1">Sisa Waktu: {project.daysLeft} Hari</p>
            </div>

            <div className="w-full md:w-72 flex-shrink-0">
              <div className="flex justify-between text-sm font-bold text-[#313131] mb-2">
                <span>Progress</span>
                <span className={project.progress === 100 ? 'text-green-500' : 'text-[#4161FF]'}>{project.progress}%</span>
              </div>
              <div className="w-full bg-[#B2B2B2]/30 rounded-full h-3">
                <div className={`h-3 rounded-full transition-all duration-700 ${project.progress === 100 ? 'bg-green-500' : 'bg-[#4161FF]'}`} style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          <div className="lg:col-span-2">
            <section className="bg-white rounded-2xl p-6 border border-[#313131]/10 shadow-sm flex flex-col h-[450px]">
              <h2 className="text-lg font-bold text-[#313131] border-b border-[#313131]/10 pb-3 mb-4 flex items-center gap-2 flex-shrink-0">
                <CheckCircle2 size={18} className="text-[#4161FF]" /> Tasks & To-Do
              </h2>
              
              <div className="bg-[#B2B2B2]/10 p-2 rounded-xl border border-[#313131]/10 flex items-center gap-3 focus-within:border-[#4161FF] transition-colors mb-4 flex-shrink-0">
                <Plus size={18} className="text-[#313131]/40 ml-1" />
                <input 
                  type="text" placeholder="Tambah tugas & Enter..." value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)} onKeyDown={handleAddTodo}
                  className="w-full bg-transparent border-none outline-none text-[#313131] text-sm py-1 placeholder-[#313131]/40"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scroll space-y-2.5">
                {activeTodos.map(todo => (
                  <div key={todo.id} className="group bg-white p-3 rounded-xl border border-[#313131]/10 shadow-sm hover:border-[#4161FF]/50 transition-all flex items-start gap-3">
                    <button onClick={() => toggleTodo(todo.id)} className="text-[#313131]/30 hover:text-[#4161FF] mt-0.5 flex-shrink-0"><Circle size={18} /></button>
                    <span className="flex-1 font-semibold text-[#313131] text-sm leading-relaxed">{todo.text}</span>
                    <button onClick={() => deleteTodo(todo.id)} className="text-[#313131]/20 hover:text-red-500 opacity-0 group-hover:opacity-100 flex-shrink-0"><Trash2 size={14} /></button>
                  </div>
                ))}
                
                {completedTodos.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-[#313131]/5">
                    <div className="space-y-2 opacity-60">
                      {completedTodos.map(todo => (
                        <div key={todo.id} className="bg-[#B2B2B2]/10 p-3 rounded-xl border border-[#313131]/5 flex items-start gap-3">
                          <button onClick={() => toggleTodo(todo.id)} className="text-green-500 mt-0.5 flex-shrink-0"><CheckCircle2 size={18} /></button>
                          <span className="flex-1 font-semibold text-[#313131] text-sm line-through">{todo.text}</span>
                          <button onClick={() => deleteTodo(todo.id)} className="text-[#313131]/40 hover:text-red-500 flex-shrink-0"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <section className="bg-white rounded-2xl p-6 border border-[#313131]/10 shadow-sm flex flex-col h-[450px]">
              <h2 className="text-lg font-bold text-[#313131] border-b border-[#313131]/10 pb-3 mb-4 flex items-center gap-2 flex-shrink-0">
                <LinkIcon size={18} className="text-[#4161FF]" /> Project Embeds
              </h2>
              
              <div className="bg-[#B2B2B2]/10 p-1.5 rounded-lg border border-[#313131]/10 flex items-center gap-2 focus-within:border-[#4161FF] transition-colors mb-4 flex-shrink-0">
                <Plus size={16} className="text-[#313131]/40 ml-2 flex-shrink-0" />
                <input 
                  type="url" placeholder="Paste link & Enter" value={newEmbedUrl}
                  onChange={(e) => setNewEmbedUrl(e.target.value)} onKeyDown={handleAddEmbedClick}
                  className="w-full bg-transparent border-none outline-none text-[#313131] text-sm py-1 placeholder-[#313131]/40"
                />
              </div>

              <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-2 custom-scroll">
                {(project.embeds || []).map((embed, idx) => {
                  let Icon = ExternalLink; let iconColor = "text-[#4161FF]";
                  if (embed.type === 'docs') { Icon = FileText; iconColor = "text-blue-600"; }
                  if (embed.type === 'youtube') { Icon = Video; iconColor = "text-red-600"; }
                  if (embed.type === 'github') { Icon = Code; iconColor = "text-[#313131]"; }

                  return (
                    <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#313131]/10 shadow-sm hover:border-[#4161FF]/50 transition-all group flex-shrink-0">
                      <div 
                        onClick={() => {
                          if (window.electron && window.electron.ipcRenderer) {
                            window.electron.ipcRenderer.send('open-auth-link', embed.url);
                          } else {
                            window.open(embed.url, '_blank');
                          }
                        }}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <div className={`p-1.5 rounded-lg bg-[#B2B2B2]/10 ${iconColor}`}><Icon size={16} /></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#313131] text-sm truncate group-hover:text-[#4161FF] transition-colors">{embed.title}</h4>
                        </div>
                      </div>

                      <button onClick={() => deleteEmbed(idx)} className="p-1.5 text-[#313131]/30 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

        </div>

        <div className="w-full">
          <section className="bg-white rounded-2xl p-6 border border-[#313131]/10 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#313131]/10 pb-4 mb-6 gap-4">
              <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2 whitespace-nowrap">
                <Folder size={18} className="text-[#4161FF]" /> References & Files
              </h2>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#313131]/40" />
                  <input 
                    type="text" placeholder="Cari file atau folder..." 
                    value={fileSearchQuery} onChange={(e) => setFileSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full sm:w-56 bg-[#B2B2B2]/10 border border-[#313131]/10 rounded-lg text-xs font-bold text-[#313131] focus:outline-none focus:border-[#4161FF] transition-colors"
                  />
                </div>
                <button onClick={() => setFolderPrompt(true)} className="flex items-center gap-1.5 text-xs font-bold bg-[#4161FF]/10 text-[#4161FF] px-4 py-2 rounded-lg hover:bg-[#4161FF] hover:text-white transition-colors flex-shrink-0">
                  <Plus size={14} /> Add Folder
                </button>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto custom-scroll pr-2 pb-4">
              {filteredReferences.length === 0 ? (
                <div className="border-2 border-dashed border-[#313131]/10 rounded-2xl p-12 text-center bg-[#B2B2B2]/5">
                  <Folder size={48} className="mx-auto text-[#313131]/20 mb-3" />
                  <h3 className="font-bold text-[#313131] mb-1">
                    {fileSearchQuery ? "Tidak Ada Hasil Pencarian" : "Area Referensi Kosong"}
                  </h3>
                  <p className="text-xs text-[#313131]/50 mb-4">
                    {fileSearchQuery ? `Tidak ditemukan file atau folder yang cocok dengan "${fileSearchQuery}"` : "Buat Folder baru untuk mulai menyusun materi, gambar, atau dokumen proyek Anda."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-8 items-start">
                  {filteredReferences.map((folder) => (
                    <div key={folder.id} onClick={() => setSelectedFolderId(folder.id)} className="flex flex-col items-center gap-3 cursor-pointer group w-32">
                      <div className="w-32 h-32 bg-[#B2B2B2]/10 border border-[#313131]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#4161FF]/5 group-hover:border-[#4161FF]/50 transition-all shadow-sm group-hover:shadow-md relative">
                        <Folder size={48} className="text-[#4161FF] fill-[#4161FF]/20 group-hover:scale-110 transition-transform" />
                        {folder.files.length > 0 && (
                          <div className="absolute -top-2 -right-2 bg-[#313131] text-white text-[11px] font-bold w-7 h-7 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                            {folder.files.length}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#313131] text-center w-full truncate px-2 group-hover:text-[#4161FF] transition-colors">{folder.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

      </div>

      {/* ALL MODALS */}
      {activeFolder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setSelectedFolderId(null)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#313131]/10 flex items-center justify-between bg-[#B2B2B2]/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#4161FF]/10 text-[#4161FF] rounded-lg"><FolderOpen size={20} /></div>
                <div>
                  <h3 className="font-bold text-[#313131] text-lg leading-tight">{activeFolder.name}</h3>
                  <p className="text-xs text-[#313131]/50 font-semibold">{activeFolder.files.length} Item tersimpan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDeleteFolderClick(activeFolder.id)} className="p-2 text-[#313131]/30 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Hapus Folder"><Trash2 size={18} /></button>
                <button onClick={() => setSelectedFolderId(null)} className="p-2 text-[#313131]/30 hover:bg-[#B2B2B2]/20 hover:text-[#313131] rounded-lg transition-colors"><X size={20} /></button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto custom-scroll bg-[#B2B2B2]/5">
              {activeFolder.files.length === 0 ? (
                <div className="text-center py-10">
                  <File size={32} className="mx-auto text-[#313131]/20 mb-3" />
                  <p className="text-sm font-semibold text-[#313131]/50">Folder ini masih kosong.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeFolder.files.map(file => (
                    <div key={file.id} className="bg-white p-3 rounded-xl border border-[#313131]/10 flex items-center justify-between shadow-sm hover:border-[#4161FF]/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${file.type === 'image' ? 'bg-purple-100 text-purple-600' : file.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {file.type === 'image' ? <ImageIcon size={18} /> : file.type === 'pdf' ? <FileText size={18} /> : <File size={18} />}
                        </div>
                        <span className="font-bold text-[#313131] text-sm">{file.name}</span>
                      </div>
                      <button onClick={() => handleDeleteFile(activeFolder.id, file.id)} className="p-2 text-[#313131]/20 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#313131]/10 bg-white">
              <button onClick={() => setFilePrompt({ isOpen: true, targetFolderId: activeFolder.id })} className="w-full py-3 border-2 border-dashed border-[#313131]/20 rounded-xl text-sm font-bold text-[#313131]/60 hover:text-[#4161FF] hover:border-[#4161FF] hover:bg-[#4161FF]/5 transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> Tambahkan File Baru ke Folder Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {folderPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in" onClick={() => setFolderPrompt(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#313131] mb-2">Buat Folder Baru</h3>
            <p className="text-xs text-[#313131]/60 mb-4">Masukkan nama untuk folder referensi ini.</p>
            <input 
              autoFocus type="text" placeholder="Misal: Aset UI, Dokumen Final..." value={folderNameInput}
              onChange={e => setFolderNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmAddFolder()}
              className="w-full bg-[#B2B2B2]/10 border border-[#313131]/10 rounded-lg p-3 text-sm font-bold text-[#313131] focus:outline-none focus:border-[#4161FF] mb-6"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setFolderPrompt(false)} className="px-4 py-2 text-sm font-bold text-[#313131]/50 hover:text-[#313131]">Batal</button>
              <button onClick={confirmAddFolder} className="bg-[#4161FF] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">Buat Folder</button>
            </div>
          </div>
        </div>
      )}

      {filePrompt.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in" onClick={() => setFilePrompt({isOpen: false, targetFolderId: null})}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#313131] mb-2">Simpan File Baru</h3>
            <p className="text-xs text-[#313131]/60 mb-4">Ketik nama file beserta ekstensinya (.png, .pdf, .txt).</p>
            <input 
              autoFocus type="text" placeholder="Misal: mockup.png" value={fileNameInput}
              onChange={e => setFileNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmAddFile()}
              className="w-full bg-[#B2B2B2]/10 border border-[#313131]/10 rounded-lg p-3 text-sm font-bold text-[#313131] focus:outline-none focus:border-[#4161FF] mb-6"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setFilePrompt({isOpen: false, targetFolderId: null})} className="px-4 py-2 text-sm font-bold text-[#313131]/50 hover:text-[#313131]">Batal</button>
              <button onClick={confirmAddFile} className="bg-[#4161FF] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">Simpan File</button>
            </div>
          </div>
        </div>
      )}

      {embedPrompt.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in" onClick={() => setEmbedPrompt({isOpen: false, url: ''})}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#313131] mb-2">Beri Judul Tautan</h3>
            <p className="text-[10px] text-[#4161FF] mb-4 truncate bg-blue-50 p-2 rounded border border-blue-100">{embedPrompt.url}</p>
            <input 
              autoFocus type="text" placeholder="Misal: Jurnal Penelitian" value={embedTitleInput}
              onChange={e => setEmbedTitleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmAddEmbed()}
              className="w-full bg-[#B2B2B2]/10 border border-[#313131]/10 rounded-lg p-3 text-sm font-bold text-[#313131] focus:outline-none focus:border-[#4161FF] mb-6"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setEmbedPrompt({isOpen: false, url: ''})} className="px-4 py-2 text-sm font-bold text-[#313131]/50 hover:text-[#313131]">Batal</button>
              <button onClick={confirmAddEmbed} className="bg-[#4161FF] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">Simpan Tautan</button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in" onClick={() => setConfirmDialog({isOpen: false, message: '', action: null})}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-500 flex items-center justify-center rounded-full mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#313131] mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-[#313131]/60 mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDialog({isOpen: false, message: '', action: null})} className="flex-1 py-2.5 bg-[#B2B2B2]/20 rounded-xl text-sm font-bold text-[#313131] hover:bg-[#B2B2B2]/40 transition-colors">Batal</button>
              <button onClick={confirmDialog.action} className="flex-1 py-2.5 bg-red-500 rounded-xl text-sm font-bold text-white hover:bg-red-600 shadow-md transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalProjectView;