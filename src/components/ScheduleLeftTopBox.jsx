"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

export default function ScheduleLeftTopBox() {
  const [date, setDate] = React.useState(new Date(2025, 5, 12));

  return (
    <div className="w-full h-full bg-gray-100 rounded-lg border flex">
      <Calendar
        mode="single"
        defaultMonth={date}
        selected={date}
        onSelect={(selectedDate) => {
          setDate(selectedDate);
          console.log(selectedDate);
        }}
        captionLayout="dropdown"
        className="rounded-lg border w-full h-full"
      />
    </div>
  );
}
