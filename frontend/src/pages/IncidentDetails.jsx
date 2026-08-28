import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function IncidentDetails() {
  const { id } = useParams()
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/incidents/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found")
        return res.json()
      })
      .then((data) => {
        setIncident(data)
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <p className="text-gray-400">Loading...</p>
  }

  if (notFound || !incident) {
    return (
      <div>
        <p className="text-gray-400">No incident found for "{id}".</p>
        <Link to="/incidents" className="text-blue-400 hover:underline mt-2 inline-block">
          &larr; Back to Incidents
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/incidents" className="text-blue-400 hover:underline text-sm">
        &larr; Back to Incidents
      </Link>

      <div className="flex items-center justify-between mt-2">
        <h1 className="text-2xl font-semibold">{id}</h1>
        <Link
          to={`/incidents/${id}/analysis`}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded"
        >
          View AI Analysis
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Error</h2>
          <p className="text-gray-100">{incident.error.error_message}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Endpoint</h2>
          <p className="text-gray-100 font-mono text-sm">{incident.error.endpoint}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Status Code</h2>
          <p className="text-gray-100">{incident.error.status_code}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Risk Level</h2>
          <p className="text-gray-100">{incident.risk?.risk_level || "—"}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 col-span-2">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Blast Radius Reason</h2>
          <p className="text-gray-100">{incident.risk?.reason || "—"}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 col-span-2">
          <h2 className="text-sm text-gray-400 uppercase mb-2">Stack Trace</h2>
          <pre className="bg-gray-950 text-red-300 text-xs p-3 rounded overflow-x-auto">{incident.error.stack}</pre>
        </div>
      </div>
    </div>
  )
}

export default IncidentDetails