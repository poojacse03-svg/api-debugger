import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const riskColor = {
  LOW: "text-green-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-red-400",
  UNKNOWN: "text-gray-400",
}

function CheckRow({ label, passed, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
      <span className="text-gray-300">{label}</span>
      <span className={passed ? "text-green-400" : "text-red-400"}>
        {value !== undefined ? value : (passed ? "✅" : "❌")}
      </span>
    </div>
  )
}

function Verification() {
  const { id } = useParams()
  const [v, setV] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/incidents/${id}/verify`, { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("failed")
        return res.json()
      })
      .then((data) => {
        setV(data)
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <p className="text-gray-400">Running sandbox verification (may take 15-30s)...</p>
  }

  if (notFound || !v) {
    return (
      <div>
        <p className="text-gray-400">No verification data found for "{id}".</p>
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

      <h1 className="text-2xl font-semibold mt-2">Patch Verification — {id}</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mt-6 max-w-xl">
        <CheckRow label="Error reproduced" passed={v.error_reproduced} />
        <CheckRow label="Patch applied" passed={v.patch_applied} />
        <CheckRow
          label="Tests"
          passed={v.tests_passed === v.total_tests && v.total_tests > 0}
          value={`${v.tests_passed}/${v.total_tests}`}
        />
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-300">Attempts</span>
          <span className="text-gray-100">{v.attempts || 1}</span>
        </div>
      </div>

      <div
        className={`mt-6 max-w-xl rounded-lg p-6 text-center border-2 ${
          v.verified
            ? "bg-green-500/10 border-green-500 text-green-400"
            : "bg-red-500/10 border-red-500 text-red-400"
        }`}
      >
        <p className="text-3xl font-bold">
          {v.verified ? "🟢 VERIFIED" : "🔴 UNVERIFIED"}
        </p>
        <p className="text-sm mt-2 text-gray-300">{v.verification_message}</p>
      </div>
    </div>
  )
}

export default Verification