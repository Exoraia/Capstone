import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pin, Clock, Users } from 'lucide-react';

const GroupProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Ambil SEMUA data dari memory lokal
    const savedProjects = JSON.parse(localStorage.getItem('worknet_projects') || '[]');
    
    // FILTER: Hanya ambil project yang sifatnya Group (memiliki member)
    const groupProjects = savedProjects
      .filter(p => p.type === 'group')
      .map(p => ({
        ...p,
        tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Team Project'],
        daysLeft: p.daysLeft !== undefined ? p.daysLeft : 14,
        progress: p.progress || 0,
        isPinned: p.isPinned || false
      }));

    setProjects(groupProjects);
  }, []);

  const togglePin = (id, e) => {
    e.stopPropagation();
    
    // Update UI
    const updatedProjects = projects.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p);
    setProjects(updatedProjects);

    // Simpan status Pin ke LocalStorage
    const allSaved = JSON.parse(localStorage.getItem('worknet_projects') || '[]');
    const newSaved = allSaved.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p);
    localStorage.setItem('worknet_projects', JSON.stringify(newSaved));
  };

  const pinnedProjects = projects.filter(p => p.isPinned);
  const ongoingProjects = projects.filter(p => !p.isPinned);

  return (
    <div className="flex flex-col gap-8 mt-4 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER GROUP PROJECTS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#313131]/20 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#313131] flex items-center gap-2">
            <Users size={24} className="text-[#4161FF]" /> Group Projects
          </h1>
          <p className="text-sm text-[#313131]/60 mt-1 font-medium">Daftar workspace kolaboratif tim Anda yang terintegrasi dengan Google Drive.</p>
        </div>
        <button
          onClick={() => navigate('/create-project')}
          className="bg-[#4161FF] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#313131] transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={16} /> New Group Project
        </button>
      </div>

      <div className="flex-1 space-y-8">
        
        {/* PINNED PROJECTS */}
        {pinnedProjects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#313131] mb-4 flex items-center gap-2">
               Pinned Project
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pinnedProjects.map(proj => <ProjectCard key={proj.id} proj={proj} onTogglePin={togglePin} />)}
            </div>
          </div>
        )}

        {/* ON GOING PROJECTS */}
        <div>
          <h2 className="text-xl font-bold text-[#313131] mb-4 border-b border-[#313131]/10 pb-2">On Going</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {ongoingProjects.map(proj => <ProjectCard key={proj.id} proj={proj} onTogglePin={togglePin} />)}
            
            {/* Tombol Buat Project Baru Jika Masih Kosong */}
            {projects.length === 0 && (
              <div 
                onClick={() => navigate('/create-project')}
                className="border-2 border-dashed border-[#313131]/30 rounded-xl p-6 flex flex-col items-center justify-center text-[#313131] hover:text-[#4161FF] hover:border-[#4161FF] hover:bg-white cursor-pointer transition-all min-h-[160px] bg-white/50"
              >
                <Plus size={32} className="mb-2" />
                <span className="font-bold text-sm">Create group project</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- KOMPONEN KARTU PROJECT ---
const ProjectCard = ({ proj, onTogglePin }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/project/${proj.id}`)} 
      className="border border-[#313131]/10 rounded-xl p-5 hover:shadow-lg transition-all bg-white flex flex-col justify-between min-h-[160px] cursor-pointer group relative overflow-hidden shadow-sm"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${proj.progress === 100 ? 'bg-green-500' : 'bg-[#4161FF]'}`}></div>

      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2 flex-wrap">
            {proj.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#B2B2B2]/30 text-[#313131] border border-[#313131]/10">
                {tag}
              </span>
            ))}
          </div>
          
          <button 
            onClick={(e) => onTogglePin(proj.id, e)}
            className={`p-1.5 rounded-full transition-colors z-10 relative ${proj.isPinned ? 'bg-[#4161FF] text-white' : 'text-[#313131] hover:bg-[#B2B2B2] hover:text-[#4161FF]'}`}
          >
            <Pin size={14} className={proj.isPinned ? 'fill-current' : ''} />
          </button>
        </div>
        
        <h3 className="font-bold text-base text-[#313131] leading-tight mb-2">{proj.title}</h3>
        
        {/* Indikator Group */}
        <div className="flex items-center gap-1.5 mb-2">
           <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full bg-[#313131] flex items-center justify-center text-white text-[8px] font-bold border border-white">ME</div>
              {(proj.members || []).slice(0, 2).map((email, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-[#4161FF] flex items-center justify-center text-white text-[8px] font-bold border border-white">
                  {email.charAt(0).toUpperCase()}
                </div>
              ))}
           </div>
           <span className="text-[10px] font-semibold text-[#313131]/50 ml-1">
             {(proj.members || []).length > 0 ? `+${proj.members.length} members` : 'Team'}
           </span>
        </div>

        <p className="text-[11px] text-[#313131]/70 mt-1 flex items-center gap-1 font-semibold">
          <Clock size={12} /> {proj.daysLeft} days left
        </p>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-bold text-[#313131] mb-1.5">
          <span>Progress :</span>
          <span>{proj.progress}%</span>
        </div>
        <div className="w-full bg-[#B2B2B2]/40 rounded-full h-1.5">
          <div className="bg-[#4161FF] h-1.5 rounded-full transition-all duration-500" style={{ width: `${proj.progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default GroupProjectsPage;