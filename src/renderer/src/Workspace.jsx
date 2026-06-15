import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown,
  Menu, 
  Folder,
  File,
  FolderPlus,
  FilePlus,
  User,
  Settings as SettingsIcon,
  Calendar,
  Clock,
  Video,
  Shield,
  Code,
  LayoutGrid,
  Plus,
  MoreVertical,
  Pin,
  Filter
} from 'lucide-react';

const schedule = [
  { id: 'bash-bot', label: 'Bash the Bot Workshop', date: 'Jun 25', fullDate: 'June 25, 2026', time: 'Online', host: 'TryHackMe', description: 'Live AI pentesting workshop. We will be testing vulnerabilities in automated systems and bots.', icon: Shield, emoji: '🛡️' },
  { id: 'pbo-sync', label: 'PBO Assignment Sync', date: 'Jun 28', fullDate: 'June 28, 2026', time: '14:00 PM', host: 'GitHub Collab', description: 'Syncing up on the final repository commits and verifying the Firebase Studio migration.', icon: Code, emoji: '💻' }
];

const AVAILABLE_TAGS = ['Kewarganegaraan', 'Statistika', 'PBO', 'Internet of Things', 'Cybersecurity'];

const Workspace = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeModuleId, setActiveModuleId] = useState('my-projects'); 
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  const [projects, setProjects] = useState([
    { id: 'p1', title: 'Rest API Connection', status: 'Ongoing', progress: 50, tags: ['Internet of Things'], isPinned: true, daysLeft: 4 },
    { id: 'p2', title: 'PBO Final Assignment', status: 'In Progress', progress: 75, tags: ['PBO'], isPinned: false, daysLeft: 12 },
    { id: 'p3', title: 'TryHackMe Writeups', status: 'Ongoing', progress: 40, tags: ['Cybersecurity'], isPinned: false, daysLeft: 20 },
    { id: 'p4', title: 'Citizenship Essay', status: 'Planning', progress: 10, tags: ['Kewarganegaraan'], isPinned: false, daysLeft: 2 }
  ]);

  const [selectedTags, setSelectedTags] = useState([]);
  const [deadlineFilter, setDeadlineFilter] = useState('all'); 

  // --- File System State ---
  const [fileSystem, setFileSystem] = useState([
    { id: 'f1', type: 'folder', name: 'Project Alpha', isOpen: true, children: [{ id: 'doc1', type: 'file', name: 'brainstorming.txt' }] },
    { id: 'doc3', type: 'file', name: 'Getting_Started.md' }
  ]);

  const activeEvent = schedule.find(e => e.id === activeModuleId);

  const textMain = "text-[#37352f]";
  const textMuted = "text-[#787774]";
  const bgHoverLight = "hover:bg-[#efefed]";
  const bgSidebarDark = "bg-[#252526]"; 
  const textSidebarMain = "text-[#cccccc]"; 
  const textSidebarMuted = "text-[#8a8a8a]"; 
  const bgSidebarHover = "hover:bg-[#2a2d2e]"; 
  const bgSidebarActive = "bg-[#37373d]"; 

  const togglePin = (id, e) => {
    e.stopPropagation(); 
    setProjects(projects.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
  };

  const toggleTagFilter = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreateProject = () => {
    const projName = prompt("Enter new project title:");
    if (projName) {
      const newProj = { id: Date.now().toString(), title: projName, status: 'Just Started', progress: 0, tags: [], isPinned: false, daysLeft: 30 };
      setProjects([...projects, newProj]);
    }
  };

  // Folders Handlers
  const handleCreateFile = () => {
    const fileName = prompt("Enter new file name:");
    if (fileName) {
      const newFile = { id: Date.now().toString(), type: 'file', name: fileName };
      setFileSystem([...fileSystem, newFile]);
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt("Enter new folder name:");
    if (folderName) {
      const newFolder = { id: Date.now().toString(), type: 'folder', name: folderName, isOpen: true, children: [] };
      setFileSystem([...fileSystem, newFolder]);
    }
  };

  let filteredProjects = projects.filter(p => {
    if (selectedTags.length > 0 && !p.tags.some(t => selectedTags.includes(t))) return false;
    if (deadlineFilter === 'under7' && p.daysLeft >= 7) return false;
    if (deadlineFilter === '7to14' && (p.daysLeft < 7 || p.daysLeft > 14)) return false;
    if (deadlineFilter === 'above14' && p.daysLeft <= 14) return false;
    return true;
  });

  const pinnedProjects = filteredProjects.filter(p => p.isPinned);
  const ongoingProjects = filteredProjects.filter(p => !p.isPinned);

  const renderContent = () => {
    if (activeModuleId === 'my-projects') {
      return (
        <div className="animate-in fade-in duration-500 flex flex-col md:flex-row gap-8 mt-4">
          <div className="w-full md:w-64 flex-shrink-0 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                <Filter size={18} /> Filters
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => toggleTagFilter(tag)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      selectedTags.includes(tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Sort by deadline :</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="deadline" checked={deadlineFilter === 'all'} onChange={() => setDeadlineFilter('all')} className="accent-blue-600" />
                  All Time
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="deadline" checked={deadlineFilter === 'under7'} onChange={() => setDeadlineFilter('under7')} className="accent-blue-600" />
                  Under 7 days
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="deadline" checked={deadlineFilter === '7to14'} onChange={() => setDeadlineFilter('7to14')} className="accent-blue-600" />
                  7 - 14 days
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="deadline" checked={deadlineFilter === 'above14'} onChange={() => setDeadlineFilter('above14')} className="accent-blue-600" />
                  Above 14 days
                </label>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            {pinnedProjects.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Pin size={20} className="text-blue-500" /> Pinned Project
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {pinnedProjects.map(proj => <ProjectCard key={proj.id} proj={proj} togglePin={togglePin} />)}
                </div>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">On Going</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {ongoingProjects.map(proj => <ProjectCard key={proj.id} proj={proj} togglePin={togglePin} />)}
                <div onClick={handleCreateProject} className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all min-h-[160px]">
                  <Plus size={32} className="mb-2" />
                  <span className="font-medium">Create new project</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } 
    
    if (activeEvent) {
      return (
        <div className="space-y-6 text-base leading-relaxed animate-in fade-in duration-500">
          <div className="flex items-center gap-6 text-sm text-gray-500 border-b border-gray-100 pb-5">
             <div className="flex items-center gap-2"><Calendar size={16}/> {activeEvent.fullDate}</div>
             <div className="flex items-center gap-2"><Clock size={16}/> {activeEvent.time}</div>
             <div className="flex items-center gap-2"><Video size={16}/> {activeEvent.host}</div>
          </div>
          <p className="mt-6 text-[#37352f] text-[15px]">{activeEvent.description}</p>
          <div className="flex gap-3 p-4 rounded-md bg-[#f1f1ef] mt-8 border border-gray-200">
            <span className="mt-0.5">🔔</span>
            <div className="text-sm text-[#37352f]">
              <strong>Preparation:</strong> Make sure to upload any necessary reference files or notes into the Folders directory below before the event begins.
            </div>
          </div>
        </div>
      );
    } 
    
    return <div className="text-gray-400 italic mt-8">This document is currently empty...</div>;
  };

  return (
    <div className={`flex h-screen w-full bg-white ${textMain} font-sans`}>
      {isSidebarOpen && (
        <aside className={`w-64 flex-shrink-0 flex flex-col ${bgSidebarDark} ${textSidebarMain} transition-all duration-300 hidden md:flex border-r border-[#333333]`}>
          <div className="relative">
            <div onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className={`h-11 flex items-center justify-between px-4 cursor-pointer ${bgSidebarHover} transition-colors border-b border-[#333333]`}>
              <div className="flex items-center gap-2 font-medium text-sm">
                <div className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold shadow-sm">D</div>
                <span>Hello, Dustin</span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-3">
            <div className="px-2 mb-6">
              <div className={`text-xs font-semibold ${textSidebarMuted} px-2 mb-3 tracking-wider uppercase`}>Workspace</div>
              <div onClick={() => setActiveModuleId('my-projects')} className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm mb-0.5 transition-colors ${activeModuleId === 'my-projects' ? `${bgSidebarActive} text-white font-medium` : `text-[#cccccc] ${bgSidebarHover} text-gray-300`}`}>
                <LayoutGrid size={16} className={activeModuleId === 'my-projects' ? "text-blue-400" : "text-[#8a8a8a]"} />
                <span className="truncate">My Projects</span>
              </div>
            </div>

            <div className="px-2 mb-6">
              <div className={`text-xs font-semibold ${textSidebarMuted} px-2 mb-3 tracking-wider uppercase`}>Upcoming Schedule</div>
              {schedule.map((event) => (
                <div key={event.id} onClick={() => setActiveModuleId(event.id)} className={`flex items-start gap-3 px-3 py-2 rounded-md cursor-pointer text-sm mb-0.5 transition-colors ${activeModuleId === event.id ? `${bgSidebarActive} text-white` : `text-[#cccccc] ${bgSidebarHover} text-gray-300`}`}>
                  <div className="mt-0.5"><event.icon size={16} className={activeModuleId === event.id ? "text-blue-400" : "text-[#8a8a8a]"} /></div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`truncate ${activeModuleId === event.id ? 'font-medium' : ''}`}>{event.label}</span>
                    <span className={`text-xs mt-0.5 ${activeModuleId === event.id ? 'text-blue-200' : 'text-[#8a8a8a]'}`}>{event.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* RESTORED FOLDERS SECTION */}
            <div className="px-2">
              <div className={`flex items-center justify-between px-2 mb-2 group`}>
                <div className={`text-xs font-semibold ${textSidebarMuted} tracking-wider uppercase`}>Folders</div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={handleCreateFile} className={`p-1 rounded hover:bg-[#37373d] text-[#8a8a8a] hover:text-white`} title="New File">
                    <FilePlus size={14} />
                  </button>
                  <button onClick={handleCreateFolder} className={`p-1 rounded hover:bg-[#37373d] text-[#8a8a8a] hover:text-white`} title="New Folder">
                    <FolderPlus size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-0.5 mt-1">
                {fileSystem.map(node => (
                  <FileTreeNode key={node.id} node={node} />
                ))}
              </div>
            </div>

          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#fafafa]">
        <header className="h-11 bg-white flex items-center justify-between px-3 flex-shrink-0 border-b border-gray-200 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-1 rounded-md ${bgHoverLight} ${textMuted} transition-colors`}><Menu size={20} /></button>
            <div className={`flex items-center text-sm ${textMuted}`}>
              <span className="cursor-pointer hover:underline">{activeModuleId === 'my-projects' ? 'Workspace' : 'Upcoming Schedule'}</span>
              <ChevronRight size={16} className="mx-1" />
              <span className={textMain}>{activeModuleId === 'my-projects' ? 'My Projects' : activeEvent?.label}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-10">
            {activeModuleId === 'my-projects' && (
              <div className="mb-2 group relative">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">My Projects</h1>
              </div>
            )}
            
            {/* Render Dashboard or Event Detail */}
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const ProjectCard = ({ proj, togglePin }) => (
  <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all bg-white flex flex-col justify-between min-h-[160px] cursor-pointer group relative overflow-hidden">
    <div className={`absolute top-0 left-0 right-0 h-1 ${proj.progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2 flex-wrap">
          {proj.tags.map(tag => (
            <span key={tag} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              {tag}
            </span>
          ))}
        </div>
        <button onClick={(e) => togglePin(proj.id, e)} className={`p-1.5 rounded-full transition-colors ${proj.isPinned ? 'bg-gray-800 text-white hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-800'}`}>
          <Pin size={16} className={proj.isPinned ? 'fill-current' : ''} />
        </button>
      </div>
      <h3 className="font-bold text-lg text-gray-800 leading-tight">{proj.title}</h3>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={12} /> {proj.daysLeft} days left</p>
    </div>
    <div className="mt-5">
      <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
        <span>Progress</span>
        <span>{proj.progress}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${proj.progress}%` }}></div>
      </div>
    </div>
  </div>
);

const FileTreeNode = ({ node, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(node.isOpen);

  const toggleFolder = (e) => {
    e.stopPropagation();
    if (node.type === 'folder') setIsOpen(!isOpen);
  };

  return (
    <div>
      <div onClick={toggleFolder} className={`flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer text-sm text-[#cccccc] hover:bg-[#2a2d2e] transition-colors`} style={{ paddingLeft: `${(depth * 12) + 8}px` }}>
        {node.type === 'folder' ? (
          <><ChevronRight size={14} className={`text-[#8a8a8a] transition-transform ${isOpen ? 'rotate-90' : ''}`} /><Folder size={14} className="text-blue-400" /></>
        ) : (
          <><span className="w-[14px]"></span><File size={14} className="text-[#8a8a8a]" /></>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {node.type === 'folder' && isOpen && node.children && (
        <div>{node.children.map(childNode => <FileTreeNode key={childNode.id} node={childNode} depth={depth + 1} />)}</div>
      )}
    </div>
  );
};

export default Workspace;