"use client";

import React from "react";
import { FaHouseChimney } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import { usePathname } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";
  const isSchedule = pathname === "/dashboard/schedule";
  const [scrolled, setScrolled] = React.useState(false);
  const { user } = useUser();

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

  return (
    <header
      className={`fixed top-4 left-1/2 z-40 -translate-x-1/2 w-[95vw] max-w-4xl flex items-center justify-between px-4 py-2 rounded-2xl shadow-xl border border-blue-100/60 bg-white/60 backdrop-blur-md transition-all duration-300
        ${scrolled ? "scale-95 opacity-95" : "scale-100 opacity-100"}
      `}
      style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(232,240,254,0.85) 100%)",
      }}
    >
      {/* Left: Logo and Name */}
      <div className="flex items-center gap-2 rounded-xl px-2 py-1">
        <img src="/images/the_alphabridge_logo.jpg" alt="Logo" className="h-6 w-6 object-contain rounded-lg" />
        <span className="text-base font-bold text-blue-700 tracking-tight">lphabridge</span>
      </div>
      {/* Center: Navigation */}
      <nav className="flex gap-1 bg-white/40 rounded-full px-2 py-1 shadow-sm border border-blue-100/40 backdrop-blur-sm">
        <a
          href="/dashboard"
          className={`flex items-center gap-1 font-medium transition rounded-full px-3 py-1 text-sm
            ${isHome
              ? "bg-blue-600 text-white shadow border-blue-600"
              : "bg-white/0 text-blue-700 border border-transparent hover:text-blue-600 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700"}
          `}
        >
          <FaHouseChimney className="w-4 h-4" />
          Home
        </a>
        <a
          href="/dashboard/schedule"
          className={`flex items-center gap-1 font-medium transition rounded-full px-3 py-1 text-sm
            ${isSchedule
              ? "bg-blue-600 text-white shadow border-blue-600"
              : "bg-white/0 text-blue-700 border border-transparent hover:text-blue-600 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700"}
          `}
        >
          <FaCalendarAlt className="w-4 h-4" />
          Schedule
        </a>
      </nav>
      {/* Right: User Email and Notifications */}
      <div className="flex items-center gap-2">
        {/* Notifications Button */}
        <button className="relative p-1.5 rounded-full border border-blue-100 bg-white/70 shadow hover:bg-blue-100 transition group focus:outline-none focus:ring-2 focus:ring-blue-300">
          <IoNotifications className="w-4 h-4 text-blue-600" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white animate-pulse" />
        </button>
        {/* Profile Icon and User Info */}
        <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-500 font-bold text-base">
            {user?.email ? user.email[0].toUpperCase() : "?"}
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-blue-900 font-semibold text-xs truncate max-w-[80px]">
              {user?.name || user?.username || user?.email || "User"}
            </span>
            <span className="text-blue-500 text-[10px] truncate max-w-[80px]">
              {user?.email || "No email"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
