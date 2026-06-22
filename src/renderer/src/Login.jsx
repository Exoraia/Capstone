import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from './services/firebase';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Ambil dan simpan token Google Drive ke Local Storage
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        localStorage.setItem('googleDriveToken', credential.accessToken);
        console.log("Token Drive Berhasil Disimpan!");
      }

      navigate('/dashboard');
    } catch (err) {
      console.error("Gagal Login:", err);
      setError(err.message || "Gagal masuk menggunakan Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#B2B2B2] items-center justify-center font-sans">
      <div className="bg-[#313131] w-full max-w-md rounded-2xl shadow-2xl p-8 border border-[#B2B2B2]/10 animate-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#4161FF] rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white text-2xl font-black tracking-tighter">W</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">WorkNet</h1>
          <p className="text-[#B2B2B2]/60 text-sm mt-1">Campus Collaboration Workspace</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-semibold p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#313131] font-bold py-3 rounded-xl hover:bg-[#B2B2B2] transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Memproses...' : 'Lanjutkan dengan Google'}
        </button>
      </div>
    </div>
  );
};

export default Login;