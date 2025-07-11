"use client";

import React from "react";
import { FaHouseChimney } from "react-icons/fa6";

import { FaCalendarAlt } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";
  const isSchedule = pathname === "/dashboard/schedule";

  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-transparent">
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
        {/* Profile Icon and User Info */}
        <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-500 font-bold text-base">A</span>
          <div className="flex flex-col leading-tight">
            <span className="text-gray-800 font-semibold text-xs">Ahmed Ali</span>
            <span className="text-gray-600 text-[10px]">user@email.com</span>
          </div>
        </div>
      </div>
    </header>
  );
}
