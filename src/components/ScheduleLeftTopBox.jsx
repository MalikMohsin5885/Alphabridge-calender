"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export default function ScheduleLeftTopBox({ selectedDate, setSelectedDate }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col p-4 transition-all duration-300 hover:shadow-2xl dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Select Date</h2>
          <div className="text-sm text-gray-500 font-medium mt-1 dark:text-gray-400">
            {mounted && selectedDate ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : ''}
          </div>
        </div>
      </div>
      <Calendar
        mode="single"
        defaultMonth={selectedDate}
        selected={selectedDate}
        onSelect={setSelectedDate}
        captionLayout="dropdown"
        className="rounded-lg border w-full h-full bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
      />
    </div>
  );
}
