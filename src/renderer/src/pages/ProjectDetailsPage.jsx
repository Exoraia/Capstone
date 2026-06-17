import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit2, Info, CheckCircle2, Circle, Clock, 
  FileText, Video, Code, ExternalLink, Plus 
} from 'lucide-react';

// --- DUMMY DATA ---
const TEAM_MEMBERS = [
  { id: 'm1', name: 'Andru', email: 'andru@workspace.com', role: '(Leader)', avatar: 'A', color: 'bg-red-500' },
  { id: 'm2', name: 'Jenie', email: 'jenie@workspace.com', role: '', avatar: 'J', color: 'bg-green-500' },
  { id: 'm3', name: 'Wannandy', email: 'wannandy@workspace.com', role: '', avatar: 'W', color: 'bg-yellow-500' },
  { id: 'm4', name: 'Sylvinho', email: 'sylvinho@workspace.com', role: '', avatar: 'S', color: 'bg-purple-500' }
];

const INITIAL_TASKS = [
  { id: 't1', text: 'Create Database Schema', status: 'unassigned', assignee: null },
  { id: 't2', text: 'Setup Firebase Auth', status: 'progress', assignee: TEAM_MEMBERS[0] },
  { id: 't3', text: 'Design Login Page', status: 'progress', assignee: TEAM_MEMBERS[1] },
  { id: 't4', text: 'Initialize React App', status: 'finished', assignee: TEAM_MEMBERS[2] },
  { id: 't5', text: 'Setup Tailwind CSS', status: 'finished', assignee: TEAM_MEMBERS[3] },
  { id: 't6', text: 'Create Navigation Layout', status: 'finished', assignee: TEAM_MEMBERS[2] },
  { id: 't7', text: 'Design Dashboard UI', status: 'finished', assignee: TEAM_MEMBERS[0] },
];

