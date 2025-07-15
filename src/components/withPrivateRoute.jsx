"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "../services/loginService";

export default function withPrivateRoute(Component) {
  return function PrivateRouteWrapper(props) {
    const router = useRouter();

    useEffect(() => {
      const token = getAccessToken();
      if (!token) {
        router.replace("/login");
      }
    }, [router]);

    const token = getAccessToken();
    if (!token) {
      return null; // Optionally, show a spinner here
    }

    return <Component {...props} />;
  };
} 

