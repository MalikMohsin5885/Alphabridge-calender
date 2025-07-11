import React from 'react';

const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = 9 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const MEETING_BOX_WIDTH = 200; // px
const MEETING_BOX_GAP = 12; // px

// Sample meetings with improved, light, aesthetic colors
const meetings = [
  {
    id: 1,
    title: 'Team Sync',
    start: '09:30',
    end: '10:30',
    color: 'bg-blue-100 border-blue-300',
    text: 'text-blue-900',
  },
  {
    id: 2,
    title: 'Client Call',
    start: '11:00',
    end: '12:30',
    color: 'bg-pink-100 border-pink-300',
    text: 'text-pink-900',
  },
  {
    id: 3,
    title: 'Design Review',
    start: '09:30',
    end: '10:30',
    color: 'bg-green-100 border-green-300',
    text: 'text-green-900',
  },
  {
    id: 4,
    title: 'Planning Meeting',
    start: '11:30',
    end: '12:30',
    color: 'bg-yellow-100 border-yellow-300',
    text: 'text-yellow-900',
  },
  {
    id: 5,
    title: 'Daily Standup',
    start: '10:00',
    end: '11:00',
    color: 'bg-purple-100 border-purple-300',
    text: 'text-purple-900',
  },
];

// Helper to get slot index from time string
const getSlotIndex = (time) => {
  const [h, m] = time.split(':').map(Number);
  return (h - 9) * 2 + (m === 30 ? 1 : 0);
};

// Helper to check if two meetings overlap
const meetingsOverlap = (meeting1, meeting2) => {
  const start1 = getSlotIndex(meeting1.start);
  const end1 = getSlotIndex(meeting1.end);
  const start2 = getSlotIndex(meeting2.start);
  const end2 = getSlotIndex(meeting2.end);
  
  return start1 < end2 && start2 < end1;
};

// Helper to group overlapping meetings
const groupOverlappingMeetings = (allMeetings) => {
  const groups = [];
  const processed = new Set();

  allMeetings.forEach(meeting => {
    if (processed.has(meeting.id)) return;

    const group = [meeting];
    processed.add(meeting.id);

    // Find all meetings that overlap with any meeting in this group
    let foundNew = true;
    while (foundNew) {
      foundNew = false;
      allMeetings.forEach(otherMeeting => {
        if (processed.has(otherMeeting.id)) return;
        
        const overlapsWithGroup = group.some(groupMeeting => 
          meetingsOverlap(groupMeeting, otherMeeting)
        );
        
        if (overlapsWithGroup) {
          group.push(otherMeeting);
          processed.add(otherMeeting.id);
          foundNew = true;
        }
      });
    }

    groups.push(group);
  });

  return groups;
};

// Helper to calculate position and width for overlapping meetings (pixel-based)
const calculateMeetingLayout = (meeting, allMeetings) => {
  const groups = groupOverlappingMeetings(allMeetings);
  
  // Find which group this meeting belongs to
  const meetingGroup = groups.find(group => 
    group.some(m => m.id === meeting.id)
  );
  
  if (!meetingGroup) {
    return { left: 0, width: MEETING_BOX_WIDTH };
  }
  
  // Sort group by start time to determine order
  meetingGroup.sort((a, b) => getSlotIndex(a.start) - getSlotIndex(b.start));
  
  // Find position in the group
  const position = meetingGroup.findIndex(m => m.id === meeting.id);
  const totalOverlapping = meetingGroup.length;
  
  const width = MEETING_BOX_WIDTH;
  const left = position * (MEETING_BOX_WIDTH + MEETING_BOX_GAP);
  
  return { left, width, totalOverlapping };
};

export default function ScheduleRightSection() {
  const groups = groupOverlappingMeetings(meetings);
  const maxOverlapping = Math.max(...groups.map(group => group.length));
  const containerWidth = maxOverlapping > 1 ? (maxOverlapping * (MEETING_BOX_WIDTH + MEETING_BOX_GAP)) + 'px' : '100%';

  return (
    <div className="w-full h-full bg-green-50 rounded-lg p-4 border flex flex-col">
      <h3 className="text-lg font-semibold mb-2">12 June 2025</h3>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_1fr] relative" style={{ minHeight: '600px' }}>
          {/* Time slots */}
          <div className="flex flex-col">
            {TIME_SLOTS.map((slot, idx) => (
              <div key={slot} className="h-12 flex items-start justify-end pr-2 text-xs text-gray-400">
                {slot}
              </div>
            ))}
          </div>
          {/* Meeting grid */}
          <div className="relative overflow-x-auto">
            <div style={{ width: containerWidth, minWidth: '100%' }}>
              {/* Time slot lines */}
              {TIME_SLOTS.map((slot, idx) => (
                <div key={slot} className="h-12 border-t border-gray-200 w-full absolute left-0" style={{ top: `${idx * 48}px`, zIndex: 0 }} />
              ))}
              {/* Meeting boxes */}
              {meetings.map((meeting) => {
                const top = getSlotIndex(meeting.start) * 48;
                const height = (getSlotIndex(meeting.end) - getSlotIndex(meeting.start)) * 48;
                const { left, width, totalOverlapping } = calculateMeetingLayout(meeting, meetings);
                
                return (
                  <div
                    key={meeting.id}
                    className={`absolute rounded-2xl border p-3 shadow-sm ${meeting.color} ${meeting.text} transition-all duration-200`}
                    style={{ 
                      top, 
                      height: height - 8, // add a little gap between meetings
                      left: left + 'px',
                      width: width + 'px',
                      zIndex: 1,
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div className="font-semibold truncate mb-1 text-base leading-tight">{meeting.title}</div>
                    <div className="text-xs opacity-70 font-medium">{meeting.start} - {meeting.end}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}