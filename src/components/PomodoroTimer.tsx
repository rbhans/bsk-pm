import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { getPomodoroSettings, savePomodoroSettings } from '@/lib/storage'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'

type TimerMode = 'work' | 'break' | 'long-break'

export default function PomodoroTimer() {
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

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: mode === 'work' ? 'Work session completed! Time for a break.' : 'Break over! Time to work.',
      })
    }

    // Switch modes
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

  const getProgress = () => {
    const total = mode === 'work'
      ? settings.workDuration * 60
      : mode === 'break'
      ? settings.breakDuration * 60
      : settings.longBreakDuration * 60
    return ((total - timeLeft) / total) * 100
  }

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'text-red-600'
      case 'break':
        return 'text-green-600'
      case 'long-break':
        return 'text-blue-600'
    }
  }

  const getModeLabel = () => {
    switch (mode) {
      case 'work':
        return 'Work Session'
      case 'break':
        return 'Short Break'
      case 'long-break':
        return 'Long Break'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pomodoro Timer</CardTitle>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger>
              <Button variant="ghost" size="icon">
                <Settings size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
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
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          {/* Circular Progress */}
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className={getModeColor()}
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - getProgress() / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>
              <div className={`text-sm font-medium ${getModeColor()}`}>
                {getModeLabel()}
              </div>
            </div>
          </div>

          {/* Session Counter */}
          <div className="text-center">
            <div className="text-sm text-gray-500">Sessions Completed</div>
            <div className="text-2xl font-bold text-matrix-green">{sessionsCompleted}</div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <Button
              size="lg"
              variant={isRunning ? "secondary" : "default"}
              onClick={handlePlayPause}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            <Button size="lg" variant="outline" onClick={handleReset}>
              <RotateCcw size={20} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
