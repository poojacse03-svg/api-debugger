import { useParams, Link } from 'react-router-dom'

// Mock data - later this will come from the real backend API
const patchData = {
  "INC-1042": {
    file: "src/services/checkout/cartTotals.js",
    before: `function calculateTotal(cart, coupon) {
  const discount = coupon.amount;
  return cart.subtotal - discount;
}`,
    after: `function calculateTotal(cart, coupon) {
  const discount = coupon ? coupon.amount : 0;
  return cart.subtotal - discount;
}`,
    diff: [
      { type: "context", text: "function calculateTotal(cart, coupon) {" },
      { type: "removed", text: "  const discount = coupon.amount;" },
      { type: "added", text: "  const discount = coupon ? coupon.amount : 0;" },
      { type: "context", text: "  return cart.subtotal - discount;" },
      { type: "context", text: "}" },
    ],
  },
}

const diffLineStyle = {
  added: "bg-green-500/10 text-green-400",
  removed: "bg-red-500/10 text-red-400",
  context: "text-gray-400",
}

const diffPrefix = {
  added: "+",
  removed: "-",
  context: " ",
}

function PatchViewer() {
  const { id } = useParams()
  const patch = patchData[id]

  if (!patch) {
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
          <p className="text-gray-500 font-mono text-sm mt-1">{patch.file}</p>
        </div>
        <Link
          to={`/incidents/${id}/verification`}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded"
        >
          Run Verification
        </Link>
      </div>

      {/* Before / After */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-2">Before</h2>
          <pre className="bg-gray-950 text-gray-300 text-xs p-3 rounded overflow-x-auto">{patch.before}</pre>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-2">After</h2>
          <pre className="bg-gray-950 text-gray-300 text-xs p-3 rounded overflow-x-auto">{patch.after}</pre>
        </div>
      </div>

      {/* Unified Diff */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-4">
        <h2 className="text-sm text-gray-400 uppercase mb-2">Unified Diff</h2>
        <div className="bg-gray-950 rounded p-3 font-mono text-xs overflow-x-auto">
          {patch.diff.map((line, index) => (
            <div key={index} className={`px-2 py-0.5 ${diffLineStyle[line.type]}`}>
              {diffPrefix[line.type]} {line.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PatchViewer