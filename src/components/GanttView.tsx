import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { Task } from '../types';
import { NOTION_COLORS } from '../constants';

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

interface GanttViewProps {
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onUpdateTaskDate: (taskId: string, newDate: string) => void;
    onReorderTasks: (draggedId: string, targetId: string) => void;
    onAddTask: () => void;
}

export default function GanttView({ tasks, onEditTask, onUpdateTaskDate, onReorderTasks, onAddTask }: GanttViewProps) {
    const dates = tasks.map(t => parseTaskDate(t.date));
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
                <div className="w-80 flex-shrink-0 p-3 border-r border-gray-200 dark:border-gray-800 bg-[#F7F7F5] dark:bg-[#191919] flex items-center justify-between pl-4">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">WBS / Task Name</span>
                    <button onClick={onAddTask} className="flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded px-2 py-1 text-gray-500 dark:text-gray-400 transition-colors text-xs font-medium">
                        <Plus size={12} />
                        <span>New</span>
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

                            // Determine color class or hex
                            let colorClass = 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'; // Default
                            let customBg = undefined;
                            let customShadow = undefined;

                            if (task.status === 'done') {
                                colorClass = `${NOTION_COLORS.green.bg} ${NOTION_COLORS.green.text}`;
                            } else if (task.priority === 'high') {
                                colorClass = `${NOTION_COLORS.red.bg} ${NOTION_COLORS.red.text}`;
                            } else if (task.priority === 'medium') {
                                colorClass = `${NOTION_COLORS.yellow.bg} ${NOTION_COLORS.yellow.text}`;
                            }

                            // Handle custom color override
                            if (task.color) {
                                // Check if it matches a known Notion color hex to use the class instead
                                const notionColorKey = Object.keys(NOTION_COLORS).find(k => NOTION_COLORS[k as keyof typeof NOTION_COLORS].hex === task.color);
                                if (notionColorKey) {
                                    const nc = NOTION_COLORS[notionColorKey as keyof typeof NOTION_COLORS];
                                    colorClass = `${nc.bg} ${nc.text}`;
                                } else {
                                    colorClass = 'text-gray-800'; // Default text for custom
                                    customBg = task.color;
                                    customShadow = `0 0 10px ${task.color}40`;
                                }
                            }

                            return (
                                <div key={task.id} className="h-10 border-b border-transparent flex items-center relative group">
                                    <div onMouseDown={(e) => handleBarMouseDown(e, task)}
                                        className={`absolute h-6 rounded shadow-sm border border-white/20 flex items-center px-2 text-[10px] font-medium overflow-hidden whitespace-nowrap transition-all select-none
                        ${isDragging ? 'z-50 ring-2 ring-gray-400 shadow-lg cursor-grabbing' : 'cursor-grab hover:opacity-100 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]'}
                        ${!customBg ? colorClass : ''}
                      `}
                                        style={{
                                            left: startOffset * cellWidth,
                                            width: duration * cellWidth,
                                            transform: `translateX(${dragOffset}px)`,
                                            zIndex: isDragging ? 50 : 5,
                                            backgroundColor: customBg,
                                            boxShadow: customShadow
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
}