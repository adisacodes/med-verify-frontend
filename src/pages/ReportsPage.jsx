import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost } from "../api/client";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";

function ReportsPage() {
  const { user, logout } = useAuth();

  const [reports, setReports] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  async function loadReports() {
    try {
      const { ok, data } = await apiGet("/reports");
      if (ok) {
        setReports(data);
        setListError("");
      } else {
        setListError("Could not load reports.");
      }
    } catch {
      setListError("Could not reach the server. Is the backend running?");
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setSuccess(false);

    const body = {
      product_name_text: productName,
      description,
      location,
    };
    if (position) {
      body.latitude = position.lat;
      body.longitude = position.lng;
    }

    try {
      const { ok, status, data } = await apiPost("/reports", body);

      if (ok) {
        setProductName("");
        setDescription("");
        setLocation("");
        setPosition(null);
        setSuccess(true);
        loadReports();
      } else if (status === 401 || status === 422) {
        logout();
        setFormError("Your session has expired. Please log in again.");
      } else {
        setFormError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setFormError("Could not reach the server. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Community reports</h1>
      <p className="mt-2 text-gray-600">
        Report a medicine or pharmacy that looks suspicious. Reports are
        community observations, not confirmed findings.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Submit a report</h2>

        {user ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Product name"
              required
              className={inputClass}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What looked suspicious? (packaging, seal, price, where you bought it)"
              required
              rows={4}
              className={inputClass}
            />

            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">
                Where did you see it? (optional)
              </p>
              <LocationPicker value={position} onChange={setPosition} />
            </div>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Place name or landmark (e.g. next to Naivas, Rongai)"
              className={inputClass}
            />

            {formError && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>
            )}
            {success && (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                Thank you. Your report was submitted and is pending review.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit report"}
            </button>
          </form>
        ) : (
          <div className="mt-3">
            {formError && (
              <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>
            )}
            <p className="text-gray-600">
              You need to be logged in to submit a report.{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in or create an account
              </Link>
            </p>
          </div>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Recent reports</h2>

      {listLoading && <p className="mt-3 text-gray-500">Loading...</p>}

      {listError && (
        <p className="mt-3 rounded-lg bg-red-50 p-4 text-red-700">{listError}</p>
      )}

      {!listLoading && !listError && reports.length === 0 && (
        <p className="mt-3 text-gray-500">No reports yet.</p>
      )}

      <ul className="mt-3 space-y-3">
        {reports.map((report) => (
          <li
            key={report.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-gray-900">
                {report.product_name_text || "Unnamed product"}
              </h3>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {report.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-700">{report.description}</p>
            <p className="mt-2 text-xs text-gray-500">
              {report.location ? `${report.location} · ` : ""}
              {report.latitude != null ? "Pinned on map · " : ""}
              {report.created_at
                ? new Date(report.created_at).toLocaleDateString()
                : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReportsPage;