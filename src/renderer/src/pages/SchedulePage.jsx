import React from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, Video, Shield, Code } from 'lucide-react';

// Data jadwal dipindahkan ke sini agar mudah dikelola
const scheduleData = [
  { id: 'bash-bot', label: 'Bash the Bot Workshop', date: 'Jun 25', fullDate: 'June 25, 2026', time: 'Online', host: 'TryHackMe', description: 'Live AI pentesting workshop. We will be testing vulnerabilities in automated systems and bots. Ensure local environment is prepped.', icon: Shield },
  { id: 'pbo-sync', label: 'PBO Assignment Sync', date: 'Jun 28', fullDate: 'June 28, 2026', time: '14:00 PM', host: 'GitHub Collab', description: 'Syncing up on the final repository commits and verifying the Firebase Studio migration for the project.', icon: Code }
];

const SchedulePage = () => {
  // useParams mengambil ID dari URL (contoh: /schedule/bash-bot akan mengambil 'bash-bot')
  const { eventId } = useParams(); 
  
  // Cari data jadwal yang sesuai dengan ID di URL
  const activeEvent = scheduleData.find(e => e.id === eventId);

  // Jika URL tidak cocok dengan jadwal manapun
  if (!activeEvent) {
    return <div className="text-[#313131]/60 italic mt-8 animate-in fade-in">Event not found...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header Halaman Jadwal */}
      <div className="mb-10 group relative">
        <h1 className="text-4xl font-bold tracking-tight text-[#313131]">
          {activeEvent.label}
        </h1>
      </div>

      {/* Konten Detail Jadwal */}
      <div className="space-y-6 text-base leading-relaxed">
        
        {/* Baris Info Meta */}
        <div className="flex items-center gap-6 text-sm text-[#313131]/80 border-b border-[#313131]/20 pb-5">
           <div className="flex items-center gap-2"><Calendar size={16} className="text-[#4161FF]" /> {activeEvent.fullDate}</div>
           <div className="flex items-center gap-2"><Clock size={16} className="text-[#4161FF]" /> {activeEvent.time}</div>
           <div className="flex items-center gap-2"><Video size={16} className="text-[#4161FF]" /> {activeEvent.host}</div>
        </div>
        
        <p className="mt-6 text-[#313131] text-[15px]">
          {activeEvent.description}
        </p>

        {/* Kotak Pengingat */}
        <div className="flex gap-3 p-4 rounded-md bg-[#4161FF] mt-8 shadow-sm">
          <span className="mt-0.5">🔔</span>
          <div className="text-sm text-white">
            <strong>Preparation:</strong> Make sure to upload any necessary reference files or notes into the Folders directory below before the event begins.
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SchedulePage;