import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pin, Clock, Filter } from 'lucide-react';

const AVAILABLE_TAGS = ['Kewarganegaraan', 'Statistika', 'PBO', 'Internet of Things', 'Cybersecurity'];

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // State dimulai dari array kosong
  const [projects, setProjects] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [deadlineFilter, setDeadlineFilter] = useState('all');

  // --- BARU: Mengambil Data dari LocalStorage saat komponen dimuat ---
  useEffect(() => {
    // 1. Ambil SEMUA data dari memory lokal
    const savedProjects = JSON.parse(localStorage.getItem('worknet_projects') || '[]');
    
    // 2. FILTER: Hanya ambil project yang sifatnya personal (tanpa member)
    const personalProjects = savedProjects
      .filter(p => p.type !== 'group')
      .map(p => ({
        ...p,
        // Fallback default untuk memastikan UI tidak error jika ada data lama yang kurang lengkap
        tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Internet of Things'],
        daysLeft: p.daysLeft !== undefined ? p.daysLeft : 14,
        progress: p.progress || 0,
        isPinned: p.isPinned || false
      }));

    setProjects(personalProjects);
  }, []);

  // --- DIPERBARUI: Fungsi Pin agar tersimpan permanen di memori ---
  const togglePin = (id, e) => {
    e.stopPropagation();
    
    // 1. Update UI secara instan
    const updatedProjects = projects.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p);
    setProjects(updatedProjects);

    // 2. Simpan status Pin yang baru ke LocalStorage
    const allSaved = JSON.parse(localStorage.getItem('worknet_projects') || '[]');
    const newSaved = allSaved.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p);
    localStorage.setItem('worknet_projects', JSON.stringify(newSaved));
  };

  const toggleTagFilter = (tag) => {
    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag));
    else setSelectedTags([...selectedTags, tag]);
  };

  const filteredProjects = projects.filter(p => {
    if (selectedTags.length > 0 && !p.tags.some(t => selectedTags.includes(t))) return false;
    if (deadlineFilter === 'under7' && p.daysLeft >= 7) return false;
    if (deadlineFilter === '7to14' && (p.daysLeft < 7 || p.daysLeft > 14)) return false;
    if (deadlineFilter === 'above14' && p.daysLeft <= 14) return false;
    return true;
  });

  const pinnedProjects = filteredProjects.filter(p => p.isPinned);
  const ongoingProjects = filteredProjects.filter(p => !p.isPinned);

  return (
    <div className="flex flex-col md:flex-row gap-8 mt-4 animate-in fade-in duration-500">
      
      {/* FILTER KIRI */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-[#313131] mb-3 border-b border-[#313131]/20 pb-2">
            <Filter size={18} className="text-[#4161FF]" /> Filter :
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map(tag => (
              <button 
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  selectedTags.includes(tag) 
                    ? 'bg-[#4161FF] text-white border-[#4161FF] shadow-md' 
                    : 'bg-white text-[#313131] border-[#313131]/30 hover:bg-[#313131] hover:text-[#B2B2B2]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#313131] mb-3">Sort by deadline :</h3>
          <div className="space-y-2 text-sm font-medium text-[#313131]">
            {['all', 'under7', '7to14', 'above14'].map((val) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer hover:text-[#4161FF] transition-colors">
                <input 
                  type="radio" name="deadline" 
                  checked={deadlineFilter === val} 
                  onChange={() => setDeadlineFilter(val)} 
                  className="accent-[#4161FF] w-4 h-4" 
                />
                {val === 'all' ? 'All Time' : val === 'under7' ? 'Under 7 days' : val === '7to14' ? '7 - 14 days' : 'Above 14 days'}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* AREA KANAN */}
      <div className="flex-1 space-y-8">
        {pinnedProjects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#313131] mb-4 flex items-center gap-2">
               Pinned Project
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {pinnedProjects.map(proj => <ProjectCard key={proj.id} proj={proj} onTogglePin={togglePin} />)}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-[#313131] mb-4 border-b border-[#313131]/20 pb-2">On Going</h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {ongoingProjects.map(proj => <ProjectCard key={proj.id} proj={proj} onTogglePin={togglePin} />)}
            
            {/* Tombol Buat Project Baru Selalu Ada di Akhir */}
            <div 
              onClick={() => navigate('/create-project')}
              className="border-2 border-dashed border-[#313131]/30 rounded-xl p-6 flex flex-col items-center justify-center text-[#313131] hover:text-[#4161FF] hover:border-[#4161FF] hover:bg-white cursor-pointer transition-all min-h-[160px] bg-white/50"
            >
              <Plus size={32} className="mb-2" />
              <span className="font-bold">Create new project</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN KARTU ---
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
              <span key={tag} className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#B2B2B2]/30 text-[#313131] border border-[#313131]/10">
                {tag}
              </span>
            ))}
          </div>
          
          <button 
            onClick={(e) => onTogglePin(proj.id, e)}
            className={`p-1.5 rounded-full transition-colors z-10 relative ${proj.isPinned ? 'bg-[#4161FF] text-white' : 'text-[#313131] hover:bg-[#B2B2B2] hover:text-[#4161FF]'}`}
          >
            <Pin size={16} className={proj.isPinned ? 'fill-current' : ''} />
          </button>
        </div>
        
        <h3 className="font-bold text-lg text-[#313131] leading-tight">{proj.title}</h3>
        <p className="text-xs text-[#313131]/70 mt-1 flex items-center gap-1 font-semibold">
          <Clock size={12} /> {proj.daysLeft} days left
        </p>
      </div>
      
      <div className="mt-5">
        <div className="flex justify-between text-xs font-bold text-[#313131] mb-1.5">
          <span>Progress :</span>
          <span>{proj.progress}%</span>
        </div>
        <div className="w-full bg-[#B2B2B2]/40 rounded-full h-2">
          <div className="bg-[#4161FF] h-2 rounded-full transition-all duration-500" style={{ width: `${proj.progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;