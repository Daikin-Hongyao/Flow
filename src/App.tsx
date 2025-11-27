import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Layout, Plus, Search, Bell, Settings, ChevronRight, ChevronDown,
  MoreHorizontal, Calendar, CheckCircle2, Circle, Clock, FileText,
  Kanban, List as ListIcon, Filter, ArrowUpCircle, GripVertical,
  Trash2, X, User, Inbox, CheckSquare, BarChart2, CreditCard,
  LogOut, Moon, Globe, Palette
} from 'lucide-react';

/**
 * ==========================================
 * SECTION 1: TYPES & INTERFACES
 * ==========================================
 */

type Status = 'todo' | 'in-progress' | 'review' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  wbs: string;
  title: string;
  status: Status;
  priority: Priority;
  assignee: string;
  tags: string[];
  date: string;
  projectId: string;
  description: string;
  // Removed 'color' property strictly
}

interface Project {
  id: string;
  name: string;
  type: 'project' | 'doc';
}

interface Column {
  id: Status;
  title: string;
  color: string;
}

interface Route {
  type: string;
  id: string | null;
}

/**
 * ==========================================
 * SECTION 2: CONSTANTS & DATA
 * ==========================================
 */

const USERS = ['Alex', 'Sarah', 'Mike', 'User'];

// Notion-style Low Saturation Palette strictly bound to Status
const STATUS_COLORS: Record<Status, string> = {
  'todo': '#E2E8F0',        // Muted Slate (Neutral)
  'in-progress': '#BFDBFE', // Muted Blue (Active)
  'review': '#FEF08A',      // Muted Yellow (Warning/Check)
  'done': '#BBF7D0',        // Muted Green (Success)
};

const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' },
  { id: 'review', title: 'Review', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300' },
];

