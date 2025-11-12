import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import ProjectDetails from './components/ProjectDetails'
import ClientDetails from './components/ClientDetails'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/client/:id" element={<ClientDetails />} />
      </Routes>
    </Router>
  )
}

export default App