const EMBEDS = [
  { id: 'e1', title: 'List fitur WK', type: 'docs', url: '#' },
  { id: 'e2', title: 'Tutorial Connect API', type: 'youtube', url: '#' }
];

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggleTaskStatus = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status: task.status === 'finished' ? 'progress' : 'finished' };
      }
      return task;
    }));
  };

  const unassignedTasks = tasks.filter(t => t.status === 'unassigned');
  const progressTasks = tasks.filter(t => t.status === 'progress');
  const finishedTasks = tasks.filter(t => t.status === 'finished');

  const myTasks = tasks.filter(t => t.assignee?.name === 'Andru');

  const progressPercentage = Math.round((finishedTasks.length / tasks.length) * 100) || 0;

  return (
    <>
      {/* CSS KHUSUS UNTUK MENYEMBUNYIKAN SCROLLBAR */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <div className="bg-white min-h-full rounded-2xl p-8 shadow-sm border border-[#313131]/10 animate-in fade-in duration-500 flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-[#313131]/10 pb-6 mb-8 flex-shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-[#313131] tracking-wide">Rest API Connection</h1>
              <button className="text-[#313131]/40 hover:text-[#4161FF] transition-colors"><Edit2 size={18} /></button>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#313131]/70 font-medium">
              <span>PBO II / 4th July 2025</span>
              <button className="bg-[#B2B2B2]/20 hover:bg-[#4161FF] hover:text-white px-3 py-1 rounded-md transition-colors text-[#313131]">
                Manage
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-[#4161FF]/10 text-[#4161FF] px-4 py-2 rounded-lg border border-[#4161FF]/20">
            <span className="font-bold text-lg">Due in: 3d 19hrs</span>
            <Info size={18} />
          </div>
        </div>

        <div className="flex gap-8 flex-1 min-h-0">
          
          {/* LEFT COLUMN: Kanban & Bottom Sections */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* KANBAN BOARDS (Tracker) */}
            <div className="grid grid-cols-3 gap-6 flex-shrink-0">
              {/* 1. Unassigned */}
              <div className="flex flex-col">
                <h3 className="text-center font-extrabold text-lg text-[#313131] mb-4 tracking-widest uppercase">Unassigned</h3>
                <div className="bg-[#B2B2B2]/10 rounded-xl p-4 border border-[#313131]/10 space-y-3 h-[300px] overflow-y-auto hide-scrollbar">
                  {unassignedTasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={() => toggleTaskStatus(task.id)} />
                  ))}
                </div>
              </div>

              {/* 2. On Progress */}
              <div className="flex flex-col">
                <h3 className="text-center font-extrabold text-lg text-[#313131] mb-4 tracking-widest uppercase">On Progress</h3>
                <div className="bg-[#B2B2B2]/10 rounded-xl p-4 border border-[#313131]/10 space-y-3 h-[300px] overflow-y-auto hide-scrollbar">
                  {progressTasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={() => toggleTaskStatus(task.id)} showAssignee />
                  ))}
                </div>
              </div>

              {/* 3. Finished */}
              <div className="flex flex-col">
                <h3 className="text-center font-extrabold text-lg text-[#313131] mb-4 tracking-widest uppercase">Finished</h3>
                <div className="bg-[#B2B2B2]/10 rounded-xl p-4 border border-[#313131]/10 space-y-3 h-[300px] overflow-y-auto hide-scrollbar opacity-70">
                  {finishedTasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={() => toggleTaskStatus(task.id)} showAssignee />
                  ))}
                </div>
              </div>
            </div>

            {/* PEMISAH (Garis Dashed) */}
            <div className="w-full border-t-2 border-dashed border-[#313131]/10 my-2"></div>

            {/* BOTTOM ROW (Tasks & Embeds) */}
            <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
              {/* My Tasks */}
              <div className="flex flex-col h-full">
                <h3 className="text-center font-extrabold text-lg text-[#313131] mb-4 tracking-widest uppercase flex-shrink-0">My Tasks</h3>
                <div className="bg-[#B2B2B2]/10 rounded-xl p-4 flex-1 border border-[#313131]/10 space-y-3 overflow-y-auto hide-scrollbar">
                   {myTasks.length > 0 ? myTasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={() => toggleTaskStatus(task.id)} />
                  )) : <p className="text-center text-[#313131]/50 text-sm mt-4">No tasks assigned to you yet.</p>}
                </div>
              </div>

              {/* Project Embeds */}
              <div className="flex flex-col h-full">
                <h3 className="text-center font-extrabold text-lg text-[#313131] mb-4 tracking-widest uppercase flex-shrink-0">Project Embeds</h3>
                <div className="bg-[#B2B2B2]/10 rounded-xl p-5 border border-[#313131]/10 flex-1 overflow-y-auto hide-scrollbar">
                  <div className="text-sm font-bold text-[#313131] mb-3">This project is connected to:</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {EMBEDS.map(embed => {
                      let Icon = ExternalLink;
                      let color = "text-[#4161FF]";
                      if (embed.type === 'docs') { Icon = FileText; color = "text-blue-500"; }
                      if (embed.type === 'youtube') { Icon = Video; color = "text-red-500"; } 
                      
                      return (
                        <a key={embed.id} href={embed.url} className="flex items-center gap-2 bg-white border border-[#313131]/10 px-3 py-1.5 rounded-md text-sm font-bold text-[#313131] shadow-sm hover:border-[#4161FF] transition-all">
                          <Icon size={14} className={color} /> {embed.title}
                        </a>
                      );
                    })}
                    <button className="flex items-center justify-center w-8 h-8 rounded-md border border-dashed border-[#313131]/40 text-[#313131]/60 hover:text-[#4161FF] hover:border-[#4161FF] transition-colors"><Plus size={16}/></button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar (Team & Progress) */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-8">
            
            {/* Team Members */}
            <div className="border border-[#313131]/10 rounded-xl shadow-sm bg-white overflow-hidden">
              <h3 className="text-center font-extrabold text-lg text-[#313131] mb-4 bg-[#B2B2B2]/20 py-3 border-b border-[#313131]/10 tracking-widest">Team Members</h3>
              <div className="space-y-4 px-5 pb-5">
                {TEAM_MEMBERS.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${member.color} text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm`}>
                      {member.avatar}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <div className="text-[#313131] font-bold text-sm leading-tight truncate">
                        {member.name} <span className="text-[#313131]/50 text-[11px] font-medium ml-0.5">{member.role}</span>
                      </div>
                      <span className="text-[#313131]/50 text-[11px] font-medium truncate mt-0.5">{member.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Member Contributions */}
            <div>
              <h3 className="text-center font-bold text-md text-[#313131] mb-4">Member Contributions</h3>
              <div className="flex justify-between px-2">
                {TEAM_MEMBERS.map(member => (
                  <div key={member.id} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border-2 border-[#B2B2B2] relative shadow-sm">
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${member.color} border-2 border-white`}></div>
                    </div>
                    <span className="text-xs text-[#313131]/70 font-semibold">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Progress Bar */}
            <div className="mt-auto mb-4">
              <h3 className="text-center font-bold text-md text-[#313131] mb-6">Project Progress Bar</h3>
              
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#B2B2B2" strokeWidth="8" strokeOpacity="0.2" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#4161FF" strokeWidth="8" 
                    strokeDasharray={`${(progressPercentage / 100) * 283} 283`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-[#313131]">{progressPercentage}%</span>
                  <span className="text-xs font-semibold text-[#313131]/60">Complete</span>
                </div>
              </div>

              <div className="flex justify-between text-center px-4">
                <div>
                  <div className="font-bold text-[#313131]">Today</div>
                  <div className="text-xl font-extrabold text-[#4161FF]">0</div>
                  <div className="text-[9px] text-[#313131]/50 uppercase tracking-wider">Task Finished</div>
                </div>
                <div>
                  <div className="font-bold text-[#313131]">This Week</div>
                  <div className="text-xl font-extrabold text-[#4161FF]">0</div>
                  <div className="text-[9px] text-[#313131]/50 uppercase tracking-wider">Task Finished</div>
                </div>
                <div>
                  <div className="font-bold text-[#313131]">Total</div>
                  <div className="text-xl font-extrabold text-[#4161FF]">{finishedTasks.length}/{tasks.length}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

// --- HELPER COMPONENT: TASK CARD ---
const TaskCard = ({ task, onToggle, showAssignee }) => {
  const isDone = task.status === 'finished';
  const isUnassigned = task.status === 'unassigned';

  return (
    <div className={`bg-white border ${isDone ? 'border-[#4161FF]/30 bg-[#4161FF]/5' : 'border-[#313131]/10'} rounded-lg p-3 shadow-sm flex items-start gap-3 transition-all`}>
      
      <button 
        onClick={isUnassigned ? undefined : onToggle} 
        disabled={isUnassigned}
        className={`mt-0.5 flex-shrink-0 transition-colors ${
          isDone ? 'text-[#4161FF]' : 
          isUnassigned ? 'text-[#313131]/20 cursor-default' : 
          'text-[#313131]/30 hover:text-[#4161FF]'
        }`}
      >
        {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>

      <div className="flex-1 flex flex-col gap-2">
        <span className={`text-sm font-bold leading-tight ${isDone ? 'text-[#313131]/50 line-through' : 'text-[#313131]'}`}>
          {task.text}
        </span>
        {showAssignee && task.assignee && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-4 h-4 rounded-full ${task.assignee.color} text-white flex items-center justify-center text-[8px] font-bold`}>
              {task.assignee.avatar}
            </div>
            <span className="text-xs font-semibold text-[#313131]/60">{task.assignee.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;