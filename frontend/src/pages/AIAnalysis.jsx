import { useParams, Link } from 'react-router-dom'

// Mock data - later this will come from the real backend API
const analysisData = {
  "INC-1042": {
    rootCause: "Unhandled null value when calculating cart total after a coupon is removed.",
    explanation:
      "When a user removes a coupon during checkout, the discount object is set to null, but the total calculation function still tries to read its 'amount' property before checking if it exists. This throws an unhandled exception and crashes the checkout request.",
    affectedFiles: [
      { file: "src/services/checkout/cartTotals.js", lines: "38-45" },
      { file: "src/controllers/checkoutController.js", lines: "85-90" },
    ],
  },
  "INC-1041": {
    rootCause: "Payments service connection pool exhausted under high load.",
    explanation:
      "During peak traffic, the number of concurrent requests to the payments service exceeds the configured connection pool size, causing new requests to wait and eventually time out before a connection becomes available.",
    affectedFiles: [
      { file: "src/services/payments/paymentClient.js", lines: "15-25" },
    ],
  },
  "INC-1039": {
    rootCause: "Profile loader assumed a user's avatar field always exists.",
    explanation:
      "Some older user accounts were created before the avatar field was required, so their avatar value is undefined. The profile loader accesses avatarUrl directly without a fallback, causing a crash for those users.",
    affectedFiles: [
      { file: "src/services/profile/profileLoader.js", lines: "12-20" },
    ],
  },
}

function AIAnalysis() {
  const { id } = useParams()
  const analysis = analysisData[id]

  if (!analysis) {
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
        <p className="text-gray-100">{analysis.rootCause}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-4">
        <h2 className="text-sm text-gray-400 uppercase mb-1">Explanation</h2>
        <p className="text-gray-300 leading-relaxed">{analysis.explanation}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-4">
        <h2 className="text-sm text-gray-400 uppercase mb-3">Affected Files & Lines</h2>
        <div className="flex flex-col gap-2">
          {analysis.affectedFiles.map((item, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-800 rounded px-3 py-2">
              <span className="font-mono text-sm text-gray-100">{item.file}</span>
              <span className="text-xs text-gray-400">Lines {item.lines}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AIAnalysis