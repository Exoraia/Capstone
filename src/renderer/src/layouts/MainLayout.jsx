import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Menu, ChevronRight, LayoutGrid, ChevronDown, User, FolderPlus, FilePlus, Settings, LogOut, Users 
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase'; 
import FileTreeNode from '../components/FileTreeNode';

const schedule = [
  { id: 'bash-bot', label: 'Bash the Bot Workshop', date: 'Jun 25' },
  { id: 'pbo-sync', label: 'PBO Assignment Sync', date: 'Jun 28' }
];

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const location = useLocation();

  const [fileSystem, setFileSystem] = useState([
    { id: 'f1', type: 'folder', name: 'Project Alpha', isOpen: true, children: [{ id: 'doc1', type: 'file', name: 'brainstorming.txt' }] },
    { id: 'doc3', type: 'file', name: 'Getting_Started.md' }
  ]);

  // Dengarkan status user dari Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari WorkNet?");
    if (confirmLogout) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Gagal melakukan sign out:", error.message);
      }
    }
  };

  const handleCreateFile = () => {
    const fileName = prompt("Enter new file name:");
    if (fileName) setFileSystem([...fileSystem, { id: Date.now().toString(), type: 'file', name: fileName }]);
  };

  const handleCreateFolder = () => {
    const folderName = prompt("Enter new folder name:");
    if (folderName) setFileSystem([...fileSystem, { id: Date.now().toString(), type: 'folder', name: folderName, isOpen: true, children: [] }]);
  };

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'My Projects';
    if (location.pathname === '/group-projects') return 'Group Projects';
    if (location.pathname === '/create-project') return 'Create Project';
    if (location.pathname === '/settings') return 'Settings';
    const activeEvent = schedule.find(e => location.pathname.includes(e.id));
    if (activeEvent) return activeEvent.label;
    return 'Workspace';
  };

  return (
    <div className="flex h-screen w-full bg-[#B2B2B2] text-[#313131] font-sans">
      
      {/* SIDEBAR */}
      {isSidebarOpen && (
        <aside className={`w-64 flex-shrink-0 flex flex-col bg-[#313131] text-[#B2B2B2] border-r border-[#313131] shadow-xl z-20`}>
          
          {/* PROFILE SECTION DENGAN FIREBASE DATA */}
          <div className="relative">
            <div 
              onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} 
              className={`h-11 flex items-center justify-between px-4 cursor-pointer hover:bg-[#4161FF] border-b border-[#B2B2B2]/10 transition-colors`}
            >
              <div className="flex items-center gap-2 font-medium text-sm max-w-[85%]">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-5 h-5 rounded object-cover border border-[#4161FF]/20" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-5 h-5 bg-[#B2B2B2] text-[#313131] rounded flex items-center justify-center text-xs font-bold shadow-sm">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-white font-bold truncate">
                  {user?.displayName ? `Hello, ${user.displayName.split(' ')[0]}` : 'Hello, User'}
                </span>
              </div>
              <ChevronDown size={14} className={isProfileMenuOpen ? "rotate-180 transition-transform text-white" : "transition-transform text-[#B2B2B2]"} />
            </div>

            {/* DROPDOWN MENU */}
            {isProfileMenuOpen && (
               <div className="absolute top-12 left-2 right-2 bg-[#313131] border border-[#4161FF] rounded-md shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#B2B2B2]/10 text-[11px] text-[#B2B2B2] font-medium truncate">
                    {user?.email}
                  </div>
                  <button 
                    onClick={handleSignOut} 
                    className="flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:bg-red-500 hover:text-white transition-colors text-red-400 font-bold"
                  > 
                    <LogOut size={14} /> Sign Out
                  </button>
               </div>
            )}
          </div>

          {/* AREA SCROLL (Jadwal & Folder) */}
          <div className="flex-1 overflow-y-auto py-3">
            
            <div className="px-2 mb-6">
              <div className="text-[11px] font-semibold text-[#B2B2B2]/60 px-2 mb-3 tracking-wider uppercase">Schedule</div>
              {schedule.map(event => (
                <Link key={event.id} to={`/schedule/${event.id}`} className={`flex flex-col px-3 py-2 rounded-md text-sm mb-1 transition-colors ${location.pathname.includes(event.id) ? 'bg-[#4161FF] text-white font-medium shadow-md' : 'text-[#B2B2B2] hover:bg-[#4161FF]/60 hover:text-white'}`}>
                  <span>{event.label}</span>
                  <span className="text-[10px] opacity-80 mt-0.5">{event.date}</span>
                </Link>
              ))}
            </div>

            <div className="px-2 mb-6">
              <div className="text-[11px] font-semibold text-[#B2B2B2]/60 px-2 mb-3 tracking-wider uppercase">Workspace</div>
              
              {/* Menu My Projects */}
              <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-1 ${location.pathname === '/dashboard' ? 'bg-[#4161FF] text-white font-medium shadow-md' : 'text-[#B2B2B2] hover:bg-[#4161FF]/60 hover:text-white'}`}>
                <LayoutGrid size={16} className={location.pathname === '/dashboard' ? "text-white" : "opacity-80"} /> 
                My Projects
              </Link>
              
              {/* Menu Group Projects */}
              <Link to="/group-projects" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${location.pathname === '/group-projects' ? 'bg-[#4161FF] text-white font-medium shadow-md' : 'text-[#B2B2B2] hover:bg-[#4161FF]/60 hover:text-white'}`}>
                <Users size={16} className={location.pathname === '/group-projects' ? "text-white" : "opacity-80"} /> 
                Group Projects
              </Link>
            </div>

            <div className="px-2 mb-6">
              <div className="flex items-center justify-between px-2 mb-2 group">
                <div className="text-[11px] font-semibold text-[#B2B2B2]/60 tracking-wider uppercase">Folders</div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={handleCreateFile} className="p-1 rounded hover:bg-[#4161FF] text-[#B2B2B2] hover:text-white" title="New File">
                    <FilePlus size={14} />
                  </button>
                  <button onClick={handleCreateFolder} className="p-1 rounded hover:bg-[#4161FF] text-[#B2B2B2] hover:text-white" title="New Folder">
                    <FolderPlus size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-0.5 mt-1 text-[#B2B2B2]">
                {fileSystem.map(node => <FileTreeNode key={node.id} node={node} />)}
              </div>
            </div>

          </div>

          {/* FOOTER SIDEBAR (Settings Pinned ke Bawah) */}
          <div className="p-3 border-t border-[#B2B2B2]/10 mt-auto">
            <Link 
              to="/settings" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-all ${location.pathname === '/settings' ? 'bg-[#4161FF] text-white shadow-md' : 'text-[#B2B2B2] hover:bg-[#B2B2B2]/10 hover:text-white'}`}
            >
              <Settings size={18} className={location.pathname === '/settings' ? "text-white" : "opacity-80"} /> 
              Settings
            </Link>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
        
        <header className="h-11 bg-[#B2B2B2] flex items-center justify-between px-3 border-b border-[#313131]/10 shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-[#313131]">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-[#313131]/10 rounded transition-colors text-[#313131]"> 
              <Menu size={20} /> 
            </button>
            <span className="cursor-pointer hover:underline text-[#313131]/70">Workspace</span>
            <ChevronRight size={16} className="text-[#313131]" />
            <span className="text-[#313131] font-bold">{getPageTitle()}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-10">
             <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;