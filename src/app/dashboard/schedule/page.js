import React from 'react';
import ScheduleLeftSection from '../../../components/ScheduleLeftSection';
import ScheduleRightSection from '../../../components/ScheduleRightSection';

export default function SchedulePage() {
  return (
    <div className="w-full h-screen p-4">
      <div className="flex h-full w-full gap-4">
        {/* Left Section - 40% */}
        <div className="w-[30%] h-full">
          <ScheduleLeftSection />
        </div>
        
        {/* Right Section - 60% */}
        <div className="w-[70%] h-full">
          <ScheduleRightSection />
        </div>
      </div>
    </div>
  );
}