import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Task } from '@/types'
import { getTasks, addTask, updateTask, deleteTask, generateId } from '@/lib/storage'
import { Plus, Trash2, Check } from 'lucide-react'
import { format } from 'date-fns'

export default function DailyTaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = () => {
    const allTasks = getTasks()
    const today = format(new Date(), 'yyyy-MM-dd')
    // Show today's daily tasks and incomplete tasks
    const dailyTasks = allTasks.filter(
      task => task.isDaily && (!task.completedAt || task.completedAt.startsWith(today))
    )
    setTasks(dailyTasks)
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

  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Daily Tasks</span>
          <span className="text-sm font-normal text-gray-500">
            {completedCount}/{tasks.length} completed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
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

          {/* Task list */}
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No daily tasks yet. Add one above!
              </p>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    task.status === 'completed' ? 'bg-gray-50 opacity-75' : 'bg-white'
                  }`}
                >
                  <button
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-matrix-green border-matrix-green'
                        : 'border-gray-300 hover:border-matrix-green'
                    }`}
                  >
                    {task.status === 'completed' && <Check size={14} className="text-white" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      task.status === 'completed' ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
