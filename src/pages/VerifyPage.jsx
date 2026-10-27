import { useState } from "react";
import { apiGet } from "../api/client";

// The register writes dates like "2031 September 02". If we can't read
// a date, we return null and skip the expiry check instead of guessing.
function isExpired(dateString) {
  const parsed = Date.parse(dateString);
  if (Number.isNaN(parsed)) return null;
  return parsed < Date.now();
}

function VerifyPage() {
  const [regNumber, setRegNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify(e) {
    e.preventDefault();
    const value = regNumber.trim();
    if (!value) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { status, data } = await apiGet(
        `/drugs/verify?registration_number=${encodeURIComponent(value)}`
      );
      if (status === 200 || status === 404) {
        setResult(data);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const expired = result?.verified ? isExpired(result.drug.registration_expiry) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Verify a registration number</h1>
      <p className="mt-2 text-gray-600">
        Enter the registration number printed on the medicine's packaging
        (for example H2015/00123/001) to check it against the register.
      </p>

      <form onSubmit={handleVerify} className="mt-6 flex gap-2">
        <input
          type="text"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
          placeholder="Registration number"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Verify"}
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}

      {result?.verified && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-5">
          <p className="font-semibold text-green-800">
            Registered: this number is on the PPB register
          </p>
          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            {result.drug.trade_name}
          </h2>
          <p className="text-sm text-gray-600">{result.drug.active_ingredient}</p>
          <dl className="mt-3 space-y-1 text-sm">
            <div>
              <dt className="inline font-medium text-gray-700">Manufacturer: </dt>
              <dd className="inline text-gray-600">{result.drug.manufacturer}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-gray-700">Form: </dt>
              <dd className="inline text-gray-600">{result.drug.dosage_form}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-gray-700">Origin: </dt>
              <dd className="inline text-gray-600">{result.drug.country_of_origin}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-gray-700">Registration expires: </dt>
              <dd className="inline text-gray-600">{result.drug.registration_expiry}</dd>
            </div>
          </dl>
          {expired === true && (
            <p className="mt-3 rounded bg-yellow-100 p-3 text-sm text-yellow-800">
              This registration appears to have expired. Check with a
              pharmacist before using this product.
            </p>
          )}
          <p className="mt-3 text-xs text-gray-500">
            This confirms the product is registered in Kenya. It can't confirm
            that the specific package in your hand is genuine.
          </p>
        </div>
      )}

      {result && !result.verified && (
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-5">
          <p className="font-semibold text-yellow-800">Not found on the register</p>
          <p className="mt-2 text-sm text-yellow-800">{result.message}</p>
        </div>
      )}
    </div>
  );
}

export default VerifyPage;