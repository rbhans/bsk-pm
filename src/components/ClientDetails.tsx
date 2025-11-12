import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from './Layout'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Client, Project, ClientContact } from '@/types'
import { getClients, updateClient, getProjects } from '@/lib/storage'
import { ArrowLeft, Mail, Phone, FolderKanban, FileText, Save, Download, Palette, Check, User, Plus, X } from 'lucide-react'

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

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

    // Validate at least one contact with a name
    const validContacts = client.contacts.filter(c => c.name.trim())
    if (validContacts.length === 0) {
      alert('Please provide at least one contact with a name')
      return
    }

    updateClient(id, {
      name: client.name,
      contacts: validContacts,
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

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(color)
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (err) {
      console.error('Failed to copy color:', err)
    }
  }

  const handleDownloadLogo = () => {
    if (!client?.logo) return
    const link = document.createElement('a')
    link.href = client.logo
    link.download = `${client.name.replace(/[^a-zA-Z0-9]/g, '_')}_logo.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAddContact = () => {
    if (!client) return
    const newContact: ClientContact = { name: '', email: '', phone: '' }
    setClient({
      ...client,
      contacts: [...client.contacts, newContact],
    })
  }

  const handleRemoveContact = (index: number) => {
    if (!client) return
    // Always keep at least one contact
    if (client.contacts.length === 1) {
      alert('At least one contact is required')
      return
    }
    setClient({
      ...client,
      contacts: client.contacts.filter((_, idx) => idx !== index),
    })
  }

  const handleUpdateContact = (index: number, field: keyof ClientContact, value: string) => {
    if (!client) return
    const updatedContacts = [...client.contacts]
    updatedContacts[index] = { ...updatedContacts[index], [field]: value }
    setClient({ ...client, contacts: updatedContacts })
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
                <div className="relative group">
                  <img
                    src={client.logo}
                    alt={`${client.name} logo`}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-border"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleDownloadLogo}
                    title="Download logo"
                  >
                    <Download size={14} />
                  </Button>
                </div>
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
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Contacts Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User size={20} />
                <span>Contacts</span>
              </CardTitle>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddContact}
                >
                  <Plus size={14} className="mr-1" />
                  Add Contact
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.contacts.map((contact, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${isEditing ? 'border border-border' : 'bg-muted'}`}
                  >
                    {isEditing && (
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          Contact {index + 1}
                        </span>
                        {client.contacts && client.contacts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveContact(index)}
                            className="h-7 px-2 text-muted-foreground hover:text-red-500"
                          >
                            <X size={14} className="mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    )}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Name</label>
                        {isEditing ? (
                          <Input
                            placeholder="Contact name"
                            value={contact.name}
                            onChange={(e) => handleUpdateContact(index, 'name', e.target.value)}
                          />
                        ) : (
                          <p className="text-foreground font-medium">{contact.name || 'Unnamed'}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                          <Mail size={14} />
                          Email
                        </label>
                        {isEditing ? (
                          <Input
                            type="email"
                            placeholder="contact@example.com"
                            value={contact.email || ''}
                            onChange={(e) => handleUpdateContact(index, 'email', e.target.value)}
                          />
                        ) : (
                          <p className="text-foreground text-sm">{contact.email || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                          <Phone size={14} />
                          Phone
                        </label>
                        {isEditing ? (
                          <Input
                            placeholder="Phone number"
                            value={contact.phone || ''}
                            onChange={(e) => handleUpdateContact(index, 'phone', e.target.value)}
                          />
                        ) : (
                          <p className="text-foreground text-sm">{contact.phone || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors Card */}
        {client.colorPalette && client.colorPalette.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette size={20} />
                <span>Brand Colors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {client.colorPalette.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleCopyColor(color)}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer group"
                    title="Click to copy"
                  >
                    <div
                      className="w-12 h-12 rounded-md border border-border flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-mono text-foreground truncate">{color}</p>
                      {copiedColor === color ? (
                        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 mt-1">
                          <Check size={12} />
                          <span className="text-xs">Copied!</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          Click to copy
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
