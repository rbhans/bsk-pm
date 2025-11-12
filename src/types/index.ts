export type KanbanStatus = 'backlog' | 'in-progress' | 'review' | 'completed'

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  logo?: string // base64 or blob URL
  colorPalette?: string[] // array of hex color codes
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  // Client reference - new approach
  clientId?: string
  // Legacy client fields - kept for backward compatibility
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  status: KanbanStatus
  createdAt: string
  updatedAt: string
  color?: string
  isInternal?: boolean
  isArchived?: boolean
  protonDriveLink?: string
  dueDate?: string
  notes?: string
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
  missedDate?: string // Date when a daily task was missed
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
