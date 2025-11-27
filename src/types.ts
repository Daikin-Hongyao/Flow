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
    date: string; // End Date / Due Date (Display/Planning)
    startDate?: string; // Optional Start Date (Display/Planning)
    plannedStartDate?: string;
    plannedEndDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
    projectId: string;
    description: string;
}

interface DraggingBarState {
    id: string;
    startX: number;
    currentX: number;
}

interface ResizingState {
    id: string;
    side: 'left' | 'right';
    startX: number;
    currentX: number;
    initialStart: Date;
    initialEnd: Date;
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