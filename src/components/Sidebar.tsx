import React from 'react';
import {
    Bell, Settings, Search, Layout, CheckCircle2, Inbox, Kanban, FileText, Plus,
    MoreHorizontal, ChevronDown, ChevronRight, BarChart2, List as ListIcon
} from 'lucide-react';
import { Project, Route } from '../types';
import { Avatar } from './Shared';

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

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean) => void;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    activeRoute: Route;
    setActiveRoute: (r: Route) => void;
    projects: Project[];
    expandedMenus: Record<string, boolean>;
    toggleMenu: (menu: string) => void;
    setViewMode: (mode: 'board' | 'list' | 'gantt') => void;
    viewMode: 'board' | 'list' | 'gantt';
    onAddProject: () => void;
}

export default function Sidebar({
    sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery, activeRoute, setActiveRoute,
    projects, expandedMenus, toggleMenu, setViewMode, viewMode, onAddProject
}: SidebarProps) {
    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-[#F7F7F5] dark:bg-[#191919] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden relative flex-shrink-0`}>
            <div className="p-4 flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-gray-800 dark:bg-gray-200 rounded-md flex items-center justify-center text-white dark:text-gray-900 font-bold text-xs shadow-sm">N</div>
                <div className="font-semibold text-gray-700 dark:text-gray-200 text-sm tracking-tight flex-1">NotionClone</div>
                <div className="flex gap-1">
                    <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"><Bell size={14} /></button>
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
}