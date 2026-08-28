import { useParams, Link } from 'react-router-dom'

// Mock data - later this will come from the real backend API
const incidentDetails = {
  "INC-1042": {
    error: "500 Internal Server Error on /api/checkout",
    rootCause: "Unhandled null value when calculating cart total after a coupon is removed.",
    affectedFile: "src/services/checkout/cartTotals.js",
    stackTrace: `TypeError: Cannot read properties of null (reading 'amount')
    at calculateTotal (cartTotals.js:42)
    at processCheckout (checkoutController.js:88)
    at Router.post (routes/checkout.js:15)`,
    businessImpact: "Checkout fails for ~1,300 users, blocking all purchases on affected sessions.",
    risk: "Low",
  },
  "INC-1041": {
    error: "Timeout connecting to payments service",
    rootCause: "Payments service connection pool exhausted under high load.",
    affectedFile: "src/services/payments/paymentClient.js",
    stackTrace: `ConnectionTimeoutError: Timed out after 5000ms
    at PaymentClient.connect (paymentClient.js:21)
    at processPayment (paymentController.js:60)`,
    businessImpact: "Delayed payment confirmations for a subset of transactions.",
    risk: "Medium",
  },
  "INC-1039": {
    error: "Null reference in user profile loader",
    rootCause: "Profile loader assumed a user's avatar field always exists.",
    affectedFile: "src/services/profile/profileLoader.js",
    stackTrace: `TypeError: Cannot read properties of undefined (reading 'avatarUrl')
    at loadProfile (profileLoader.js:17)`,
    businessImpact: "Minor - profile page fails to load for users without an avatar set.",
    risk: "Low",
  },
}

function IncidentDetails() {
  const { id } = useParams()
  const incident = incidentDetails[id]

  if (!incident) {
    return (
      <div>
        <p className="text-gray-400">No incident found for "{id}".</p>
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

        <div className="flex items-center justify-between mt-2">
        <h1 className="text-2xl font-semibold">{id}</h1>
        <Link
          to={`/incidents/${id}/analysis`}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded"
        >
          View AI Analysis
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Error</h2>
          <p className="text-gray-100">{incident.error}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Root Cause</h2>
          <p className="text-gray-100">{incident.rootCause}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Affected File</h2>
          <p className="text-gray-100 font-mono text-sm">{incident.affectedFile}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Risk</h2>
          <p className="text-gray-100">{incident.risk}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 col-span-2">
          <h2 className="text-sm text-gray-400 uppercase mb-1">Business Impact</h2>
          <p className="text-gray-100">{incident.businessImpact}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 col-span-2">
          <h2 className="text-sm text-gray-400 uppercase mb-2">Stack Trace</h2>
          <pre className="bg-gray-950 text-red-300 text-xs p-3 rounded overflow-x-auto">{incident.stackTrace}</pre>
        </div>
      </div>
    </div>
  )
}

export default IncidentDetails