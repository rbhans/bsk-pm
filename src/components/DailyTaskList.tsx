import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Task } from '@/types'
import { getTasks, addTask, updateTask, deleteTask, generateId, saveTasks } from '@/lib/storage'
import { Plus, Trash2, Check, AlertCircle } from 'lucide-react'
import { format, parseISO, isSameDay, isToday } from 'date-fns'

const LAST_CHECK_KEY = 'psk_last_daily_check'

export default function DailyTaskList() {
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [missedTasks, setMissedTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')

  useEffect(() => {
    checkAndResetDailyTasks()
    loadTasks()
  }, [])

  const checkAndResetDailyTasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY)

    // If it's a new day, move incomplete tasks to missed
    if (lastCheck && lastCheck !== today) {
      const allTasks = getTasks()
      const lastCheckDate = parseISO(lastCheck)
      const updatedTasks = allTasks.map(task => {
        if (task.isDaily && task.status !== 'completed' && isSameDay(parseISO(task.createdAt), lastCheckDate)) {
          // Mark as missed by adding a missedDate field
          return {
            ...task,
            missedDate: lastCheck,
            createdAt: task.createdAt, // Keep original creation date
          }
        }
        return task
      })
      saveTasks(updatedTasks)
    }

    // Update last check date
    localStorage.setItem(LAST_CHECK_KEY, today)
  }

  const loadTasks = () => {
    const allTasks = getTasks()

    // Today's tasks: created today and not missed
    const today_tasks = allTasks.filter(
      task => task.isDaily &&
              isToday(parseISO(task.createdAt)) &&
              !(task as any).missedDate
    )

    // Missed tasks: have missedDate set and not completed
    const missed_tasks = allTasks.filter(
      task => task.isDaily &&
              (task as any).missedDate &&
              task.status !== 'completed'
    )

    setTodayTasks(today_tasks)
    setMissedTasks(missed_tasks)
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    const task: Task = {
      id: generateId(),
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      isDaily: true,
    }

    addTask(task)
    setNewTaskTitle('')
    loadTasks()
  }

  const handleToggleTask = (taskId: string, currentStatus: Task['status']) => {
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed'
    updateTask(taskId, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    })
    loadTasks()
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
    loadTasks()
  }

  const handleCompleteMissedTask = (taskId: string) => {
    deleteTask(taskId) // Remove missed tasks when completed
    loadTasks()
  }

  const completedTodayCount = todayTasks.filter(t => t.status === 'completed').length

  const renderTask = (task: Task, isMissed: boolean = false) => (
    <div
      key={task.id}
      className={`flex items-center space-x-3 p-3 rounded-lg border ${
        task.status === 'completed' ? 'bg-muted opacity-75' : 'bg-card'
      } ${isMissed ? 'border-border' : ''}`}
    >
      <button
        onClick={() => isMissed ? handleCompleteMissedTask(task.id) : handleToggleTask(task.id, task.status)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          task.status === 'completed'
            ? 'bg-matrix-green border-matrix-green'
            : isMissed
            ? 'border-muted-foreground hover:border-muted-foreground hover:bg-muted'
            : 'border-border hover:border-matrix-green'
        }`}
      >
        {task.status === 'completed' && <Check size={14} className="text-white" />}
      </button>
      <span
        className={`flex-1 text-sm ${
          task.status === 'completed' ? 'line-through text-muted-foreground' : ''
        }`}
      >
        {task.title}
      </span>
      {isMissed && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertCircle size={12} />
          Missed
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDeleteTask(task.id)}
      >
        <Trash2 size={14} className="text-muted-foreground hover:text-white" />
      </Button>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Daily Tasks</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedTodayCount}/{todayTasks.length} completed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add new task */}
          <div className="flex space-x-2">
            <Input
              placeholder="Add a daily task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button size="icon" onClick={handleAddTask}>
              <Plus size={16} />
            </Button>
          </div>

          {/* Missed Tasks Section */}
          {missedTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <AlertCircle size={16} />
                Missed Tasks ({missedTasks.length})
              </h4>
              <div className="space-y-2">
                {missedTasks.map(task => renderTask(task, true))}
              </div>
            </div>
          )}

          {/* Today's Task list */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Today's Tasks</h4>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No daily tasks yet. Add one above!
              </p>
            ) : (
              todayTasks.map(task => renderTask(task, false))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
