import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, MoreHorizontal, Clock, 
  HardDrive, Users, MessageSquare, AlertCircle
} from 'lucide-react';

// --- DATA DUMMY AWAL UNTUK KANBAN JIKA PROJECT KOSONG ---
const DEFAULT_COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'In Review' },
  { id: 'done', title: 'Done' }
];

const DEFAULT_TASKS = [
  { id: 't1', colId: 'todo', title: 'Riset referensi jurnal', tags: ['Research'], assignee: 'A', date: '2 days left' },
  { id: 't2', colId: 'todo', title: 'Buat struktur database', tags: ['Backend'], assignee: 'B', date: '4 days left' },
  { id: 't3', colId: 'in-progress', title: 'Desain UI/UX Figma', tags: ['Design'], assignee: 'D', date: 'Due today' },
  { id: 't4', colId: 'review', title: 'Koneksi API Firebase', tags: ['Backend', 'Urgent'], assignee: 'A', date: 'Overdue' }
];

const GroupProjectView = ({ projectId }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  // State untuk Kanban
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [tasks, setTasks] = useState(DEFAULT_TASKS);

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('worknet_projects') || '[]');
    const currentProject = savedProjects.find(p => p.id === projectId);
    
    if (currentProject) {
      setProject(currentProject);
      // Jika project sudah punya data kanban tersimpan, gunakan itu. 
      // Jika belum, pakai default untuk preview.
      if (currentProject.kanbanTasks) setTasks(currentProject.kanbanTasks);
      if (currentProject.kanbanColumns) setColumns(currentProject.kanbanColumns);
    }
  }, [projectId]);

  if (!project) {
    return <div className="flex h-full items-center justify-center text-[#313131]/50 font-bold">Mencari Data Group Project...</div>;
  }

  // --- KUMPULAN WARNA TAG ---
  const getTagColor = (tag) => {
    switch(tag.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-600 border-red-200';
      case 'design': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'backend': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'research': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-[#B2B2B2]/20 text-[#313131] border-[#313131]/10';
    }
  };

  return (
    <>
      {/* CSS Khusus untuk menyembunyikan scrollbar tapi tetap bisa di-scroll */}
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="animate-in fade-in duration-500 h-full flex flex-col">
        
        {/* ================= HEADER AREA ================= */}
        <div className="flex-shrink-0 px-8 pt-8 pb-4 border-b border-[#313131]/10 bg-white/50">
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
              
              {/* Tumpukan Avatar Anggota Tim */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#313131] border-2 border-white flex items-center justify-center text-white text-[10px] font-bold z-10" title="You (Owner)">
                    ME
                  </div>
                  {(project.members || []).map((email, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full bg-[#4161FF] border-2 border-white flex items-center justify-center text-white text-[10px] font-bold z-0" title={email}>
                      {email.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-[#B2B2B2]/20 border-2 border-white flex items-center justify-center text-[#313131]/50 hover:text-[#4161FF] hover:bg-[#4161FF]/10 cursor-pointer transition-colors" title="Undang Anggota Baru">
                    <Plus size={14} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#313131]/50">{(project.members || []).length + 1} Kolaborator</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-white border border-[#313131]/10 text-[#313131] font-bold px-4 py-2.5 rounded-xl shadow-sm hover:border-[#4161FF] hover:text-[#4161FF] transition-all text-sm">
                <MessageSquare size={16} /> Team Chat
              </button>
              <button 
                onClick={() => {
                  const driveUrl = `https://drive.google.com/drive/folders/${project.folderId}`;
                  if (window.electron && window.electron.ipcRenderer) {
                    window.electron.ipcRenderer.send('open-auth-link', driveUrl);
                  } else {
                    window.open(driveUrl, '_blank');
                  }
                }}
                className="flex items-center gap-2 bg-[#4161FF] text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-all text-sm"
              >
                <HardDrive size={16} /> Buka Folder Drive
              </button>
            </div>
          </div>
        </div>

        {/* ================= KANBAN BOARD AREA ================= */}
        <div className="flex-1 overflow-x-auto hide-scroll p-8 bg-[#B2B2B2]/5">
          <div className="flex gap-6 h-full items-start">
            
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.colId === col.id);
              return (
                <div key={col.id} className="flex-shrink-0 w-[300px] flex flex-col max-h-full">
                  
                  {/* Kolom Header */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#313131]">{col.title}</h3>
                      <span className="bg-[#313131]/10 text-[#313131]/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {colTasks.length}
                      </span>
                    </div>
                    <button className="text-[#313131]/40 hover:text-[#4161FF] transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* Area Kartu (Scroll vertikal per kolom) */}
                  <div className="flex-1 overflow-y-auto hide-scroll space-y-3 pb-4">
                    {colTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="bg-white p-4 rounded-xl border border-[#313131]/10 shadow-sm hover:shadow-md hover:border-[#4161FF]/40 cursor-grab transition-all group"
                      >
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {task.tags.map(tag => (
                            <span key={tag} className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getTagColor(tag)}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <h4 className="font-bold text-[#313131] text-sm leading-tight mb-4">{task.title}</h4>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${task.date === 'Overdue' ? 'text-red-500' : 'text-[#313131]/40'}`}>
                            {task.date === 'Overdue' ? <AlertCircle size={12} /> : <Clock size={12} />}
                            {task.date}
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#4161FF]/10 text-[#4161FF] flex items-center justify-center text-[10px] font-bold border border-[#4161FF]/20">
                            {task.assignee}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Tombol Tambah Kartu */}
                    <button className="w-full flex items-center gap-2 text-[#313131]/40 hover:text-[#4161FF] p-3 hover:bg-[#4161FF]/5 rounded-xl transition-all font-bold text-sm border border-transparent hover:border-[#4161FF]/20 justify-center">
                      <Plus size={16} /> Add Task
                    </button>
                  </div>
                  
                </div>
              );
            })}

            {/* Tombol Tambah Kolom Kategori Baru */}
            <div className="flex-shrink-0 w-[300px]">
              <button className="w-full flex items-center justify-center gap-2 text-[#313131]/40 hover:text-[#313131] p-4 bg-white/50 border-2 border-dashed border-[#313131]/20 rounded-xl transition-all font-bold text-sm hover:bg-white hover:border-[#313131]/40 shadow-sm">
                <Plus size={16} /> Tambah Kategori
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default GroupProjectView;