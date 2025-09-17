"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "../../../services/loginService";
import { jwtDecode } from "jwt-decode";
import Login from "../../../components/Login";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken();

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          // ✅ Token exists and is still valid → go to dashboard
          router.replace("/dashboard");
          return;
        } else {
          // ❌ Token expired → clear it
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } catch (err) {
        // ❌ Invalid token → clear it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }

    // No valid token → show login form
    setChecking(false);
  }, [router]);

  if (checking) {
    return null; // Or spinner
  }

  return (
    <div>
      <Login />
    </div>
  );
}
