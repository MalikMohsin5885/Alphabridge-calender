"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "../../../services/loginService";
import Login from '../../../components/Login';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return null; // Or a spinner
  }

  return (
    <div>
      <Login />
    </div>
  );
}
  