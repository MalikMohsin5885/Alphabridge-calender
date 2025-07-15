"use client";
import withPrivateRoute from "../../../components/withPrivateRoute";
import ScheduleLeftSection from '../../../components/ScheduleLeftSection';
import ScheduleRightSection from '../../../components/ScheduleRightSection';

function SchedulePage() {
  return (
    <div className="relative min-h-[80vh] px-8 py-6 mt-24">
      <div className="flex h-full w-full gap-4">
        {/* Left Section - 40% */}
        <div className="w-[30%]">
          <ScheduleLeftSection />
        </div>
        {/* Right Section - 60% */}
        <div className="w-[70%]">
          <ScheduleRightSection />
        </div>
      </div>
    </div>
  );
}

export default withPrivateRoute(SchedulePage);