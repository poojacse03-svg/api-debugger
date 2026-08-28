import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

// Mock data - later this will come from the real backend API
const prData = {
  "INC-1042": {
    prNumber: 128,
    branch: "fix/inc-1042-null-coupon-total",
    changedFiles: [
      "src/services/checkout/cartTotals.js",
      "src/controllers/checkoutController.js",
    ],
    verified: true,
    risk: "LOW",
    rollback: "Revert commit a1b2c3d or redeploy previous release tag v2.14.1",
  },
}

const riskColor = {
  LOW: "text-green-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-red-400",
}

function PullRequest() {
  const { id } = useParams()
  const pr = prData[id]
  const [created, setCreated] = useState(false)

  if (!pr) {
    return (
      <div>
        <p className="text-gray-400">No pull request data found for "{id}".</p>
        <Link to="/incidents" className="text-blue-400 hover:underline mt-2 inline-block">
          &larr; Back to Incidents
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/incidents/${id}/blast-radius`} className="text-blue-400 hover:underline text-sm">
        &larr; Back to Blast Radius
      </Link>

      <h1 className="text-2xl font-semibold mt-2">Pull Request — {id}</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mt-6 max-w-2xl">
        <div className="flex justify-between items-center py-2 border-b border-gray-800">
          <span className="text-gray-300">PR number</span>
          <span className="text-gray-100">#{pr.prNumber}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800">
          <span className="text-gray-300">Branch</span>
          <span className="text-gray-100 font-mono text-sm">{pr.branch}</span>
        </div>
        <div className="py-2 border-b border-gray-800">
          <span className="text-gray-300">Changed files</span>
          <div className="flex flex-col gap-1 mt-2">
            {pr.changedFiles.map((file, index) => (
              <span key={index} className="text-gray-100 font-mono text-sm">{file}</span>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800">
          <span className="text-gray-300">Verification evidence</span>
          <span className={pr.verified ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
            {pr.verified ? "🟢 VERIFIED" : "🔴 UNVERIFIED"}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800">
          <span className="text-gray-300">Risk</span>
          <span className={`font-semibold ${riskColor[pr.risk]}`}>{pr.risk}</span>
        </div>
        <div className="py-2">
          <span className="text-gray-300">Rollback plan</span>
          <p className="text-gray-100 text-sm mt-1">{pr.rollback}</p>
        </div>
      </div>

      {!created ? (
        <button
          onClick={() => setCreated(true)}
          className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-lg"
        >
          CREATE PULL REQUEST
        </button>
      ) : (
        <div className="mt-6 max-w-2xl bg-green-500/10 border border-green-500 text-green-400 rounded-lg p-4">
          Pull request #{pr.prNumber} created successfully on branch <span className="font-mono">{pr.branch}</span>.
          <div className="mt-3">
            <Link
              to={`/incidents/${id}/approval`}
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded"
            >
              Continue to Approval
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default PullRequest