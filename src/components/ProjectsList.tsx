import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Project, Client } from '@/types'
import { getProjects, addProject, deleteProject, generateId, updateProject, getClients, getClientById } from '@/lib/storage'
import { Plus, Trash2, Search, Archive, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ClientForm from './ClientForm'

interface ProjectsListProps {
  onProjectsChange?: () => void
}

export default function ProjectsList({ onProjectsChange }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isClientFormOpen, setIsClientFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    isInternal: false,
    useExistingClient: false,
    dueDate: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    loadProjects()
    loadClients()
  }, [])

  const loadProjects = () => {
    setProjects(getProjects())
  }

  const loadClients = () => {
    setClients(getClients())
  }

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return

    const project: Project = {
      id: generateId(),
      name: newProject.name,
      description: newProject.description,
      clientId: newProject.isInternal ? undefined : (newProject.useExistingClient && newProject.clientId ? newProject.clientId : undefined),
      // Keep legacy fields for backward compatibility
      clientName: newProject.isInternal ? undefined : (newProject.useExistingClient ? undefined : (newProject.clientName || undefined)),
      clientEmail: newProject.isInternal ? undefined : (newProject.useExistingClient ? undefined : (newProject.clientEmail || undefined)),
      clientPhone: newProject.isInternal ? undefined : (newProject.useExistingClient ? undefined : (newProject.clientPhone || undefined)),
      status: 'backlog',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isInternal: newProject.isInternal,
      isArchived: false,
      dueDate: newProject.dueDate || undefined,
    }

    addProject(project)
    setNewProject({
      name: '',
      description: '',
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      isInternal: false,
      useExistingClient: false,
      dueDate: '',
    })
    setIsDialogOpen(false)
    loadProjects()
    onProjectsChange?.()
  }

  const handleSaveNewClient = () => {
    setIsClientFormOpen(false)
    loadClients()
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

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesArchiveFilter = showArchived ? project.isArchived : !project.isArchived
      return matchesSearch && matchesArchiveFilter
    })
  }, [projects, searchQuery, showArchived])

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
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-1" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    <label className="text-sm font-medium mb-1 block">Due Date</label>
                    <Input
                      type="date"
                      value={newProject.dueDate}
                      onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isInternal"
                      checked={newProject.isInternal}
                      onChange={(e) => setNewProject({ ...newProject, isInternal: e.target.checked, useExistingClient: false, clientId: '' })}
                      className="w-4 h-4 rounded border-border"
                    />
                    <label htmlFor="isInternal" className="text-sm font-medium">
                      Internal Project (no client info needed)
                    </label>
                  </div>
                  {!newProject.isInternal && (
                    <>
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <label className="text-sm font-medium">Client Information</label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setIsClientFormOpen(true)}
                          >
                            <Plus size={14} className="mr-1" />
                            New Client
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {clients.length > 0 ? (
                            <>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="useExistingClient"
                                  name="clientOption"
                                  checked={newProject.useExistingClient}
                                  onChange={(e) => setNewProject({ ...newProject, useExistingClient: e.target.checked, clientName: '', clientEmail: '', clientPhone: '' })}
                                  className="w-4 h-4"
                                />
                                <label htmlFor="useExistingClient" className="text-sm font-medium">
                                  Select existing client
                                </label>
                              </div>

                              {newProject.useExistingClient && (
                                <div className="ml-6">
                                  <select
                                    value={newProject.clientId}
                                    onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                                    className="w-full h-10 rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                                  >
                                    <option value="">Select a client...</option>
                                    {clients.map(client => (
                                      <option key={client.id} value={client.id}>
                                        {client.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="enterClientInfo"
                                  name="clientOption"
                                  checked={!newProject.useExistingClient}
                                  onChange={(e) => setNewProject({ ...newProject, useExistingClient: !e.target.checked, clientId: '' })}
                                  className="w-4 h-4"
                                />
                                <label htmlFor="enterClientInfo" className="text-sm font-medium">
                                  Enter client details manually
                                </label>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No saved clients yet. Click "New Client" above to create one, or enter details manually below.
                            </p>
                          )}

                          {!newProject.useExistingClient && (
                            <div className="space-y-3">
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
                            </div>
                          )}
                        </div>
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
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
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
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery ? 'No projects match your search.' : showArchived ? 'No archived projects.' : 'No projects yet. Create your first project!'}
            </p>
          ) : (
            filteredProjects.map(project => {
              const client = project.clientId ? getClientById(project.clientId) : null
              const clientName = client?.name || project.clientName

              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer border"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {client?.logo && (
                      <img
                        src={client.logo}
                        alt={`${client.name} logo`}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{project.name}</h4>
                      {clientName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User size={12} />
                          {clientName}
                        </p>
                      )}
                      {project.isInternal && (
                        <p className="text-xs text-muted-foreground">Internal Project</p>
                      )}
                    </div>
                  </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                    {project.status.replace('-', ' ')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleToggleArchive(project, e)}
                    title={project.isArchived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive size={16} className={project.isArchived ? "text-matrix-green" : "text-muted-foreground"} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                  >
                    <Trash2 size={16} className="text-muted-foreground hover:text-white" />
                  </Button>
                </div>
              </div>
              )
            })
          )}
        </div>
      </CardContent>

      {/* New Client Dialog */}
      <Dialog open={isClientFormOpen} onOpenChange={setIsClientFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSave={handleSaveNewClient}
            onCancel={() => setIsClientFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
