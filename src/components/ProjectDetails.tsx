import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from './Layout'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Project, TimeEntry, FileAttachment, KanbanStatus } from '@/types'
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
} from '@/lib/storage'
import { ArrowLeft, Clock, Upload, Trash2, Download, Save } from 'lucide-react'
import { format } from 'date-fns'

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [files, setFiles] = useState<FileAttachment[]>([])
  const [isEditing, setIsEditing] = useState(false)

  // Time entry form
  const [newTimeEntry, setNewTimeEntry] = useState({
    description: '',
    duration: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    if (id) {
      loadProjectData()
    }
  }, [id])

  const loadProjectData = () => {
    if (!id) return

    const projects = getProjects()
    const foundProject = projects.find(p => p.id === id)
    if (foundProject) {
      setProject(foundProject)
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
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      clientPhone: project.clientPhone,
      status: project.status,
    })
    setIsEditing(false)
    loadProjectData()
  }

  const handleAddTimeEntry = () => {
    if (!id || !newTimeEntry.description || !newTimeEntry.duration) return

    const entry: TimeEntry = {
      id: generateId(),
      projectId: id,
      description: newTimeEntry.description,
      duration: parseInt(newTimeEntry.duration),
      date: newTimeEntry.date,
      createdAt: new Date().toISOString(),
    }

    addTimeEntry(entry)
    setNewTimeEntry({
      description: '',
      duration: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    })
    loadProjectData()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files) return

    const file = e.target.files[0]
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
          <p className="text-gray-500">Project not found</p>
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
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">Project Details</p>
            </div>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)}>
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
                  <p className="text-gray-900">{project.name}</p>
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
                  <p className="text-gray-900 capitalize">{project.status.replace('-', ' ')}</p>
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
                  <p className="text-gray-900">{project.description || 'No description'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Client Name</label>
                {isEditing ? (
                  <Input
                    value={project.clientName || ''}
                    onChange={(e) => setProject({ ...project, clientName: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900">{project.clientName || 'Not specified'}</p>
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
                  <p className="text-gray-900">{project.clientEmail || 'Not specified'}</p>
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
                  <p className="text-gray-900">{project.clientPhone || 'Not specified'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Button onClick={handleSaveProject} className="w-full">
            <Save size={16} className="mr-2" />
            Save All Changes
          </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                <Input
                  placeholder="What did you work on?"
                  value={newTimeEntry.description}
                  onChange={(e) => setNewTimeEntry({ ...newTimeEntry, description: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={newTimeEntry.duration}
                  onChange={(e) => setNewTimeEntry({ ...newTimeEntry, duration: e.target.value })}
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
                  <p className="text-sm text-gray-500 text-center py-4">
                    No time entries yet. Log your first session above!
                  </p>
                ) : (
                  timeEntries.map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{entry.description}</p>
                        <p className="text-xs text-gray-500">
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
                          <Trash2 size={16} className="text-red-500" />
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
                <p className="text-sm text-gray-500 text-center py-4">
                  No files uploaded yet. Upload one above!
                </p>
              ) : (
                files.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
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
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
