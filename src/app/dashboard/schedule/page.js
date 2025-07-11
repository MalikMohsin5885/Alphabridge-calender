import React from 'react';
import ScheduleMainBox from '../../../components/ScheduleMainBox';
import ScheduleSmallBox from '../../../components/ScheduleSmallBox';

export default function SchedulePage() {
  return (
    <div className="relative min-h-[80vh] px-8 py-6">
      <ScheduleMainBox />
      <ScheduleSmallBox />
    </div>
  );
} 

