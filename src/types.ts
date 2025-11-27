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
  date: string;
  projectId: string;
  description: string;
  color?: string;
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
}

export interface Route {
  type: string;
  id: string | null;
}