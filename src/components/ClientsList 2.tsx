import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Client } from '@/types'
import { getClients, deleteClient } from '@/lib/storage'
import { Plus, Trash2, Search, Edit2, Palette, Image as ImageIcon } from 'lucide-react'
import ClientForm from './ClientForm'

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = () => {
    setClients(getClients())
  }

  const handleDeleteClient = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this client? This will not affect existing projects.')) {
      deleteClient(id)
      loadClients()
    }
  }

  const handleEditClient = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingClient(client)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingClient(null)
    loadClients()
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Clients</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingClient(null)
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={16} className="mr-1" />
                New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClient ? 'Edit Client' : 'Create New Client'}</DialogTitle>
              </DialogHeader>
              <ClientForm
                client={editingClient || undefined}
                onSave={handleDialogClose}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredClients.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {searchQuery ? 'No clients match your search.' : 'No clients yet. Create your first client!'}
            </p>
          ) : (
            filteredClients.map(client => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg border"
              >
                <div className="flex items-center gap-4 flex-1">
                  {client.logo ? (
                    <img
                      src={client.logo}
                      alt={`${client.name} logo`}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <ImageIcon size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{client.name}</h4>
                    {client.email && (
                      <p className="text-xs text-gray-500">{client.email}</p>
                    )}
                    {client.phone && (
                      <p className="text-xs text-gray-500">{client.phone}</p>
                    )}
                  </div>
                  {client.colorPalette && client.colorPalette.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Palette size={14} className="text-gray-400" />
                      <div className="flex gap-1">
                        {client.colorPalette.slice(0, 5).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleEditClient(client, e)}
                  >
                    <Edit2 size={16} className="text-gray-400 hover:text-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteClient(client.id, e)}
                  >
                    <Trash2 size={16} className="text-gray-400 hover:text-white" />
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
