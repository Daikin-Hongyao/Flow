import React from 'react';
import { Circle, Trash2, X, Palette, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';
import { COLUMNS, STATUS_COLORS, STATUS_BAR_CLASSES } from '../constants';

interface TaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (task: Task) => void;
    onDelete: (id: string) => void;
}

export default function TaskModal({ task, isOpen, onClose, onUpdate, onDelete }: TaskModalProps) {
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
                                    <div className={`w-3 h-3 rounded-full ${STATUS_BAR_CLASSES[task.status]}`}></div>
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