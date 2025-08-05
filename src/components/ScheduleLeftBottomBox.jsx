import React from 'react';
import { CalendarDays, Clock } from 'lucide-react';

const todaysMeetings = [
  { id: 1, title: 'Team Sync', time: '09:30 - 10:30', color: 'bg-blue-100', icon: <CalendarDays className="w-5 h-5 text-blue-500" /> },
  { id: 2, title: 'Client Call', time: '11:00 - 12:30', color: 'bg-pink-100', icon: <CalendarDays className="w-5 h-5 text-pink-500" /> },
  { id: 3, title: 'Design Review', time: '09:30 - 10:30', color: 'bg-green-100', icon: <CalendarDays className="w-5 h-5 text-green-500" /> },
];

export default function ScheduleLeftBottomBox() {
  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col transition-all duration-300 hover:shadow-2xl dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2 dark:text-gray-100">
        <Clock className="w-5 h-5 text-blue-500" /> Today's Meetings
      </h3>
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {todaysMeetings.map((meeting) => (
          <div key={meeting.id} className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 shadow-sm ${meeting.color} transition-all duration-200 hover:scale-[1.02] dark:border-gray-600 dark:bg-gray-700`}> 
            <div>{meeting.icon}</div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 text-sm dark:text-gray-100">{meeting.title}</span>
              <span className="text-xs text-gray-500 font-medium dark:text-gray-400">{meeting.time}</span>
            </div>
          </div>
        ))}
        {todaysMeetings.length === 0 && (
          <div className="text-gray-400 text-sm text-center mt-6 dark:text-gray-500">No meetings today</div>
        )}
      </div>
    </div>
  );
}