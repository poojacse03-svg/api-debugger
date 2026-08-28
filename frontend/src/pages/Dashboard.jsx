import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard.jsx'
function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [incidents, setIncidents] = useState([])

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/incidents")
      .then((res) => res.json())
      .then((data) => {
        setIncidents(data.incidents)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const total = incidents.length
  const critical = incidents.filter((i) => i.status_code >= 500).length
  const verified = incidents.filter((i) => i.status === "verified").length
  const unresolved = incidents.filter((i) => i.status !== "verified").length
  
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
        <StatCard label="Total Incidents" value={String(total)} />
        <StatCard label="Critical Incidents" value={String(critical)} color="text-red-400" />
        <StatCard label="Verified Fixes" value={String(verified)} color="text-green-400" />
        <StatCard label="Unresolved" value={String(unresolved)} color="text-yellow-400" />
      </div>

      {/* Recent Errors + Business Impact/Risk side by side */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Recent Errors</h2>
                    <div className="flex flex-col gap-2">
            {incidents.slice(0, 5).map((incident) => (
              <div key={incident.incident_id} className="flex justify-between items-center bg-gray-800 rounded px-3 py-2">
                <div>
                  <p className="text-sm text-gray-100">{incident.error_message}</p>
                  <p className="text-xs text-gray-500">{incident.endpoint}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                  {incident.status_code}
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