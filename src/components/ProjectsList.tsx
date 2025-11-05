import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Project } from '@/types'
import { getProjects, addProject, deleteProject, generateId, updateProject } from '@/lib/storage'
import { Plus, Trash2, Search, Archive, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ProjectsListProps {
  onProjectsChange?: () => void
}

export default function ProjectsList({ onProjectsChange }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    isInternal: false,
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
      clientName: newProject.isInternal ? undefined : (newProject.clientName || undefined),
      clientEmail: newProject.isInternal ? undefined : (newProject.clientEmail || undefined),
      clientPhone: newProject.isInternal ? undefined : (newProject.clientPhone || undefined),
      status: 'backlog',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isInternal: newProject.isInternal,
      isArchived: false,
    }

    addProject(project)
    setNewProject({
      name: '',
      description: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      isInternal: false,
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

  const handleToggleArchive = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    updateProject(project.id, {
      isArchived: !project.isArchived,
    })
    loadProjects()
    onProjectsChange?.()
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesArchiveFilter = showArchived ? project.isArchived : !project.isArchived
    return matchesSearch && matchesArchiveFilter
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Projects</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive size={16} className="mr-1" />
              {showArchived ? 'Show Active' : 'Show Archived'}
            </Button>
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isInternal"
                      checked={newProject.isInternal}
                      onChange={(e) => setNewProject({ ...newProject, isInternal: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="isInternal" className="text-sm font-medium">
                      Internal Project (no client info needed)
                    </label>
                  </div>
                  {!newProject.isInternal && (
                    <>
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
                    </>
                  )}
                  <Button onClick={handleCreateProject} className="w-full">
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredProjects.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {searchQuery ? 'No projects match your search.' : showArchived ? 'No archived projects.' : 'No projects yet. Create your first project!'}
            </p>
          ) : (
            filteredProjects.map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg cursor-pointer border"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{project.name}</h4>
                  {project.clientName && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <User size={12} />
                      {project.clientName}
                    </p>
                  )}
                  {project.isInternal && (
                    <p className="text-xs text-gray-500">Internal Project</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded capitalize">
                    {project.status.replace('-', ' ')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleToggleArchive(project, e)}
                    title={project.isArchived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive size={16} className={project.isArchived ? "text-blue-500" : "text-gray-500"} />
                  </Button>
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
