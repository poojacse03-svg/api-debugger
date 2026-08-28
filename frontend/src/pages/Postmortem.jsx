import { useParams, Link } from 'react-router-dom'

// Mock data - later this will come from the real backend API
const postmortemData = {
  "INC-1042": {
    timeline: [
      { time: "15:02", event: "Error first detected: 500 on /api/checkout" },
      { time: "15:03", event: "AI root cause analysis started" },
      { time: "15:05", event: "Root cause identified: unhandled null coupon" },
      { time: "15:07", event: "Patch generated and verification started" },
      { time: "15:09", event: "Patch verified: 12/12 tests passed" },
      { time: "15:11", event: "Pull request #128 created" },
      { time: "15:14", event: "Fix approved and merged" },
    ],
    rootCause: "Unhandled null value when calculating cart total after a coupon is removed.",
    impact: "Checkout failed for ~1,300 users over a 12-minute window, at an estimated $4,200/hr revenue risk.",
    fix: "Added a null check before reading the coupon's amount, defaulting the discount to 0 when no coupon is present.",
    verification: "Reproduced the original error, applied the patch, and confirmed all 12 regression tests passed with LOW regression risk.",
    prevention: "Add a linter rule flagging unguarded property access on function parameters, and add a regression test covering coupon removal at checkout.",
  },
}

function Postmortem() {
  const { id } = useParams()
  const pm = postmortemData[id]

  if (!pm) {
    return (
      <div>
        <p className="text-gray-400">No postmortem found for "{id}".</p>
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

      <h1 className="text-2xl font-semibold mt-2">Postmortem — {id}</h1>

      {/* Timeline */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-6 max-w-2xl">
        <h2 className="text-sm text-gray-400 uppercase mb-3">Timeline</h2>
        <div className="flex flex-col gap-2">
          {pm.timeline.map((item, index) => (
            <div key={index} className="flex gap-3 text-sm">
              <span className="text-gray-500 font-mono w-14 shrink-0">{item.time}</span>
              <span className="text-gray-200">{item.event}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary sections */}
      <div className="grid grid-cols-2 gap-4 mt-4 max-w-2xl">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Root Cause</h2>
          <p className="text-gray-100 text-sm">{pm.rootCause}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Impact</h2>
          <p className="text-gray-100 text-sm">{pm.impact}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Fix</h2>
          <p className="text-gray-100 text-sm">{pm.fix}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Verification</h2>
          <p className="text-gray-100 text-sm">{pm.verification}</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-4 max-w-2xl">
        <h2 className="text-sm text-gray-400 uppercase mb-1">Prevention</h2>
        <p className="text-gray-100 text-sm">{pm.prevention}</p>
      </div>
    </div>
  )
}

export default Postmortem