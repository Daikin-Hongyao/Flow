import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { Task } from '../types';

// Re-defined locally to prevent import resolution errors in preview environment
const STATUS_BAR_CLASSES: Record<string, string> = {
    'todo': 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600',
    'in-progress': 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700',
    'review': 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-700',
    'done': 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-300 dark:border-green-700',
};

const parseTaskDate = (dateStr: string) => {
    const currentYear = new Date().getFullYear();
    return new Date(`${dateStr}, ${currentYear}`);
};

const formatDateForDisplay = (dateObj: Date) => {
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to group weeks into months with "MMM-YY" format
const getGanttHeaders = (start: Date, end: Date, scale: 'day' | 'week') => {
    const headers = {
        months: [] as { label: string; cols: number }[],
        cols: [] as { date: Date; label: string }[]
    };

    const dt = new Date(start);

    // Align start date to Monday if in week view for consistent grid
    if (scale === 'week') {
        const day = dt.getDay();
        const diff = dt.getDate() - day + (day === 0 ? -6 : 1); // Align to Monday
        dt.setDate(diff);
    }

    while (dt <= end) {
        let colLabel = '';
        let jumpDays = 1;

        if (scale === 'day') {
            colLabel = dt.getDate().toString().padStart(2, '0');
            jumpDays = 1;
        } else {
            // For week view, label is the start day of the week (e.g., "06")
            colLabel = dt.getDate().toString().padStart(2, '0');
            jumpDays = 7;
        }

        headers.cols.push({ date: new Date(dt), label: colLabel });

        // Grouping Logic for Top Row (Month-Year)
        // Format: "MMM-yy" e.g., "Oct-25"
        const monthLabel = dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).replace(' ', '-');

        const lastMonth = headers.months[headers.months.length - 1];
        if (lastMonth && lastMonth.label === monthLabel) {
            lastMonth.cols += 1;
        } else {
            headers.months.push({ label: monthLabel, cols: 1 });
        }

        dt.setDate(dt.getDate() + jumpDays);
    }

    return headers;
};

interface GanttViewProps {
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onUpdateTaskDate: (taskId: string, newDate: string) => void;
    onReorderTasks: (draggedId: string, targetId: string) => void;
    onAddTask: () => void;
    onUpdateTask: (task: Task) => void;
}

