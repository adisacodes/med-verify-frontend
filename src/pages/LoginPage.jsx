import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const isRegister = mode === "register";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const { ok, data } = await apiPost(`/auth/${mode}`, body);
      if (ok) {
        saveSession(data.access_token, data.user);
        navigate("/");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">
        {isRegister ? "Create an account" : "Log in"}
      </h1>
      <p className="mt-2 text-gray-600">
        You only need an account to submit a report. Searching and verifying
        are open to everyone.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {isRegister && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className={inputClass}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={inputClass}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className={inputClass}
        />

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Please wait..." : isRegister ? "Create account" : "Log in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(isRegister ? "login" : "register");
          setError("");
        }}
        className="mt-4 text-sm text-blue-600 hover:underline"
      >
        {isRegister
          ? "Already have an account? Log in"
          : "New here? Create an account"}
      </button>
    </div>
  );
}

export default LoginPage;