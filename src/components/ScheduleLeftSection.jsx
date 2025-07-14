import React from 'react';
import ScheduleLeftTopBox from './ScheduleLeftTopBox';
import ScheduleLeftBottomBox from './ScheduleLeftBottomBox';

export default function ScheduleLeftSection() {
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Section - 70% */}
      <div className="flex-[6]">
        <ScheduleLeftTopBox />
      </div>
      
      {/* Bottom Section - 30% */}
      <div className="flex-[4]">
        <ScheduleLeftBottomBox />
      </div>
    </div>
  );
}