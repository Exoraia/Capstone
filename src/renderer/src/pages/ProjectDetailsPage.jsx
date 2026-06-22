import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PersonalProjectView from '../components/PersonalProjectView';
import GroupProjectView from '../components/GroupProjectView';

// Import Firestore
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectType, setProjectType] = useState(null);
  const [isError, setIsError] = useState(false); // BARU: State Error

  useEffect(() => {
    // Tambahkan pengecekan ini agar tidak memanggil Firestore dengan ID kosong
    if (!projectId) return;

    const checkProjectType = async () => {
      try {
        const docRef = doc(db, 'worknet_projects', projectId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProjectType(docSnap.data().type || 'personal');
        } else {
          console.error("Project tidak ditemukan di database!");
          setIsError(true);
        }
      } catch (error) {
        console.error("Gagal mengecek tipe project:", error);
        // Jika offline, coba cek apakah ada data di cache (Firestore akan otomatis mencoba)
        setIsError(true); 
      }
    };

    checkProjectType();
  }, [projectId]);

  // --- LAYAR ERROR JIKA KONEKSI TERPUTUS/GAGAL ---
  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center flex-col text-[#313131] gap-4 animate-in fade-in">
        <AlertCircle size={48} className="text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-bold mb-1">Gagal Membuka Project</h2>
          <p className="text-sm text-[#313131]/60">Project tidak ditemukan atau koneksi ke server terputus.</p>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-2 flex items-center gap-2 bg-[#B2B2B2]/20 hover:bg-[#B2B2B2]/40 text-[#313131] font-bold px-5 py-2.5 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </button>
      </div>
    );
  }

  // --- LAYAR LOADING NORMAL ---
  if (!projectType) {
    return (
      <div className="flex h-screen items-center justify-center flex-col text-[#313131]/50 gap-3">
        <Loader2 size={32} className="animate-spin text-[#4161FF]" />
        <span className="font-bold">Membuka Project...</span>
      </div>
    );
  }

  // --- SANG SATPAM MERENDER KOMPONEN SESUAI TIPE ---
  if (projectType === 'group') {
    return <GroupProjectView projectId={projectId} />;
  }

  return <PersonalProjectView projectId={projectId} />;
};

export default ProjectDetailsPage;