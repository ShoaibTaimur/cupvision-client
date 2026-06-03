const API_URL = "http://localhost:5000";
const TOKEN_KEY = "cupvision_admin_token";
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
async function request(path, opts = {}, auth = false) {
  const headers = {
    Accept: "application/json",
    ...opts.headers
  };
  if (opts.body && !(opts.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const text = await res.text();
  const data = text ? (() => {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  })() : null;
  if (!res.ok) {
    const msg = data && data.error || res.statusText || "Request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data;
}
const api = {
  get: (p) => request(p),
  post: (p, body, auth = false) => request(p, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body || {}) }, auth),
  put: (p, body) => request(p, { method: "PUT", body: JSON.stringify(body || {}) }, true),
  del: (p) => request(p, { method: "DELETE" }, true),
  authed: (p) => request(p, {}, true)
};
export {
  API_URL as A,
  api as a,
  clearToken as c,
  getToken as g,
  setToken as s
};
