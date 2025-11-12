import { ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, RotateCcw, Settings, Download, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { getPomodoroSettings, savePomodoroSettings, exportAllData, importAllData } from '@/lib/storage'

interface LayoutProps {
  children: ReactNode
}

type TimerMode = 'work' | 'break' | 'long-break'

interface TimerState {
  mode: TimerMode
  timeLeft: number
  isRunning: boolean
  sessionsCompleted: number
  lastUpdateTime: number
}

const TIMER_STATE_KEY = 'psk_timer_state'

const loadTimerState = (settings: ReturnType<typeof getPomodoroSettings>): TimerState => {
  const saved = localStorage.getItem(TIMER_STATE_KEY)
  if (saved) {
    try {
      const state = JSON.parse(saved) as TimerState
      // Calculate elapsed time if timer was running
      if (state.isRunning && state.lastUpdateTime) {
        const elapsed = Math.floor((Date.now() - state.lastUpdateTime) / 1000)
        const newTimeLeft = Math.max(0, state.timeLeft - elapsed)
        return { ...state, timeLeft: newTimeLeft }
      }
      return state
    } catch (e) {
      // If parsing fails, return default
    }
  }
  return {
    mode: 'work',
    timeLeft: settings.workDuration * 60,
    isRunning: false,
    sessionsCompleted: 0,
    lastUpdateTime: Date.now(),
  }
}

const saveTimerState = (state: TimerState) => {
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
    ...state,
    lastUpdateTime: Date.now(),
  }))
}

export default function Layout({ children }: LayoutProps) {
  // Pomodoro timer state
  const [settings, setSettings] = useState(getPomodoroSettings())
  const initialState = loadTimerState(settings)
  const [mode, setMode] = useState<TimerMode>(initialState.mode)
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft)
  const [isRunning, setIsRunning] = useState(initialState.isRunning)
  const [sessionsCompleted, setSessionsCompleted] = useState(initialState.sessionsCompleted)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const importFileRef = useRef<HTMLInputElement>(null)

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    saveTimerState({
      mode,
      timeLeft,
      isRunning,
      sessionsCompleted,
      lastUpdateTime: Date.now(),
    })
  }, [mode, timeLeft, isRunning, sessionsCompleted])

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
  }, [isRunning, timeLeft, handleTimerComplete])

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

    // Close AudioContext after sounds complete to prevent memory leak
    setTimeout(() => {
      audioContext.close()
    }, 1200)
  }

  const handleTimerComplete = useCallback(() => {
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

    // Auto-start the next session
    setIsRunning(true)
  }, [mode, sessionsCompleted, settings])

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

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `projectsidekick_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const jsonData = event.target?.result as string
      const result = importAllData(jsonData)

      if (result.success) {
        alert('Data imported successfully! The page will reload.')
        window.location.reload()
      } else {
        alert(`Import failed: ${result.error}`)
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (importFileRef.current) {
      importFileRef.current.value = ''
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'text-gray-400'
      case 'break':
        return 'text-matrix-green'
      case 'long-break':
        return 'text-gray-400'
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
      {/* Header with custom title bar for Electron */}
      <header className="sticky top-0 z-50 bg-gray-900 dark:bg-black text-white shadow-lg border-b border-gray-800" style={{ WebkitAppRegion: 'drag' } as any}>
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

          {/* Right: Export/Import and Pomodoro Timer */}
          <div className="ml-auto flex items-center self-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as any}>
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

            {/* Pomodoro Timer - compact design */}
            <div
              className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 backdrop-blur-sm rounded-md border border-gray-700/50"
            >
            <span className={`text-[10px] font-medium uppercase tracking-wide ${getModeColor()}`}>
              {getModeLabel()}
            </span>
            <span className="text-base font-mono font-bold tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-gray-500">
              {sessionsCompleted}
            </span>
            <div className="flex items-center gap-0.5 ml-1 pl-2 border-l border-gray-700">
              <Button
                size="icon"
                variant="ghost"
                onClick={handlePlayPause}
                className="h-7 w-7"
              >
                {isRunning ? <Pause size={12} /> : <Play size={12} />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleReset}
                className="h-7 w-7"
              >
                <RotateCcw size={12} />
              </Button>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Settings size={12} />
                  </Button>
                </DialogTrigger>
                <DialogContent style={{ WebkitAppRegion: 'no-drag' } as any}>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-gray-400 text-center py-4 mt-12 border-t border-gray-800">
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
