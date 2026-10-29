import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPatch } from "../api/client";
import { useAuth } from "../context/AuthContext";

const TABS = ["pending", "approved", "rejected"];

const ACTIONS = {
  approved: {
    label: "Approve",
    className: "bg-green-600 text-white hover:bg-green-700",
  },
  rejected: {
    label: "Reject",
    className: "bg-red-600 text-white hover:bg-red-700",
  },
  pending: {
    label: "Move to pending",
    className: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  },
};

function mapLink(report) {
  const { latitude: lat, longitude: lng } = report;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
}

function ReviewPage() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("pending");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    async function load() {
      try {
        const { ok, status, data } = await apiGet(
          `/reports/review?status=${activeTab}`
        );
        if (cancelled) return;
        if (ok) {
          setReports(data);
        } else if (status === 401 || status === 422) {
          logout();
        } else if (status === 403) {
          setError("Your account is not an admin.");
        } else {
          setError(data.error || "Could not load reports.");
        }
      } catch {
        if (!cancelled) {
          setError("Could not reach the server. Is the backend running?");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, isAdmin, logout]);

  function switchTab(tab) {
    setActiveTab(tab);
    setLoading(true);
    setError("");
  }

  async function changeStatus(id, newStatus) {
    setBusyId(id);
    setError("");
    try {
      const { ok, status, data } = await apiPatch(`/reports/${id}/status`, {
        status: newStatus,
      });
      if (ok) {
        // the report now belongs to a different tab, so drop it from this list
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else if (status === 401 || status === 422) {
        logout();
      } else {
        setError(data.error || "Could not update the report.");
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setBusyId(null);
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Review reports</h1>
        <p className="mt-3 text-gray-600">
          Please{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            log in
          </Link>{" "}
          to continue.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Review reports</h1>
        <p className="mt-3 text-gray-600">
          This page is for reviewers only. If you were just made an admin, log
          out and log back in.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Review reports</h1>
      <p className="mt-2 text-gray-600">
        Approve reports that describe a product and what looked wrong. Reject
        spam, abuse, or anything that accuses a named person without evidence.
        Approved reports become public, without the reporter's identity.
      </p>

      <div className="mt-6 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}

      {!loading && !error && reports.length === 0 && (
        <p className="mt-4 text-gray-500">No {activeTab} reports.</p>
      )}

      {!loading && (
        <ul className="mt-4 space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900">
                {report.product_name_text || "Unnamed product"}
              </h3>
              <p className="mt-2 text-sm text-gray-700">{report.description}</p>
              <p className="mt-2 text-xs text-gray-500">
                {report.location ? `${report.location} · ` : ""}
                {report.latitude != null && report.longitude != null && (
                  <>
                    <a
                      href={mapLink(report)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View pin on map
                    </a>
                    {" · "}
                  </>
                )}
                Reporter #{report.reporter_id}
                {report.created_at
                  ? ` · ${new Date(report.created_at).toLocaleString()}`
                  : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TABS.filter((s) => s !== activeTab).map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(report.id, s)}
                    disabled={busyId === report.id}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${ACTIONS[s].className}`}
                  >
                    {ACTIONS[s].label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReviewPage;