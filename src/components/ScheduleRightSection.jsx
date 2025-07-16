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

// Users will be fetched from the API

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

export default function ScheduleRightSection({ selectedDate }) {
  const [meetings, setMeetings] = React.useState([]);
  const [selectedMeeting, setSelectedMeeting] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editData, setEditData] = React.useState(null);
  const [hoveredMeetingId, setHoveredMeetingId] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [allUsers, setAllUsers] = React.useState([]);
  const [addForm, setAddForm] = React.useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    created_by: null,
    members: [],
  });

  // Fetch users from API on mount
  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://127.0.0.1:8000/api/users/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        setAllUsers(data);
        // Set default created_by for addForm if not set
        setAddForm(prev => ({ ...prev, created_by: data[0] || null }));
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setAllUsers([]);
      });
  }, []);

  React.useEffect(() => setMounted(true), []);

  // Fetch meetings for the selected date
  React.useEffect(() => {
    console.log('Selected date changed:', selectedDate); // Debug log
    if (!selectedDate) return;
    // Format date as YYYY-MM-DD
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    const token = localStorage.getItem('access_token');
    console.log('About to fetch:', `http://127.0.0.1:8000/api/meetings/?date=${formattedDate}`, 'with token:', token); // Debug log

    fetch(`http://127.0.0.1:8000/api/meetings/?date=${formattedDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        // Filter meetings to only include those matching the selected date
        const mappedMeetings = data
          .filter(meeting => {
            const meetingDate = new Date(meeting.start_time);
            return (
              meetingDate.getFullYear() === selectedDate.getFullYear() &&
              meetingDate.getMonth() === selectedDate.getMonth() &&
              meetingDate.getDate() === selectedDate.getDate()
            );
          })
          .map(meeting => {
            // Parse start and end time to HH:mm
            const startDate = new Date(meeting.start_time);
            const endDate = new Date(meeting.end_time);
            const pad = n => n.toString().padStart(2, '0');
            const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
            const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

            // Use ID as fallback for created_by
            return {
              ...meeting,
              start,
              end,
              created_by: typeof meeting.created_by === 'object' ? meeting.created_by : { id: meeting.created_by, name: `User ${meeting.created_by}` },
              color: 'from-blue-200 to-blue-100',
              text: 'text-blue-900',
              icon: <CalendarDays className="w-5 h-5 text-blue-500" />,
            };
          });
        console.log('Mapped meetings:', mappedMeetings); // Debug log
        setMeetings(mappedMeetings);
      })
      .catch(err => {
        console.error('Fetch error:', err); // Debug log
        setMeetings([]);
      });
  }, [selectedDate]);

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
        if (!user) return prev;
        newMembers = [...prev.members, user];
      }
      return { ...prev, members: newMembers };
    });
  };

  // Add Meeting form handlers
  const handleAddFormChange = (field, value) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleAddMembersChange = (userId) => {
    setAddForm((prev) => {
      const exists = prev.members.some((m) => m.id === userId);
      let newMembers;
      if (exists) {
        newMembers = prev.members.filter((m) => m.id !== userId);
      } else {
        const user = allUsers.find((u) => u.id === userId);
        if (!user) return prev;
        newMembers = [...prev.members, user];
      }
      return { ...prev, members: newMembers };
    });
  };

  // Helper to convert local datetime-local string to UTC ISO string
  function toUTCISOString(localDateTimeString) {
    if (!localDateTimeString) return '';
    const localDate = new Date(localDateTimeString);
    return localDate.toISOString();
  }

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    // Prepare the payload for the API
    const payload = {
      title: addForm.title,
      description: addForm.description,
      start_time: toUTCISOString(addForm.start_time),
      end_time: toUTCISOString(addForm.end_time),
      created_by: addForm.created_by?.id,
      member_ids: addForm.members.map(m => m.id),
    };
    try {
      const response = await fetch('http://127.0.0.1:8000/api/meetings/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to add meeting');
      // Optionally, you can get the created meeting from the response
      // const createdMeeting = await response.json();
      // Refetch meetings for the selected date
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;
      const meetingsRes = await fetch(`http://127.0.0.1:8000/api/meetings/?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await meetingsRes.json();
      const mappedMeetings = data
        .filter(meeting => {
          const meetingDate = new Date(meeting.start_time);
          return (
            meetingDate.getFullYear() === selectedDate.getFullYear() &&
            meetingDate.getMonth() === selectedDate.getMonth() &&
            meetingDate.getDate() === selectedDate.getDate()
          );
        })
        .map(meeting => {
          const startDate = new Date(meeting.start_time);
          const endDate = new Date(meeting.end_time);
          const pad = n => n.toString().padStart(2, '0');
          const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
          const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
          return {
            ...meeting,
            start,
            end,
            created_by: typeof meeting.created_by === 'object' ? meeting.created_by : { id: meeting.created_by, name: `User ${meeting.created_by}` },
            // Use members as returned by backend (should be array of user objects)
            color: 'from-blue-100 to-blue-50',
            text: 'text-blue-900',
            icon: <CalendarDays className="w-5 h-5 text-blue-500" />,
          };
        });
      setMeetings(mappedMeetings);
      setAddModalOpen(false);
      setAddForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        created_by: allUsers[0] || null,
        members: [],
      });
    } catch (err) {
      console.error('Failed to add meeting:', err);
      // Optionally show an error message to the user
    }
  };

  // Display the selected date at the top
  return (
    <div className="flex flex-col h-full w-full">
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <div className="w-full h-full rounded-3xl border border-gray-100 bg-white/70 backdrop-blur-lg shadow-2xl p-0 flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)' }}>
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
            <div>
              {selectedDate && (
                <>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </h3>
                  <div className="text-sm text-gray-500 font-medium">
                    {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
                  </div>
                </>
              )}
            </div>
            <Button variant="default" size="sm" className="rounded-full flex items-center gap-2 shadow-md" onClick={() => setAddModalOpen(true)}>
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
                    value={editData.created_by?.id || ''}
                    onChange={e => handleEditChange('created_by', allUsers.find(u => u.id === Number(e.target.value)))}
                  >
                    <option value="" disabled>Select creator...</option>
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
        {/* Add Meeting Modal */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent>
            <DialogTitle>Add New Meeting</DialogTitle>
            <form onSubmit={handleAddMeeting} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
                  value={addForm.title}
                  onChange={e => handleAddFormChange('title', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none min-h-[60px]"
                  value={addForm.description}
                  onChange={e => handleAddFormChange('description', e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
                    value={addForm.start_time}
                    onChange={e => handleAddFormChange('start_time', e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
                    value={addForm.end_time}
                    onChange={e => handleAddFormChange('end_time', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Members</label>
                {/* Selected members as chips */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {addForm.members.map((m) => (
                    <span key={m.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium shadow-sm">
                      {m.name}
                      <button
                        type="button"
                        className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                        onClick={() => handleAddFormChange('members', addForm.members.filter(mem => mem.id !== m.id))}
                        aria-label={`Remove ${m.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {/* Select for unselected members */}
                <select
                  className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
                  value=""
                  onChange={e => {
                    const userId = Number(e.target.value);
                    if (!userId) return;
                    const user = allUsers.find(u => u.id === userId);
                    if (user && !addForm.members.some(m => m.id === user.id)) {
                      handleAddFormChange('members', [...addForm.members, user]);
                    }
                  }}
                  disabled={allUsers.length === 0}
                >
                  <option value="">Select member...</option>
                  {allUsers.filter(u => !addForm.members.some(m => m.id === u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <Button type="submit" variant="default" className="flex-1">Add Meeting</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setAddModalOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Dialog>
    </div>
  );
}