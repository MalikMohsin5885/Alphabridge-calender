"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export default function ScheduleLeftTopBox() {
  const [date, setDate] = React.useState(new Date(2025, 5, 12));

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col p-4 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Select Date</h2>
          <div className="text-sm text-gray-500 font-medium mt-1">
            {date ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : ''}
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full px-4 py-1 text-xs font-semibold shadow-sm">Today</Button>
      </div>
      <Calendar
        mode="single"
        defaultMonth={date}
        selected={date}
        onSelect={(selectedDate) => {
          setDate(selectedDate);
          console.log(selectedDate);
        }}
        captionLayout="dropdown"
        className="rounded-lg border w-full h-full bg-gray-50"
      />
    </div>
  );
}
