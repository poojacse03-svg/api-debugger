import { useParams, Link } from 'react-router-dom'

// Mock data - later this will come from the real backend API
const blastRadiusData = {
  "INC-1042": {
    origin: "src/services/checkout/cartTotals.js",
    affected: [
      { file: "src/services/checkout/cartTotals.js", role: "Origin (patched file)", impact: "High" },
      { file: "src/controllers/checkoutController.js", role: "Calls patched function", impact: "Medium" },
      { file: "src/routes/checkout.js", role: "Routes request to controller", impact: "Low" },
    ],
  },
}

const impactColor = {
  High: "bg-red-500/20 text-red-400 border-red-500/40",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  Low: "bg-green-500/20 text-green-400 border-green-500/40",
}

function BlastRadius() {
  const { id } = useParams()
  const data = blastRadiusData[id]

  if (!data) {
    return (
      <div>
        <p className="text-gray-400">No blast radius data found for "{id}".</p>
        <Link to="/incidents" className="text-blue-400 hover:underline mt-2 inline-block">
          &larr; Back to Incidents
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/incidents/${id}/verification`} className="text-blue-400 hover:underline text-sm">
        &larr; Back to Verification
      </Link>

            <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-2xl font-semibold">Blast Radius — {id}</h1>
          <p className="text-gray-400 mt-1">
            {data.affected.length} files affected by this patch.
          </p>
        </div>
        <Link
          to={`/incidents/${id}/pr`}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded"
        >
          Continue to PR
        </Link>
      </div>

      <div className="flex flex-col gap-3 mt-6 max-w-2xl">
        {data.affected.map((item, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 flex justify-between items-center ${impactColor[item.impact]}`}
          >
            <div>
              <p className="font-mono text-sm text-gray-100">{item.file}</p>
              <p className="text-xs text-gray-400 mt-1">{item.role}</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded border border-current">
              {item.impact} impact
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BlastRadius