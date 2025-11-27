import React, { useState } from 'react';
import { Plus, ArrowUpCircle, Calendar, CheckCircle2, Circle } from 'lucide-react';

// --- Types (Inlined to resolve build error) ---
export type Status = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
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
  color?: string;
}

interface Column {
  id: Status;
  title: string;
  color: string;
}

// --- Constants (Inlined with Notion-style Colors) ---

const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
  { id: 'review', title: 'Review', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
];

const PRIORITIES: Record<Priority, { color: string; bg: string; label: string }> = {
  low: { 
    color: 'text-gray-600 dark:text-gray-400', 
    bg: 'bg-gray-100 dark:bg-gray-800', 
    label: 'Low' 
  },
  medium: { 
    color: 'text-yellow-700 dark:text-yellow-300', 
    bg: 'bg-yellow-100/80 dark:bg-yellow-900/30', 
    label: 'Medium' 
  },
  high: { 
    color: 'text-red-700 dark:text-red-300', 
    bg: 'bg-red-100/80 dark:bg-red-900/30', 
    label: 'High' 
  },
};

// --- Components ---

const Tag = ({ text }: { text: string }) => (
  <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 whitespace-nowrap">{text}</span>
);

const Avatar = ({ name }: { name: string }) => {
  const initials = name ? name[0] : '?';
  return <div className="w-6 h-6 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium border border-gray-200 dark:border-gray-600">{initials}</div>;
};

export const KanbanBoard = ({ tasks, onTaskUpdate, onEditTask, onAddTask }: any) => {
  const [draggedItem, setDraggedItem] = useState<Task | null>(null);
  const handleDragStart = (e: React.DragEvent, task: Task) => { setDraggedItem(task); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, status: Status) => { e.preventDefault(); if (!draggedItem) return; onTaskUpdate({ ...draggedItem, status }); setDraggedItem(null); };

  return (
    <div className="flex h-full overflow-x-auto pb-4 gap-6 min-w-full">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter((t: Task) => t.status === col.id);
        return (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col h-full rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-transparent" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
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

export const ListView = ({ tasks, onEditTask, onAddTask }: any) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <div className="col-span-5 pl-2">Task Name</div><div className="col-span-2">Status</div><div className="col-span-2">Assignee</div><div className="col-span-2">Due Date</div><div className="col-span-1">Priority</div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
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