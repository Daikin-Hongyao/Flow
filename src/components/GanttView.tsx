import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { Task } from '../types';
import { STATUS_COLORS, STATUS_BAR_CLASSES } from '../constants';

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

    if (scale === 'week') {
        const day = dt.getDay();
        const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
        dt.setDate(diff);
    }

    while (dt <= end) {
        let colLabel = '';
        let jumpDays = 1;

        if (scale === 'day') {
            colLabel = dt.getDate().toString().padStart(2, '0');
            jumpDays = 1;
        } else {
            colLabel = dt.getDate().toString().padStart(2, '0');
            jumpDays = 7;
        }

        headers.cols.push({ date: new Date(dt), label: colLabel });

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
    const [viewScale, setViewScale] = useState<'day' | 'week'>('week');
    const [containerWidth, setContainerWidth] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const cellWidth = viewScale === 'day' ? 40 : 60;
    const daysPerCell = viewScale === 'day' ? 1 : 7;

    const dates = tasks.flatMap((t: Task) => {
        const d = [parseTaskDate(t.date)];
        if (t.startDate) d.push(parseTaskDate(t.startDate));
        if (t.actualStartDate) d.push(parseTaskDate(t.actualStartDate));
        if (t.actualDueDate) d.push(parseTaskDate(t.actualDueDate));
        return d;
    });
    const minDate = new Date(Math.min.apply(null, dates as any));
    const maxDate = new Date(Math.max.apply(null, dates as any));

    minDate.setDate(minDate.getDate() - 14);
    maxDate.setDate(maxDate.getDate() + 45);

    // Ensure timeline fills the screen
    if (containerWidth > 0) {
        const sidebarWidth = 320;
        const availableWidth = containerWidth - sidebarWidth;
        const currentDurationDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
        const currentWidth = (currentDurationDays / daysPerCell) * cellWidth;

        if (currentWidth < availableWidth) {
            const missingWidth = availableWidth - currentWidth;
            const missingDays = Math.ceil((missingWidth / cellWidth) * daysPerCell);
            maxDate.setDate(maxDate.getDate() + missingDays);
        }
    }

    const { months, cols } = getGanttHeaders(minDate, maxDate, viewScale);

    const [draggingBar, setDraggingBar] = useState<{ id: string; startX: number; currentX: number } | null>(null);
    const [resizing, setResizing] = useState<{ id: string; side: 'left' | 'right'; startX: number; initialStart: Date; initialEnd: Date } | null>(null);
    const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

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
        const startDate = task.startDate ? parseTaskDate(task.startDate) : new Date(endDate.getTime() - 3 * 24 * 60 * 60 * 1000);
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
                // Just force re-render for smoothness if needed, but actual calc is in mouseUp/render
                // For real-time preview, we might want to update a temp state, but for now let's just handle drop
                // Actually, to show resizing in real-time we need state. 
                // Let's update the task in real-time or use a local state for preview?
                // For simplicity, let's update the task on mouse up, but we need visual feedback.
                // We can use the same 'draggingBar' approach or just use the resizing state to calculate render.
                // Let's update resizing currentX.
                // Wait, I didn't add currentX to resizing state. Let's add it.
                // Actually, I can just use the delta in render.
                // But I need to trigger re-render.
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
                            // Prevent start > end
                            if (newStart < newEnd) {
                                onUpdateTask({
                                    ...task,
                                    startDate: formatDateForDisplay(newStart),
                                    date: formatDateForDisplay(newEnd)
                                });
                            }
                        } else {
                            newEnd.setDate(newEnd.getDate() + daysMoved);
                            // Prevent end < start
                            if (newEnd > newStart) {
                                onUpdateTask({
                                    ...task,
                                    startDate: formatDateForDisplay(newStart),
                                    date: formatDateForDisplay(newEnd)
                                });
                            }
                        }
                    }
                }
                setResizing(null);
                return;
            }

            if (!draggingBar) return;
            const totalDelta = e.clientX - draggingBar.startX;
            if (Math.abs(totalDelta) < 5) {
                // Clicked but not dragged - do nothing as per request
                // const task = tasks.find((t: Task) => t.id === draggingBar.id);
                // if (task) onEditTask(task);
            } else {
                const unitsMoved = Math.round(totalDelta / cellWidth);
                const daysMoved = unitsMoved * daysPerCell;

                if (daysMoved !== 0) {
                    const task = tasks.find((t: Task) => t.id === draggingBar.id);
                    if (task) {
                        const endDate = parseTaskDate(task.date);
                        const startDate = task.startDate ? parseTaskDate(task.startDate) : new Date(endDate.getTime() - 3 * 24 * 60 * 60 * 1000);

                        const newStart = new Date(startDate);
                        const newEnd = new Date(endDate);

                        newStart.setDate(newStart.getDate() + daysMoved);
                        newEnd.setDate(newEnd.getDate() + daysMoved);

                        onUpdateTask({
                            ...task,
                            startDate: formatDateForDisplay(newStart),
                            date: formatDateForDisplay(newEnd)
                        });
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
    }, [draggingBar, resizing, cellWidth, daysPerCell, onUpdateTaskDate, tasks, onEditTask]);

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
            <div className="flex border-b border-gray-300 dark:border-gray-700">
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

                <div className="flex-1 overflow-hidden relative bg-white dark:bg-gray-900 border-l border-gray-300 dark:border-gray-700">
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
                        {cols.map((col, i) => {
                            const isWeekend = viewScale === 'day' && (col.date.getDay() === 0 || col.date.getDay() === 6);
                            return (
                                <div
                                    key={i}
                                    className={`border-r border-gray-100 dark:border-gray-800 h-full flex-shrink-0 ${isWeekend ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                                    style={{ width: cellWidth }}
                                ></div>
                            );
                        })}
                    </div>
                    <div className="pt-0">
                        {tasks.map((task: Task) => {
                            // Planning Dates (Foreground)
                            const planEndDate = parseTaskDate(task.date);
                            const planStartDate = task.startDate ? parseTaskDate(task.startDate) : new Date(planEndDate.getTime() - 3 * 24 * 60 * 60 * 1000);

                            const planStartOffset = (planStartDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
                            const planDurationDays = (planEndDate.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24);

                            const planStartUnits = planStartOffset / daysPerCell;
                            const planDurationUnits = Math.max(0.5, planDurationDays / daysPerCell);

                            // Actual Dates (Background)
                            let actualStartUnits = 0;
                            let actualDurationUnits = 0;
                            const hasActuals = task.actualStartDate && task.actualDueDate;

                            if (hasActuals) {
                                const actStartDate = parseTaskDate(task.actualStartDate!);
                                const actEndDate = parseTaskDate(task.actualDueDate!);

                                const actStartOffset = (actStartDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
                                const actDurationDays = (actEndDate.getTime() - actStartDate.getTime()) / (1000 * 60 * 60 * 24);

                                actualStartUnits = actStartOffset / daysPerCell;
                                actualDurationUnits = Math.max(0.5, actDurationDays / daysPerCell);
                            }

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
                                <div key={task.id} className="h-10 border-b border-transparent flex items-center relative group">
                                    {/* Actual Bar (Background) */}
                                    {hasActuals && (
                                        <div
                                            className={`absolute h-6 rounded-sm opacity-40 ${STATUS_BAR_CLASSES[task.status]}`}
                                            style={{
                                                left: actualStartUnits * cellWidth,
                                                width: Math.max(cellWidth, actualDurationUnits * cellWidth),
                                                zIndex: 4,
                                            }}
                                            title={`Actual: ${task.actualStartDate} - ${task.actualDueDate}`}
                                        />
                                    )}

                                    {/* Planning Bar (Foreground, Interactive) */}
                                    <div onMouseDown={(e) => handleBarMouseDown(e, task)}
                                        className={`absolute h-4 rounded shadow-sm border border-white/20 flex items-center px-2 text-[10px] font-medium overflow-hidden whitespace-nowrap transition-none select-none
                        ${isDragging || isResizing ? 'z-50 ring-2 ring-gray-400 shadow-lg' : 'cursor-grab hover:opacity-90'}
                        ${STATUS_BAR_CLASSES[task.status]}
                      `}
                                        style={{
                                            left: planStartUnits * cellWidth + (isDragging ? dragOffset : leftChange),
                                            width: Math.max(cellWidth, planDurationUnits * cellWidth + widthChange),
                                            transform: isDragging ? `translateX(0px)` : 'none',
                                            zIndex: isDragging || isResizing ? 50 : 10,
                                        }}
                                        title={`Planning: ${formatDateForDisplay(planStartDate)} - ${task.date}`}
                                    >
                                        {/* Left Resize Handle */}
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 z-10"
                                            onMouseDown={(e) => handleResizeStart(e, task, 'left')}
                                        />

                                        <span className="truncate w-full drop-shadow-md">{task.title}</span>

                                        {/* Right Resize Handle */}
                                        <div
                                            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 z-10"
                                            onMouseDown={(e) => handleResizeStart(e, task, 'right')}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}