export default function GanttView({ tasks, onEditTask, onUpdateTaskDate, onReorderTasks, onAddTask, onUpdateTask }: GanttViewProps) {
    const [viewScale, setViewScale] = useState<'day' | 'week'>('week'); // Default to week based on user request
    const [containerWidth, setContainerWidth] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const headerScrollRef = useRef<HTMLDivElement>(null);

    const cellWidth = viewScale === 'day' ? 40 : 60; // Adjusted width for better week visibility
    const daysPerCell = viewScale === 'day' ? 1 : 7;

    const dates = tasks.flatMap(t => [
        parseTaskDate(t.date),
        t.startDate ? parseTaskDate(t.startDate) : parseTaskDate(t.date),
        t.plannedStartDate ? parseTaskDate(t.plannedStartDate) : null,
        t.plannedEndDate ? parseTaskDate(t.plannedEndDate) : null
    ].filter(Boolean) as Date[]);

    const minDate = dates.length > 0 ? new Date(Math.min.apply(null, dates as any)) : new Date();
    const maxDate = dates.length > 0 ? new Date(Math.max.apply(null, dates as any)) : new Date();

    // Pad dates to ensure full weeks/months visibility
    minDate.setDate(minDate.getDate() - 14);
    maxDate.setDate(maxDate.getDate() + 45); // Extended buffer for week view

    // Generate Headers
    const { months, cols } = getGanttHeaders(minDate, maxDate, viewScale);

    const [draggingBar, setDraggingBar] = useState<{ id: string; startX: number; currentX: number } | null>(null);
    const [resizing, setResizing] = useState<{ id: string; side: 'left' | 'right'; startX: number; initialStart: Date; initialEnd: Date } | null>(null);
    const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

    // Helper to calculate position and width
    const getBarPosition = (startStr?: string, endStr?: string) => {
        if (!startStr || !endStr) return null;
        const startDate = parseTaskDate(startStr);
        const endDate = parseTaskDate(endStr);

        // We need to use the same start date as the grid (from getGanttHeaders)
        // Re-calculate effective grid start date:
        const gridStart = new Date(minDate);
        if (viewScale === 'week') {
            const day = gridStart.getDay();
            const diff = gridStart.getDate() - day + (day === 0 ? -6 : 1);
            gridStart.setDate(diff);
        }

        const startOffset = (startDate.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24);
        const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

        const adjustedDuration = Math.max(0.9, durationDays + (viewScale === 'day' ? 1 : 0));

        return {
            left: (startOffset / daysPerCell) * cellWidth,
            width: (adjustedDuration / daysPerCell) * cellWidth
        };
    };

    const handleBarMouseDown = (e: React.MouseEvent, task: Task) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        setDraggingBar({ id: task.id, startX, currentX: startX });
    };

    const handleResizeStart = (e: React.MouseEvent, task: Task, side: 'left' | 'right') => {
        e.preventDefault();
        e.stopPropagation();
        const endDate = parseTaskDate(task.date);
        const startDate = task.startDate ? parseTaskDate(task.startDate) : new Date(endDate.getTime());
        setResizing({
            id: task.id,
            side,
            startX: e.clientX,
            initialStart: startDate,
            initialEnd: endDate
        });
    };

    useEffect(() => {
        if (!draggingBar && !resizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (draggingBar) {
                setDraggingBar(prev => prev ? { ...prev, currentX: e.clientX } : null);
            } else if (resizing) {
                setResizing(prev => prev ? { ...prev, currentX: e.clientX } : null);
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (resizing) {
                const totalDelta = e.clientX - resizing.startX;
                const unitsMoved = Math.round(totalDelta / cellWidth);
                const daysMoved = unitsMoved * daysPerCell;

                if (daysMoved !== 0) {
                    const task = tasks.find(t => t.id === resizing.id);
                    if (task) {
                        const newStart = new Date(resizing.initialStart);
                        const newEnd = new Date(resizing.initialEnd);

                        if (resizing.side === 'left') {
                            newStart.setDate(newStart.getDate() + daysMoved);
                            if (newStart <= newEnd) {
                                onUpdateTask({
                                    ...task,
                                    startDate: formatDateForDisplay(newStart),
                                    date: formatDateForDisplay(newEnd),
                                    plannedStartDate: formatDateForDisplay(newStart),
                                    plannedEndDate: formatDateForDisplay(newEnd)
                                });
                            }
                        } else {
                            newEnd.setDate(newEnd.getDate() + daysMoved);
                            if (newEnd >= newStart) {
                                onUpdateTask({
                                    ...task,
                                    startDate: formatDateForDisplay(newStart),
                                    date: formatDateForDisplay(newEnd),
                                    plannedStartDate: formatDateForDisplay(newStart),
                                    plannedEndDate: formatDateForDisplay(newEnd)
                                });
                            }
                        }
                    }
                }
                setResizing(null);
                return;
            }

            if (draggingBar) {
                const totalDelta = e.clientX - draggingBar.startX;
                if (Math.abs(totalDelta) >= 5) {
                    const unitsMoved = Math.round(totalDelta / cellWidth);
                    const daysMoved = unitsMoved * daysPerCell;

                    if (daysMoved !== 0) {
                        const task = tasks.find((t: Task) => t.id === draggingBar.id);
                        if (task) {
                            const endDate = parseTaskDate(task.date);
                            const startDate = task.startDate ? parseTaskDate(task.startDate) : new Date(endDate.getTime());

                            const newStart = new Date(startDate);
                            const newEnd = new Date(endDate);

                            newStart.setDate(newStart.getDate() + daysMoved);
                            newEnd.setDate(newEnd.getDate() + daysMoved);

                            onUpdateTask({
                                ...task,
                                startDate: formatDateForDisplay(newStart),
                                date: formatDateForDisplay(newEnd),
                                plannedStartDate: formatDateForDisplay(newStart),
                                plannedEndDate: formatDateForDisplay(newEnd)
                            });
                        }
                    }
                } else {
                    const task = tasks.find((t: Task) => t.id === draggingBar.id);
                    if (task) onEditTask(task);
                }
                setDraggingBar(null);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingBar, resizing, cellWidth, daysPerCell, tasks, onEditTask, onUpdateTask]);

    useEffect(() => {
        if (!scrollRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(scrollRef.current);
        return () => resizeObserver.disconnect();
    }, []);

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
            {/* Header Section */}
            <div className="flex border-b border-gray-300 dark:border-gray-700"> {/* Stronger border for header separation */}
                <div className="w-80 flex-shrink-0 p-3 border-r border-gray-300 dark:border-gray-700 bg-[#F7F7F5] dark:bg-[#191919] flex justify-between items-center pl-4">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">WBS / Task Name</span>
                    <div className="flex gap-2">
                        <div className="flex bg-gray-200 dark:bg-gray-800 rounded p-0.5">
                            <button
                                onClick={() => setViewScale('day')}
                                className={`text-[10px] px-2 py-0.5 rounded ${viewScale === 'day' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}
                            >D</button>
                            <button
                                onClick={() => setViewScale('week')}
                                className={`text-[10px] px-2 py-0.5 rounded ${viewScale === 'week' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}
                            >W</button>
                        </div>
                        <button
                            onClick={() => onAddTask()}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title="Add Task"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                <div
                    ref={headerScrollRef}
                    className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden relative bg-white dark:bg-gray-900 border-l border-gray-300 dark:border-gray-700"
                    onScroll={(e) => {
                        if (scrollRef.current) {
                            scrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
                        }
                    }}
                >
                    <div style={{ width: cols.length * cellWidth }}>
                        {/* Top Row: Month-Year (e.g. Oct-25) */}
                        <div className="flex border-b border-gray-300 dark:border-gray-700">
                            {months.map((m, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 text-center text-sm font-bold text-gray-700 dark:text-gray-200 py-2 border-r border-gray-300 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50"
                                    style={{ width: m.cols * cellWidth }}
                                >
                                    {m.label}
                                </div>
                            ))}
                        </div>
                        {/* Bottom Row: Day Numbers (e.g. 06, 13) */}
                        <div className="flex bg-gray-50 dark:bg-gray-800">
                            {cols.map((col, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700 py-1 text-center text-[11px] font-semibold text-gray-600 dark:text-gray-400"
                                    style={{ width: cellWidth }}
                                >
                                    {col.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Body Section */}
            <div
                className="flex-1 overflow-x-auto overflow-y-auto flex"
                ref={scrollRef}
                onScroll={(e) => {
                    if (headerScrollRef.current) {
                        headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
                    }
                }}
            >
                {/* Sidebar Rows */}
                <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                    {tasks.map((task: Task) => {
                        const indent = Math.max(0, (task.wbs.split('.').length - 2) * 16);
                        const isDraggingRow = draggedRowId === task.id;
                        return (
                            <div key={task.id} draggable onDragStart={(e) => handleRowDragStart(e, task.id)} onDragOver={handleRowDragOver} onDrop={(e) => handleRowDrop(e, task.id)}
                                className={`h-12 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-grab active:cursor-grabbing group ${isDraggingRow ? 'opacity-50 bg-gray-100 dark:bg-gray-800' : ''}`}
                                onClick={() => onEditTask(task)}
                            >
                                <div className="mr-2 text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing hover:text-gray-500 dark:hover:text-gray-400"><GripVertical size={14} /></div>
                                <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-12 flex-shrink-0">{task.wbs}</span>
                                <div className="flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-200" style={{ paddingLeft: indent }}>{task.title}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Timeline Grid */}
                <div className="relative" style={{ width: cols.length * cellWidth, height: tasks.length * 48 }}>
                    <div className="absolute inset-0 flex pointer-events-none h-full">
                        {cols.map((col, i) => {
                            const isWeekend = viewScale === 'day' && (col.date.getDay() === 0 || col.date.getDay() === 6);
                            return (
                                <div
                                    key={i}
                                    className={`border-r border-gray-100 dark:border-gray-800 h-full flex-shrink-0 ${isWeekend ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                                    style={{ width: cellWidth }}
                                ></div>
                            );
                        })}
                    </div>
                    <div className="pt-0">
                        {tasks.map((task: Task) => {
                            // 1. Calculate Position for Actual (Execution)
                            const actualPos = getBarPosition(task.startDate, task.date);

                            // 2. Calculate Position for Plan (Baseline)
                            const planPos = getBarPosition(task.plannedStartDate, task.plannedEndDate);

                            const isDragging = draggingBar?.id === task.id;
                            const isResizing = resizing?.id === task.id;

                            let dragOffset = 0;
                            let widthChange = 0;
                            let leftChange = 0;

                            if (isDragging) {
                                dragOffset = draggingBar.currentX - draggingBar.startX;
                            } else if (isResizing && (resizing as any).currentX) {
                                const delta = (resizing as any).currentX - resizing.startX;
                                if (resizing.side === 'left') {
                                    leftChange = delta;
                                    widthChange = -delta;
                                } else {
                                    widthChange = delta;
                                }
                            }

                            return (
                                <div key={task.id} className="h-12 border-b border-transparent flex items-center relative group">

                                    {/* PLAN BAR (Ghost / Baseline) - Rendered Behind/Above */}
                                    {planPos && (
                                        <div
                                            className="absolute h-3 rounded-full bg-gray-300 dark:bg-gray-600/50 top-2 border border-gray-400 dark:border-gray-500/50 opacity-80"
                                            style={{
                                                left: planPos.left,
                                                width: planPos.width,
                                                zIndex: 1
                                            }}
                                            title={`Planned: ${task.plannedStartDate} - ${task.plannedEndDate}`}
                                        >
                                            {/* Dashed pattern for "Planned" feel */}
                                            <div className="w-full h-full opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 6px)' }}></div>
                                        </div>
                                    )}

                                    {/* ACTUAL BAR (Editable) */}
                                    {actualPos && (
                                        <div onMouseDown={(e) => handleBarMouseDown(e, task)}
                                            className={`absolute h-5 rounded shadow-sm border border-white/10 flex items-center px-2 text-[10px] font-medium overflow-hidden whitespace-nowrap transition-none select-none top-5
                                                ${isDragging || isResizing ? 'z-50 ring-2 ring-gray-400 shadow-lg' : 'cursor-grab hover:opacity-90'}
                                                ${STATUS_BAR_CLASSES[task.status] || 'bg-slate-200 dark:bg-slate-700'}
                                            `}
                                            style={{
                                                left: actualPos.left + (isDragging ? dragOffset : leftChange),
                                                width: Math.max(cellWidth, actualPos.width + widthChange),
                                                zIndex: isDragging || isResizing ? 50 : 5,
                                            }}
                                            title={`Actual: ${task.startDate || '...'} - ${task.date}`}
                                        >
                                            {/* Left Resize Handle */}
                                            <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 z-10" onMouseDown={(e) => handleResizeStart(e, task, 'left')} />
                                            <span className="truncate w-full">{task.title}</span>
                                            {/* Right Resize Handle */}
                                            <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 z-10" onMouseDown={(e) => handleResizeStart(e, task, 'right')} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}