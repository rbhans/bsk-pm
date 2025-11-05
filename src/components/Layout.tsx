import { ReactNode, useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { getPomodoroSettings, savePomodoroSettings } from '@/lib/storage'

interface LayoutProps {
  children: ReactNode
}

type TimerMode = 'work' | 'break' | 'long-break'

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  // Pomodoro timer state
  const [settings, setSettings] = useState(getPomodoroSettings())
  const [mode, setMode] = useState<TimerMode>('work')
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    // Play three beeps
    setTimeout(() => {
      const osc2 = audioContext.createOscillator()
      const gain2 = audioContext.createGain()
      osc2.connect(gain2)
      gain2.connect(audioContext.destination)
      osc2.frequency.value = 800
      osc2.type = 'sine'
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      osc2.start()
      osc2.stop(audioContext.currentTime + 0.5)
    }, 200)

    setTimeout(() => {
      const osc3 = audioContext.createOscillator()
      const gain3 = audioContext.createGain()
      osc3.connect(gain3)
      gain3.connect(audioContext.destination)
      osc3.frequency.value = 1000
      osc3.type = 'sine'
      gain3.gain.setValueAtTime(0.3, audioContext.currentTime)
      gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7)
      osc3.start()
      osc3.stop(audioContext.currentTime + 0.7)
    }, 400)
  }

  const handleTimerComplete = () => {
    setIsRunning(false)

    // Play audio notification
    playNotificationSound()

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: mode === 'work' ? 'Work session completed! Time for a break.' : 'Break over! Time to work.',
      })
    }

    if (mode === 'work') {
      const newSessionCount = sessionsCompleted + 1
      setSessionsCompleted(newSessionCount)

      if (newSessionCount % settings.sessionsUntilLongBreak === 0) {
        setMode('long-break')
        setTimeLeft(settings.longBreakDuration * 60)
      } else {
        setMode('break')
        setTimeLeft(settings.breakDuration * 60)
      }
    } else {
      setMode('work')
      setTimeLeft(settings.workDuration * 60)
    }
  }

  const handlePlayPause = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setMode('work')
    setTimeLeft(settings.workDuration * 60)
  }

  const handleSaveSettings = () => {
    savePomodoroSettings(settings)
    setTimeLeft(settings.workDuration * 60)
    setMode('work')
    setIsRunning(false)
    setIsSettingsOpen(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'text-red-500'
      case 'break':
        return 'text-green-500'
      case 'long-break':
        return 'text-blue-500'
    }
  }

  const getModeLabel = () => {
    switch (mode) {
      case 'work':
        return 'Work'
      case 'break':
        return 'Break'
      case 'long-break':
        return 'Long Break'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-gray-900 dark:bg-black text-white shadow-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                <span className="text-matrix-green">[</span>
                <span className="text-white">basidekick</span>
                <span className="text-matrix-green">]</span>
              </div>
            </Link>

            {/* Pomodoro Timer in Header */}
            <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 dark:bg-gray-950 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${getModeColor()}`}>
                  {getModeLabel()}
                </span>
                <span className="text-xl font-mono font-bold">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-gray-400">
                  ({sessionsCompleted})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handlePlayPause}
                  className="h-8 w-8"
                >
                  {isRunning ? <Pause size={14} /> : <Play size={14} />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleReset}
                  className="h-8 w-8"
                >
                  <RotateCcw size={14} />
                </Button>
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings size={14} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Pomodoro Timer Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block text-foreground">Work Duration (minutes)</label>
                        <Input
                          type="number"
                          value={settings.workDuration}
                          onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block text-foreground">Break Duration (minutes)</label>
                        <Input
                          type="number"
                          value={settings.breakDuration}
                          onChange={(e) => setSettings({ ...settings, breakDuration: parseInt(e.target.value) || 5 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block text-foreground">Long Break Duration (minutes)</label>
                        <Input
                          type="number"
                          value={settings.longBreakDuration}
                          onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block text-foreground">Sessions Until Long Break</label>
                        <Input
                          type="number"
                          value={settings.sessionsUntilLongBreak}
                          onChange={(e) => setSettings({ ...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4 })}
                        />
                      </div>
                      <Button onClick={handleSaveSettings} className="w-full">
                        Save Settings
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 hover:text-matrix-green transition-colors ${
                  location.pathname === '/' ? 'text-matrix-green' : ''
                }`}
              >
                <Home size={20} />
                <span>Dashboard</span>
              </Link>
            </nav>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            projectsidekick
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-4 mt-12">
        <p className="text-sm">
          <span className="text-matrix-green">[</span>
          <span>basidekick</span>
          <span className="text-matrix-green">]</span>
          {' '}© {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
