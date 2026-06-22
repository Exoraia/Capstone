import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, MoreHorizontal, Clock, 
  HardDrive, Users, MessageSquare, AlertCircle, Loader2,
  Trash2, X, Search, Folder, FolderOpen, File, Image as ImageIcon, FileText
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// --- Import Firestore ---
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const DEFAULT_COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

const GroupProjectView = ({ projectId }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATES KANBAN ---
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [colPrompt, setColPrompt] = useState(false);
  const [colTitle, setColTitle] = useState('');
  const [taskPrompt, setTaskPrompt] = useState({ isOpen: false, colId: null });
  const [taskForm, setTaskForm] = useState({ title: '', tags: '', assignee: '', date: '' });

  // --- STATES REFERENCES & FILES ---
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [folderPrompt, setFolderPrompt] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [filePrompt, setFilePrompt] = useState({ isOpen: false, targetFolderId: null });
  const [fileNameInput, setFileNameInput] = useState('');

  // --- STATE GLOBAL CONFIRM ---
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', action: null });

  // --- MENGAMBIL DATA DARI FIRESTORE ---
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'worknet_projects', projectId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const currentProject = docSnap.data();
          setProject({ id: docSnap.id, ...currentProject });
          
          setColumns(currentProject.kanbanColumns || DEFAULT_COLUMNS);
          setTasks(currentProject.kanbanTasks || []);
        }
      } catch (error) {
        console.error("Gagal menarik detail project:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // --- FUNGSI UPDATE KE FIRESTORE ---
  const saveProjectUpdate = async (updatedFields) => {
    setProject(prev => ({ ...prev, ...updatedFields }));
    try {
      const projectRef = doc(db, 'worknet_projects', projectId);
      await updateDoc(projectRef, updatedFields);
    } catch (error) {
      console.error("Gagal update ke Firebase:", error);
    }
  };

  // ==========================================
  // LOGIKA KANBAN BOARD
  // ==========================================
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newTasks = Array.from(tasks);
    const draggedTaskIndex = newTasks.findIndex(t => t.id === draggableId);
    const [draggedTask] = newTasks.splice(draggedTaskIndex, 1);
    
    draggedTask.colId = destination.droppableId;

    const sourceTasks = newTasks.filter(t => t.colId === source.droppableId);
    const destTasks = newTasks.filter(t => t.colId === destination.droppableId);
    const otherTasks = newTasks.filter(t => t.colId !== source.droppableId && t.colId !== destination.droppableId);

    destTasks.splice(destination.index, 0, draggedTask);

    const finalTasks = [...otherTasks, ...sourceTasks, ...destTasks];
    setTasks(finalTasks);
    saveProjectUpdate({ kanbanTasks: finalTasks });
  };

  const confirmAddCol = () => {
    if (colTitle.trim()) {
      const newCols = [...columns, { id: `col-${Date.now()}`, title: colTitle.trim() }];
      setColumns(newCols);
      saveProjectUpdate({ kanbanColumns: newCols });
      setColPrompt(false);
      setColTitle('');
    }
  };

  const handleDeleteCol = (colId) => {
    setConfirmDialog({
      isOpen: true,
      message: "Hapus kategori ini beserta semua tugas di dalamnya?",
      action: () => {
        const newCols = columns.filter(c => c.id !== colId);
        const newTasks = tasks.filter(t => t.colId !== colId);
        setColumns(newCols);
        setTasks(newTasks);
        saveProjectUpdate({ kanbanColumns: newCols, kanbanTasks: newTasks });
        setConfirmDialog({ isOpen: false, message: '', action: null });
      }
    });
  };

  const confirmAddTask = () => {
    if (taskForm.title.trim()) {
      const newTask = {
        id: `task-${Date.now()}`,
        colId: taskPrompt.colId,
        title: taskForm.title.trim(),
        tags: taskForm.tags ? taskForm.tags.split(',').map(t => t.trim()) : [],
        assignee: taskForm.assignee.trim().toUpperCase() || 'U',
        date: taskForm.date.trim() || 'No deadline'
      };
      const newTasks = [...tasks, newTask];
      setTasks(newTasks);
      saveProjectUpdate({ kanbanTasks: newTasks });
      setTaskPrompt({ isOpen: false, colId: null });
      setTaskForm({ title: '', tags: '', assignee: '', date: '' });
    }
  };

  const handleDeleteTask = (taskId, e) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      message: "Hapus tugas ini dari papan Kanban?",
      action: () => {
        const newTasks = tasks.filter(t => t.id !== taskId);
        setTasks(newTasks);
        saveProjectUpdate({ kanbanTasks: newTasks });
        setConfirmDialog({ isOpen: false, message: '', action: null });
      }
    });
  };

  // ==========================================
  // LOGIKA REFERENCES & FILES
  // ==========================================
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
      message: "Apakah Anda yakin ingin menghapus folder referensi ini secara permanen?",
      action: () => {
        const updatedRefs = (project.references || []).filter(f => f.id !== folderId);
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
      const updatedRefs = (project.references || []).map(folder => {
        if (folder.id === filePrompt.targetFolderId) return { ...folder, files: [...folder.files, newFile] };
        return folder;
      });
      saveProjectUpdate({ references: updatedRefs });
      setFilePrompt({ isOpen: false, targetFolderId: null });
      setFileNameInput('');
    }
  };

  const handleDeleteFile = (folderId, fileId) => {
    const updatedRefs = (project.references || []).map(folder => {
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


  // --- RENDER SCREEN ---
  if (isLoading || !project) {
    return (
      <div className="flex h-full items-center justify-center flex-col text-[#313131]/50 gap-3">
        <Loader2 size={32} className="animate-spin text-[#4161FF]" />
        <span className="font-bold">Membuka Workspace Tim...</span>
      </div>
    );
  }

  const filteredReferences = getFilteredReferences();
  const activeFolder = (project.references || []).find(f => f.id === selectedFolderId);

  const getTagColor = (tag) => {
    switch(tag.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-600 border-red-200';
      case 'design': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'backend': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'research': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-[#B2B2B2]/20 text-[#313131] border-[#313131]/10';
    }
  };

  const inputClass = "w-full bg-[#B2B2B2]/10 border border-[#313131]/10 rounded-lg p-3 text-sm font-bold text-[#313131] focus:outline-none focus:border-[#4161FF] mb-4";

  return (
    <>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #B2B2B2; border-radius: 10px; }
      `}</style>

      {/* Main Container bisa di scroll vertikal */}
      <div className="animate-in fade-in duration-500 h-full flex flex-col overflow-y-auto custom-scroll">
        
        {/* ================= HEADER AREA ================= */}
        <div className="flex-shrink-0 px-8 pt-8 pb-4 border-b border-[#313131]/10 bg-white">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#313131]/60 hover:text-[#4161FF] font-bold text-sm mb-5 transition-colors">
            <ArrowLeft size={16} /> Kembali
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] font-bold px-3 py-1 rounded-md border bg-[#4161FF]/10 text-[#4161FF] border-[#4161FF]/20 flex items-center gap-1.5">
                  <Users size={12} /> Team Workspace
                </span>
                {project.progress === 100 && (
                  <span className="text-[11px] font-bold px-3 py-1 rounded-md border bg-green-100 text-green-700 border-green-200">Completed</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-[#313131] tracking-wide mb-2">{project.title}</h1>
              
              <div className="flex items-center gap-3 mt-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#313131] border-2 border-white flex items-center justify-center text-white text-[10px] font-bold z-10" title="You (Owner)">ME</div>
                  {(project.members || []).map((email, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full bg-[#4161FF] border-2 border-white flex items-center justify-center text-white text-[10px] font-bold z-0" title={email}>
                      {email.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#313131]/50">{(project.members || []).length + 1} Kolaborator</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-white border border-[#313131]/10 text-[#313131] font-bold px-4 py-2.5 rounded-xl shadow-sm hover:border-[#4161FF] hover:text-[#4161FF] transition-all text-sm">
                <MessageSquare size={16} /> Team Chat
              </button>
              <button 
                onClick={() => {
                  const driveUrl = `https://drive.google.com/drive/folders/${project.folderId}`;
                  if (window.electron && window.electron.ipcRenderer) window.electron.ipcRenderer.send('open-auth-link', driveUrl);
                  else window.open(driveUrl, '_blank');
                }}
                className="flex items-center gap-2 bg-[#4161FF] text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-all text-sm"
              >
                <HardDrive size={16} /> Buka Folder Drive
              </button>
            </div>
          </div>
        </div>

        {/* ================= KANBAN BOARD AREA ================= */}
        <div className="p-8 bg-[#B2B2B2]/5 border-b border-[#313131]/10 min-h-[500px]">
          <h2 className="text-xl font-bold text-[#313131] mb-6 flex items-center gap-2">
            <MoreHorizontal className="text-[#4161FF]" /> Kanban Board
          </h2>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="overflow-x-auto hide-scroll pb-4">
              <div className="flex gap-6 items-start">
                
                {columns.map(col => {
                  const colTasks = tasks.filter(t => t.colId === col.id);
                  return (
                    <div key={col.id} className="flex-shrink-0 w-[300px] flex flex-col">
                      
                      {/* Header Kolom & Tombol Delete Kolom */}
                      <div className="flex items-center justify-between mb-4 px-1 group/col">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#313131]">{col.title}</h3>
                          <span className="bg-[#313131]/10 text-[#313131]/60 text-[10px] font-bold px-2 py-0.5 rounded-full">{colTasks.length}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteCol(col.id)} 
                          className="text-[#313131]/20 hover:text-red-500 opacity-0 group-hover/col:opacity-100 transition-all p-1"
                          title="Hapus Kategori"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <Droppable droppableId={col.id}>
                        {(provided, snapshot) => (
                          <div 
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`flex-1 min-h-[100px] p-2 -mx-2 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-[#4161FF]/5 border border-[#4161FF]/20 border-dashed' : ''}`}
                          >
                            <div className="space-y-3">
                              {colTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div 
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`bg-white p-4 rounded-xl border transition-all relative group/task ${
                                        snapshot.isDragging 
                                          ? 'shadow-2xl border-[#4161FF] rotate-2 scale-105 z-50' 
                                          : 'border-[#313131]/10 shadow-sm hover:shadow-md hover:border-[#4161FF]/40'
                                      }`}
                                    >
                                      {/* Tombol Delete Task */}
                                      <button 
                                        onClick={(e) => handleDeleteTask(task.id, e)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-md opacity-0 group-hover/task:opacity-100 transition-opacity"
                                      >
                                        <Trash2 size={14} />
                                      </button>

                                      <div className="flex flex-wrap gap-1.5 mb-3">
                                        {task.tags.map(tag => (
                                          <span key={tag} className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getTagColor(tag)}`}>{tag}</span>
                                        ))}
                                      </div>
                                      <h4 className="font-bold text-[#313131] text-sm leading-tight mb-4 pr-6">{task.title}</h4>
                                      <div className="flex items-center justify-between mt-auto">
                                        <div className={`flex items-center gap-1 text-[10px] font-bold ${task.date === 'Overdue' ? 'text-red-500' : 'text-[#313131]/40'}`}>
                                          {task.date === 'Overdue' ? <AlertCircle size={12} /> : <Clock size={12} />} {task.date}
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-[#4161FF]/10 text-[#4161FF] flex items-center justify-center text-[10px] font-bold border border-[#4161FF]/20">
                                          {task.assignee}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>

                            {/* Tombol Add Task di Kolom Ini */}
                            <button 
                              onClick={() => setTaskPrompt({ isOpen: true, colId: col.id })}
                              className="w-full flex items-center gap-2 text-[#313131]/40 hover:text-[#4161FF] p-3 hover:bg-[#4161FF]/5 rounded-xl transition-all font-bold text-sm border border-transparent hover:border-[#4161FF]/20 justify-center mt-3"
                            >
                              <Plus size={16} /> Add Task
                            </button>
                          </div>
                        )}
                      </Droppable>
                      
                    </div>
                  );
                })}

                {/* Tombol Tambah Kolom Kategori Baru */}
                <div className="flex-shrink-0 w-[300px] pt-8">
                  <button 
                    onClick={() => setColPrompt(true)}
                    className="w-full flex items-center justify-center gap-2 text-[#313131]/40 hover:text-[#313131] p-4 bg-white/50 border-2 border-dashed border-[#313131]/20 rounded-xl transition-all font-bold text-sm hover:bg-white hover:border-[#313131]/40 shadow-sm"
                  >
                    <Plus size={16} /> Tambah Kategori
                  </button>
                </div>

              </div>
            </div>
          </DragDropContext>
        </div>

        {/* ================= REFERENCES & FILES AREA ================= */}
        <div className="p-8 bg-white flex-1">
          <section className="bg-white rounded-2xl p-6 border border-[#313131]/10 shadow-sm flex flex-col h-full">
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

            <div className="flex-1 overflow-y-auto custom-scroll pr-2 pb-4">
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

      {/* ========================================================= */}
      {/* KUMPULAN SEMUA MODAL POP-UP */}
      {/* ========================================================= */}

      {/* 1. Modal Add Task (Kanban) */}
      {taskPrompt.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in" onClick={() => setTaskPrompt({ isOpen: false, colId: null })}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#313131] mb-4">Buat Tugas Baru</h3>
            <input 
              autoFocus type="text" placeholder="Judul Tugas (Misal: Desain Mockup)" value={taskForm.title}
              onChange={e => setTaskForm({...taskForm, title: e.target.value})} className={inputClass}
            />
            <input 
              type="text" placeholder="Tag (Pisahkan dengan koma: UI, Urgent)" value={taskForm.tags}
              onChange={e => setTaskForm({...taskForm, tags: e.target.value})} className={inputClass}
            />
            <div className="flex gap-3">
              <input 
                type="text" placeholder="Inisial Anggota (A)" value={taskForm.assignee} maxLength={2}
                onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} className={inputClass}
              />
              <input 
                type="text" placeholder="Tenggat (2 days left)" value={taskForm.date}
                onChange={e => setTaskForm({...taskForm, date: e.target.value})} onKeyDown={e => e.key === 'Enter' && confirmAddTask()} className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setTaskPrompt({ isOpen: false, colId: null })} className="px-4 py-2 text-sm font-bold text-[#313131]/50 hover:text-[#313131]">Batal</button>
              <button onClick={confirmAddTask} className="bg-[#4161FF] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">Buat Tugas</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Add Category (Kanban) */}
      {colPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in" onClick={() => setColPrompt(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#313131] mb-2">Tambah Kategori</h3>
            <p className="text-xs text-[#313131]/60 mb-4">Masukkan nama untuk kolom tahapan baru ini.</p>
            <input 
              autoFocus type="text" placeholder="Misal: Testing, QA..." value={colTitle}
              onChange={e => setColTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmAddCol()} className={inputClass}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setColPrompt(false)} className="px-4 py-2 text-sm font-bold text-[#313131]/50 hover:text-[#313131]">Batal</button>
              <button onClick={confirmAddCol} className="bg-[#4161FF] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal View Folder & Files */}
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

      {/* 4. Modal Add Folder */}
      {folderPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in" onClick={() => setFolderPrompt(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#313131] mb-2">Buat Folder Baru</h3>
            <p className="text-xs text-[#313131]/60 mb-4">Masukkan nama untuk folder referensi ini.</p>
            <input 
              autoFocus type="text" placeholder="Misal: Aset UI, Dokumen Final..." value={folderNameInput}
              onChange={e => setFolderNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmAddFolder()} className={inputClass}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setFolderPrompt(false)} className="px-4 py-2 text-sm font-bold text-[#313131]/50 hover:text-[#313131]">Batal</button>
              <button onClick={confirmAddFolder} className="bg-[#4161FF] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">Buat Folder</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Add File */}
      {filePrompt.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in" onClick={() => setFilePrompt({isOpen: false, targetFolderId: null})}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#313131] mb-2">Simpan File Baru</h3>
            <p className="text-xs text-[#313131]/60 mb-4">Ketik nama file beserta ekstensinya (.png, .pdf, .txt).</p>
            <input 
              autoFocus type="text" placeholder="Misal: mockup.png" value={fileNameInput}
              onChange={e => setFileNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmAddFile()} className={inputClass}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setFilePrompt({isOpen: false, targetFolderId: null})} className="px-4 py-2 text-sm font-bold text-[#313131]/50 hover:text-[#313131]">Batal</button>
              <button onClick={confirmAddFile} className="bg-[#4161FF] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">Simpan File</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Konfirmasi Hapus Universal */}
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

export default GroupProjectView;