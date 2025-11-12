import { Project, Task, TimeEntry, FileAttachment, PomodoroSettings, Client } from '@/types'

const STORAGE_KEYS = {
  PROJECTS: 'psk_projects',
  TASKS: 'psk_tasks',
  TIME_ENTRIES: 'psk_time_entries',
  FILES: 'psk_files',
  POMODORO_SETTINGS: 'psk_pomodoro_settings',
  CLIENTS: 'psk_clients',
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
    const serialized = JSON.stringify(value)

    // Check approximate size (rough estimate)
    const sizeInBytes = new Blob([serialized]).size
    const sizeInMB = sizeInBytes / (1024 * 1024)

    // Warning at 4MB to prevent hitting the typical 5-10MB quota
    if (sizeInMB > 4) {
      console.warn(`⚠️ Storage size for ${key} is ${sizeInMB.toFixed(2)}MB. Consider exporting and archiving old data.`)
    }

    localStorage.setItem(key, serialized)
  } catch (error: any) {
    console.error(`Error saving ${key} to storage:`, error)

    // Handle quota exceeded error specifically
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      alert(
        'Storage quota exceeded!\n\n' +
        'Your project data has become too large for browser storage.\n\n' +
        'Please try one of the following:\n' +
        '• Export your data using the download button in the header\n' +
        '• Delete some old files or archived projects\n' +
        '• Clear browser cache for this site'
      )
    } else {
      alert('Failed to save data. Please try again or contact support if the issue persists.')
    }

    throw error // Re-throw so caller knows save failed
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

// Clients
export function getClients(): Client[] {
  return getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, [])
}

export function saveClients(clients: Client[]): void {
  saveToStorage(STORAGE_KEYS.CLIENTS, clients)
}

export function addClient(client: Client): void {
  const clients = getClients()
  clients.push(client)
  saveClients(clients)
}

export function updateClient(id: string, updates: Partial<Client>): void {
  const clients = getClients()
  const index = clients.findIndex(c => c.id === id)
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updates, updatedAt: new Date().toISOString() }
    saveClients(clients)
  }
}

export function deleteClient(id: string): void {
  const clients = getClients()
  saveClients(clients.filter(c => c.id !== id))
}

export function getClientById(id: string): Client | undefined {
  const clients = getClients()
  return clients.find(c => c.id === id)
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Export/Import functionality
export function exportAllData(): string {
  const data = {
    projects: getProjects(),
    clients: getClients(),
    tasks: getTasks(),
    timeEntries: getTimeEntries(),
    files: getFiles(),
    pomodoroSettings: getPomodoroSettings(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  }
  return JSON.stringify(data, null, 2)
}

export function importAllData(jsonData: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonData)

    // Validate data structure
    if (!data.version) {
      return { success: false, error: 'Invalid data format: missing version' }
    }

    // Import data
    if (data.projects) saveProjects(data.projects)
    if (data.clients) saveClients(data.clients)
    if (data.tasks) saveTasks(data.tasks)
    if (data.timeEntries) saveTimeEntries(data.timeEntries)
    if (data.files) saveFiles(data.files)
    if (data.pomodoroSettings) savePomodoroSettings(data.pomodoroSettings)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
