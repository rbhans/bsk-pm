import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from './Layout'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Client, Project } from '@/types'
import { getClients, updateClient, getProjects } from '@/lib/storage'
import { ArrowLeft, Mail, Phone, FolderKanban, FileText, Save } from 'lucide-react'

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!id) return

    // Load client data
    const allClients = getClients()
    const foundClient = allClients.find(c => c.id === id)
    if (foundClient) {
      setClient(foundClient)
    }

    // Load projects for this client
    const allProjects = getProjects()
    const clientProjects = allProjects.filter(p =>
      p.clientId === id || (!p.clientId && p.clientName === foundClient?.name)
    )
    setProjects(clientProjects)
  }, [id])

  const handleSaveClient = () => {
    if (!client || !id) return

    updateClient(id, {
      name: client.name,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
    })
    setIsEditing(false)

    // Reload client data
    const allClients = getClients()
    const foundClient = allClients.find(c => c.id === id)
    if (foundClient) {
      setClient(foundClient)
    }
  }

  if (!client) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Client not found</p>
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
            <div className="flex items-center space-x-4">
              {client.logo && (
                <img
                  src={client.logo}
                  alt={`${client.name} logo`}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-border"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
                <p className="text-muted-foreground mt-1">Client Details</p>
              </div>
            </div>
          </div>
          <Button onClick={() => isEditing ? handleSaveClient() : setIsEditing(true)}>
            {isEditing ? <Save size={16} className="mr-2" /> : 'Edit'}
            {isEditing ? 'Save' : ''}
          </Button>
        </div>

        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Client Name</label>
                {isEditing ? (
                  <Input
                    value={client.name}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground">{client.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={client.email || ''}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground">{client.email || 'Not specified'}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <Phone size={16} />
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    value={client.phone || ''}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground">{client.phone || 'Not specified'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Button onClick={handleSaveClient} className="w-full">
            <Save size={16} className="mr-2" />
            Save All Changes
          </Button>
        )}

        {/* Projects Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderKanban size={20} />
              <span>Projects</span>
              <span className="text-sm font-normal text-muted-foreground">({projects.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No projects for this client yet.
                </p>
              ) : (
                projects.map(project => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{project.name}</h4>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                        {project.status.replace('-', ' ')}
                      </span>
                      {project.isArchived && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                          Archived
                        </span>
                      )}
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
              <span>Client Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                placeholder="Add any persistent notes about this client..."
                value={client.notes || ''}
                onChange={(e) => setClient({ ...client, notes: e.target.value })}
                rows={8}
                className="w-full"
              />
            ) : (
              <div className="min-h-[100px] p-4 bg-muted rounded-lg">
                {client.notes ? (
                  <p className="text-foreground whitespace-pre-wrap">{client.notes}</p>
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
