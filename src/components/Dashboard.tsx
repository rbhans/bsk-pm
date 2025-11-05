import { useState } from 'react'
import Layout from './Layout'
import KanbanBoard from './KanbanBoard'
import ProjectsList from './ProjectsList'
import DailyTaskList from './DailyTaskList'
import PomodoroTimer from './PomodoroTimer'

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleProjectsChange = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your projects and tasks efficiently</p>
        </div>

        {/* Top Row: Projects List and Pomodoro Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProjectsList onProjectsChange={handleProjectsChange} />
          </div>
          <div>
            <PomodoroTimer />
          </div>
        </div>

        {/* Daily Tasks */}
        <div>
          <DailyTaskList />
        </div>

        {/* Kanban Board */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Board</h2>
          <KanbanBoard key={refreshKey} onProjectsChange={handleProjectsChange} />
        </div>
      </div>
    </Layout>
  )
}
