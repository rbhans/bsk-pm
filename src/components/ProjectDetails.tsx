import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from './Layout'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Project, TimeEntry, FileAttachment, KanbanStatus, Client } from '@/types'
import {
  getProjects,
  updateProject,
  getTimeEntries,
  addTimeEntry,
  deleteTimeEntry,
  getFiles,
  addFile,
  deleteFile,
  generateId,
  getClientById,
} from '@/lib/storage'
import { ArrowLeft, Clock, Upload, Trash2, Download, Save, ExternalLink, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [linkedClient, setLinkedClient] = useState<Client | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [files, setFiles] = useState<FileAttachment[]>([])
  const [isEditing, setIsEditing] = useState(false)

  // Time entry form
  const [newTimeEntry, setNewTimeEntry] = useState({
    description: '',
    hours: '',
    minutes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    if (!id) return

    // Inline data loading to avoid stale closures
    const projects = getProjects()
    const foundProject = projects.find(p => p.id === id)
    if (foundProject) {
      setProject(foundProject)
      // Load linked client if clientId exists
      if (foundProject.clientId) {
        const client = getClientById(foundProject.clientId)
        setLinkedClient(client || null)
      } else {
        setLinkedClient(null)
      }
    }

    const allTimeEntries = getTimeEntries()
    setTimeEntries(allTimeEntries.filter(entry => entry.projectId === id))

    const allFiles = getFiles()
    setFiles(allFiles.filter(file => file.projectId === id))
  }, [id])

  const loadProjectData = () => {
    if (!id) return

    const projects = getProjects()
    const foundProject = projects.find(p => p.id === id)
    if (foundProject) {
      setProject(foundProject)
      // Load linked client if clientId exists
      if (foundProject.clientId) {
        const client = getClientById(foundProject.clientId)
        setLinkedClient(client || null)
      } else {
        setLinkedClient(null)
      }
    }

    const allTimeEntries = getTimeEntries()
    setTimeEntries(allTimeEntries.filter(entry => entry.projectId === id))

    const allFiles = getFiles()
    setFiles(allFiles.filter(file => file.projectId === id))
  }

  const handleSaveProject = () => {
    if (!project || !id) return

    updateProject(id, {
      name: project.name,
      description: project.description,
      // Preserve clientId if it exists
      clientId: project.clientId,
      // Only update legacy fields if there's no clientId
      clientName: project.clientId ? undefined : project.clientName,
      clientEmail: project.clientId ? undefined : project.clientEmail,
      clientPhone: project.clientId ? undefined : project.clientPhone,
      status: project.status,
      protonDriveLink: project.protonDriveLink,
      dueDate: project.dueDate,
      notes: project.notes,
    })
    setIsEditing(false)
    loadProjectData()
  }

  const handleAddTimeEntry = () => {
    if (!id || !newTimeEntry.description) return

    const hours = parseInt(newTimeEntry.hours) || 0
    const minutes = parseInt(newTimeEntry.minutes) || 0
    const totalMinutes = (hours * 60) + minutes

    if (totalMinutes === 0) return

    const entry: TimeEntry = {
      id: generateId(),
      projectId: id,
      description: newTimeEntry.description,
      duration: totalMinutes,
      date: newTimeEntry.date,
      createdAt: new Date().toISOString(),
    }

    addTimeEntry(entry)
    setNewTimeEntry({
      description: '',
      hours: '',
      minutes: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    })
    loadProjectData()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files) return

    const file = e.target.files[0]

    // Validate file size (max 5MB for localStorage safety)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 5MB to avoid storage issues.')
      e.target.value = '' // Reset file input
      return
    }

    // Validate file type - allow common document types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload images, PDFs, or common document formats.')
      e.target.value = '' // Reset file input
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      const fileAttachment: FileAttachment = {
        id: generateId(),
        projectId: id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: event.target?.result as string,
        uploadedAt: new Date().toISOString(),
      }

      addFile(fileAttachment)
      loadProjectData()
      e.target.value = '' // Reset file input after successful upload
    }

    reader.onerror = () => {
      alert('Failed to read file. Please try again.')
      e.target.value = '' // Reset file input
    }

    reader.readAsDataURL(file)
  }

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFile(fileId)
      loadProjectData()
    }
  }

  const handleDeleteTimeEntry = (entryId: string) => {
    deleteTimeEntry(entryId)
    loadProjectData()
  }

  const getTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Project not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              <p className="text-muted-foreground mt-1">Project Details</p>
            </div>
          </div>
          <Button onClick={() => isEditing ? handleSaveProject() : setIsEditing(true)}>
            {isEditing ? <Save size={16} className="mr-2" /> : 'Edit'}
            {isEditing ? 'Save' : ''}
          </Button>
        </div>

        {/* Project Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Project Name</label>
                {isEditing ? (
                  <Input
                    value={project.name}
                    onChange={(e) => setProject({ ...project, name: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground">{project.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                {isEditing ? (
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={project.status}
                    onChange={(e) => setProject({ ...project, status: e.target.value as KanbanStatus })}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <p className="text-foreground capitalize">{project.status.replace('-', ' ')}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Due Date</label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={project.dueDate || ''}
                    onChange={(e) => setProject({ ...project, dueDate: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground">
                    {project.dueDate ? format(new Date(project.dueDate), 'MMM dd, yyyy') : 'No due date set'}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Description</label>
                {isEditing ? (
                  <Textarea
                    value={project.description}
                    onChange={(e) => setProject({ ...project, description: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-foreground">{project.description || 'No description'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Info Card */}
        {!project.isInternal && (
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {linkedClient ? (
                  // Display linked client data
                  <>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Client</label>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-base text-matrix-green hover:underline"
                        onClick={() => navigate(`/client/${linkedClient.id}`)}
                      >
                        {linkedClient.name}
                      </Button>
                    </div>
                    {linkedClient.contacts && linkedClient.contacts.length > 0 && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Contacts</label>
                        <div className="space-y-2">
                          {linkedClient.contacts.map((contact, index) => (
                            <div key={index} className="p-3 bg-muted rounded-lg">
                              <p className="font-medium text-sm">{contact.name}</p>
                              {contact.email && (
                                <p className="text-xs text-muted-foreground mt-1">{contact.email}</p>
                              )}
                              {contact.phone && (
                                <p className="text-xs text-muted-foreground">{contact.phone}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Display legacy client fields (for old projects without clientId)
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Client Name</label>
                      {isEditing ? (
                        <Input
                          value={project.clientName || ''}
                          onChange={(e) => setProject({ ...project, clientName: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{project.clientName || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={project.clientEmail || ''}
                          onChange={(e) => setProject({ ...project, clientEmail: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{project.clientEmail || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone</label>
                      {isEditing ? (
                        <Input
                          value={project.clientPhone || ''}
                          onChange={(e) => setProject({ ...project, clientPhone: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{project.clientPhone || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cloud Storage Link - separate from client info */}
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                    <ExternalLink size={16} />
                    Cloud Storage Link
                  </label>
                  {isEditing ? (
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={project.protonDriveLink || ''}
                      onChange={(e) => setProject({ ...project, protonDriveLink: e.target.value })}
                    />
                  ) : project.protonDriveLink ? (
                    <a
                      href={project.protonDriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-matrix-green hover:underline flex items-center gap-2"
                    >
                      {project.protonDriveLink}
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <p className="text-muted-foreground">Not specified</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Tracking Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock size={20} />
                <span>Time Tracking</span>
              </div>
              <span className="text-lg font-bold text-matrix-green">
                {getTotalHours().toFixed(1)} hours
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add Time Entry */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-muted rounded-lg">
                <Input
                  placeholder="What did you work on?"
                  value={newTimeEntry.description}
                  onChange={(e) => setNewTimeEntry({ ...newTimeEntry, description: e.target.value })}
                  className="md:col-span-2"
                />
                <Input
                  type="number"
                  placeholder="Hours"
                  min="0"
                  value={newTimeEntry.hours || ''}
                  onChange={(e) => setNewTimeEntry({ ...newTimeEntry, hours: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Minutes"
                  min="0"
                  max="59"
                  value={newTimeEntry.minutes || ''}
                  onChange={(e) => setNewTimeEntry({ ...newTimeEntry, minutes: e.target.value })}
                />
                <Input
                  type="date"
                  value={newTimeEntry.date}
                  onChange={(e) => setNewTimeEntry({ ...newTimeEntry, date: e.target.value })}
                />
                <Button onClick={handleAddTimeEntry}>
                  <Clock size={16} className="mr-2" />
                  Log Time
                </Button>
              </div>

              {/* Time Entries List */}
              <div className="space-y-2">
                {timeEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No time entries yet. Log your first session above!
                  </p>
                ) : (
                  timeEntries.map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{entry.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-matrix-green">
                          {(entry.duration / 60).toFixed(1)}h
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTimeEntry(entry.id)}
                        >
                          <Trash2 size={16} className="text-muted-foreground hover:text-white" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload size={20} />
                <span>File Attachments</span>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button type="button">
                  <Upload size={16} className="mr-2" />
                  Upload File
                </Button>
              </label>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No files uploaded yet. Upload one above!
                </p>
              ) : (
                files.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {format(new Date(file.uploadedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a href={file.url} download={file.name}>
                        <Button variant="ghost" size="icon">
                          <Download size={16} />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 size={16} className="text-muted-foreground hover:text-white" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText size={20} />
              <span>Project Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                placeholder="Add any persistent notes about this project..."
                value={project.notes || ''}
                onChange={(e) => setProject({ ...project, notes: e.target.value })}
                rows={8}
                className="w-full"
              />
            ) : (
              <div className="min-h-[100px] p-4 bg-muted rounded-lg">
                {project.notes ? (
                  <p className="text-foreground whitespace-pre-wrap">{project.notes}</p>
                ) : (
                  <p className="text-muted-foreground italic">No notes yet. Click Edit to add notes.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
