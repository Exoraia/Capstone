import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pin, Clock, Users, Loader2, Trash2, AlertCircle } from 'lucide-react';

// Import Firestore, Auth, dan fungsi Drive
import { collection, query, where, getDocs, getDocsFromCache, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { deleteDriveFolder } from '../services/drive'; 

const GroupProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk modal hapus
  const [deletePrompt, setDeletePrompt] = useState({ isOpen: false, projectId: null, projectTitle: '', folderId: '' });

  // --- MENGAMBIL DATA DARI CLOUD (ANTI-LAG & FILTER KOLABORASI) ---
  useEffect(() => {
    const fetchGroupProjects = async (user) => {
      try {
        // Ambil SEMUA project yang tipenya 'group'
        const q = query(
          collection(db, 'worknet_projects'),
          where('type', '==', 'group')
        );
        
        let querySnapshot;
        try {
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
          querySnapshot = await Promise.race([getDocs(q), timeout]);
        } catch (networkError) {
          console.warn("Koneksi lambat, mengambil data dari Cache Lokal...");
          querySnapshot = await getDocsFromCache(q);
        }
        
        // Filter agar HANYA memunculkan project di mana user adalah Pembuat ATAU Anggota
        const fetchedProjects = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }))
        .filter(p => p.ownerId === user.uid || (p.members && p.members.includes(user.email)))
        .map(p => ({
          ...p,
          tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Team Project'],
          daysLeft: p.daysLeft !== undefined ? p.daysLeft : 14,
          progress: p.progress || 0,
          isPinned: p.isPinned || false
        }));

        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Gagal menarik data dari Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchGroupProjects(user);
      else { setProjects([]); setIsLoading(false); }
    });

    return () => unsubscribe();
  }, []);

  // --- PIN PROJECT (FIRE-AND-FORGET) ---
  const togglePin = (id, e) => {
    e.stopPropagation();
    const targetProject = projects.find(p => p.id === id);
    if (!targetProject) return;

    const newPinStatus = !targetProject.isPinned;
    setProjects(projects.map(p => p.id === id ? { ...p, isPinned: newPinStatus } : p));

    const projectRef = doc(db, 'worknet_projects', id);
    updateDoc(projectRef, { isPinned: newPinStatus }).catch(err => {
      console.warn("Gagal update pin ke Cloud:", err);
    });
  };

  // --- MENGHAPUS PROJECT & DRIVE (FIRE-AND-FORGET) ---
  const handleDeleteClick = (proj, e) => {
    e.stopPropagation(); 
    setDeletePrompt({ isOpen: true, projectId: proj.id, projectTitle: proj.title, folderId: proj.folderId });
  };

  const confirmDelete = () => {
    if (!deletePrompt.projectId) return;

    const idToDelete = deletePrompt.projectId;
    const folderToDelete = deletePrompt.folderId;

    // 1. Langsung hapus dari layar UI
    setProjects(projects.filter(p => p.id !== idToDelete));
    
    // 2. Tutup Modal
    setDeletePrompt({ isOpen: false, projectId: null, projectTitle: '', folderId: '' });

    // 3. Hapus Firebase di background
    deleteDoc(doc(db, 'worknet_projects', idToDelete)).catch(error => {
      console.warn("Firebase gagal hapus:", error);
    });

    // 4. Hapus Folder di Google Drive (jika bukan folder dummy lokal)
    if (folderToDelete && !folderToDelete.startsWith('local_folder_')) {
      deleteDriveFolder(folderToDelete).catch(error => {
        console.warn("Gagal menghapus folder dari Google Drive. Mungkin Token Expired:", error);
      });
    }
  };

  const pinnedProjects = projects.filter(p => p.isPinned);
  const ongoingProjects = projects.filter(p => !p.isPinned);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col text-[#313131]/50 gap-3">
        <Loader2 size={32} className="animate-spin text-[#4161FF]" />
        <span className="font-bold">Menarik Data Group dari Cloud...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mt-4 animate-in fade-in duration-500 max-w-6xl mx-auto relative pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#313131]/20 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#313131] flex items-center gap-2">
            <Users size={24} className="text-[#4161FF]" /> Group Projects
          </h1>
          <p className="text-sm text-[#313131]/60 mt-1 font-medium">Daftar workspace kolaboratif tim Anda yang terintegrasi dengan Google Drive.</p>
        </div>
        
        {/* URL KINI MENGGUNAKAN ?type=group */}
        <button 
          onClick={() => navigate('/create-project?type=group')} 
          className="bg-[#4161FF] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#313131] transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={16} /> New Group Project
        </button>
      </div>

      <div className="flex-1 space-y-8">
        {pinnedProjects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#313131] mb-4 flex items-center gap-2">Pinned Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pinnedProjects.map(proj => <ProjectCard key={proj.id} proj={proj} onTogglePin={togglePin} onDeleteClick={handleDeleteClick} />)}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-[#313131] mb-4 border-b border-[#313131]/10 pb-2">On Going</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {ongoingProjects.map(proj => <ProjectCard key={proj.id} proj={proj} onTogglePin={togglePin} onDeleteClick={handleDeleteClick} />)}
            
            {projects.length === 0 && (
              <div 
                onClick={() => navigate('/create-project?type=group')} 
                className="border-2 border-dashed border-[#313131]/30 rounded-xl p-6 flex flex-col items-center justify-center text-[#313131] hover:text-[#4161FF] hover:border-[#4161FF] hover:bg-white cursor-pointer transition-all min-h-[160px] bg-white/50"
              >
                <Plus size={32} className="mb-2" />
                <span className="font-bold text-sm">Create group project</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS PROJECT */}
      {deletePrompt.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in" onClick={() => setDeletePrompt({isOpen: false, projectId: null, projectTitle: '', folderId: ''})}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-500 flex items-center justify-center rounded-full mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#313131] mb-2">Hapus Project Tim?</h3>
            <p className="text-sm text-[#313131]/60 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus project <br/><strong>"{deletePrompt.projectTitle}"</strong><br/> beserta folder Drive-nya secara permanen?
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeletePrompt({isOpen: false, projectId: null, projectTitle: '', folderId: ''})} className="flex-1 py-2.5 bg-[#B2B2B2]/20 rounded-xl text-sm font-bold text-[#313131] hover:bg-[#B2B2B2]/40 transition-colors">Batal</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 rounded-xl text-sm font-bold text-white hover:bg-red-600 shadow-md transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- KOMPONEN KARTU ---
const ProjectCard = ({ proj, onTogglePin, onDeleteClick }) => {
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
              <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#B2B2B2]/30 text-[#313131] border border-[#313131]/10">{tag}</span>
            ))}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Tombol Hapus */}
            <button 
              onClick={(e) => onDeleteClick(proj, e)} 
              className="p-1.5 rounded-full transition-all z-10 relative text-[#313131]/30 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100" 
              title="Hapus Project"
            >
              <Trash2 size={16} />
            </button>
            {/* Tombol Pin */}
            <button 
              onClick={(e) => onTogglePin(proj.id, e)} 
              className={`p-1.5 rounded-full transition-colors z-10 relative ${proj.isPinned ? 'bg-[#4161FF] text-white' : 'text-[#313131] hover:bg-[#B2B2B2] hover:text-[#4161FF]'}`}
            >
              <Pin size={14} className={proj.isPinned ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        <h3 className="font-bold text-base text-[#313131] leading-tight mb-2">{proj.title}</h3>
        
        {/* Lingkaran Avatar Members */}
        <div className="flex items-center gap-1.5 mb-2 mt-3">
           <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full bg-[#313131] flex items-center justify-center text-white text-[8px] font-bold border border-white relative z-10">ME</div>
              {(proj.members || []).slice(0, 3).map((email, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-[#4161FF] flex items-center justify-center text-white text-[8px] font-bold border border-white relative" style={{ zIndex: 9 - i }}>
                  {email.charAt(0).toUpperCase()}
                </div>
              ))}
           </div>
           <span className="text-[10px] font-semibold text-[#313131]/50 ml-1">{(proj.members || []).length > 0 ? `+${proj.members.length} members` : 'Team'}</span>
        </div>
        
        <p className="text-[11px] text-[#313131]/70 mt-1 flex items-center gap-1 font-semibold"><Clock size={12} /> {proj.daysLeft} days left</p>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-bold text-[#313131] mb-1.5">
          <span>Progress :</span><span>{proj.progress}%</span>
        </div>
        <div className="w-full bg-[#B2B2B2]/40 rounded-full h-1.5">
          <div className="bg-[#4161FF] h-1.5 rounded-full transition-all duration-500" style={{ width: `${proj.progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default GroupProjectsPage;