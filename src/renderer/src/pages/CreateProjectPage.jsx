import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Plus, X, ImageIcon, 
  FileText, Video, Code, ExternalLink, Mail as MailIcon
} from 'lucide-react';

const CreateProjectPage = () => {
  const navigate = useNavigate();

  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  
  const [embeds, setEmbeds] = useState([]);
  const [embedInput, setEmbedInput] = useState('');

  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');

  const [isEmbedPromptOpen, setIsEmbedPromptOpen] = useState(false);
  const [pendingEmbedUrl, setPendingEmbedUrl] = useState('');
  const [embedTitleInput, setEmbedTitleInput] = useState('');

  const handleAddEmail = (e) => {
    if (e.key === 'Enter' && emailInput.trim() !== '') {
      e.preventDefault();
      setEmails([...emails, emailInput.trim()]);
      setEmailInput('');
    }
  };

  const handleAddTask = (e) => {
    if (e.key === 'Enter' && taskInput.trim() !== '') {
      e.preventDefault();
      setTasks([...tasks, taskInput.trim()]);
      setTaskInput('');
    }
  };

  const handleAddEmbed = (e) => {
    if (e.key === 'Enter' && embedInput.trim() !== '') {
      e.preventDefault();
      let url = embedInput.trim();
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      setPendingEmbedUrl(url);
      setIsEmbedPromptOpen(true);
      setEmbedInput('');
    }
  };

  const handleConfirmEmbedTitle = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const title = embedTitleInput.trim() || "Untitled Link";

      let type = 'link';
      if (pendingEmbedUrl.includes('docs.google.com')) type = 'docs';
      else if (pendingEmbedUrl.includes('youtube.com') || pendingEmbedUrl.includes('youtu.be')) type = 'youtube';
      else if (pendingEmbedUrl.includes('github.com')) type = 'github';

      setEmbeds([...embeds, { title, url: pendingEmbedUrl, type }]);
      
      setIsEmbedPromptOpen(false);
      setPendingEmbedUrl('');
      setEmbedTitleInput('');
    }
  };

  const removeEmail = (index) => setEmails(emails.filter((_, i) => i !== index));
  const removeTask = (index) => setTasks(tasks.filter((_, i) => i !== index));
  const removeEmbed = (index) => setEmbeds(embeds.filter((_, i) => i !== index));

  const labelClass = "text-lg font-bold text-[#313131] mb-2 block tracking-wide";
  const inputClass = "w-full bg-[#B2B2B2]/20 text-[#313131] rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#4161FF] focus:bg-white placeholder-[#313131]/40 transition-all border border-[#313131]/10 font-medium";
  const dashedBoxClass = "border-2 border-dashed border-[#313131]/30 bg-[#B2B2B2]/10 rounded-lg p-4 flex items-center gap-2 text-[#313131] hover:text-[#4161FF] hover:border-[#4161FF] hover:bg-white cursor-text transition-all";

  return (
    <div className="bg-white min-h-full rounded-2xl p-8 shadow-sm border border-[#313131]/10 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end border-b border-[#313131]/10 pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#313131] tracking-wide">Create Project</h1>
          <div className="h-1 w-20 bg-[#4161FF] mt-2 rounded-full"></div>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#4161FF] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#313131] transition-colors shadow-md"
        >
          Create
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
        
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Project Name</label>
            <input type="text" placeholder="e.g. Rest API Connection" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Subject</label>
            <input type="text" placeholder="e.g. PBO II" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Deadline</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-[#313131]/50" />
                </div>
                <input type="date" className={`${inputClass} pl-10`} />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Clock size={18} className="text-[#313131]/50" />
                </div>
                <input type="time" className={`${inputClass} pl-10`} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Add Members</label>
            <div className="bg-[#B2B2B2]/10 rounded-lg p-2 min-h-[120px] focus-within:ring-2 focus-within:ring-[#4161FF] focus-within:bg-white transition-all border border-[#313131]/10">
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <MailIcon size={16} className="text-[#313131]/50" />
                <input 
                  type="email" 
                  placeholder="Type email and press Enter..." 
                  className="bg-transparent border-none outline-none text-[#313131] font-medium w-full placeholder-[#313131]/40"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleAddEmail}
                />
              </div>
              <div className="flex flex-wrap gap-2 px-1">
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-1.5 bg-[#313131] text-sm text-white font-medium px-3 py-1.5 rounded-full shadow-sm">
                    <span>{email}</span>
                    <X size={14} className="cursor-pointer hover:text-[#4161FF]" onClick={() => removeEmail(index)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          
          <div>
            <label className={labelClass}>Manage Tasks</label>
            <div className="bg-[#B2B2B2]/10 border border-[#313131]/10 rounded-lg p-4 min-h-[160px]">
              <label className={dashedBoxClass}>
                <Plus size={18} />
                <input 
                  type="text"
                  placeholder="Create a new task (Press Enter)"
                  className="bg-transparent outline-none w-full text-[#313131] font-medium placeholder-[#313131]/40"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={handleAddTask}
                />
              </label>
              <div className="mt-4 space-y-2">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between text-[#313131] font-medium bg-white px-4 py-2.5 rounded-md border border-[#313131]/10 shadow-sm">
                    <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#4161FF]"></div>{task}</span>
                    <X size={16} className="text-[#313131]/40 cursor-pointer hover:text-red-500" onClick={() => removeTask(index)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Project Embeds</label>
            <div className="bg-[#B2B2B2]/10 border border-[#313131]/10 rounded-lg p-4">
              <label className={`${dashedBoxClass} mb-4`}>
                <Plus size={18} />
                <input 
                  type="url"
                  placeholder="Paste a link (e.g. Google Docs) & Press Enter"
                  className="bg-transparent outline-none w-full text-[#313131] font-medium placeholder-[#313131]/40"
                  value={embedInput}
                  onChange={(e) => setEmbedInput(e.target.value)}
                  onKeyDown={handleAddEmbed}
                />
              </label>
              
              <div className="flex flex-wrap gap-3">
                {embeds.map((embed, index) => {
                  let Icon = ExternalLink;
                  let iconColor = "text-[#4161FF]";
                  
                  if (embed.type === 'docs') { Icon = FileText; iconColor = "text-blue-600"; }
                  if (embed.type === 'youtube') { Icon = Video; iconColor = "text-red-600"; }
                  if (embed.type === 'github') { Icon = Code; iconColor = "text-[#313131]"; }

                  return (
                    <a 
                      key={index}
                      href={embed.url}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 bg-white border border-[#313131]/10 shadow-sm text-sm text-[#313131] font-bold px-3 py-1.5 rounded-md hover:border-[#4161FF] transition-all cursor-pointer group"
                    >
                      <Icon size={14} className={iconColor} />
                      <span className="max-w-[150px] truncate">{embed.title}</span>
                      
                      <div 
                        className="ml-1 p-0.5 rounded-sm text-[#313131]/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                        onClick={(e) => {
                          e.preventDefault(); 
                          e.stopPropagation();
                          removeEmbed(index);
                        }}
                      >
                        <X size={14} />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Project Icon</label>
            <div className="flex gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-[#313131]/20 rounded-xl flex flex-col items-center justify-center text-[#313131]/60 hover:text-[#4161FF] hover:border-[#4161FF] cursor-pointer transition-colors bg-[#B2B2B2]/10 hover:bg-white">
                <ImageIcon size={28} className="mb-2" />
                <span className="text-xs font-bold text-center px-2">Browse<br/>From Device</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- DIALOG PROMPT --- */}
      {isEmbedPromptOpen && (
        <div className="fixed inset-0 bg-[#313131]/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#313131]/10 w-96">
            <h3 className="text-lg font-bold text-[#313131] mb-1">Enter Link Title</h3>
            <p className="text-xs text-[#4161FF] mb-4 truncate font-medium">{pendingEmbedUrl}</p>
            <input 
              type="text" 
              placeholder="e.g. 'Proposal Project'" 
              className={inputClass}
              value={embedTitleInput}
              onChange={(e) => setEmbedTitleInput(e.target.value)}
              onKeyDown={handleConfirmEmbedTitle}
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setIsEmbedPromptOpen(false);
                  setEmbedTitleInput('');
                  setPendingEmbedUrl('');
                }}
                className="px-4 py-2 text-sm font-bold text-[#313131]/60 hover:text-[#313131] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmEmbedTitle}
                className="bg-[#4161FF] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#313131] transition-colors shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateProjectPage;