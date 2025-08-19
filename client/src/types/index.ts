export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TodoStatus = 'pending' | 'active' | 'completed';

export interface Todo {
  id: string;
  userId: string;
  description: string;
  priority: Priority;
  date: string | null;       
  status: TodoStatus;        
  pinned: boolean;
  pinnedAt: string | null;
  createdAt: string;         
  updatedAt: string;         
}

export interface Paginated<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
}
