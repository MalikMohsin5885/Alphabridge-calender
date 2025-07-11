import React from 'react';
import ScheduleLeftTopBox from './ScheduleLeftTopBox';
import ScheduleLeftBottomBox from './ScheduleLeftBottomBox';

export default function ScheduleLeftSection() {
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Section - 70% */}
      <div className="flex-[7]">
        <ScheduleLeftTopBox />
      </div>
      
      {/* Bottom Section - 30% */}
      <div className="flex-[3]">
        <ScheduleLeftBottomBox />
      </div>
    </div>
  );
}