import { useState } from 'react'
import Layout from './Layout'
import KanbanBoard from './KanbanBoard'
import ProjectsList from './ProjectsList'
import DailyTaskList from './DailyTaskList'
import ClientsList from './ClientsList'
import ProjectCalendar from './ProjectCalendar'
import { FolderKanban, Users } from 'lucide-react'

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'projects' | 'clients'>('projects')

  const handleProjectsChange = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your projects and tasks efficiently</p>
        </div>

        {/* Tabs for Projects and Clients */}
        <div>
          <div className="flex gap-2 mb-4 border-b border-border">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'projects'
                  ? 'border-matrix-green text-matrix-green'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FolderKanban size={18} />
              Projects
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'clients'
                  ? 'border-matrix-green text-matrix-green'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users size={18} />
              Clients
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'projects' ? (
            <ProjectsList onProjectsChange={handleProjectsChange} />
          ) : (
            <ClientsList />
          )}
        </div>

        {/* Calendar */}
        <div>
          <ProjectCalendar key={refreshKey} />
        </div>

        {/* Daily Tasks */}
        <div>
          <DailyTaskList />
        </div>

        {/* Kanban Board */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Project Board</h2>
          <KanbanBoard key={refreshKey} onProjectsChange={handleProjectsChange} />
        </div>
      </div>
    </Layout>
  )
}
