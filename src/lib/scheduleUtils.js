'use client';

// Schedule utilities and layout helpers

export const TIME_SLOTS = (() => {
  const slots = [];
  let hour = 17; // 5 PM
  let minute = 0;
  while (!(hour === 2 && minute === 30)) {
    const h = hour % 24;
    slots.push(`${h.toString().padStart(2, '0')}:${minute === 0 ? '00' : '30'}`);
    if (minute === 0) {
      minute = 30;
    } else {
      minute = 0;
      hour = (hour + 1) % 24;
    }
    // Stop at 2:00 AM
    if (h === 2 && minute === 0) break;
  }
  return slots;
})();

export const MEETING_BOX_WIDTH = 200; // px
export const MEETING_BOX_GAP = 16; // px

export const getSlotIndex = (time) => {
  const [h, m] = time.split(':').map(Number);
  let hour = h;
  // If hour is less than 5 (AM), treat as next day (e.g., 1 AM = 25)
  if (hour < 5) hour += 24;
  const base = 17; // 17:00 is slot 0
  return (hour - base) * 2 + (m === 30 ? 1 : 0);
};

export const meetingsOverlap = (meeting1, meeting2) => {
  const start1 = getSlotIndex(meeting1.start);
  const end1 = getSlotIndex(meeting1.end);
  const start2 = getSlotIndex(meeting2.start);
  const end2 = getSlotIndex(meeting2.end);
  return start1 < end2 && start2 < end1;
};

export const groupOverlappingMeetings = (allMeetings) => {
  const groups = [];
  const processed = new Set();
  allMeetings.forEach(meeting => {
    if (processed.has(meeting.id)) return;
    const group = [meeting];
    processed.add(meeting.id);
    let foundNew = true;
    while (foundNew) {
      foundNew = false;
      allMeetings.forEach(otherMeeting => {
        if (processed.has(otherMeeting.id)) return;
        const overlapsWithGroup = group.some(groupMeeting => meetingsOverlap(groupMeeting, otherMeeting));
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

export const calculateMeetingLayout = (meeting, allMeetings) => {
  const groups = groupOverlappingMeetings(allMeetings);
  const meetingGroup = groups.find(group => group.some(m => m.id === meeting.id));
  if (!meetingGroup) {
    return { left: 0, width: MEETING_BOX_WIDTH };
  }
  meetingGroup.sort((a, b) => getSlotIndex(a.start) - getSlotIndex(b.start));
  const position = meetingGroup.findIndex(m => m.id === meeting.id);
  const width = MEETING_BOX_WIDTH;
  const left = position * (MEETING_BOX_WIDTH + MEETING_BOX_GAP);
  return { left, width, totalOverlapping: meetingGroup.length };
};

export function getTodayDateString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

