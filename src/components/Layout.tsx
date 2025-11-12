import { ReactNode, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Download, Upload, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { exportAllData, importAllData } from '@/lib/storage'

// Declare window.electron type
declare global {
  interface Window {
    electron?: {
      onUpdateAvailable: (callback: (info: any) => void) => void
      onUpdateDownloaded: (callback: (info: any) => void) => void
      onDownloadProgress: (callback: (progress: any) => void) => void
      downloadUpdate: () => Promise<{success: boolean}>
      installUpdate: () => void
      removeUpdateListeners: () => void
    }
  }
}

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const importFileRef = useRef<HTMLInputElement>(null)

  // Auto-update state
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  // Export handler
  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `projectsidekick-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Import handler
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string
        const result = importAllData(data)
        if (result.success) {
          alert('Data imported successfully! The page will reload.')
          window.location.reload()
        } else {
          alert(`Import failed: ${result.error}`)
        }
      } catch (error) {
        alert('Failed to import data. Please check the file format.')
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (importFileRef.current) {
      importFileRef.current.value = ''
    }
  }

  const handleDownloadUpdate = async () => {
    setIsDownloading(true)
    if (window.electron) {
      await window.electron.downloadUpdate()
    }
  }

  const handleInstallUpdate = () => {
    if (window.electron) {
      window.electron.installUpdate()
    }
  }

  // Set up auto-update listeners
  useEffect(() => {
    if (window.electron) {
      window.electron.onUpdateAvailable(() => {
        setUpdateAvailable(true)
      })

      window.electron.onUpdateDownloaded(() => {
        setUpdateDownloaded(true)
        setIsDownloading(false)
      })

      window.electron.onDownloadProgress((progress) => {
        setDownloadProgress(progress.percent || 0)
      })
    }

    return () => {
      if (window.electron) {
        window.electron.removeUpdateListeners()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header with custom title bar for Electron */}
      <header className="sticky top-0 z-50 bg-background text-white shadow-lg border-b border-border" style={{ WebkitAppRegion: 'drag' } as any}>
        <div className="relative flex justify-between pr-4" style={{ height: '48px' }}>
          {/* Left: Project Name - positioned to align with traffic lights */}
          <Link
            to="/"
            className="absolute"
            style={{
              WebkitAppRegion: 'no-drag',
              left: '88px',
              top: '50%',
              transform: 'translateY(-50%)'
            } as any}
          >
            <div className="text-2xl font-bold" style={{ lineHeight: '1' }}>
              <span className="text-matrix-green">[</span>
              <span className="text-white">projectsidekick</span>
              <span className="text-matrix-green">]</span>
            </div>
          </Link>

          {/* Right: Export/Import and Update Buttons */}
          <div className="ml-auto flex items-center self-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as any}>
            {/* Update notification */}
            {updateAvailable && !updateDownloaded && !isDownloading && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadUpdate}
                className="h-7 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <RefreshCw size={12} className="mr-1" />
                Update Available
              </Button>
            )}
            {isDownloading && (
              <div className="text-xs text-muted-foreground">
                Downloading... {Math.round(downloadProgress)}%
              </div>
            )}
            {updateDownloaded && (
              <Button
                size="sm"
                onClick={handleInstallUpdate}
                className="h-7 text-xs bg-primary hover:bg-primary/90"
              >
                <RefreshCw size={12} className="mr-1" />
                Restart to Update
              </Button>
            )}

            {/* Export/Import buttons */}
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleExport}
                className="h-7 w-7"
                title="Export all data"
              >
                <Download size={12} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => importFileRef.current?.click()}
                className="h-7 w-7"
                title="Import data"
              >
                <Upload size={12} />
              </Button>
              <input
                ref={importFileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImport}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  )
}
