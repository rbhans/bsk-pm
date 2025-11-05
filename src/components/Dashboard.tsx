import { useState } from 'react'
import Layout from './Layout'
import KanbanBoard from './KanbanBoard'
import ProjectsList from './ProjectsList'
import DailyTaskList from './DailyTaskList'

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your projects and tasks efficiently</p>
        </div>

        {/* Projects List - Now Full Width */}
        <div>
          <ProjectsList onProjectsChange={handleProjectsChange} />
        </div>

        {/* Daily Tasks */}
        <div>
          <DailyTaskList />
        </div>

        {/* Kanban Board */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project Board</h2>
          <KanbanBoard key={refreshKey} onProjectsChange={handleProjectsChange} />
        </div>
      </div>
    </Layout>
  )
}
