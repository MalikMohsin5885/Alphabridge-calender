"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
      <button
        onClick={() => setTheme("light")}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          theme === "light"
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        }`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          theme === "dark"
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        }`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          theme === "system"
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        }`}
        title="System mode"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  )
} 