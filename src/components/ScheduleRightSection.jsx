import React from 'react';

export default function ScheduleRightSection() {
  return (
    <div className="w-full h-full bg-green-50 rounded-lg p-4 border flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Right Section</h3>
      <div className="flex-1 text-gray-600">
        <p>This is the right component (60% of total width)</p>
        {/* Add your content here */}
      </div>
    </div>
  );
}