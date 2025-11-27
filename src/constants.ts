import { Task, Project, Column, Priority } from './types';

export const USERS = ['Alex', 'Sarah', 'Mike', 'User'];

// Notion-style Low Saturation Palette
export const NOTION_COLORS = {
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-300', hex: '#FECACA' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-300', hex: '#FEF08A' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-300', hex: '#BBF7D0' },
    gray: { bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-500 dark:text-gray-400', hex: '#E2E8F0' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-300', hex: '#BFDBFE' },
};

// Notion-style Low Saturation Palette for Priorities
export const PRIORITIES: Record<Priority, { text: string; bg: string; label: string }> = {
    low: {
        text: 'text-gray-500 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        label: 'Low'
    },
    medium: {
        text: 'text-yellow-600 dark:text-yellow-300',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        label: 'Medium'
    },
    high: {
        text: 'text-red-600 dark:text-red-300',
        bg: 'bg-red-50 dark:bg-red-900/20',
        label: 'High'
    },
};

// Notion-style Column Colors (Subtle backgrounds)
export const COLUMNS: Column[] = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' },
    { id: 'review', title: 'Review', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300' },
    { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300' },
];

export const INITIAL_TASKS: Task[] = [
    { id: '1', wbs: '1.0', title: 'Product Launch Phase', status: 'in-progress', priority: 'high', assignee: 'Alex', tags: ['Core'], date: 'Oct 30', projectId: 'p1', description: 'Main tracking item.' },
    { id: '2', wbs: '1.1', title: 'Design System V2', status: 'done', priority: 'high', assignee: 'Alex', tags: ['Design'], date: 'Oct 24', projectId: 'p1', description: 'Update palette.' },
    { id: '3', wbs: '1.2', title: 'User Interview Analysis', status: 'todo', priority: 'low', assignee: 'Alex', tags: ['Research'], date: 'Oct 28', projectId: 'p1', description: 'Collate feedback.' },
    { id: '4', wbs: '1.2.1', title: 'Compile Survey Data', status: 'todo', priority: 'low', assignee: 'Mike', tags: ['Research'], date: 'Oct 27', projectId: 'p1', description: 'Raw data processing.' },
    { id: '5', wbs: '2.0', title: 'Marketing Campaign', status: 'in-progress', priority: 'medium', assignee: 'Sarah', tags: ['Marketing'], date: 'Oct 31', projectId: 'p2', description: 'Q4 push.', color: '#E39D39' }, // Muted Orange/Yellow
    { id: '6', wbs: '2.1', title: 'Q4 Strategy Draft', status: 'in-progress', priority: 'medium', assignee: 'Sarah', tags: ['Marketing'], date: 'Oct 26', projectId: 'p2', description: 'Initial draft.' },
    { id: '7', wbs: '2.2', title: 'Landing Page Update', status: 'todo', priority: 'medium', assignee: 'Sarah', tags: ['Dev'], date: 'Oct 29', projectId: 'p2', description: 'New testimonials.' },
    { id: '8', wbs: '3.0', title: 'Finance Review', status: 'review', priority: 'high', assignee: 'User', tags: ['Finance'], date: 'Oct 30', projectId: 'p1', description: 'Q3 Report.' },
];

export const INITIAL_PROJECTS: Project[] = [
    { id: 'p1', name: 'Product Launch', type: 'project' },
    { id: 'p2', name: 'Marketing', type: 'project' },
    { id: 'd1', name: 'Q4 Roadmap', type: 'doc' },
    { id: 'd2', name: 'Meeting Notes', type: 'doc' },
];