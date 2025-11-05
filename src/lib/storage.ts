import { Project, Task, TimeEntry, FileAttachment, PomodoroSettings } from '@/types'

const STORAGE_KEYS = {
  PROJECTS: 'psk_projects',
  TASKS: 'psk_tasks',
  TIME_ENTRIES: 'psk_time_entries',
  FILES: 'psk_files',
  POMODORO_SETTINGS: 'psk_pomodoro_settings',
}

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error)
  }
}

// Projects
export function getProjects(): Project[] {
  return getFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, [])
}

export function saveProjects(projects: Project[]): void {
  saveToStorage(STORAGE_KEYS.PROJECTS, projects)
}

export function addProject(project: Project): void {
  const projects = getProjects()
  projects.push(project)
  saveProjects(projects)
}

export function updateProject(id: string, updates: Partial<Project>): void {
  const projects = getProjects()
  const index = projects.findIndex(p => p.id === id)
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() }
    saveProjects(projects)
  }
}

export function deleteProject(id: string): void {
  const projects = getProjects()
  saveProjects(projects.filter(p => p.id !== id))
}

// Tasks
export function getTasks(): Task[] {
  return getFromStorage<Task[]>(STORAGE_KEYS.TASKS, [])
}

export function saveTasks(tasks: Task[]): void {
  saveToStorage(STORAGE_KEYS.TASKS, tasks)
}

export function addTask(task: Task): void {
  const tasks = getTasks()
  tasks.push(task)
  saveTasks(tasks)
}

export function updateTask(id: string, updates: Partial<Task>): void {
  const tasks = getTasks()
  const index = tasks.findIndex(t => t.id === id)
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates }
    saveTasks(tasks)
  }
}

export function deleteTask(id: string): void {
  const tasks = getTasks()
  saveTasks(tasks.filter(t => t.id !== id))
}

// Time Entries
export function getTimeEntries(): TimeEntry[] {
  return getFromStorage<TimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, [])
}

export function saveTimeEntries(entries: TimeEntry[]): void {
  saveToStorage(STORAGE_KEYS.TIME_ENTRIES, entries)
}

export function addTimeEntry(entry: TimeEntry): void {
  const entries = getTimeEntries()
  entries.push(entry)
  saveTimeEntries(entries)
}

export function deleteTimeEntry(id: string): void {
  const entries = getTimeEntries()
  saveTimeEntries(entries.filter(e => e.id !== id))
}

// File Attachments
export function getFiles(): FileAttachment[] {
  return getFromStorage<FileAttachment[]>(STORAGE_KEYS.FILES, [])
}

export function saveFiles(files: FileAttachment[]): void {
  saveToStorage(STORAGE_KEYS.FILES, files)
}

export function addFile(file: FileAttachment): void {
  const files = getFiles()
  files.push(file)
  saveFiles(files)
}

export function deleteFile(id: string): void {
  const files = getFiles()
  saveFiles(files.filter(f => f.id !== id))
}

// Pomodoro Settings
export function getPomodoroSettings(): PomodoroSettings {
  return getFromStorage<PomodoroSettings>(STORAGE_KEYS.POMODORO_SETTINGS, {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  })
}

export function savePomodoroSettings(settings: PomodoroSettings): void {
  saveToStorage(STORAGE_KEYS.POMODORO_SETTINGS, settings)
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
