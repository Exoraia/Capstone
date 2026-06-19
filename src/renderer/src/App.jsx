import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase'; 

// Import semua halaman yang sudah kita buat
import Login from './Login';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import CreateProjectPage from './pages/CreateProjectPage'; 
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import SettingsPage from './pages/SettingsPage'; 
import FolderPage from './pages/FolderPage'; // <-- INI YANG MEMBUAT LAYAR ANDA PUTIH! (Baru ditambahkan)

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true); 
      } else {
        setIsAuthenticated(false); 
      }
      setIsLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500 font-bold font-sans">
        Memuat Workspace...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rute Login */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

        {/* Rute Ber-Layout (Hanya bisa diakses jika terautentikasi) */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/schedule/:eventId" element={<SchedulePage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route path="/project/:projectId" element={<ProjectDetailsPage />} />    
          
          {/* Parameter diubah menjadi :folderId agar cocok dengan FolderPage.jsx */}
          <Route path="/folder/:folderId" element={<FolderPage />} />
          
          <Route path="/settings" element={<SettingsPage />} />      
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 