import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
    value: string; // "MMM DD" or "MMM DD, YYYY"
    onChange: (date: string) => void;
    placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = "Select Date" }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date()); // For navigation
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse the input value to set initial calendar state
    useEffect(() => {
        if (value) {
            const currentYear = new Date().getFullYear();
            const dateStr = value.includes(',') ? value : `${value}, ${currentYear}`;
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
                setCurrentDate(parsed);
            }
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const formatted = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        onChange(formatted);
        setIsOpen(false);
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateToCheck = new Date(year, month, day);
            const isToday = new Date().toDateString() === dateToCheck.toDateString();

            // Check if this is the selected date
            let isSelected = false;
            if (value) {
                const currentYear = new Date().getFullYear();
                const dateStr = value.includes(',') ? value : `${value}, ${currentYear}`;
                const parsed = new Date(dateStr);
                if (!isNaN(parsed.getTime()) && parsed.toDateString() === dateToCheck.toDateString()) {
                    isSelected = true;
                }
            }

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
                        ${isSelected
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : isToday
                                ? 'bg-gray-100 dark:bg-gray-700 text-blue-500 font-bold hover:bg-gray-200 dark:hover:bg-gray-600'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                    `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="flex items-center h-8 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded px-2 py-1 text-sm text-gray-700 w-32 cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {value || <span className="text-gray-400">{placeholder}</span>}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-64 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
                            <ChevronLeft size={16} />
                        </button>
                        <div className="font-semibold text-gray-900 dark:text-white">
                            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </div>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-400">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                    </div>
                </div>
            )}
        </div>
    );
}
