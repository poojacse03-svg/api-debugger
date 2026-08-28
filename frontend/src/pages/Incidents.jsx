import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const severityColor = {
  Critical: "bg-red-500/20 text-red-400",
  High: "bg-orange-500/20 text-orange-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  Low: "bg-green-500/20 text-green-400",
}

const verificationColor = {
  Verified: "bg-green-500/20 text-green-400",
  Unverified: "bg-red-500/20 text-red-400",
}
function Incidents() {
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/incidents")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.incidents.map((inc) => ({
          id: inc.incident_id,
          endpoint: inc.endpoint,
          status: inc.status,
          severity: inc.status_code >= 500 ? "Critical" : "Medium",
          rootCause: inc.status === "received" ? "Pending" : "Found",
          verification: inc.status === "verified" ? "Verified" : "Unverified",
          risk: "—",
          timestamp: inc.created_at,
        }))
        setIncidents(mapped)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading incidents...</p>
      </div>
    )
  }
  return (
    <div>
      <h1 className="text-2xl font-semibold">Incidents</h1>
      <p className="text-gray-400 mt-2">All tracked incidents and their current status.</p>

      <div className="bg-gray-900 border border-gray-800 rounded-lg mt-6 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Incident</th>
              <th className="px-4 py-3">Endpoint</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Root Cause</th>
              <th className="px-4 py-3">Verification</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-3 font-medium">
                  <Link to={`/incidents/${incident.id}`} className="text-blue-400 hover:underline">
                    {incident.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-300">{incident.endpoint}</td>
                <td className="px-4 py-3 text-gray-300">{incident.status}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${severityColor[incident.severity]}`}>
                    {incident.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{incident.rootCause}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${verificationColor[incident.verification]}`}>
                    {incident.verification}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{incident.risk}</td>
                <td className="px-4 py-3 text-gray-500">{incident.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Incidents