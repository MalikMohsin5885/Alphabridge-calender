import React from 'react';

export default function ScheduleLeftBottomBox() {
  return (
    <div className="w-full h-full bg-blue-50 rounded-lg p-4 border flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Left Bottom Section</h3>
      <div className="flex-1 text-gray-600">
        <p>This is the bottom left component (30% of left side)</p>
        {/* Add your content here */}
      </div>
    </div>
  );
}