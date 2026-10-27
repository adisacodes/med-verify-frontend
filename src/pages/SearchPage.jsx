import { useState } from "react";
import { apiGet } from "../api/client";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;

    setLoading(true);
    setError("");

    try {
      const { ok, data } = await apiGet(
        `/drugs/search?q=${encodeURIComponent(term)}`
      );
      if (ok) {
        setResults(data.results);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setResults([]);
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Check your medicine</h1>
      <p className="mt-2 text-gray-600">
        Search by product name, active ingredient, or registration number to see
        if it is registered with Kenya's Pharmacy and Poisons Board.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Panadol, amoxicillin, H2015/00123/001"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}

      {searched && !error && results.length === 0 && (
        <p className="mt-6 rounded-lg bg-yellow-50 p-4 text-yellow-800">
          No registered products matched your search. This doesn't automatically
          mean a product is fake, but check the spelling and be cautious.
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Showing {results.length} result{results.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-3 space-y-3">
            {results.map((drug) => (
              <li
                key={drug.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  {drug.trade_name}
                </h2>
                <p className="text-sm text-gray-600">{drug.active_ingredient}</p>
                <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="inline font-medium text-gray-700">Reg. no: </dt>
                    <dd className="inline text-gray-600">{drug.registration_number}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-gray-700">Form: </dt>
                    <dd className="inline text-gray-600">{drug.dosage_form}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-gray-700">Manufacturer: </dt>
                    <dd className="inline text-gray-600">{drug.manufacturer}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-gray-700">Origin: </dt>
                    <dd className="inline text-gray-600">{drug.country_of_origin}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-gray-700">Registration expires: </dt>
                    <dd className="inline text-gray-600">{drug.registration_expiry}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-gray-500">
            Being on the register means the product is officially registered in
            Kenya. It can't confirm that the specific package in your hand is
            genuine.
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;