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
  SheetTitle
} from "./ui/sheet";
import { useRouter } from "next/navigation";
import { logout } from "../services/loginService";
import { ThemeToggle } from "./ui/theme-toggle";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";
  const isSchedule = pathname === "/dashboard/schedule";
  const isAddUser = pathname === "/dashboard/add-user";
  const isAddRole = pathname === "/dashboard/add-role";
  const [scrolled, setScrolled] = React.useState(false);
  const { user, loading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user_info");
    router.push("/login");
  };

  // Loading state: don't render user info until loaded
  if (loading) {
    return null; // Or a spinner
  }
  if (user === null) {
    return (
      <header className="w-full flex items-center justify-between px-7 py-6 transition-all duration-300">
        {/* Optionally, add a spinner or skeleton here */}
      </header>
    );
  }

  return (
    <header
      className={`fixed top-4 left-1/2 z-40 -translate-x-1/2 w-[95vw] max-w-4xl flex items-center justify-between px-4 py-2 rounded-2xl shadow-xl border border-blue-100/60 bg-white/60 backdrop-blur-md transition-all duration-300 dark:border-gray-700/60 dark:bg-gray-800/60
        ${scrolled ? "scale-95 opacity-95" : "scale-100 opacity-100"}
      `}
      style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(232,240,254,0.85) 100%)",
      }}
    >
      {/* Left: Logo and Name */}
      <div className="flex items-center gap-2 rounded-xl px-2 py-1">
        <img src="/images/the_alphabridge_logo.png" alt="Logo" className="h-6 w-6 object-contain rounded-lg" />
        <span className="text-base font-bold text-blue-700 tracking-tight">lphabridge</span>
      </div>
      {/* Center: Navigation */}
      <nav className="flex gap-1 bg-white/40 rounded-full px-2 py-1 shadow-sm border border-blue-100/40 backdrop-blur-sm dark:bg-gray-800/40 dark:border-gray-700/40">
        <a
          href="/dashboard"
          className={`flex items-center gap-1 font-medium transition rounded-full px-3 py-1 text-sm whitespace-nowrap
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
          className={`flex items-center gap-1 font-medium transition rounded-full px-3 py-1 text-sm whitespace-nowrap
            ${isSchedule
              ? "bg-blue-600 text-white shadow border-blue-600"
              : "bg-white/0 text-blue-700 border border-transparent hover:text-blue-600 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700"}
          `}
        >
          <FaCalendarAlt className="w-4 h-4" />
          Schedule
        </a>
        {/* Only show Add User and Add Role for Administrator */}
        {user?.role === 'Administrator' && (
          <>
            <a
              href="/dashboard/add-user"
              className={`flex items-center gap-1 font-medium transition rounded-full px-3 py-1 text-sm whitespace-nowrap
                ${isAddUser
                  ? "bg-blue-600 text-white shadow border-blue-600"
                  : "bg-white/0 text-blue-700 border border-transparent hover:text-blue-600 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700"}
              `}
            >
              Add User
            </a>
            <a
              href="/dashboard/add-role"
              className={`flex items-center gap-1 font-medium transition rounded-full px-3 py-1 text-sm whitespace-nowrap
                ${isAddRole
                  ? "bg-blue-600 text-white shadow border-blue-600"
                  : "bg-white/0 text-blue-700 border border-transparent hover:text-blue-600 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700"}
              `}
            >
              Edit Permissions
            </a>
          </>
        )}
      </nav>
      {/* Right: User Email and Notifications */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />
        {/* Notifications Button */}
        <button className="relative p-1.5 rounded-full border border-blue-100 bg-white/70 shadow hover:bg-blue-100 transition group focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-800/70 dark:hover:bg-gray-700">
          <IoNotifications className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white animate-pulse" />
        </button>
        {/* Profile Icon and User Info with Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 cursor-pointer dark:border-gray-600 dark:bg-gray-800">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-500 font-bold text-base dark:bg-gray-600 dark:text-gray-300">
                {user?.email ? user.email[0].toUpperCase() : "?"}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-blue-900 font-semibold text-xs truncate max-w-[80px] dark:text-blue-300">
                  {user?.name || user?.username || user?.email || "User"}
                </span>
                <span className="text-blue-500 text-[10px] truncate max-w-[80px] dark:text-blue-400">
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
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 mb-4 dark:bg-gray-600 dark:text-gray-300">
                  {user?.email ? user.email[0].toUpperCase() : "?"}
                </div>
                {/* User Info Card */}
                <div className="w-full bg-white rounded-xl shadow p-4 flex flex-col gap-2 border dark:bg-gray-800 dark:border-gray-600">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Name</span>
                    <div className="font-semibold text-lg text-gray-800 dark:text-gray-200">{user?.name || user?.username || user?.email || "User"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Email</span>
                    <div className="text-gray-700 text-base dark:text-gray-300">{user?.email || "No email"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Role</span>
                    <div className="text-blue-700 text-base font-medium capitalize dark:text-blue-400">{user?.role || "No role"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Department</span>
                    <div className="text-gray-700 text-base dark:text-gray-300">{user?.department?.name || "No department"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Administrator</span>
                    <div className="text-gray-700 text-base dark:text-gray-300">{user?.supervisor?.name || "No administrator"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                    <div className={`text-base font-medium capitalize ${
                      user?.status === 'active' 
                        ? 'text-green-600 dark:text-green-400' 
                        : user?.status === 'inactive' 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {user?.status || "Unknown"}
                    </div>
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
