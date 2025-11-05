import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Project } from '@/types'
import { getProjects, addProject, deleteProject, generateId } from '@/lib/storage'
import { Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ProjectsListProps {
  onProjectsChange?: () => void
}

export default function ProjectsList({ onProjectsChange }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    setProjects(getProjects())
  }

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return

    const project: Project = {
      id: generateId(),
      name: newProject.name,
      description: newProject.description,
      clientName: newProject.clientName || undefined,
      clientEmail: newProject.clientEmail || undefined,
      clientPhone: newProject.clientPhone || undefined,
      status: 'backlog',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addProject(project)
    setNewProject({
      name: '',
      description: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
    })
    setIsDialogOpen(false)
    loadProjects()
    onProjectsChange?.()
  }

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id)
      loadProjects()
      onProjectsChange?.()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Projects</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button size="sm">
                <Plus size={16} className="mr-1" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Project Name *</label>
                  <Input
                    placeholder="Enter project name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea
                    placeholder="Project description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Client Name</label>
                  <Input
                    placeholder="Client name"
                    value={newProject.clientName}
                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Client Email</label>
                  <Input
                    type="email"
                    placeholder="client@example.com"
                    value={newProject.clientEmail}
                    onChange={(e) => setNewProject({ ...newProject, clientEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Client Phone</label>
                  <Input
                    placeholder="Phone number"
                    value={newProject.clientPhone}
                    onChange={(e) => setNewProject({ ...newProject, clientPhone: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateProject} className="w-full">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {projects.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No projects yet. Create your first project!
            </p>
          ) : (
            projects.map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer border"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{project.name}</h4>
                  {project.clientName && (
                    <p className="text-xs text-gray-500">👤 {project.clientName}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                    {project.status.replace('-', ' ')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteProject(project.id, e)}
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
  )
}
