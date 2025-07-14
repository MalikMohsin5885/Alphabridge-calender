'use client';

import React from 'react';
import { Plus, CalendarDays, User, Users, Clock, FileText, Pencil, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

const TIME_SLOTS = (() => {
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

const MEETING_BOX_WIDTH = 200; // px
const MEETING_BOX_GAP = 16; // px

const allUsers = [
  { id: 101, name: 'Ahmed Ali' },
  { id: 102, name: 'Sara Khan' },
  { id: 103, name: 'John Doe' },
  { id: 104, name: 'Emily Smith' },
];

const initialMeetings = [
  {
    id: 1,
    title: 'Team Sync',
    description: 'Daily team sync to discuss progress and blockers.',
    start: '19:30',
    end: '20:30',
    start_time: '2025-06-12T09:30:00',
    end_time: '2025-06-12T10:30:00',
    created_by: { id: 101, name: 'Ahmed Ali' },
    members: [
      { id: 101, name: 'Ahmed Ali' },
      { id: 102, name: 'Sara Khan' },
    ],
    color: 'from-blue-200 to-blue-100',
    text: 'text-blue-900',
    icon: <CalendarDays className="w-5 h-5 text-blue-500" />,
  },
  {
    id: 2,
    title: 'Client Call',
    description: 'Call with client to review project milestones.',
    start: '18:00',
    end: '20:30',
    start_time: '2025-06-12T11:00:00',
    end_time: '2025-06-12T12:30:00',
    created_by: { id: 102, name: 'Sara Khan' },
    members: [
      { id: 102, name: 'Sara Khan' },
      { id: 103, name: 'John Doe' },
    ],
    color: 'from-pink-200 to-pink-100',
    text: 'text-pink-900',
    icon: <CalendarDays className="w-5 h-5 text-pink-500" />,
  },
  {
    id: 3,
    title: 'Design Review',
    description: 'Review new design proposals and give feedback.',
    start: '00:30',
    end: '01:30',
    start_time: '2025-06-12T09:30:00',
    end_time: '2025-06-12T10:30:00',
    created_by: { id: 103, name: 'John Doe' },
    members: [
      { id: 101, name: 'Ahmed Ali' },
      { id: 103, name: 'John Doe' },
    ],
    color: 'from-green-200 to-green-100',
    text: 'text-green-900',
    icon: <CalendarDays className="w-5 h-5 text-green-500" />,
  },
  {
    id: 4,
    title: 'Planning Meeting',
    description: 'Sprint planning and task assignment.',
    start: '00:30',
    end: '01:30',
    start_time: '2025-06-12T11:30:00',
    end_time: '2025-06-12T12:30:00',
    created_by: { id: 101, name: 'Ahmed Ali' },
    members: [
      { id: 101, name: 'Ahmed Ali' },
      { id: 104, name: 'Emily Smith' },
    ],
    color: 'from-yellow-200 to-yellow-100',
    text: 'text-yellow-900',
    icon: <CalendarDays className="w-5 h-5 text-yellow-500" />,
  },
  {
    id: 5,
    title: 'Daily Standup',
    description: 'Quick daily standup for all team members.',
    start: '20:00',
    end: '21:00',
    start_time: '2025-06-12T10:00:00',
    end_time: '2025-06-12T11:00:00',
    created_by: { id: 104, name: 'Emily Smith' },
    members: [
      { id: 101, name: 'Ahmed Ali' },
      { id: 104, name: 'Emily Smith' },
    ],
    color: 'from-purple-200 to-purple-100',
    text: 'text-purple-900',
    icon: <CalendarDays className="w-5 h-5 text-purple-500" />,
  },
];

// Helper to get slot index from time string (now starting at 17:00)
const getSlotIndex = (time) => {
  const [h, m] = time.split(':').map(Number);
  // Calculate the slot index based on 17:00 as the start
  let hour = h;
  // If hour is less than 5 (AM), treat as next day (e.g., 1 AM = 25)
  if (hour < 5) hour += 24;
  const base = 17; // 17:00 is slot 0
  return (hour - base) * 2 + (m === 30 ? 1 : 0);
};

const meetingsOverlap = (meeting1, meeting2) => {
  const start1 = getSlotIndex(meeting1.start);
  const end1 = getSlotIndex(meeting1.end);
  const start2 = getSlotIndex(meeting2.start);
  const end2 = getSlotIndex(meeting2.end);
  return start1 < end2 && start2 < end1;
};

const groupOverlappingMeetings = (allMeetings) => {
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

const calculateMeetingLayout = (meeting, allMeetings) => {
  const groups = groupOverlappingMeetings(allMeetings);
  const meetingGroup = groups.find(group => group.some(m => m.id === meeting.id));
  if (!meetingGroup) {
    return { left: 0, width: MEETING_BOX_WIDTH };
  }
  meetingGroup.sort((a, b) => getSlotIndex(a.start) - getSlotIndex(b.start));
  const position = meetingGroup.findIndex(m => m.id === meeting.id);
  const totalOverlapping = meetingGroup.length;
  const width = MEETING_BOX_WIDTH;
  const left = position * (MEETING_BOX_WIDTH + MEETING_BOX_GAP);
  return { left, width, totalOverlapping };
};

export default function ScheduleRightSection() {
  const [meetings, setMeetings] = React.useState(initialMeetings);
  const [selectedMeeting, setSelectedMeeting] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editData, setEditData] = React.useState(null);
  const [hoveredMeetingId, setHoveredMeetingId] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const groups = groupOverlappingMeetings(meetings);
  const maxOverlapping = Math.max(...groups.map(group => group.length));
  const containerWidth = maxOverlapping > 1 ? (maxOverlapping * (MEETING_BOX_WIDTH + MEETING_BOX_GAP)) + 'px' : '100%';

  // Handle opening modal and optionally edit mode
  const openModal = (meeting) => {
    setSelectedMeeting(meeting);
    setEditMode(false);
    setEditData(null);
    setModalOpen(true);
  };

  // Handle edit button
  const startEdit = () => {
    setEditMode(true);
    setEditData({ ...selectedMeeting });
  };

  // Handle cancel edit
  const cancelEdit = () => {
    setEditMode(false);
    setEditData(null);
  };

  // Handle save edit
  const saveEdit = () => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === editData.id ? { ...editData } : m))
    );
    setSelectedMeeting({ ...editData });
    setEditMode(false);
    setEditData(null);
  };

  // Handle edit field change
  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle members multi-select
  const handleMembersChange = (userId) => {
    setEditData((prev) => {
      const exists = prev.members.some((m) => m.id === userId);
      let newMembers;
      if (exists) {
        newMembers = prev.members.filter((m) => m.id !== userId);
      } else {
        const user = allUsers.find((u) => u.id === userId);
        newMembers = [...prev.members, user];
      }
      return { ...prev, members: newMembers };
    });
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <div className="w-full h-full rounded-3xl border border-gray-100 bg-white/70 backdrop-blur-lg shadow-2xl p-0 flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)' }}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">12 June 2025</h3>
            <div className="text-sm text-gray-500 font-medium">Thursday</div>
          </div>
          <Button variant="default" size="sm" className="rounded-full flex items-center gap-2 shadow-md">
            <Plus className="w-4 h-4" /> Add Meeting
          </Button>
        </div>
        {/* Time grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
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
                      className={`absolute rounded-2xl border border-gray-200 p-4 shadow-lg bg-gradient-to-br ${meeting.color} ${meeting.text} transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl flex items-center gap-3 cursor-pointer`}
                      style={{ 
                        top, 
                        height: height - 10, // add a little gap between meetings
                        left: left + 'px',
                        width: width + 'px',
                        zIndex: 1,
                        boxShadow: '0 4px 16px 0 rgba(0,0,0,0.06)',
                      }}
                      onClick={() => openModal(meeting)}
                      onMouseEnter={() => setHoveredMeetingId(meeting.id)}
                      onMouseLeave={() => setHoveredMeetingId(null)}
                    >
                      {/* Tooltip on hover */}
                      {hoveredMeetingId === meeting.id && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full bg-white/90 border border-blue-100 shadow-lg rounded-xl px-4 py-2 min-w-[180px] z-50 animate-fade-in pointer-events-none">
                          <div className="font-semibold text-blue-900 text-sm mb-1 truncate">{meeting.title}</div>
                          <div className="text-xs text-blue-600 mb-1">{meeting.start} - {meeting.end}</div>
                          <div className="text-xs text-gray-500 truncate">{meeting.members?.map(m => m.name).join(', ')}</div>
                        </div>
                      )}
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/70 shadow-inner mr-2">
                        {meeting.icon}
                      </div>
                      <div className="flex flex-col">
                        <div className="font-bold truncate mb-1 text-base leading-tight">{meeting.title}</div>
                        <div className="text-xs opacity-80 font-medium">{meeting.start} - {meeting.end}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, #c7d2fe22 0%, transparent 70%)' }} />
      </div>
      {/* Meeting Details Modal */}
      <DialogContent>
        {selectedMeeting && !editMode && (
          <div>
            <DialogTitle className="flex items-center gap-2">
              {selectedMeeting.title}
              <Button size="icon" variant="ghost" className="ml-2" onClick={startEdit} aria-label="Edit meeting">
                <Pencil className="w-4 h-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-700">
                  {mounted ? new Date(selectedMeeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  {' - '}
                  {mounted ? new Date(selectedMeeting.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Created by: <span className="font-semibold">{selectedMeeting.created_by.name}</span></span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700">Members: {selectedMeeting.members.map(m => m.name).join(', ')}</span>
              </div>
              <div className="flex items-start gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400 mt-1" />
                <span className="text-gray-700 whitespace-pre-line">{selectedMeeting.description}</span>
              </div>
            </DialogDescription>
            <DialogClose>
              <Button variant="outline" className="mt-2 w-full">Close</Button>
            </DialogClose>
          </div>
        )}
        {selectedMeeting && editMode && (
          <div>
            <DialogTitle className="flex items-center gap-2">
              <input
                className="text-2xl font-bold mb-2 text-gray-800 bg-gray-100 rounded px-2 py-1 w-full"
                value={editData.title}
                onChange={e => handleEditChange('title', e.target.value)}
              />
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <input
                  type="datetime-local"
                  className="border rounded px-2 py-1 text-gray-700"
                  value={editData.start_time.slice(0,16)}
                  onChange={e => handleEditChange('start_time', e.target.value)}
                />
                <span>-</span>
                <input
                  type="datetime-local"
                  className="border rounded px-2 py-1 text-gray-700"
                  value={editData.end_time.slice(0,16)}
                  onChange={e => handleEditChange('end_time', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-green-500" />
                <select
                  className="border rounded px-2 py-1 text-gray-700"
                  value={editData.created_by.id}
                  onChange={e => handleEditChange('created_by', allUsers.find(u => u.id === Number(e.target.value)))}
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <div className="flex flex-wrap gap-2">
                  {allUsers.map(u => (
                    <label key={u.id} className="flex items-center gap-1 text-xs bg-gray-100 rounded px-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editData.members.find(m => m.id === u.id)}
                        onChange={() => handleMembersChange(u.id)}
                      />
                      {u.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400 mt-1" />
                <textarea
                  className="border rounded px-2 py-1 text-gray-700 w-full min-h-[60px]"
                  value={editData.description}
                  onChange={e => handleEditChange('description', e.target.value)}
                />
              </div>
            </DialogDescription>
            <div className="flex gap-2 mt-4">
              <Button variant="default" className="flex-1 flex items-center gap-2" onClick={saveEdit}>
                <Check className="w-4 h-4" /> Save
              </Button>
              <Button variant="outline" className="flex-1 flex items-center gap-2" onClick={cancelEdit}>
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}