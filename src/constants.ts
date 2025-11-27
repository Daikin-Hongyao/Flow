import { Task, Project, Column, Priority, Status } from './types';

export const USERS = ['Alex', 'Sarah', 'Mike', 'User'];

// Notion-style Low Saturation Palette strictly bound to Status
export const STATUS_COLORS: Record<Status, string> = {
    'todo': '#E2E8F0',        // Muted Slate (Neutral)
    'in-progress': '#BFDBFE', // Muted Blue (Active)
    'review': '#FEF08A',      // Muted Yellow (Warning/Check)
    'done': '#BBF7D0',        // Muted Green (Success)
};

export const STATUS_BAR_CLASSES: Record<Status, string> = {
    'todo': 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100',
    'in-progress': 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100',
    'review': 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100',
    'done': 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100',
};

export const COLUMNS: Column[] = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400', barColor: STATUS_COLORS.todo },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300', barColor: STATUS_COLORS['in-progress'] },
    { id: 'review', title: 'Review', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300', barColor: STATUS_COLORS.review },
    { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300', barColor: STATUS_COLORS.done },
];

export const PRIORITIES: Record<Priority, { color: string; bg: string; label: string }> = {
    low: { color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', label: 'Low' },
    medium: { color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Medium' },
    high: { color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30', label: 'High' },
};

export const INITIAL_TASKS: Task[] = [
    { 
        id: '1', wbs: '1.0', title: 'Product Launch Phase', status: 'in-progress', priority: 'high', assignee: 'Alex', tags: ['Core'], projectId: 'p1', description: 'Main tracking item.',
        date: 'Oct 30', startDate: 'Oct 01',
        plannedStartDate: 'Oct 01', plannedEndDate: 'Oct 28' // Slipping 2 days
    },
    { 
        id: '2', wbs: '1.1', title: 'Design System V2', status: 'done', priority: 'high', assignee: 'Alex', tags: ['Design'], projectId: 'p1', description: 'Update palette.',
        date: 'Oct 24', startDate: 'Oct 10',
        plannedStartDate: 'Oct 10', plannedEndDate: 'Oct 24' // On time
    },
    { 
        id: '3', wbs: '1.2', title: 'User Interview Analysis', status: 'todo', priority: 'low', assignee: 'Alex', tags: ['Research'], projectId: 'p1', description: 'Collate feedback.',
        date: 'Oct 28', startDate: 'Oct 25',
        plannedStartDate: 'Oct 20', plannedEndDate: 'Oct 25' // Started late
    },
    { 
        id: '4', wbs: '1.2.1', title: 'Compile Survey Data', status: 'todo', priority: 'low', assignee: 'Mike', tags: ['Research'], projectId: 'p1', description: 'Raw data processing.',
        date: 'Oct 27', startDate: 'Oct 26',
        plannedStartDate: 'Oct 26', plannedEndDate: 'Oct 27' 
    },
    { 
        id: '5', wbs: '2.0', title: 'Marketing Campaign', status: 'in-progress', priority: 'medium', assignee: 'Sarah', tags: ['Marketing'], projectId: 'p2', description: 'Q4 push.',
        date: 'Oct 31', startDate: 'Oct 15',
        plannedStartDate: 'Oct 15', plannedEndDate: 'Nov 05' // Finishing early?
    },
    { 
        id: '6', wbs: '2.1', title: 'Q4 Strategy Draft', status: 'in-progress', priority: 'medium', assignee: 'Sarah', tags: ['Marketing'], projectId: 'p2', description: 'Initial draft.',
        date: 'Oct 26', startDate: 'Oct 20',
        plannedStartDate: 'Oct 20', plannedEndDate: 'Oct 26'
    },
    { 
        id: '7', wbs: '2.2', title: 'Landing Page Update', status: 'todo', priority: 'medium', assignee: 'Sarah', tags: ['Dev'], projectId: 'p2', description: 'New testimonials.',
        date: 'Oct 29', startDate: 'Oct 28',
        plannedStartDate: 'Oct 25', plannedEndDate: 'Oct 28'
    },
    { 
        id: '8', wbs: '3.0', title: 'Finance Review', status: 'review', priority: 'high', assignee: 'User', tags: ['Finance'], projectId: 'p1', description: 'Q3 Report.',
        date: 'Oct 30', startDate: 'Oct 29',
        plannedStartDate: 'Oct 29', plannedEndDate: 'Oct 30'
    },
];

export const INITIAL_PROJECTS: Project[] = [
    { id: 'p1', name: 'Product Launch', type: 'project' },
    { id: 'p2', name: 'Marketing', type: 'project' },
    { id: 'd1', name: 'Q4 Roadmap', type: 'doc' },
    { id: 'd2', name: 'Meeting Notes', type: 'doc' },
];