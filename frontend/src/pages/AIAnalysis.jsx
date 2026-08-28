import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function AIAnalysis() {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/incidents/${id}/analyze`, { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("failed")
        return res.json()
      })
      .then((data) => {
        setAnalysis(data)
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <p className="text-gray-400">Running AI analysis...</p>
  }

  if (notFound || !analysis) {
    return (
      <div>
        <p className="text-gray-400">No analysis found for "{id}".</p>
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
        <h1 className="text-2xl font-semibold">AI Analysis — {id}</h1>
        <Link
          to={`/incidents/${id}/patch`}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded"
        >
          View Patch
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-6">
        <h2 className="text-sm text-gray-400 uppercase mb-1">Root Cause</h2>
        <p className="text-gray-100">{analysis.root_cause}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-4">
        <h2 className="text-sm text-gray-400 uppercase mb-1">Explanation</h2>
        <p className="text-gray-300 leading-relaxed">{analysis.explanation}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-4">
        <h2 className="text-sm text-gray-400 uppercase mb-3">Affected Files & Lines</h2>
        <div className="flex flex-col gap-2">
          {analysis.affected_files.map((file, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-800 rounded px-3 py-2">
              <span className="font-mono text-sm text-gray-100">{file}</span>
              <span className="text-xs text-gray-400">
                {analysis.affected_lines ? analysis.affected_lines.join(", ") : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AIAnalysis