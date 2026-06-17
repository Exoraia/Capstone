import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import semua halaman yang sudah kita buat
import Login from './Login';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import CreateProjectPage from './pages/CreateProjectPage'; 
import ProjectDetailsPage from './pages/ProjectDetailsPage';

function App() {
  // Ubah ke false nanti jika ingin mengaktifkan halaman login kembali
  const [isAuthenticated, setIsAuthenticated] = useState(true); 

  return (
    <Router>
      <Routes>
        {/* Rute Login */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

        {/* Rute Ber-Layout (Hanya bisa diakses jika login) */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/schedule/:eventId" element={<SchedulePage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route path="/project/:projectId" element={<ProjectDetailsPage />} />          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;