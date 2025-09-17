"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "../services/loginService";
import {jwtDecode} from "jwt-decode";

export default function withPrivateRoute(Component) {
  return function PrivateRouteWrapper(props) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const token = getAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expired → clear and redirect
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          router.replace("/login");
        }
      } catch (err) {
        // Invalid token → clear and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.replace("/login");
      } finally {
        setIsChecking(false);
      }
    }, [router]);

    if (isChecking) {
      return null; // or a spinner while checking token
    }

    return <Component {...props} />;
  };
}
