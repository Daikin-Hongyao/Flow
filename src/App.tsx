import React, { useState, useMemo, useEffect } from 'react';
import { Layout, Plus, CheckCircle2, Inbox, Kanban, List as ListIcon, BarChart2, ChevronDown, User, Moon, Sun } from 'lucide-react';
import { Task, Project, Route, Status } from './types';
import { INITIAL_TASKS, INITIAL_PROJECTS, USERS } from './constants';
import Sidebar from './components/Sidebar';
import TaskModal from './components/TaskModal';
import GanttView from './components/GanttView';
import { KanbanBoard, ListView } from './components/ProjectViews';
import { DashboardView, AccountView, InboxView, DocView } from './components/GeneralViews';
import { Avatar } from './components/Shared';

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

        <div className="h-14 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900 flex-shrink-0 transition-colors duration-200 relative z-50">
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

          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
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
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-md transition-all active:scale-95"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {(activeRoute.type === 'project' || activeRoute.type === 'mytasks') && (
          <div className="px-6 py-3 flex items-center gap-4 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-200 relative z-40">
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

        <div className={`flex-1 overflow-auto bg-white dark:bg-gray-900 relative transition-colors duration-200 ${viewMode === 'gantt' ? '' : 'p-6'}`}>
          {activeRoute.type === 'dashboard' && <DashboardView stats={stats} tasks={tasks} projects={projects} />}
          {activeRoute.type === 'inbox' && <InboxView />}
          {activeRoute.type === 'account' && <AccountView />}
          {activeRoute.type === 'doc' && <DocView docId={activeRoute.id as string} />}
          {(activeRoute.type === 'project' || activeRoute.type === 'mytasks') && (
            <>
              {viewMode === 'board' && (<KanbanBoard tasks={filteredTasks} onTaskUpdate={handleUpdateTask} onEditTask={setSelectedTask} onAddTask={handleAddTask} />)}
              {viewMode === 'list' && (<ListView tasks={filteredTasks} onEditTask={setSelectedTask} onAddTask={handleAddTask} />)}
              {viewMode === 'gantt' && (<GanttView tasks={filteredTasks} onEditTask={setSelectedTask} onUpdateTaskDate={handleUpdateTaskDate} onReorderTasks={handleReorderTasks} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} />)}
            </>
          )}
        </div>
      </div>

      <TaskModal task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />
    </div>
  );
}