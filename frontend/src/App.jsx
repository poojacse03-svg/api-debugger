import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Incidents from './pages/Incidents.jsx'
import IncidentDetails from './pages/IncidentDetails.jsx'
import AIAnalysis from './pages/AIAnalysis.jsx'
import PatchViewer from './pages/PatchViewer.jsx'
import Verification from './pages/Verification.jsx'
import BlastRadius from './pages/BlastRadius.jsx'
import PullRequest from './pages/PullRequest.jsx'
import Approval from './pages/Approval.jsx'
import Postmortem from './pages/Postmortem.jsx'

function App() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4">
        <h2 className="text-lg font-bold text-white">Observability</h2>
        <p className="text-sm text-gray-400 mt-1">AI Incident Dashboard</p>

                <nav className="mt-6 flex flex-col gap-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded transition-colors ${
              isActive("/") ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/incidents"
            className={`px-3 py-2 rounded transition-colors ${
              isActive("/incidents") ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
          >
            Incidents
          </Link>
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:id" element={<IncidentDetails />} />
          <Route path="/incidents/:id/analysis" element={<AIAnalysis />} />
          <Route path="/incidents/:id/patch" element={<PatchViewer />} />
          <Route path="/incidents/:id/verification" element={<Verification />} />
          <Route path="/incidents/:id/blast-radius" element={<BlastRadius />} />
          <Route path="/incidents/:id/pr" element={<PullRequest />} />
           <Route path="/incidents/:id/approval" element={<Approval />} />
           <Route path="/incidents/:id/postmortem" element={<Postmortem />} />

        </Routes>
      </main>
    </div>
  )
}

export default App