import React, { useState } from 'react';
import { Plus, ArrowUpCircle, Calendar, CheckCircle2, Circle, List as ListIcon, Kanban } from 'lucide-react';
import { Task, Status } from '../types';
import { COLUMNS, PRIORITIES } from '../constants';
import { Avatar, Tag } from './Shared';

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

export const ListView = ({ tasks, onEditTask, onAddTask }: any) => {
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