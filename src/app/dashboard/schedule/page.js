"use client";
import withPrivateRoute from "../../../components/withPrivateRoute";
import ScheduleLeftSection from '../../../components/ScheduleLeftSection';
import ScheduleRightSection from '../../../components/ScheduleRightSection';
import React, { useState } from 'react';

function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <div className="relative min-h-[80vh] px-8 py-6 mt-24 dark:bg-gray-900">
      <div className="flex h-full w-full gap-4">
        {/* Left Section - 40% */}
        <div className="w-[30%]">
          <ScheduleLeftSection selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </div>
        {/* Right Section - 60% */}
        <div className="w-[70%]">
          <ScheduleRightSection selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}

export default withPrivateRoute(SchedulePage);