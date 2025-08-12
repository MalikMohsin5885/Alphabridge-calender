import React, { useState } from 'react';
import ScheduleLeftTopBox from './ScheduleLeftTopBox';
import ScheduleLeftBottomBox from './ScheduleLeftBottomBox';

export default function ScheduleLeftSection({ selectedDate, setSelectedDate }) {
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Section - 70% */}
      <div className="flex-[6]">
        <ScheduleLeftTopBox selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </div>
      {/* Bottom Section - 30% */}
      <div className="flex-[4]">
        <ScheduleLeftBottomBox selectedDate={selectedDate} />
      </div>
    </div>
  );
}