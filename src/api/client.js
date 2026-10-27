const API_URL = import.meta.env.VITE_API_URL;

export async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`);
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}