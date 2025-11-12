import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Project } from '@/types'
import { getProjects, updateProject } from '@/lib/storage'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'

export default function ProjectCalendar() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    const allProjects = getProjects()
    // Only show non-archived projects with due dates
    const projectsWithDueDates = allProjects.filter(p => p.dueDate && !p.isArchived)
    setProjects(projectsWithDueDates)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getProjectsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return projects.filter(p => p.dueDate === dateStr)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDragStart = (project: Project) => {
    setDraggedProject(project)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Allow drop
  }

  const handleDrop = (date: Date) => {
    if (!draggedProject) return

    const newDueDate = date.toISOString().split('T')[0]
    updateProject(draggedProject.id, { dueDate: newDueDate })
    setDraggedProject(null)
    loadProjects()
  }

  const handleDragEnd = () => {
    setDraggedProject(null)
  }

  const getProjectColor = (dueDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)

    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'bg-red-500/30 hover:bg-red-500/40' // Past due
    if (diffDays <= 3) return 'bg-yellow-500/30 hover:bg-yellow-500/40' // Due soon
    return 'bg-matrix-green/20 hover:bg-matrix-green/30' // Not due yet
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const today = new Date().toISOString().split('T')[0]

  const days = []
  // Empty cells for days before month starts - calculate the actual date for these
  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyDate = new Date(year, month, -(startingDayOfWeek - i - 1))
    days.push(
      <div
        key={`empty-${i}`}
        className="h-24 border border-border bg-muted opacity-40"
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(emptyDate)}
      />
    )
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    const dayProjects = getProjectsForDate(date)
    const isToday = dateStr === today

    days.push(
      <div
        key={day}
        className={`h-24 border border-border p-2 overflow-y-auto ${
          isToday ? 'bg-matrix-green/10 border-matrix-green' : 'bg-card'
        }`}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(date)}
      >
        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-matrix-green' : 'text-foreground'}`}>
          {day}
        </div>
        <div className="space-y-1">
          {dayProjects.map(project => (
            <div
              key={project.id}
              draggable
              onDragStart={() => handleDragStart(project)}
              onDragEnd={handleDragEnd}
              onClick={() => {
                // Only navigate if not dragging
                if (!draggedProject) {
                  navigate(`/project/${project.id}`)
                }
              }}
              className={`text-xs p-1 rounded text-foreground cursor-move transition-colors truncate ${project.dueDate ? getProjectColor(project.dueDate) : 'bg-muted/50 hover:bg-muted'}`}
              title={`${project.name} (drag to change due date)`}
            >
              {project.name}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon size={20} />
              Project Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={goToToday}
              >
                Today
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8"
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm font-medium min-w-[150px] text-center">
                {monthName}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground font-medium">Status:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-matrix-green/20 border border-matrix-green/40"></div>
              <span className="text-foreground">On track</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-500/30 border border-yellow-500/60"></div>
              <span className="text-foreground">Due soon (≤3 days)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500/60"></div>
              <span className="text-foreground">Overdue</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold p-2 border-b border-border">
              {day}
            </div>
          ))}
          {days}
        </div>
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4 mt-4">
            No projects with due dates yet. Add due dates to your projects to see them on the calendar.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
