'use client';

import moment from 'moment-timezone';

// Schedule utilities and layout helpers

// export const TIME_SLOTS = (() => {
//   const slots = [];
//   let hour = 17; // 5 PM
//   let minute = 0;
//   while (!(hour === 2 && minute === 30)) {
//     const h = hour % 24;
//     const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
//     const ampm = h >= 12 ? 'PM' : 'AM';
//     slots.push(`${displayHour}:${minute === 0 ? '00' : '30'} ${ampm}`);
//     if (minute === 0) {
//       minute = 30;
//     } else {
//       minute = 0;
//       hour = (hour + 1) % 24;
//     }
//     // Stop at 2:00 AM
//     if (h === 2 && minute === 0) break;
//   }
//   return slots;
// })();
export const TIME_SLOTS = (() => {
  const slots = [];
  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? 0 : 30;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    slots.push(`${displayHour}:${minute === 0 ? '00' : '30'} ${ampm}`);
  }
  return slots;
})();

// export const TIME_SLOTS = (() => {
//   const slots = [];
//   for (let hour = 9; hour <= 17; hour++) {
//     for (let minute of [0, 30]) {
//       const h = hour % 24;
//       const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
//       const ampm = h >= 12 ? 'PM' : 'AM';
//       slots.push(`${displayHour}:${minute === 0 ? '00' : '30'} ${ampm}`);
//     }
//   }
//   return slots;
// })();

export const MEETING_BOX_WIDTH = 200; // px
export const MEETING_BOX_GAP = 16; // px

// export const getSlotIndex = (time) => {
//   const [h, m] = time.split(':').map(Number);
//   let hour = h;
//   // If hour is less than 5 (AM), treat as next day (e.g., 1 AM = 25)
//   if (hour < 5) hour += 24;
//   const base = 17; // 17:00 is slot 0
//   return (hour - base) * 2 + (m === 30 ? 1 : 0);
// };

// 

export const getSlotIndex = (time) => {
  // Supports "HH:mm" (24h) or "h:mm AM/PM"
  const m = String(time).trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
  if (!m) return 0;

  let hour = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  const ampm = m[3];

  // Convert to 24h
  if (ampm) {
    const up = ampm.toUpperCase();
    if (up === "PM" && hour !== 12) hour += 12;
    if (up === "AM" && hour === 12) hour = 0;
  }

  return hour * 2 + (minutes >= 30 ? 1 : 0);
};


export const meetingsOverlap = (meeting1, meeting2) => {
  const start1 = getSlotIndex(meeting1.start);
  const end1 = getSlotIndex(meeting1.end);
  const start2 = getSlotIndex(meeting2.start);
  const end2 = getSlotIndex(meeting2.end);
  // return start1 < end2 && start2 < end1 || start1 == start2 ;
  return (end1 == end2 ) ||(start1 == start2 ) || (start1 < end2 && start2 < end1);
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

// Convert PKT time to EST using moment-timezone (always EST, not EDT)
export const convertToEastern = (time, date) => {
  if (!time || !date) return '';
  
  try {
    // Parse the time and create a moment object in PKT timezone
    const [hours, minutes] = time.split(':').map(Number);
    
    // Ensure the date is in the correct format
    const formattedDate = moment(date).format('YYYY-MM-DD');
    
    // Create the date string in PKT timezone
    const pkDateTime = moment.tz(`${formattedDate} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`, 'Asia/Karachi');
    
    // Convert to EST (Eastern Standard Time, GMT-5) - always use EST, not EDT
    // const estDateTime = pkDateTime.clone().tz('America/New_York').utcOffset(-5);
    const estDateTime = pkDateTime.clone().tz('America/New_York').utcOffset(-4);
    // console.log(`EST TIME => ${estDateTime}\n\n`)
    
    // estDateTime = estDateTime.add(1, 'hour');
    // Format in 12-hour format
    return estDateTime.format('h:mm A');
  } catch (error) {
    console.error('Error converting timezone:', error);
    return '';
  }
};

export const convertToPakistanTime = (time, date) => {
  if (!time || !date) return '';

  try {
    // Parse the time
    const [hours, minutes] = time.split(':').map(Number);

    // Ensure date format
    const formattedDate = moment(date).format('YYYY-MM-DD');

    // Create a moment object in EST/New York time zone
    const estDateTime = moment.tz(
      `${formattedDate} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
      'America/New_York'
    );

    // Convert to Pakistan time (Asia/Karachi)
    const pkDateTime = estDateTime.clone().tz('Asia/Karachi');

    // Return formatted time in 12-hour format
    return pkDateTime.format('h:mm A');
  } catch (error) {
    console.error('Error converting timezone:', error);
    return '';
  }
};

// Convert PKT time to EST for time slots (always EST, not EDT)
export const convertSlotToEastern = (slot) => {
  if (!slot) return '';
  
  try {
    // Parse the 12-hour format time
    const [time, ampm] = slot.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format
    let hour24 = hours;
    if (ampm === 'PM' && hours !== 12) hour24 += 12;
    if (ampm === 'AM' && hours === 12) hour24 = 0;
    
    // Create moment object in PKT timezone (using today's date for conversion)
    const today = moment().format('YYYY-MM-DD');
    const pkDateTime = moment.tz(`${today} ${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`, 'Asia/Karachi');
    
    // Convert to EST (always GMT-5)
    // const estDateTime = pkDateTime.clone().tz('America/New_York').utcOffset(-5);
    const estDateTime = pkDateTime.clone().tz('America/New_York').utcOffset(-4);
    
    // Format in 12-hour format
    return estDateTime.format('h:mm A');
  } catch (error) {
    console.error('Error converting slot timezone:', error);
    return '';
  }
};

// Always return EST (Eastern Standard Time)
export const getEasternTimezoneAbbr = () => {
  return 'EST';
};

// Debug function to test timezone conversion
export const debugTimezoneConversion = () => {
  const testDate = '2025-01-15';
  const testTime = '17:00'; // 5:00 PM
  
  console.log('Testing timezone conversion:');
  console.log('PKT time:', testTime);
  console.log('Test date:', testDate);
  
  const pkDateTime = moment.tz(`${testDate} ${testTime}:00`, 'Asia/Karachi');
  console.log('PKT moment:', pkDateTime.format('YYYY-MM-DD HH:mm:ss Z'));
  
  const estDateTime = pkDateTime.clone().tz('America/New_York');
  console.log('EST moment:', estDateTime.format('YYYY-MM-DD HH:mm:ss Z'));
  
  console.log('PKT to EST:', convertToEastern(testTime, testDate));
  
  // Test with current date
  const currentDate = moment().format('YYYY-MM-DD');
  console.log('Current date test:', currentDate);
  console.log('Current date PKT to EST:', convertToEastern(testTime, currentDate));
  
  // Test manual calculation
  console.log('Manual calculation: PKT 17:00 should be EST 07:00 (10 hours difference)');
};

