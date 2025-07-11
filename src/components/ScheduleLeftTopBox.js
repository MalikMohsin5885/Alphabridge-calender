import React from "react";

export default function ScheduleLeftTopBox() {
  // Height: 100% - (16rem + 2.5rem + 104px)
  // Top: mt-16 (4rem)
  // Bottom: height of small box + margin + offset
  return (
    <div
      className="absolute left-0 ml-4 mt-16"
      style={{
        width: '28%',
        top: '4rem', // mt-16
        bottom: `calc(16rem + 2.5rem + 104px)`, // h-64 + mb-10 + offset
      }}
    >
      <div className="w-full h-full bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center">
        <span className="text-md font-semibold text-gray-700">Left Top Box</span>
      </div>
    </div>
  );
} 