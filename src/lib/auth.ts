import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { clearToken, getToken } from "./api";

export function useAdminAuth(redirect = true) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const t = getToken();
    setToken(t);
    setReady(true);
    if (!t && redirect) navigate({ to: "/admin/login" });
  }, [redirect, navigate]);
  return {
    token,
    ready,
    logout: () => {
      clearToken();
      navigate({ to: "/admin/login" });
    },
  };
}
