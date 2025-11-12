import { useState, useEffect } from 'react'
import { Project, KanbanStatus } from '@/types'
import { getProjects, updateProject } from '@/lib/storage'
import { GripVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const KANBAN_COLUMNS: { status: KanbanStatus; title: string; color: string }[] = [
  { status: 'backlog', title: 'Backlog', color: 'bg-background border-border' },
  { status: 'in-progress', title: 'In Progress', color: 'bg-card border-border' },
  { status: 'review', title: 'Review', color: 'bg-card border-border' },
  { status: 'completed', title: 'Completed', color: 'bg-card border-border' },
]

interface KanbanBoardProps {
  onProjectsChange?: () => void
}

export default function KanbanBoard({ onProjectsChange }: KanbanBoardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    setProjects(getProjects())
  }

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('projectId', projectId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStatus: KanbanStatus) => {
    e.preventDefault()
    const projectId = e.dataTransfer.getData('projectId')

    updateProject(projectId, { status: newStatus })
    loadProjects()
    onProjectsChange?.()
  }

  const getProjectsByStatus = (status: KanbanStatus) => {
    return projects.filter(p => p.status === status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {KANBAN_COLUMNS.map(column => (
        <div
          key={column.status}
          className={`rounded-lg border-2 ${column.color} p-4 min-h-[400px]`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          <h3 className="font-semibold text-lg mb-4 flex items-center justify-between text-foreground">
            <span>{column.title}</span>
            <span className="text-sm bg-muted rounded-full px-2 py-1">
              {getProjectsByStatus(column.status).length}
            </span>
          </h3>

          <div className="space-y-3">
            {getProjectsByStatus(column.status).map(project => (
              <div
                key={project.id}
                draggable
                onDragStart={(e) => handleDragStart(e, project.id)}
                className="bg-card p-4 rounded-lg shadow-sm border border-border cursor-move hover:shadow-md transition-shadow"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm flex-1 text-foreground">{project.name}</h4>
                  <GripVertical size={16} className="text-muted-foreground flex-shrink-0 ml-2" />
                </div>
                {project.description && (
                  <p className="text-xs text-foreground/80 line-clamp-2 mb-2">
                    {project.description}
                  </p>
                )}
                {project.clientName && (
                  <div className="text-xs text-muted-foreground mt-2">
                    👤 {project.clientName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
