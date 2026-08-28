import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function PatchViewer() {
  const { id } = useParams()
  const [patch, setPatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/incidents/${id}/analyze`, { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("failed")
        return res.json()
      })
      .then((data) => {
        setPatch(data)
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <p className="text-gray-400">Generating patch...</p>
  }

  if (notFound || !patch) {
    return (
      <div>
        <p className="text-gray-400">No patch found for "{id}".</p>
        <Link to="/incidents" className="text-blue-400 hover:underline mt-2 inline-block">
          &larr; Back to Incidents
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/incidents/${id}`} className="text-blue-400 hover:underline text-sm">
        &larr; Back to {id}
      </Link>

      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-2xl font-semibold">Patch Viewer — {id}</h1>
          <p className="text-gray-500 font-mono text-sm mt-1">
            {patch.affected_files ? patch.affected_files.join(", ") : ""}
          </p>
        </div>
        <Link
          to={`/incidents/${id}/verification`}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded"
        >
          Run Verification
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-6">
        <h2 className="text-sm text-gray-400 uppercase mb-2">Unified Diff</h2>
        <pre className="bg-gray-950 text-green-300 text-xs p-3 rounded overflow-x-auto whitespace-pre-wrap">
          {patch.patch}
        </pre>
      </div>
    </div>
  )
}

export default PatchViewer