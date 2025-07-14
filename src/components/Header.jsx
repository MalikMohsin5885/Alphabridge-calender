"use client";

import React from "react";
import { FaHouseChimney } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import { usePathname } from "next/navigation";
import { useUser } from "../context/UserContext";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose
} from "./ui/sheet";
import { useRouter } from "next/navigation";
import { logout } from "../services/loginService";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";
  const isSchedule = pathname === "/dashboard/schedule";
  const [scrolled, setScrolled] = React.useState(false);
  const { user } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Loading state: don't render user info until loaded
  if (user === null) {
    return (
      <header className="w-full flex items-center justify-between px-7 py-6 transition-all duration-300">
        {/* Optionally, add a spinner or skeleton here */}
      </header>
    );
  }

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user_info");
    router.push("/login");
  };

  return (
    <header
      className={`w-full flex items-center justify-between px-7 py-6 transition-all duration-300 ${
        scrolled ? "backdrop-blur bg-white/60 shadow-md" : "bg-transparent"
      }`}
    >
      {/* Left: Logo and Name */}
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1">
        <img src="/images/the_alphabridge_logo.jpg" alt="Logo" className="h-7 w-7 object-contain" />
        <span className="text-xl font-bold text-gray-800 -ml-1.5">lphabridge</span>
      </div>
      {/* Center: Navigation */}
      <nav className="flex gap-2">
        <a
          href="/dashboard"
          className={`flex items-center gap-1 font-medium transition rounded-full shadow-md border px-3 py-1.5 text-sm
            ${isHome
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-600 active:text-white focus:bg-blue-600 focus:text-white"
            }`}
        >
          <FaHouseChimney className="w-4 h-4" />
          Home
        </a>
        <a
          href="/dashboard/schedule"
          className={`flex items-center gap-1 font-medium transition rounded-full shadow-md border px-3 py-1.5 text-sm
            ${isSchedule
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-600 active:text-white focus:bg-blue-600 focus:text-white"
            }`}
        >
          <FaCalendarAlt className="w-4 h-4" />
          Schedule
        </a>
      </nav>
      {/* Right: User Email and Notifications */}
      <div className="flex items-center gap-2">
        {/* Notifications Button */}
        <button className="relative p-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-100 transition">
          <IoNotifications className="w-5 h-5 text-gray-700" />
        </button>
        {/* Profile Icon and User Info with Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 cursor-pointer">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-500 font-bold text-base">
                {user?.email ? user.email[0].toUpperCase() : "?"}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-gray-800 font-semibold text-xs">
                  {user?.name || user?.username || user?.email || "User"}
                </span>
                <span className="text-gray-600 text-[10px]">
                  {user?.email || "No email"}
                </span>
              </div>
            </div>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle className="sr-only">User Account</SheetTitle>
            <div className="flex flex-col h-full justify-between">
              <div className="flex flex-col items-center mt-8 mb-8">
                {/* Avatar/Initial */}
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 mb-4">
                  {user?.email ? user.email[0].toUpperCase() : "?"}
                </div>
                {/* User Info Card */}
                <div className="w-full bg-white rounded-xl shadow p-4 flex flex-col gap-2 border">
                  <div>
                    <span className="text-xs text-gray-500">Name</span>
                    <div className="font-semibold text-lg text-gray-800">{user?.name || user?.username || user?.email || "User"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Email</span>
                    <div className="text-gray-700 text-base">{user?.email || "No email"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Role</span>
                    <div className="text-blue-700 text-base font-medium capitalize">{user?.role || "No role"}</div>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <button
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
