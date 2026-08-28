import { useParams, Link } from 'react-router-dom'

// Mock data - later this will come from the real backend API
const verificationData = {
  "INC-1042": {
    errorReproduced: true,
    patchApplied: true,
    testsPassed: 12,
    testsTotal: 12,
    regressionRisk: "LOW",
    blastRadius: 3,
    attempts: 2,
    verified: true,
  },
  "INC-1041": {
    errorReproduced: true,
    patchApplied: false,
    testsPassed: 0,
    testsTotal: 8,
    regressionRisk: "MEDIUM",
    blastRadius: 5,
    attempts: 1,
    verified: false,
  },
}

const riskColor = {
  LOW: "text-green-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-red-400",
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
  const v = verificationData[id]

  if (!v) {
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
        <CheckRow label="Error reproduced" passed={v.errorReproduced} />
        <CheckRow label="Patch applied" passed={v.patchApplied} />
        <CheckRow
          label="Tests"
          passed={v.testsPassed === v.testsTotal}
          value={`${v.testsPassed}/${v.testsTotal}`}
        />
        <div className="flex justify-between items-center py-2 border-b border-gray-800">
          <span className="text-gray-300">Regression risk</span>
          <span className={`font-semibold ${riskColor[v.regressionRisk]}`}>{v.regressionRisk}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800">
          <span className="text-gray-300">Blast radius</span>
          <span className="text-gray-100">{v.blastRadius} files</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-300">Attempts</span>
          <span className="text-gray-100">{v.attempts}</span>
        </div>
      </div>

           {/* Final Status - impossible to miss */}
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
      </div>

      <Link
        to={`/incidents/${id}/blast-radius`}
        className="inline-block mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded"
      >
        View Blast Radius
      </Link>
    </div>
  )
}

export default Verification