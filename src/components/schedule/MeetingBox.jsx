// 'use client';

// import React from 'react';

// export default function MeetingBox({
//   meeting,
//   top,
//   left,
//   width,
//   height,
//   onClick,
//   onMouseEnter,
//   onMouseLeave,
//   isHovered,
// }) {
//   return (
//     <div
//       className={`absolute rounded-2xl border border-gray-200 p-4 shadow-lg bg-gradient-to-br ${meeting.color} transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl flex items-center gap-3 cursor-pointer`}
//       style={{
//         top,
//         height: height - 10,
//         left: left + 'px',
//         width: width + 'px',
//         zIndex: 1,
//         boxShadow: '0 4px 16px 0 rgba(0,0,0,0.06)',
//       }}
//       onClick={onClick}
//       onMouseEnter={onMouseEnter}
//       onMouseLeave={onMouseLeave}
//     >
//       {/* Tooltip on hover */}
//       {isHovered && (
//         <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full bg-white/90 border border-blue-100 shadow-lg rounded-xl px-4 py-2 min-w-[180px] z-50 animate-fade-in pointer-events-none dark:bg-gray-800/90 dark:border-gray-600">
//           <div className="font-semibold text-blue-900 text-sm mb-1 truncate dark:text-blue-300">{meeting.title}</div>
//           <div className="text-xs text-blue-600 mb-1 dark:text-blue-400">{meeting.start} - {meeting.end}</div>
//           <div className="text-xs text-gray-500 truncate dark:text-gray-400">
//             {meeting.assignee?.name}
//             {meeting.cc_members?.length > 0 && `, ${meeting.cc_members.map(m => m.name).join(', ')}`}
//           </div>
//         </div>
//       )}
//       <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/70 shadow-inner mr-2 dark:bg-gray-700/70 flex-shrink-0">
//         {meeting.icon}
//       </div>
//       <div className="flex flex-col flex-1 min-w-0">
//         <div className="font-bold truncate mb-1 text-base leading-tight text-blue-900 dark:text-blue-900 max-w-full">{meeting.title}</div>
//         <div className="text-xs opacity-80 font-medium text-blue-800 dark:text-blue-800">
//           <div className="truncate">{meeting.start}</div>
//           <div className="truncate">{meeting.end}</div>
//         </div>
//       </div>
//     </div>
//   );
// }


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
  // Smart text truncation based on meeting height
  const getDisplayTitle = () => {
    const maxLength = height < 70 ? 20 : height < 100 ? 30 : 50;
    return meeting.title.length > maxLength ? meeting.title.substring(0, maxLength) + '...' : meeting.title;
  };

  // Show time only if there's enough space
  const showTime = height >= 70;
  const showAssignee = height >= 90;

  // Determine card styling based on meeting ownership
  const isOwnMeeting = meeting.isMyMeeting;
  
  // Responsive sizing based on meeting height
  const isShortMeeting = height < 70;
  const isVeryShortMeeting = height < 50;
  
  const iconSize = isVeryShortMeeting ? 24 : isShortMeeting ? 28 : 36;
  const iconFontSize = isVeryShortMeeting ? 12 : isShortMeeting ? 14 : 16;
  const padding = isVeryShortMeeting ? '6px 8px' : isShortMeeting ? '8px 12px' : '12px 16px';
  
  const cardStyles = isOwnMeeting ? {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.25) 100%)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  } : {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.25) 100%)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  };

  const iconStyles = isOwnMeeting ? {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 1) 100%)',
    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  } : {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 1) 100%)',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  };

  const textColor = isOwnMeeting ? 'text-red-900 dark:text-red-100' : 'text-blue-900 dark:text-blue-100';
  const timeColor = isOwnMeeting ? 'text-red-800 dark:text-red-200' : 'text-blue-800 dark:text-blue-200';
  const assigneeColor = isOwnMeeting ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300';

  return (
    <div
      className={`absolute rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center gap-3 cursor-pointer backdrop-blur-md`}
      style={{
        top,
        height: height - 10,
        left: left + 'px',
        width: width + 'px',
        zIndex: 1,
        padding,
        ...cardStyles,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Enhanced Tooltip on hover */}
      {isHovered && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full bg-white/95 backdrop-blur-sm border shadow-xl rounded-xl px-4 py-3 min-w-[220px] max-w-[300px] z-50 animate-fade-in pointer-events-none dark:bg-gray-800/95 dark:border-gray-600"
             style={{
               borderColor: isOwnMeeting ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
               boxShadow: isOwnMeeting 
                 ? '0 20px 40px rgba(239, 68, 68, 0.15)' 
                 : '0 20px 40px rgba(59, 130, 246, 0.15)'
             }}>
          <div className={`font-semibold text-sm mb-2 break-words ${textColor}`}>
            {meeting.title}
          </div>
          <div className={`text-xs mb-2 ${timeColor}`}>
            {meeting.start} - {meeting.end}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="font-medium mb-1">Assignee: {meeting.assignee?.name || 'Unassigned'}</div>
            {meeting.cc_members?.length > 0 && (
              <div className="truncate">
                CC: {meeting.cc_members.map(m => m.name).join(', ')}
              </div>
            )}
            {meeting.department_name && (
              <div className={`font-medium ${isOwnMeeting ? 'text-red-500' : 'text-blue-500'}`}>
                {meeting.department_name}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Responsive Icon with gradient and glow */}
      <div 
        className="flex items-center justify-center rounded-xl flex-shrink-0 backdrop-blur-sm"
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          ...iconStyles,
        }}
      >
        <div className="text-white" style={{ 
          fontSize: `${iconFontSize}px`, 
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
        }}>
          {React.cloneElement(meeting.icon, { 
            className: `w-${Math.floor(iconFontSize * 0.6)} h-${Math.floor(iconFontSize * 0.6)}`,
            style: { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }
          })}
        </div>
      </div>
      
      {/* Content area with improved typography */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Title with smart truncation */}
        <div 
          className={`font-bold leading-tight truncate ${textColor}`}
          style={{ 
            fontSize: isVeryShortMeeting ? '10px' : isShortMeeting ? '11px' : '14px',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
          title={meeting.title}
        >
          {getDisplayTitle()}
        </div>
        
        {/* Time - only show if enough space */}
        {showTime && (
          <div className={`text-xs font-medium mt-1 ${timeColor}`}>
            <div className="truncate">{meeting.start}</div>
            <div className="truncate">{meeting.end}</div>
          </div>
        )}
        
        {/* Assignee - only show if enough space */}
        {showAssignee && meeting.assignee?.name && (
          <div className={`text-xs opacity-80 truncate mt-1 ${assigneeColor}`}>
            {meeting.assignee.name}
          </div>
        )}
      </div>
    </div>
  );
}