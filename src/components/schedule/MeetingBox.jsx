'use client';

import React from 'react';

export default function MeetingBox({
  meeting,
  top,
  left,
  width,
  height,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isHovered,
}) {
  return (
    <div
      className={`absolute rounded-2xl border border-gray-200 p-4 shadow-lg bg-gradient-to-br ${meeting.color} transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl flex items-center gap-3 cursor-pointer`}
      style={{
        top,
        height: height - 10,
        left: left + 'px',
        width: width + 'px',
        zIndex: 1,
        boxShadow: '0 4px 16px 0 rgba(0,0,0,0.06)',
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Tooltip on hover */}
      {isHovered && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full bg-white/90 border border-blue-100 shadow-lg rounded-xl px-4 py-2 min-w-[180px] z-50 animate-fade-in pointer-events-none dark:bg-gray-800/90 dark:border-gray-600">
          <div className="font-semibold text-blue-900 text-sm mb-1 truncate dark:text-blue-300">{meeting.title}</div>
          <div className="text-xs text-blue-600 mb-1 dark:text-blue-400">{meeting.start} - {meeting.end}</div>
          <div className="text-xs text-gray-500 truncate dark:text-gray-400">
            {meeting.assignee?.name}
            {meeting.cc_members?.length > 0 && `, ${meeting.cc_members.map(m => m.name).join(', ')}`}
          </div>
        </div>
      )}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/70 shadow-inner mr-2 dark:bg-gray-700/70 flex-shrink-0">
        {meeting.icon}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="font-bold truncate mb-1 text-base leading-tight text-blue-900 dark:text-blue-900 max-w-full">{meeting.title}</div>
        <div className="text-xs opacity-80 font-medium text-blue-800 dark:text-blue-800">
          <div className="truncate">{meeting.start}</div>
          <div className="truncate">{meeting.end}</div>
        </div>
      </div>
    </div>
  );
}

