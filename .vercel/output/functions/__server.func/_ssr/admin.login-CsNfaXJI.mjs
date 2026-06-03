import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as api, s as setToken } from "./api-B4OEU-Fb.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as Trophy } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
function AdminLogin() {
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const navigate = useNavigate();
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        username,
        password
      });
      setToken(res.token);
      toast.success("Welcome back");
      navigate({
        to: "/admin/dashboard"
      });
    } catch (e2) {
      toast.error(e2.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "w-full max-w-sm bg-card border border-border rounded-lg p-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto size-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Admin login" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "CupVision admin dashboard" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground", children: "Username" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), required: true, autoComplete: "username", className: "w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground", children: "Password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, autoComplete: "current-password", className: "w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50", children: loading ? "Signing in..." : "Sign in" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground text-center", children: "Credentials are checked against backend env vars." })
  ] }) });
}
export {
  AdminLogin as component
};
