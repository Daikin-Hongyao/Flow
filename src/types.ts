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
    date: string; // End Date / Due Date
    startDate?: string; // Optional Start Date
    projectId: string;
    description: string;
}

export interface Project {
    id: string;
    name: string;
    type: 'project' | 'doc';
}

export interface Column {
    id: Status;
    title: string;
    color: string;
    barColor: string;
}

export interface Route {
    type: string;
    id: string | null;
}