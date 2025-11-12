import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Client } from '@/types'
import { addClient, updateClient, generateId } from '@/lib/storage'
import { Upload, X, Plus, Check, Copy, Download } from 'lucide-react'

interface ClientFormProps {
  client?: Client
  onSave: () => void
  onCancel: () => void
}

export default function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    logo: client?.logo || '',
    colorPalette: client?.colorPalette || [],
  })
  const [newColor, setNewColor] = useState('#000000')
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownloadLogo = () => {
    if (!formData.logo) return

    const link = document.createElement('a')
    link.href = formData.logo
    link.download = `${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}_logo.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAddColor = () => {
    if (newColor && !formData.colorPalette.includes(newColor)) {
      setFormData({
        ...formData,
        colorPalette: [...formData.colorPalette, newColor],
      })
      setNewColor('#000000')
    }
  }

  const handleRemoveColor = (index: number) => {
    setFormData({
      ...formData,
      colorPalette: formData.colorPalette.filter((_, idx) => idx !== index),
    })
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

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Please enter a client name')
      return
    }

    const clientData: Client = {
      id: client?.id || generateId(),
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      logo: formData.logo || undefined,
      colorPalette: formData.colorPalette.length > 0 ? formData.colorPalette : undefined,
      createdAt: client?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (client) {
      updateClient(client.id, clientData)
    } else {
      addClient(clientData)
    }

    onSave()
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Client Name *</label>
          <Input
            placeholder="Enter client name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <Input
            type="email"
            placeholder="client@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Phone</label>
          <Input
            placeholder="Phone number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">Client Logo</label>
        {formData.logo ? (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={formData.logo}
                alt="Client logo"
                className="w-32 h-32 rounded-lg object-cover border border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-8 w-8"
                onClick={handleRemoveLogo}
              >
                <X size={16} />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadLogo}
              className="w-full max-w-[128px]"
            >
              <Download size={14} className="mr-1" />
              Download
            </Button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload logo</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF (max 2MB)</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>

      {/* Color Palette */}
      <div>
        <label className="text-sm font-medium mb-2 block">Brand Color Palette</label>
        <div className="space-y-3">
          {/* Add Color */}
          <div className="flex gap-2">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-10 w-20 rounded border border-border cursor-pointer"
              />
              <Input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
            <Button onClick={handleAddColor} size="default">
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>

          {/* Color List */}
          {formData.colorPalette.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {formData.colorPalette.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded border border-border"
                >
                  <div
                    className="w-10 h-10 rounded border border-border"
                    style={{ backgroundColor: color }}
                  />
                  <code className="flex-1 text-sm font-mono">{color}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyColor(color)}
                    title="Copy hex code"
                  >
                    {copiedColor === color ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} className="text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveColor(index)}
                  >
                    <X size={16} className="text-muted-foreground hover:text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button onClick={handleSubmit} className="flex-1">
          {client ? 'Update Client' : 'Create Client'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}
