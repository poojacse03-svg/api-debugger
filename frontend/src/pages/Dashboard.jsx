import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard.jsx'

const recentErrors = [
  { id: 1, message: "500 Internal Server Error on /api/checkout", time: "2 min ago", severity: "Critical" },
  { id: 2, message: "Timeout connecting to payments service", time: "18 min ago", severity: "High" },
  { id: 3, message: "Null reference in user profile loader", time: "1 hr ago", severity: "Medium" },
]

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simulates a network request. Later, this becomes a real fetch() call to your backend.
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-4 max-w-xl">
        Failed to load dashboard data. Please try again.
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-400 mt-2">Overview of system incidents and AI-verified fixes.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Incidents" value="12" />
        <StatCard label="Critical Incidents" value="3" color="text-red-400" />
        <StatCard label="Verified Fixes" value="8" color="text-green-400" />
        <StatCard label="Unresolved" value="4" color="text-yellow-400" />
      </div>

      {/* Recent Errors + Business Impact/Risk side by side */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Recent Errors</h2>
          <div className="flex flex-col gap-2">
            {recentErrors.map((error) => (
              <div key={error.id} className="flex justify-between items-center bg-gray-800 rounded px-3 py-2">
                <div>
                  <p className="text-sm text-gray-100">{error.message}</p>
                  <p className="text-xs text-gray-500">{error.time}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                  {error.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Business Impact & Risk</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Revenue at risk</span>
              <span className="text-red-400 font-medium">$4,200/hr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Affected users</span>
              <span className="text-yellow-400 font-medium">~1,300</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Overall risk level</span>
              <span className="text-red-400 font-medium">HIGH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard