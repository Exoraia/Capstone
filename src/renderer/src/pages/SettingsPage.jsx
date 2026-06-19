import React, { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase'; 
import { User, LogOut, RefreshCw, X } from 'lucide-react';

function SettingsPage() {
  const [user, setUser] = useState(null);
  
  // State untuk mengontrol Custom Modal
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'logout' atau 'switch'
    title: '',
    message: '',
    actionLabel: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Membuka modal konfirmasi Log Out
  const openLogoutModal = () => {
    setModal({
      isOpen: true,
      type: 'logout',
      title: 'Keluar dari WorkNet?',
      message: 'Sesi aktif Anda akan berakhir. Anda perlu masuk kembali menggunakan akun Google untuk mengakses kembali semua tugas dan project workspace Anda.',
      actionLabel: 'Sign Out'
    });
  };

  // Membuka modal konfirmasi Ganti Akun
  const openSwitchModal = () => {
    setModal({
      isOpen: true,
      type: 'switch',
      title: 'Ganti Akun Google?',
      message: 'Sistem akan mengakhiri sesi aktif Anda saat ini dan memunculkan jendela pop-up pilihan akun Google baru. Apakah Anda ingin melanjutkan?',
      actionLabel: 'Ganti Akun'
    });
  };

  // Mengeksekusi aksi setelah user menekan tombol konfirmasi di dalam modal
  const handleConfirmAction = async () => {
    const actionType = modal.type;
    
    // Tutup modal terlebih dahulu dengan transisi halus
    setModal(prev => ({ ...prev, isOpen: false }));

    try {
      if (actionType === 'logout' || actionType === 'switch') {
        await signOut(auth);
        console.log(`Berhasil mengeksekusi sesi: ${actionType}`);
      }
    } catch (error) {
      console.error("Gagal melakukan aksi autentikasi:", error.message);
      alert("Terjadi kesalahan: " + error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-8 animate-in fade-in duration-300 font-sans relative">
      
      {/* HEADER UTAMA */}
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola preferensi akun dan konfigurasi aplikasi WorkNet Anda.</p>
      </div>

      <div className="space-y-6">
        
        {/* KARTU PROFIL PENGGUNA */}
        <section className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-14 h-14 rounded-full border border-gray-200 shadow-sm object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-800 text-base">{user?.displayName || 'User Account'}</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{user?.email || 'No email connected'}</p>
            </div>
          </div>
          
          <div className="self-start sm:self-center">
            <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 shadow-sm">
              Authenticated via Google
            </span>
          </div>
        </section>

        {/* ACCOUNT OPTIONS SECTION */}
        <section className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="p-4 bg-gray-50/60 border-b border-gray-100 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            <h2 className="font-bold text-gray-700 text-sm">Account Options</h2>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-md">
              <h4 className="font-bold text-gray-800 text-sm">Manajemen Sesi Akun</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Anda dapat mengganti akun dengan email Google yang berbeda atau keluar sepenuhnya dari aplikasi pada perangkat ini.
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* TOMBOL GANTI AKUN */}
              <button
                onClick={openSwitchModal}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-sm rounded-xl transition-all border border-blue-100 hover:border-blue-600 shadow-sm"
              >
                <RefreshCw size={16} />
                Ganti Akun
              </button>

              {/* TOMBOL SIGN OUT */}
              <button
                onClick={openLogoutModal}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-sm rounded-xl transition-all border border-red-100 hover:border-red-600 shadow-sm"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ================= CUSTOM MODERN CONFIRMATION MODAL ================= */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bagian Atas: Ikon Dinamis & Tombol Close Silang */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${modal.type === 'logout' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                {modal.type === 'logout' ? <LogOut size={24} /> : <RefreshCw size={24} />}
              </div>
              <button 
                onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Isi Konten Teks */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">{modal.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{modal.message}</p>

            {/* Tombol Aksi Pilihan */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button
                onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 font-bold text-sm text-gray-600 rounded-xl transition-all shadow-sm"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-5 py-2.5 font-bold text-sm text-white rounded-xl transition-all shadow-md ${
                  modal.type === 'logout' 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/10' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/10'
                }`}
              >
                {modal.actionLabel}
              </button>
            </div>

          </div>
        </div>
      )}
      {/* =================================================================== */}

    </div>
  );
}

export default SettingsPage;