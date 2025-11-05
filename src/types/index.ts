export type KanbanStatus = 'backlog' | 'in-progress' | 'review' | 'completed'

export interface Project {
  id: string
  name: string
  description: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  status: KanbanStatus
  createdAt: string
  updatedAt: string
  color?: string
}

export interface Task {
  id: string
  projectId?: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  completedAt?: string
  isDaily: boolean
}

export interface TimeEntry {
  id: string
  projectId: string
  description: string
  duration: number // in minutes
  date: string
  createdAt: string
}

export interface FileAttachment {
  id: string
  projectId: string
  name: string
  type: string
  size: number
  url: string // base64 or blob URL
  uploadedAt: string
}

export interface PomodoroSettings {
  workDuration: number // in minutes
  breakDuration: number // in minutes
  longBreakDuration: number // in minutes
  sessionsUntilLongBreak: number
}

export interface PomodoroSession {
  startTime: string
  endTime?: string
  type: 'work' | 'break' | 'long-break'
  projectId?: string
  completed: boolean
}
