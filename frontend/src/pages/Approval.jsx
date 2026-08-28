import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

function Approval() {
  const { id } = useParams()
  const [decision, setDecision] = useState(null) // null | "approved" | "rejected"

  return (
    <div>
      <Link to={`/incidents/${id}/pr`} className="text-blue-400 hover:underline text-sm">
        &larr; Back to Pull Request
      </Link>

      <h1 className="text-2xl font-semibold mt-2">Approval — {id}</h1>
      <p className="text-gray-400 mt-1">
        Review the AI-generated fix and verification evidence before merging.
      </p>

      {decision === null && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setDecision("approved")}
            className="bg-green-600 hover:bg-green-500 text-white font-medium px-6 py-3 rounded-lg"
          >
            APPROVE
          </button>
          <button
            onClick={() => setDecision("rejected")}
            className="bg-red-600 hover:bg-red-500 text-white font-medium px-6 py-3 rounded-lg"
          >
            REJECT
          </button>
        </div>
      )}

      {decision === "approved" && (
        <div className="mt-6 max-w-xl bg-green-500/10 border border-green-500 text-green-400 rounded-lg p-4">
          <p className="font-semibold">✅ Fix approved and merged.</p>
          <Link
            to={`/incidents/${id}/postmortem`}
            className="inline-block mt-3 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded"
          >
            View Postmortem
          </Link>
        </div>
      )}

      {decision === "rejected" && (
        <div className="mt-6 max-w-xl bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-4">
          <p className="font-semibold">❌ Fix rejected. Returned for further analysis.</p>
        </div>
      )}
    </div>
  )
}

export default Approval