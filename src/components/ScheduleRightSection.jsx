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
import { useUser } from '../context/UserContext';
import { fetchMeetings, addMeeting, editMeeting } from '../services/meetingService';
import { fetchDepartmentsAndUsers } from '../services/departmentService';

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
  const { user } = useUser();
  const [meetings, setMeetings] = React.useState([]);
  const [selectedMeeting, setSelectedMeeting] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editData, setEditData] = React.useState(null);
  const [hoveredMeetingId, setHoveredMeetingId] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [allUsers, setAllUsers] = React.useState([]);
  const [closers, setClosers] = React.useState([]);
  const [allDepartments, setAllDepartments] = React.useState([]);
  const [addForm, setAddForm] = React.useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    meeting_type: '',
    department: '', // department ID
    assignee: null, // main person
    cc_members: [], // array of users
    remarks: '', // general meeting remarks
    jd_link: '', // job description link
    resume_link: '', // resume link
  });

  // Fetch users and departments from API on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDepartmentsAndUsers();
        
        setAllUsers(Array.isArray(data.all_users) ? data.all_users : []);
        setClosers(Array.isArray(data.closers) ? data.closers : []);
        setAllDepartments(Array.isArray(data.departments) ? data.departments : []);
        setAddForm(prev => ({ ...prev, assignee: (Array.isArray(data.closers) && data.closers[0]) || null }));
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setAllUsers([]);
        setClosers([]);
        setAllDepartments([]);
      }
    };
    
    loadData();
  }, []);

  React.useEffect(() => setMounted(true), []);

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId) => {
    if (!departmentId || !Array.isArray(allDepartments)) return 'N/A';
    const department = allDepartments.find(dep => dep.id === departmentId);
    return department ? department.name : 'N/A';
  };

  // Fetch meetings for the selected date
  React.useEffect(() => {
    console.log('Selected date changed:', selectedDate); // Debug log
    if (!selectedDate) return;

    const loadMeetings = async () => {
      try {
        const data = await fetchMeetings(selectedDate);
        
        // Filter meetings to only include those matching the selected date
        const mappedMeetings = data
          .filter(meeting => {
            // Combine date and time for correct filtering
            const meetingDate = new Date(`${meeting.date}T${meeting.start_time}`);
            return (
              meetingDate.getFullYear() === selectedDate.getFullYear() &&
              meetingDate.getMonth() === selectedDate.getMonth() &&
              meetingDate.getDate() === selectedDate.getDate()
            );
          })
          .map(meeting => {
            // Combine date and time to create a proper Date object
            const startDate = new Date(`${meeting.date}T${meeting.start_time}`);
            const endDate = new Date(`${meeting.date}T${meeting.end_time}`);
            const pad = n => n.toString().padStart(2, '0');
            const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
            const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

            // Extract assignee (the participant with is_to: true)
            const assignee = meeting.participants?.find(p => p.is_to)?.user || null;
            
            // Extract CC members (participants with is_to: false)
            const ccMembers = meeting.participants?.filter(p => !p.is_to).map(p => p.user) || [];

            return {
              ...meeting,
              start,
              end,
              assignee,
              cc_members: ccMembers,
              meeting_type: meeting.meeting_type,
              department_name: getDepartmentName(meeting.department),
              created_by: { id: meeting.created_by, name: `User ${meeting.created_by}` },
              remarks: meeting.remarks || '',
              jd_link: meeting.jd_link || '',
              resume_link: meeting.resume_link || '',
              color: 'from-blue-200 to-blue-100',
              text: 'text-blue-900',
              icon: <CalendarDays className="w-5 h-5 text-blue-500" />,
            };
          });
        console.log('Mapped meetings:', mappedMeetings); // Debug log
        setMeetings(mappedMeetings);
      } catch (err) {
        console.error('Fetch error:', err); // Debug log
        setMeetings([]);
      }
    };

    loadMeetings();
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
  const handleEditMeeting = async () => {
    // Validation (reuse add meeting validation logic if needed)
    if (!editData.title || !editData.description || !editData.date || !editData.start_time || !editData.end_time || !editData.assignee) {
      alert('Please fill all fields and select an assignee.');
      return;
    }
    // Only allow times from 17:00 to 23:59 or 00:00 to 02:00
    function isAllowedTimeRange(time) {
      if (!time) return false;
      const [h, m] = time.split(':').map(Number);
      return (h >= 17 && h <= 23) || (h >= 0 && h <= 2);
    }
    if (!isAllowedTimeRange(editData.start_time) || !isAllowedTimeRange(editData.end_time)) {
      alert('Meetings can only be scheduled between 5:00 PM and 2:00 AM.');
      return;
    }
    // If date is today, start and end time must be after current time
    const todayStr = getTodayDateString();
    if (editData.date === todayStr) {
      const now = new Date();
      const nowH = now.getHours();
      const nowM = now.getMinutes();
      const [startH, startM] = editData.start_time.split(':').map(Number);
      const [endH, endM] = editData.end_time.split(':').map(Number);
      if (startH < nowH || (startH === nowH && startM <= nowM)) {
        alert('Start time must be after the current time.');
        return;
      }
      if (endH < nowH || (endH === nowH && endM <= nowM)) {
        alert('End time must be after the current time.');
        return;
      }
    }

    try {
      await editMeeting(editData.id, editData);
      
      // Refetch meetings for the selected date
      const data = await fetchMeetings(selectedDate);
      console.log('Fetched meetings data after edit:', data);
      const mappedMeetings = data
        .filter(meeting => {
          const meetingDate = new Date(`${meeting.date}T${meeting.start_time}`);
          return (
            meetingDate.getFullYear() === selectedDate.getFullYear() &&
            meetingDate.getMonth() === selectedDate.getMonth() &&
            meetingDate.getDate() === selectedDate.getDate()
          );
        })
        .map(meeting => {
          const startDate = new Date(`${meeting.date}T${meeting.start_time}`);
          const endDate = new Date(`${meeting.date}T${meeting.end_time}`);
          const pad = n => n.toString().padStart(2, '0');
          const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
          const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

          // Extract assignee (the participant with is_to: true)
          const assignee = meeting.participants?.find(p => p.is_to)?.user || null;
          
          // Extract CC members (participants with is_to: false)
          const ccMembers = meeting.participants?.filter(p => !p.is_to).map(p => p.user) || [];

          return {
            ...meeting,
            start,
            end,
            assignee,
            cc_members: ccMembers,
            meeting_type: meeting.meeting_type,
            department_name: getDepartmentName(meeting.department),
            created_by: { id: meeting.created_by, name: `User ${meeting.created_by}` },
            remarks: meeting.remarks || '',
            jd_link: meeting.jd_link || '',
            resume_link: meeting.resume_link || '',
            color: 'from-blue-200 to-blue-100',
            text: 'text-blue-900',
            icon: <CalendarDays className="w-5 h-5 text-blue-500" />,
          };
        });
      console.log('Mapped meetings after edit:', mappedMeetings);
      setMeetings(mappedMeetings);
      
      // Update the selectedMeeting with the updated meeting data
      const updatedMeeting = mappedMeetings.find(m => m.id === editData.id);
      console.log('Updated meeting found:', updatedMeeting);
      if (updatedMeeting) {
        setSelectedMeeting(updatedMeeting);
      }
      
      setEditMode(false);
      setEditData(null);
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to update meeting:', err);
      alert('Failed to update meeting.');
    }
  };

  // Handle edit field change
  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };



  // Add Meeting form handlers
  const handleAddFormChange = (field, value) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleAddCCMembersChange = (userId) => {
    setAddForm((prev) => {
      const exists = prev.cc_members.some((m) => m.id === userId);
      let newCC;
      if (exists) {
        newCC = prev.cc_members.filter((m) => m.id !== userId);
      } else {
        const user = allUsers.find((u) => u.id === userId);
        if (!user) return prev;
        newCC = [...prev.cc_members, user];
      }
      return { ...prev, cc_members: newCC };
    });
  };

  // Helper to convert local datetime-local string to UTC ISO string
  function toUTCISOString(localDateTimeString) {
    if (!localDateTimeString) return '';
    const localDate = new Date(localDateTimeString);
    return localDate.toISOString();
  }

  // Helper to get today's date in YYYY-MM-DD format
  function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    
    // Prevent selecting a date before today
    if (addForm.date < getTodayDateString()) {
      alert('You cannot select a date before today.');
      return;
    }
    // If date is today, start and end time must be after current time
    const todayStr = getTodayDateString();
    if (addForm.date === todayStr) {
      const now = new Date();
      const nowH = now.getHours();
      const nowM = now.getMinutes();
      const [startH, startM] = addForm.start_time.split(':').map(Number);
      const [endH, endM] = addForm.end_time.split(':').map(Number);
      // Check start time
      if (startH < nowH || (startH === nowH && startM <= nowM)) {
        alert('Start time must be after the current time.');
        return;
      }
      // Check end time
      if (endH < nowH || (endH === nowH && endM <= nowM)) {
        alert('End time must be after the current time.');
        return;
      }
    }

    try {
      await addMeeting(addForm);
      
      // Refetch meetings for the selected date
      const data = await fetchMeetings(selectedDate);
      const mappedMeetings = data
        .filter(meeting => {
          const meetingDate = new Date(`${meeting.date}T${meeting.start_time}`);
          return (
            meetingDate.getFullYear() === selectedDate.getFullYear() &&
            meetingDate.getMonth() === selectedDate.getMonth() &&
            meetingDate.getDate() === selectedDate.getDate()
          );
        })
        .map(meeting => {
          const startDate = new Date(`${meeting.date}T${meeting.start_time}`);
          const endDate = new Date(`${meeting.date}T${meeting.end_time}`);
          const pad = n => n.toString().padStart(2, '0');
          const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
          const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

          // Extract assignee (the participant with is_to: true)
          const assignee = meeting.participants?.find(p => p.is_to)?.user || null;
          
          // Extract CC members (participants with is_to: false)
          const ccMembers = meeting.participants?.filter(p => !p.is_to).map(p => p.user) || [];

          return {
            ...meeting,
            start,
            end,
            assignee,
            cc_members: ccMembers,
            meeting_type: meeting.meeting_type,
            department_name: getDepartmentName(meeting.department),
            created_by: { id: meeting.created_by, name: `User ${meeting.created_by}` },
            remarks: meeting.remarks || '',
            jd_link: meeting.jd_link || '',
            resume_link: meeting.resume_link || '',
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
        date: '',
        start_time: '',
        end_time: '',
        meeting_type: '',
        department: '',
        assignee: allUsers[0] || null,
        cc_members: [],
        remarks: '',
        jd_link: '',
        resume_link: '',
      });
    } catch (err) {
      console.error('Failed to add meeting:', err);
      alert('Failed to add meeting.');
    }
  };

  // Display the selected date at the top
  return (
    <div className="flex flex-col h-full w-full">
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <div className="w-full h-full rounded-3xl border border-gray-100 bg-white/70 backdrop-blur-lg shadow-2xl p-0 flex flex-col relative overflow-hidden dark:border-gray-700 dark:bg-gray-800/70 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm dark:bg-gray-800/80 dark:border-gray-700">
            <div>
              {selectedDate && (
                <>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {selectedDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </h3>
                  <div className="text-sm text-gray-500 font-medium dark:text-gray-400">
                    {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
                  </div>
                </>
              )}
            </div>
            {/* Only show Add Meeting button if user is not a Member */}
            {user?.role !== 'Member' && (
            <Button variant="default" size="sm" className="rounded-full flex items-center gap-2 shadow-md" onClick={() => setAddModalOpen(true)}>
              <Plus className="w-4 h-4" /> Add Meeting
            </Button>
            )}
          </div>
          {/* Time grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-[60px_1fr] relative" style={{ minHeight: '600px' }}>
              {/* Time slots */}
              <div className="flex flex-col">
                {TIME_SLOTS.map((slot, idx) => (
                  <div key={slot} className="h-12 flex items-start justify-end pr-2 text-xs text-gray-400 dark:text-gray-500">
                    {slot}
                  </div>
                ))}
              </div>
              {/* Meeting grid */}
              <div className="relative overflow-x-auto">
                <div style={{ width: containerWidth, minWidth: '100%' }}>
                  {/* Time slot lines */}
                  {TIME_SLOTS.map((slot, idx) => (
                    <div key={slot} className="h-12 border-t border-gray-200 w-full absolute left-0 dark:border-gray-700" style={{ top: `${idx * 48}px`, zIndex: 0 }} />
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
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full bg-white/90 border border-blue-100 shadow-lg rounded-xl px-4 py-2 min-w-[180px] z-50 animate-fade-in pointer-events-none dark:bg-gray-800/90 dark:border-gray-600">
                            <div className="font-semibold text-blue-900 text-sm mb-1 truncate dark:text-blue-300">{meeting.title}</div>
                            <div className="text-xs text-blue-600 mb-1 dark:text-blue-400">{meeting.start} - {meeting.end}</div>
                            <div className="text-xs text-gray-500 truncate dark:text-gray-400">
                              {meeting.assignee?.name}
                              {meeting.cc_members?.length > 0 && `, ${meeting.cc_members.map(m => m.name).join(', ')}`}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/70 shadow-inner mr-2 dark:bg-gray-700/70">
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
          <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-blue-200/10 to-transparent dark:from-gray-600/10" />
        </div>
        {/* Meeting Details Modal */}
        <DialogContent>
          {selectedMeeting && !editMode && (
            <div>
              <DialogTitle className="flex items-center gap-2">
                {selectedMeeting.title}
                {/* Only show edit button if user is not a Member */}
                {user?.role !== 'Member' && (
                  <Button size="icon" variant="ghost" className="ml-2" onClick={startEdit} aria-label="Edit meeting">
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {selectedMeeting.date ? new Date(selectedMeeting.date).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {mounted ? new Date(`${selectedMeeting.date}T${selectedMeeting.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    {' - '}
                    {mounted ? new Date(`${selectedMeeting.date}T${selectedMeeting.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Assignee: <span className="font-semibold">{selectedMeeting.assignee?.name || 'N/A'}</span></span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-700 dark:text-gray-300">CC: {selectedMeeting.cc_members?.map(m => m.name).join(', ') || 'None'}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Meeting Type: <span className="font-semibold">{selectedMeeting.meeting_type || 'N/A'}</span></span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Department: <span className="font-semibold">{selectedMeeting.department_name || 'N/A'}</span></span>
                </div>
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedMeeting.description}</span>
                </div>
                {selectedMeeting.remarks && (
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="w-4 h-4 text-orange-400 mt-1" />
                    <span className="text-gray-700 dark:text-gray-300">Remarks: <span className="whitespace-pre-line">{selectedMeeting.remarks}</span></span>
                  </div>
                )}
                {selectedMeeting.jd_link && (
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">Job Description: </span>
                    <a href={selectedMeeting.jd_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300">
                      View Link
                    </a>
                  </div>
                )}
                {selectedMeeting.resume_link && (
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-700 dark:text-gray-300">Resume: </span>
                    <a href={selectedMeeting.resume_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300">
                      View Link
                    </a>
                  </div>
                )}
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
                  className="text-2xl font-bold mb-2 text-gray-800 bg-gray-100 rounded px-2 py-1 w-full dark:text-gray-100 dark:bg-gray-700"
                  value={editData.title}
                  onChange={e => handleEditChange('title', e.target.value)}
                />
              </DialogTitle>
              <DialogDescription>
                <div className="flex gap-4 mb-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Date</label>
                    <input
                      type="date"
                      className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      value={editData.date}
                      onChange={e => handleEditChange('date', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Start Time</label>
                    <input
                      type="time"
                      className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      value={editData.start_time}
                      onChange={e => handleEditChange('start_time', e.target.value)}
                      required
                      min="17:00"
                      max="02:00"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">End Time</label>
                    <input
                      type="time"
                      className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      value={editData.end_time}
                      onChange={e => handleEditChange('end_time', e.target.value)}
                      required
                      min="17:00"
                      max="02:00"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mb-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Meeting Type</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      value={editData.meeting_type || ''}
                      onChange={e => handleEditChange('meeting_type', e.target.value)}
                      placeholder="Enter meeting type (e.g. W2)"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Department</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      value={editData.department || ''}
                      onChange={e => handleEditChange('department', e.target.value)}
                      required
                      disabled={allDepartments.length === 0}
                    >
                      <option value="">Select department...</option>
                      {allDepartments.map(dep => (
                        <option key={dep.id} value={dep.id}>{dep.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Assignee</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={editData.assignee?.id || ''}
                    onChange={e => {
                      const userId = Number(e.target.value);
                      const user = closers.find(u => u.id === userId) || allUsers.find(u => u.id === userId);
                      handleEditChange('assignee', user);
                    }}
                    required
                    disabled={closers.length === 0}
                  >
                    <option value="">Select assignee...</option>
                    {/* Include current assignee if not in closers */}
                    {editData.assignee && !closers.some(u => u.id === editData.assignee.id) && (
                      <option key={editData.assignee.id} value={editData.assignee.id}>
                        {editData.assignee.name} (Current)
                      </option>
                    )}
                    {closers
                      .filter(u => !editData.cc_members?.some(m => m.id === u.id))
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">CC Members</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editData.cc_members?.map((m) => (
                      <span key={m.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium shadow-sm dark:bg-blue-900/30 dark:text-blue-300">
                        {m.name}
                        <button
                          type="button"
                          className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => handleEditChange('cc_members', editData.cc_members.filter(mem => mem.id !== m.id))}
                          aria-label={`Remove ${m.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value=""
                    onChange={e => {
                      const userId = Number(e.target.value);
                      if (!userId) return;
                      const user = allUsers.find(u => u.id === userId);
                      if (user && !editData.cc_members?.some(m => m.id === user.id) && user.id !== editData.assignee?.id) {
                        handleEditChange('cc_members', [...(editData.cc_members || []), user]);
                      }
                    }}
                    disabled={allUsers.length === 0}
                  >
                    <option value="">Select CC member...</option>
                    {allUsers
                      .filter(u =>
                        !(editData.cc_members || []).some(m => m.id === u.id) &&
                        u.id !== editData.assignee?.id
                      )
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                </div>
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400 mt-1" />
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none min-h-[60px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={editData.description}
                    onChange={e => handleEditChange('description', e.target.value)}
                    placeholder="Meeting description"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Remarks</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none min-h-[60px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={editData.remarks || ''}
                    onChange={e => handleEditChange('remarks', e.target.value)}
                    placeholder="General meeting remarks from any participant"
                  />
                </div>
                <div className="flex gap-4 mb-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Job Description Link</label>
                    <input
                      type="url"
                      className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      value={editData.jd_link || ''}
                      onChange={e => handleEditChange('jd_link', e.target.value)}
                      placeholder="https://example.com/job-description"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Resume Link</label>
                    <input
                      type="url"
                      className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      value={editData.resume_link || ''}
                      onChange={e => handleEditChange('resume_link', e.target.value)}
                      placeholder="https://example.com/resume"
                    />
                  </div>
                </div>
              </DialogDescription>
              <div className="flex gap-2 mt-4">
                <Button variant="default" className="flex-1 flex items-center gap-2" onClick={handleEditMeeting}>
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
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Title</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={addForm.title}
                  onChange={e => handleAddFormChange('title', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Description</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none min-h-[60px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={addForm.description}
                  onChange={e => handleAddFormChange('description', e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={addForm.date}
                    onChange={e => handleAddFormChange('date', e.target.value)}
                    required
                    min={getTodayDateString()}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Start Time</label>
                  <input
                    type="time"
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={addForm.start_time}
                    onChange={e => handleAddFormChange('start_time', e.target.value)}
                    required
                    min="17:00"
                    max="02:00"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">End Time</label>
                  <input
                    type="time"
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={addForm.end_time}
                    onChange={e => handleAddFormChange('end_time', e.target.value)}
                    required
                    min="17:00"
                    max="02:00"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Meeting Type</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={addForm.meeting_type}
                    onChange={e => handleAddFormChange('meeting_type', e.target.value)}
                    placeholder="Enter meeting type (e.g. W2)"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Department</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={addForm.department}
                    onChange={e => handleAddFormChange('department', e.target.value)}
                    required
                    disabled={allDepartments.length === 0}
                  >
                    <option value="">Select department...</option>
                    {allDepartments.map(dep => (
                      <option key={dep.id} value={dep.id}>{dep.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Assignee</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={addForm.assignee?.id || ''}
                    onChange={e => {
                      const userId = Number(e.target.value);
                      const user = closers.find(u => u.id === userId);
                      handleAddFormChange('assignee', user);
                    }}
                    required
                    disabled={closers.length === 0}
                  >
                    <option value="">Select assignee...</option>
                    {closers
                      .filter(u => !addForm.cc_members.some(m => m.id === u.id))
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">CC Members</label>
                  {/* Selected CC members as chips */}
                  <div className="flex flex-wrap gap-2 mb-2 min-h-[38px] border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    {addForm.cc_members.length === 0 ? (
                      <span className="text-gray-400 text-sm self-center">No CC members selected</span>
                    ) : (
                      addForm.cc_members.map((m) => (
                        <span key={m.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium shadow-sm dark:bg-blue-900/30 dark:text-blue-300">
                          {m.name}
                          <button
                            type="button"
                            className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => handleAddFormChange('cc_members', addForm.cc_members.filter(mem => mem.id !== m.id))}
                            aria-label={`Remove ${m.name}`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  {/* Select for unselected CC members (exclude assignee) */}
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value=""
                    onChange={e => {
                      const userId = Number(e.target.value);
                      if (!userId) return;
                      const user = allUsers.find(u => u.id === userId);
                      // Prevent assignee from being added to CC
                      if (user && !addForm.cc_members.some(m => m.id === user.id) && user.id !== addForm.assignee?.id) {
                        handleAddFormChange('cc_members', [...addForm.cc_members, user]);
                      }
                    }}
                    disabled={allUsers.length === 0}
                  >
                    <option value="">Add CC member...</option>
                    {allUsers
                      .filter(u =>
                        !addForm.cc_members.some(m => m.id === u.id) &&
                        u.id !== addForm.assignee?.id
                      )
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Remarks</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none min-h-[60px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={addForm.remarks}
                  onChange={e => handleAddFormChange('remarks', e.target.value)}
                  placeholder="General meeting remarks from any participant"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Job Description Link</label>
                  <input
                    type="url"
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={addForm.jd_link}
                    onChange={e => handleAddFormChange('jd_link', e.target.value)}
                    placeholder="https://example.com/job-description"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Resume Link</label>
                  <input
                    type="url"
                    className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={addForm.resume_link}
                    onChange={e => handleAddFormChange('resume_link', e.target.value)}
                    placeholder="https://example.com/resume"
                  />
                </div>
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