const PRIORITIES: Record<Priority, { color: string; bg: string; label: string }> = {
  low: { color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', label: 'Low' },
  medium: { color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Medium' },
  high: { color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30', label: 'High' },
};

// Removed hardcoded 'color' properties to ensure Status color takes precedence
const INITIAL_TASKS: Task[] = [
  { id: '1', wbs: '1.0', title: 'Product Launch Phase', status: 'in-progress', priority: 'high', assignee: 'Alex', tags: ['Core'], date: 'Oct 30', projectId: 'p1', description: 'Main tracking item.' },
  { id: '2', wbs: '1.1', title: 'Design System V2', status: 'done', priority: 'high', assignee: 'Alex', tags: ['Design'], date: 'Oct 24', projectId: 'p1', description: 'Update palette.' },
  { id: '3', wbs: '1.2', title: 'User Interview Analysis', status: 'todo', priority: 'low', assignee: 'Alex', tags: ['Research'], date: 'Oct 28', projectId: 'p1', description: 'Collate feedback.' },
  { id: '4', wbs: '1.2.1', title: 'Compile Survey Data', status: 'todo', priority: 'low', assignee: 'Mike', tags: ['Research'], date: 'Oct 27', projectId: 'p1', description: 'Raw data processing.' },
  { id: '5', wbs: '2.0', title: 'Marketing Campaign', status: 'in-progress', priority: 'medium', assignee: 'Sarah', tags: ['Marketing'], date: 'Oct 31', projectId: 'p2', description: 'Q4 push.' },
  { id: '6', wbs: '2.1', title: 'Q4 Strategy Draft', status: 'in-progress', priority: 'medium', assignee: 'Sarah', tags: ['Marketing'], date: 'Oct 26', projectId: 'p2', description: 'Initial draft.' },
  { id: '7', wbs: '2.2', title: 'Landing Page Update', status: 'todo', priority: 'medium', assignee: 'Sarah', tags: ['Dev'], date: 'Oct 29', projectId: 'p2', description: 'New testimonials.' },
  { id: '8', wbs: '3.0', title: 'Finance Review', status: 'review', priority: 'high', assignee: 'User', tags: ['Finance'], date: 'Oct 30', projectId: 'p1', description: 'Q3 Report.' },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: 'Product Launch', type: 'project' },
  { id: 'p2', name: 'Marketing', type: 'project' },
  { id: 'd1', name: 'Q4 Roadmap', type: 'doc' },
  { id: 'd2', name: 'Meeting Notes', type: 'doc' },
];

/**
 * ==========================================
 * SECTION 3: HELPER COMPONENTS
 * ==========================================
 */

const Tag = ({ text }: { text: string }) => (
  <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
    {text}
  </span>
);

const Avatar = ({ name, size = "sm" }: { name: string; size?: "sm" | "md" | "xl" }) => {
  const initials = name ? name[0] : '?';
  let dims = "w-6 h-6 text-xs";
  if (size === "md") dims = "w-8 h-8 text-sm";
  if (size === "xl") dims = "w-24 h-24 text-3xl";

  const colors: Record<string, string> = {
    'Alex': 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    'Sarah': 'bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    'Mike': 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    'User': 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
  };
  return (
    <div className={`${dims} rounded-full ${colors[name] || 'bg-gray-100 text-gray-600'} flex items-center justify-center font-medium border border-transparent shadow-sm`}>
      {initials}
    </div>
  );
};

/**
 * ==========================================
 * SECTION 4: SIDEBAR COMPONENT
 * ==========================================
 */

const SidebarItem = ({ icon: Icon, label, active, onClick, hasSubmenu, expanded, onToggle, count, action }: any) => (
  <div
    onClick={onClick}
    className={`group flex items-center justify-between px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors mb-0.5 select-none
      ${active
        ? 'bg-gray-200/50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'}`}
  >
    <div className="flex items-center gap-2 overflow-hidden">
      {hasSubmenu && (
        <span
          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 dark:text-gray-500"
          onClick={(e) => { e.stopPropagation(); onToggle && onToggle(); }}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      )}
      <Icon
        size={16}
        className={`flex-shrink-0 ${active ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}
      />
      <span className="truncate">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {count !== undefined && count > 0 && (
        <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 rounded-full">{count}</span>
      )}
      {action}
      <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
    </div>
  </div>
);

const Sidebar = ({
  sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery, activeRoute, setActiveRoute,
  projects, expandedMenus, toggleMenu, setViewMode, viewMode, onAddProject
}: any) => {
  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-[#F7F7F5] dark:bg-[#191919] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden relative flex-shrink-0`}>
      <div className="p-4 flex items-center gap-3 mb-2">
        <div className="w-6 h-6 bg-gray-800 dark:bg-gray-200 rounded-md flex items-center justify-center text-white dark:text-gray-900 font-bold text-xs shadow-sm">N</div>
        <div className="font-semibold text-gray-700 dark:text-gray-200 text-sm tracking-tight flex-1">NotionClone</div>
        <div className="flex gap-1">
          <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"><Bell size={14} /></button>
          <button onClick={() => setActiveRoute({ type: 'settings', id: null })} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"><Settings size={14} /></button>
        </div>
      </div>

      <div className="px-3 mb-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1.5 rounded-md flex items-center gap-2 text-sm shadow-sm">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none w-full placeholder-gray-400 dark:placeholder-gray-500 text-xs dark:text-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-1 rounded text-gray-400 dark:text-gray-500">⌘K</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Workspace</div>
          <SidebarItem icon={Layout} label="Dashboard" active={activeRoute.type === 'dashboard'} onClick={() => setActiveRoute({ type: 'dashboard', id: null })} />
          <SidebarItem icon={CheckCircle2} label="My Tasks" active={activeRoute.type === 'mytasks'} onClick={() => setActiveRoute({ type: 'mytasks', id: null })} />
          <SidebarItem icon={Inbox} label="Inbox" active={activeRoute.type === 'inbox'} count={3} onClick={() => setActiveRoute({ type: 'inbox', id: null })} />
        </div>

        <div>
          <div
            className="px-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex justify-between group cursor-pointer"
            onClick={() => toggleMenu('projects')}
          >
            <span>Projects</span>
            <button
              onClick={(e) => { e.stopPropagation(); onAddProject(); }}
              className="opacity-0 group-hover:opacity-100 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
            >
              <Plus size={12} />
            </button>
          </div>

          {expandedMenus.projects && (
            <div className="space-y-0.5">
              {projects.filter((p: Project) => p.type === 'project').map((p: Project) => (
                <div key={p.id}>
                  <SidebarItem
                    icon={Kanban}
                    label={p.name}
                    active={activeRoute.id === p.id}
                    hasSubmenu={true}
                    expanded={activeRoute.id === p.id}
                    onToggle={() => { }}
                    onClick={() => setActiveRoute({ type: 'project', id: p.id })}
                  />
                  {activeRoute.id === p.id && (
                    <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2 space-y-0.5 mb-1">
                      <div onClick={() => setViewMode('board')} className={`text-sm py-1 px-2 rounded cursor-pointer flex items-center gap-2 ${viewMode === 'board' ? 'bg-gray-200/50 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}><Kanban size={14} /> Board</div>
                      <div onClick={() => setViewMode('list')} className={`text-sm py-1 px-2 rounded cursor-pointer flex items-center gap-2 ${viewMode === 'list' ? 'bg-gray-200/50 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}><ListIcon size={14} /> List</div>
                      <div onClick={() => setViewMode('gantt')} className={`text-sm py-1 px-2 rounded cursor-pointer flex items-center gap-2 ${viewMode === 'gantt' ? 'bg-gray-200/50 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}><BarChart2 size={14} /> Gantt</div>
                    </div>
                  )}
                </div>
              ))}

              {projects.filter((p: Project) => p.type === 'doc').map((p: Project) => (
                <SidebarItem key={p.id} icon={FileText} label={p.name} active={activeRoute.id === p.id} onClick={() => setActiveRoute({ type: 'doc', id: p.id })} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div onClick={() => setActiveRoute({ type: 'account', id: null })} className="flex items-center gap-3 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors">
          <Avatar name="User" />
          <div className="flex-1">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-200">User Account</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">Pro Plan</div>
          </div>
          <MoreHorizontal size={14} className="text-gray-400 dark:text-gray-500" />
        </div>
      </div>
    </div>
  );
};

/**
 * ==========================================
 * SECTION 5: GENERAL VIEWS
 * ==========================================
 */

const DashboardView = ({ stats, tasks, projects }: { stats: any; tasks: Task[]; projects: Project[] }) => (
  <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300 dark:text-gray-100">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Good Morning, User ☀️</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Stat Cards - Muted Colors */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><CheckCircle2 size={20} /></div><h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Tasks Completed</h3></div><p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.done}</p></div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg"><Circle size={20} /></div><h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">In Progress</h3></div><p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.progress}</p></div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><ArrowUpCircle size={20} /></div><h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">High Priority</h3></div><p className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.filter(t => t.priority === 'high' && t.status !== 'done').length}</p></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Project Summary</h2>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
          {projects.filter((p: Project) => p.type === 'project').map((p: Project) => {
            const projTasks = tasks.filter(t => t.projectId === p.id);
            const percentage = projTasks.length === 0 ? 0 : Math.round((projTasks.filter(t => t.status === 'done').length / projTasks.length) * 100);
            return (
              <div key={p.id} className="p-4 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex justify-between items-center mb-2"><span className="font-semibold text-gray-800 dark:text-gray-100">{p.name}</span><span className="text-xs font-medium text-gray-500 dark:text-gray-400">{percentage}% Complete</span></div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div></div>
              </div>
            )
          })}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h2>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750">
              <div className="flex items-center gap-3"><Avatar name={task.assignee} /><div><div className="text-sm font-medium text-gray-800 dark:text-gray-200">{task.title}</div><div className="text-xs text-gray-400">Updated {task.date}</div></div></div>
              <span className={`text-xs px-2 py-1 rounded-full ${PRIORITIES[task.priority].bg} ${PRIORITIES[task.priority].color}`}>{PRIORITIES[task.priority].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SettingsView = ({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) => (
  <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-center gap-4"><div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg"><Moon size={20} /></div><div><h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3><p className="text-sm text-gray-500 dark:text-gray-400">Enable dark theme.</p></div></div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={toggleDarkMode} />
          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900 dark:peer-checked:bg-white"></div>
        </label>
      </div>
    </div>
  </div>
);

const AccountView = () => (
  <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Account</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col md:flex-row items-start gap-8 shadow-sm">
      <div className="flex flex-col items-center gap-4"><Avatar name="User" size="xl" /><button className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline">Change Avatar</button></div>
      <div className="flex-1 space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label><input type="text" defaultValue="User Account" className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" defaultValue="user@example.com" className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 outline-none" /></div>
        </div>
      </div>
    </div>
  </div>
);

const InboxView = () => (
  <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-300">
    <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inbox</h1><button className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 flex items-center gap-1"><CheckSquare size={14} /> Mark all read</button></div>
    <div className="space-y-2"><div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><div className="mt-1"><div className="w-2 h-2 rounded-full bg-blue-400/50"></div></div><div className="flex-1"><div className="flex justify-between mb-1"><span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Sarah mentioned you</span><span className="text-xs text-gray-400">2h ago</span></div><p className="text-sm text-gray-600 dark:text-gray-400 mb-2">"Can you review the latest draft?"</p></div></div></div>
  </div>
);

const DocView = ({ docId }: { docId: string }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-8 animate-in fade-in duration-300">
      <div className="text-4xl mb-6 font-bold text-gray-800 dark:text-white placeholder-gray-300 outline-none" contentEditable suppressContentEditableWarning>{docId === 'd1' ? 'Q4 Roadmap' : 'Meeting Notes'}</div>
      <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed group"><h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">Overview</h2><p className="outline-none focus:bg-gray-50 dark:focus:bg-gray-800 p-1 rounded" contentEditable suppressContentEditableWarning>This document outlines the core strategy.</p></div>
    </div>
  );
};

/**
 * ==========================================
 * SECTION 6: GANTT VIEW
 * ==========================================
 */

const parseTaskDate = (dateStr: string) => {
  const currentYear = new Date().getFullYear();
  return new Date(`${dateStr}, ${currentYear}`);
};

const formatDateForDisplay = (dateObj: Date) => {
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDaysArray = (start: Date, end: Date) => {
  const arr = [];
  const dt = new Date(start);
  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
};

const GanttView = ({ tasks, onEditTask, onUpdateTaskDate, onReorderTasks, onAddTask }: any) => {
  const dates = tasks.map((t: Task) => parseTaskDate(t.date));
  const minDate = new Date(Math.min.apply(null, dates as any));
  const maxDate = new Date(Math.max.apply(null, dates as any));
  minDate.setDate(minDate.getDate() - 5);
  maxDate.setDate(maxDate.getDate() + 8);

  const days = getDaysArray(minDate, maxDate);
  const cellWidth = 44;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [draggingBar, setDraggingBar] = useState<{ id: string; startX: number; currentX: number } | null>(null);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

  const handleBarMouseDown = (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    setDraggingBar({ id: task.id, startX, currentX: startX });
  };

  useEffect(() => {
    if (!draggingBar) return;
    const handleMouseMove = (e: MouseEvent) => setDraggingBar(prev => prev ? { ...prev, currentX: e.clientX } : null);
    const handleMouseUp = (e: MouseEvent) => {
      if (!draggingBar) return;
      const totalDelta = e.clientX - draggingBar.startX;
      if (Math.abs(totalDelta) < 5) {
        const task = tasks.find((t: Task) => t.id === draggingBar.id);
        if (task) onEditTask(task);
      } else {
        const daysMoved = Math.round(totalDelta / cellWidth);
        if (daysMoved !== 0) {
          const task = tasks.find((t: Task) => t.id === draggingBar.id);
          if (task) {
            const originalDate = parseTaskDate(task.date);
            const newDate = new Date(originalDate);
            newDate.setDate(newDate.getDate() + daysMoved);
            onUpdateTaskDate(task.id, formatDateForDisplay(newDate));
          }
        }
      }
      setDraggingBar(null);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingBar, cellWidth, onUpdateTaskDate, tasks, onEditTask]);

  const handleRowDragStart = (e: React.DragEvent, taskId: string) => {
    if (draggingBar) { e.preventDefault(); return; }
    setDraggedRowId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleRowDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handleRowDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (draggedRowId && draggedRowId !== targetTaskId) onReorderTasks(draggedRowId, targetTaskId);
    setDraggedRowId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <div className="w-80 flex-shrink-0 p-3 border-r border-gray-200 dark:border-gray-800 bg-[#F7F7F5] dark:bg-[#191919] flex justify-between items-center pl-4">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">WBS / Task Name</span>
          <button
            onClick={() => onAddTask()}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Add Task"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex" style={{ transform: `translateX(0)` }}>
            {days.map((d, i) => (
              <div key={i} className="flex-shrink-0 border-r border-gray-100 dark:border-gray-800 p-2 text-center text-[10px] text-gray-500 dark:text-gray-400 font-medium bg-[#F7F7F5] dark:bg-[#191919]" style={{ width: cellWidth }}>
                <div>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
                <div className="font-bold text-gray-800 dark:text-gray-200">{d.getDate()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex" ref={scrollRef}>
        <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
          {tasks.map((task: Task) => {
            const indent = Math.max(0, (task.wbs.split('.').length - 2) * 16);
            const isDraggingRow = draggedRowId === task.id;
            return (
              <div key={task.id} draggable onDragStart={(e) => handleRowDragStart(e, task.id)} onDragOver={handleRowDragOver} onDrop={(e) => handleRowDrop(e, task.id)}
                className={`h-10 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-grab active:cursor-grabbing group ${isDraggingRow ? 'opacity-50 bg-gray-100 dark:bg-gray-800' : ''}`}
                onClick={() => onEditTask(task)}
              >
                <div className="mr-2 text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing hover:text-gray-500 dark:hover:text-gray-400"><GripVertical size={14} /></div>
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-12 flex-shrink-0">{task.wbs}</span>
                <div className="flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-200" style={{ paddingLeft: indent }}>{task.title}</div>
              </div>
            );
          })}
        </div>
        <div className="relative min-w-full">
          <div className="absolute inset-0 flex pointer-events-none h-full">
            {days.map((_, i) => (<div key={i} className="border-r border-gray-50 dark:border-gray-800 h-full flex-shrink-0" style={{ width: cellWidth }}></div>))}
          </div>
          <div className="pt-0">
            {tasks.map((task: Task) => {
              const endDate = parseTaskDate(task.date);
              const startDate = new Date(endDate);
              startDate.setDate(endDate.getDate() - 3);
              const startOffset = (startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
              const duration = 3;
              const isDragging = draggingBar?.id === task.id;
              const dragOffset = isDragging ? (draggingBar.currentX - draggingBar.startX) : 0;

              // Strict Binding: Use Status Color
              const barColorHex = STATUS_COLORS[task.status];

              return (
                <div key={task.id} className="h-10 border-b border-transparent flex items-center relative group">
                  <div onMouseDown={(e) => handleBarMouseDown(e, task)}
                    className={`absolute h-6 rounded shadow-sm border border-white/10 flex items-center px-2 text-[10px] font-medium overflow-hidden whitespace-nowrap transition-none select-none
                        ${isDragging ? 'z-50 ring-2 ring-gray-400 shadow-lg cursor-grabbing' : 'cursor-grab hover:opacity-90'}
                      `}
                    style={{
                      left: startOffset * cellWidth,
                      width: duration * cellWidth,
                      transform: `translateX(${dragOffset}px)`,
                      zIndex: isDragging ? 50 : 5,
                      backgroundColor: barColorHex,
                      color: '#333'
                    }}
                    title="Drag to reschedule"
                  >{task.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ==========================================
 * SECTION 7: PROJECT VIEWS (KANBAN/LIST)
 * ==========================================
 */

const KanbanBoard = ({ tasks, onTaskUpdate, onEditTask, onAddTask }: any) => {
  const [draggedItem, setDraggedItem] = useState<Task | null>(null);
  const handleDragStart = (e: React.DragEvent, task: Task) => { setDraggedItem(task); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, status: Status) => { e.preventDefault(); if (!draggedItem) return; onTaskUpdate({ ...draggedItem, status }); setDraggedItem(null); };

  return (
    <div className="flex h-full overflow-x-auto pb-4 gap-6 min-w-full">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter((t: Task) => t.status === col.id);
        return (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col h-full rounded-xl bg-[#F7F7F5] dark:bg-[#191919] border border-transparent" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
            <div className="flex items-center justify-between p-3 mb-2">
              <div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${col.color}`}>{colTasks.length}</span><span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{col.title}</span></div>
              <div className="flex gap-1"><button onClick={() => onAddTask(col.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 dark:text-gray-500 transition-colors"><Plus size={14} /></button></div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-hide">
              {colTasks.map((task: Task) => (
                <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task)} onClick={() => onEditTask(task)} className="group bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2"><div className="flex gap-1 flex-wrap">{task.tags.map(tag => <Tag key={tag} text={tag} />)}</div></div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3 leading-snug">{task.title}</h4>
                  <div className="flex items-center justify-between mt-auto"><div className="flex items-center gap-2"><Avatar name={task.assignee} />{task.priority === 'high' && <ArrowUpCircle size={14} className="text-red-500 dark:text-red-400" />}</div><span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><Calendar size={12} /> {task.date}</span></div>
                </div>
              ))}
              <button onClick={() => onAddTask(col.id)} className="w-full py-2 text-left px-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm flex items-center gap-2 transition-colors"><Plus size={14} /> New Task</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ListView = ({ tasks, onEditTask, onAddTask }: any) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <div className="col-span-5 pl-2">Task Name</div><div className="col-span-2">Status</div><div className="col-span-2">Assignee</div><div className="col-span-2">Due Date</div><div className="col-span-1">Priority</div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {tasks.map((task: Task) => (
          <div key={task.id} onClick={() => onEditTask(task)} className="group grid grid-cols-12 gap-4 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer items-center transition-colors">
            <div className="col-span-5 flex items-center gap-3 pl-2"><button className={`text-gray-300 dark:text-gray-600 hover:text-blue-500 transition-colors`}>{task.status === 'done' ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} />}</button><div className="flex flex-col truncate"><span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{task.wbs}</span><span className={`text-gray-700 dark:text-gray-300 font-medium truncate ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>{task.title}</span></div></div>
            <div className="col-span-2"><span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${COLUMNS.find(c => c.id === task.status)?.color}`}>{COLUMNS.find(c => c.id === task.status)?.title}</span></div>
            <div className="col-span-2 flex items-center gap-2"><Avatar name={task.assignee} /><span className="text-gray-500 dark:text-gray-400 text-xs">{task.assignee}</span></div>
            <div className="col-span-2 text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1"><Calendar size={12} /> {task.date}</div>
            <div className="col-span-1"><span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITIES[task.priority].bg} ${PRIORITIES[task.priority].color}`}>{PRIORITIES[task.priority].label}</span></div>
          </div>
        ))}
        <div className="px-6 py-2 border-t border-transparent hover:border-gray-100 dark:hover:border-gray-800"><button onClick={() => onAddTask()} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-sm flex items-center gap-2"><Plus size={14} /> Add New Task</button></div>
      </div>
    </div>
  );
};

/**
 * ==========================================
 * SECTION 8: TASK MODAL
 * ==========================================
 */

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskModal = ({ task, isOpen, onClose, onUpdate, onDelete }: TaskModalProps) => {
  if (!isOpen || !task) return null;
  const handleChange = (field: keyof Task, value: any) => { onUpdate({ ...task, [field]: value }); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <style>{`
        @keyframes icon-shake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(12deg); }
          50% { transform: rotate(-12deg); }
          75% { transform: rotate(12deg); }
          100% { transform: rotate(0deg); }
        }
        .group:hover .icon-shake {
          animation: icon-shake 0.5s ease-in-out infinite;
        }
        @keyframes light-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3); }
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        .dark .pulse-on-hover:hover {
          animation: light-pulse 1.5s infinite;
        }
      `}</style>
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider dark:text-gray-300">{task.wbs ? `Task ${task.wbs}` : `Task-${task.id}`}</span></div>
        </div>
        <div className="p-8 overflow-y-auto flex-1 pb-28">
          <input type="text" value={task.title} onChange={(e) => handleChange('title', e.target.value)} className="text-3xl font-bold text-gray-900 dark:text-white w-full outline-none placeholder-gray-300 mb-6 bg-transparent" placeholder="Task Title" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center h-8"><div className="w-24 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">WBS Code</div><input type="text" value={task.wbs || ''} onChange={(e) => handleChange('wbs', e.target.value)} className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded px-2 py-1 text-sm text-gray-700 w-32 focus:border-gray-400 outline-none" /></div>

              {/* Status Selector - Now binds to color */}
              <div className="flex items-center h-8 relative group">
                <div className="w-24 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"><div className="w-4"><Circle size={14} /></div> Status</div>
                <div className="flex items-center gap-2">
                  <select value={task.status} onChange={(e) => handleChange('status', e.target.value)} className={`appearance-none cursor-pointer pl-2.5 pr-8 py-1 rounded text-sm font-medium outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 ${COLUMNS.find(c => c.id === task.status)?.color}`}>
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  {/* Color preview dot */}
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[task.status] }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300"><textarea value={task.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-gray-400 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none resize-none min-h-[120px] text-gray-700 dark:text-gray-200" placeholder="Description..." /></div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 px-8 flex justify-between items-center pointer-events-none">
          <button
            onClick={() => onDelete(task.id)}
            className="pulse-on-hover pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 border border-transparent backdrop-blur-md shadow-sm transition-all duration-300 hover:scale-105 group"
          >
            <Trash2 size={18} className="transition-transform icon-shake" />
            <span className="font-medium text-sm">Delete</span>
          </button>

          <button
            onClick={onClose}
            className="pulse-on-hover pointer-events-auto flex items-center gap-2 px-6 py-2.5 rounded-full bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 border border-transparent backdrop-blur-md shadow-sm transition-all duration-300 hover:scale-105 group"
          >
            <span className="font-medium text-sm">Done</span>
            <CheckCircle2 size={18} className="icon-shake" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ==========================================
 * SECTION 9: MAIN APP COMPONENT
 * ==========================================
 */

export default function App() {
  const [activeRoute, setActiveRoute] = useState<Route>({ type: 'dashboard', id: null });
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'gantt'>('board');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ projects: true });

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (activeRoute.type === 'project') result = result.filter(t => t.projectId === activeRoute.id);
    else if (activeRoute.type === 'mytasks') result = result.filter(t => t.assignee === 'User');
    if (searchQuery) result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.assignee.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [tasks, activeRoute, searchQuery]);

  const stats = {
    todo: tasks.filter(t => t.status === 'todo').length,
    progress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  const handleUpdateTaskDate = (taskId: string, newDateStr: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, date: newDateStr } : t));
  };

  const handleReorderTasks = (draggedId: string, targetId: string) => {
    const fromIndex = tasks.findIndex(t => t.id === draggedId);
    const toIndex = tasks.findIndex(t => t.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const newTasks = [...tasks];
    const [movedItem] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, movedItem);
    setTasks(newTasks);
  };

  const handleAddTask = (status: Status = 'todo') => {
    const newTask: Task = { id: Math.random().toString(36).substr(2, 9), wbs: '1.0', title: 'New Task', status, priority: 'low', assignee: 'User', tags: [], date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), projectId: activeRoute.type === 'project' ? (activeRoute.id as string) : 'p1', description: '' };
    setTasks([...tasks, newTask]);
    setSelectedTask(newTask);
  };

  const handleDeleteTask = (id: string) => { setTasks(tasks.filter(t => t.id !== id)); setSelectedTask(null); };
  const toggleMenu = (menu: string) => { setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] })); };

  const handleAddProject = () => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: `New Project ${projects.filter(p => p.type === 'project').length + 1}`,
      type: 'project'
    };
    setProjects([...projects, newProject]);
    if (!expandedMenus.projects) setExpandedMenus(prev => ({ ...prev, projects: true }));
    setActiveRoute({ type: 'project', id: newProject.id });
  };

  const getPageTitle = () => {
    if (activeRoute.type === 'dashboard') return 'Dashboard';
    if (activeRoute.type === 'mytasks') return 'My Tasks';
    if (activeRoute.type === 'inbox') return 'Inbox';
    if (activeRoute.type === 'settings') return 'Settings';
    if (activeRoute.type === 'account') return 'Account';
    if (activeRoute.type === 'project' || activeRoute.type === 'doc') return projects.find(p => p.id === activeRoute.id)?.name || 'Project';
    return 'Home';
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Sidebar
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        activeRoute={activeRoute} setActiveRoute={setActiveRoute}
        projects={projects} expandedMenus={expandedMenus} toggleMenu={toggleMenu}
        setViewMode={setViewMode} viewMode={viewMode}
        onAddProject={handleAddProject}
      />

      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 relative transition-colors duration-200">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-20 p-2 bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <Layout size={16} />
          </button>
        )}

        <div className="h-14 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900 flex-shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="opacity-50 hover:underline cursor-pointer">Work</span>
              <span className="opacity-30">/</span>
              <span className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                {getPageTitle()}
                <ChevronDown size={14} className="opacity-30" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 mr-2">
              {USERS.slice(0, 3).map(n => (
                <div key={n} className="ring-2 ring-white dark:ring-gray-900 rounded-full">
                  <Avatar name={n} />
                </div>
              ))}
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 ring-2 ring-white dark:ring-gray-900 flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400 font-medium">+</div>
            </div>
            <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
            <button
              onClick={() => handleAddTask()}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1 shadow-sm transition-all active:scale-95"
            >
              <Plus size={14} /> New Task
            </button>
          </div>
        </div>

        {(activeRoute.type === 'project' || activeRoute.type === 'mytasks') && (
          <div className="px-6 py-3 flex items-center gap-4 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-200">
            <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setViewMode('board')}
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-2 transition-all 
                    ${viewMode === 'board'
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <Kanban size={14} /> Board
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-2 transition-all 
                    ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <ListIcon size={14} /> List
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-2 transition-all 
                    ${viewMode === 'gantt'
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <BarChart2 size={14} /> Gantt
              </button>
            </div>

            <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700"></div>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 hidden md:flex">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                {filteredTasks.filter(t => t.status === 'todo').length} To Do
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                {filteredTasks.filter(t => t.status === 'in-progress').length} In Progress
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-6 relative transition-colors duration-200">
          {activeRoute.type === 'dashboard' && <DashboardView stats={stats} tasks={tasks} projects={projects} />}
          {activeRoute.type === 'inbox' && <InboxView />}
          {activeRoute.type === 'settings' && <SettingsView darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />}
          {activeRoute.type === 'account' && <AccountView />}
          {activeRoute.type === 'doc' && <DocView docId={activeRoute.id as string} />}
          {(activeRoute.type === 'project' || activeRoute.type === 'mytasks') && (
            <>
              {viewMode === 'board' && (<KanbanBoard tasks={filteredTasks} onTaskUpdate={handleUpdateTask} onEditTask={setSelectedTask} onAddTask={handleAddTask} />)}
              {viewMode === 'list' && (<ListView tasks={filteredTasks} onEditTask={setSelectedTask} onAddTask={handleAddTask} />)}
              {viewMode === 'gantt' && (<GanttView tasks={filteredTasks} onEditTask={setSelectedTask} onUpdateTaskDate={handleUpdateTaskDate} onReorderTasks={handleReorderTasks} onAddTask={handleAddTask} />)}
            </>
          )}
        </div>
      </div>

      <TaskModal task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />
    </div>
  );
}