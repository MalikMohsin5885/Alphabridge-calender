'use client';

import React from 'react';
import { Plus, CalendarDays, User, Users, Clock, FileText, Pencil, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useUser } from '../context/UserContext';
import { fetchMeetings, addMeeting, editMeeting, updateMeetingRemarks } from '../services/meetingService';
import { fetchDepartmentsAndUsers } from '../services/departmentService';
import MeetingBox from '@/components/schedule/MeetingBox';
import {
  TIME_SLOTS,
  MEETING_BOX_WIDTH,
  MEETING_BOX_GAP,
  getSlotIndex,
  groupOverlappingMeetings,
  calculateMeetingLayout,
  getTodayDateString,
  convertToEastern,
  convertSlotToEastern,
  getEasternTimezoneAbbr,
  debugTimezoneConversion,
} from '@/lib/scheduleUtils';

// Users will be fetched from the API

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
    jd_link: '', // job description link
    resume_link: '', // resume link
  });
  const [remarksEditMode, setRemarksEditMode] = React.useState(false);
  const [remarksText, setRemarksText] = React.useState('');
  const [savingRemarks, setSavingRemarks] = React.useState(false);

  // Fetch users and departments from API on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading departments and users...');
        const data = await fetchDepartmentsAndUsers();
        console.log('Fetched data:', data);
        
        setAllUsers(Array.isArray(data.all_users) ? data.all_users : []);
        setClosers(Array.isArray(data.closers) ? data.closers : []);
        setAllDepartments(Array.isArray(data.departments) ? data.departments : []);
        setAddForm(prev => ({ 
          ...prev, 
          assignee: user?.role === 'BD' ? null : ((Array.isArray(data.closers) && data.closers[0]) || null) 
        }));
        
        console.log('Set departments:', Array.isArray(data.departments) ? data.departments : []);
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
    console.log('getDepartmentName called with:', { 
      departmentId, 
      departmentIdType: typeof departmentId,
      allDepartments,
      allDepartmentsLength: allDepartments?.length 
    });
    
    if (!departmentId || !Array.isArray(allDepartments)) {
      console.log('Returning N/A because:', { departmentId, allDepartmentsLength: allDepartments?.length });
      return 'N/A';
    }
    
    // Try to find department by ID, handling both string and number types
    let department = allDepartments.find(dep => dep.id === departmentId);
    
    // If not found, try converting types
    if (!department) {
      if (typeof departmentId === 'string') {
        department = allDepartments.find(dep => dep.id === parseInt(departmentId));
      } else if (typeof departmentId === 'number') {
        department = allDepartments.find(dep => dep.id === departmentId.toString());
      }
    }
    
    console.log('Found department:', department);
    return department ? department.name : 'N/A';
  };

  // Fetch meetings for the selected date
  React.useEffect(() => {
    console.log('Selected date changed:', selectedDate); // Debug log
    if (!selectedDate) return;
    
    // Don't load meetings until departments are available
    if (!Array.isArray(allDepartments) || allDepartments.length === 0) {
      console.log('Departments not loaded yet, skipping meetings fetch');
      return;
    }

    const loadMeetings = async () => {
      try {
        const data = await fetchMeetings(selectedDate);
        
        // Filter meetings to only include those matching the selected date
        console.log('Raw meetings data:', data);
        console.log('All departments available:', allDepartments);
        
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
            console.log('Processing meeting:', meeting);
            console.log('Meeting department field:', meeting.department);
            
            // Combine date and time to create a proper Date object
            const startDate = new Date(`${meeting.date}T${meeting.start_time}`);
            const endDate = new Date(`${meeting.date}T${meeting.end_time}`);
            const pad = n => n.toString().padStart(2, '0');
            const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
            const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

            // Extract assignee from to_participant
            const assignee = meeting.to_participant?.user || null;
            
            // Extract CC members from other_participants
            const ccMembers = meeting.other_participants?.map(p => p.user) || [];

            // Check if current user is the assignee
            const isMyMeeting = assignee?.id === user?.id;
            
            return {
              ...meeting,
              start,
              end,
              assignee,
              cc_members: ccMembers,
              meeting_type: meeting.meeting_type,
              department_name: getDepartmentName(meeting.department),
              created_by: { id: meeting.created_by, name: ` ${meeting.created_by}` },
              remarks: meeting.remarks || '',
              jd_link: meeting.jd_link || '',
              resume_link: meeting.resume_link || '',
              color: isMyMeeting ? 'from-cyan-400 to-cyan-300' : 'from-blue-200 to-blue-100',
              icon: <CalendarDays className={`w-5 h-5 ${isMyMeeting ? 'text-white' : 'text-blue-500'}`} />,
              isMyMeeting,
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
  }, [selectedDate, allDepartments]);

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
    console.log('startEdit called, selectedMeeting:', selectedMeeting);
    setEditMode(true);
    // Map the display format back to edit format
    const editDataToSet = {
      ...selectedMeeting,
      // Ensure we have the correct time format for editing (HH:mm)
      start_time: selectedMeeting.start_time ? selectedMeeting.start_time.substring(0, 5) : selectedMeeting.start?.split(' ')[0],
      end_time: selectedMeeting.end_time ? selectedMeeting.end_time.substring(0, 5) : selectedMeeting.end?.split(' ')[0],
    };
    console.log('Setting editData:', editDataToSet);
    setEditData(editDataToSet);
  };

  // Handle cancel edit
  const cancelEdit = () => {
    setEditMode(false);
    setEditData(null);
  };

  // Handle save edit
  const handleEditMeeting = async () => {
    // Validation (reuse add meeting validation logic if needed)
    if (!editData.title || !editData.description || !editData.date || !editData.start_time || !editData.end_time) {
      toast.error('Please fill all required fields.');
      return;
    }
    // Only allow times from 17:00 to 23:59 or 00:00 to 02:00
    function isAllowedTimeRange(time) {
      if (!time) return false;
      const [h, m] = time.split(':').map(Number);
      return (h >= 17 && h <= 23) || (h >= 0 && h <= 2);
    }
    if (!isAllowedTimeRange(editData.start_time) || !isAllowedTimeRange(editData.end_time)) {
      toast.error('Meetings can only be scheduled between 5:00 PM and 2:00 AM.');
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
        toast.error('Start time must be after the current time.');
        return;
      }
      if (endH < nowH || (endH === nowH && endM <= nowM)) {
        toast.error('End time must be after the current time.');
        return;
      }
    }

    try {
      console.log('Editing meeting with data:', editData); // Debug log
      await editMeeting(editData.id, editData);
      
      // Refetch meetings for the selected date
      const data = await fetchMeetings(selectedDate);
      console.log('Fetched meetings data after edit:', data);
      console.log('All departments available during edit mapping:', allDepartments);
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
          console.log('Processing meeting during edit mapping:', meeting);
          console.log('Meeting department field during edit:', meeting.department);
          
          const startDate = new Date(`${meeting.date}T${meeting.start_time}`);
          const endDate = new Date(`${meeting.date}T${meeting.end_time}`);
          const pad = n => n.toString().padStart(2, '0');
          const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
          const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

          // Extract assignee from to_participant
          const assignee = meeting.to_participant?.user || null;
          
          // Extract CC members from other_participants
          const ccMembers = meeting.other_participants?.map(p => p.user) || [];

          // Check if current user is the assignee
          const isMyMeeting = assignee?.id === user?.id;
          
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
            color: isMyMeeting ? 'from-cyan-400 to-cyan-300' : 'from-blue-200 to-blue-100',
            icon: <CalendarDays className={`w-5 h-5 ${isMyMeeting ? 'text-white' : 'text-blue-500'}`} />,
            isMyMeeting,
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
      toast.success('Meeting updated successfully!');
    } catch (err) {
      console.error('Failed to update meeting:', err);
      console.error('Error details:', err.message);
      toast.error(`Failed to update meeting: ${err.message}`);
    }
  };

  // Handle edit field change
  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle saving remarks
  const handleSaveRemarks = async () => {
    if (!selectedMeeting || !remarksText.trim()) {
      toast.error('Please enter some remarks to save.');
      return;
    }

    setSavingRemarks(true);
    try {
      await updateMeetingRemarks(selectedMeeting.id, remarksText.trim());
      
      // Update the selected meeting with new remarks
      setSelectedMeeting(prev => ({
        ...prev,
        remarks: remarksText.trim()
      }));
      
      // Update the meeting in the meetings list
      setMeetings(prev => prev.map(meeting => 
        meeting.id === selectedMeeting.id 
          ? { ...meeting, remarks: remarksText.trim() }
          : meeting
      ));
      
      setRemarksEditMode(false);
      toast.success('Remarks saved successfully!');
    } catch (error) {
      console.error('Failed to save remarks:', error);
      toast.error(`Failed to save remarks: ${error.message}`);
    } finally {
      setSavingRemarks(false);
    }
  };

  // Handle starting remarks edit
  const startRemarksEdit = () => {
    setRemarksText(selectedMeeting?.remarks || '');
    setRemarksEditMode(true);
  };

  // Handle canceling remarks edit
  const cancelRemarksEdit = () => {
    setRemarksEditMode(false);
    setRemarksText('');
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
      toast.error('You cannot select a date before today.');
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
        toast.error('Start time must be after the current time.');
        return;
      }
      // Check end time
      if (endH < nowH || (endH === nowH && endM <= nowM)) {
        toast.error('End time must be after the current time.');
        return;
      }
    }

    try {
      await addMeeting(addForm);
      
      // Refetch meetings for the selected date
      const data = await fetchMeetings(selectedDate);
      console.log('Fetched meetings data after add:', data);
      console.log('All departments available during add mapping:', allDepartments);
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
          console.log('Processing meeting during add mapping:', meeting);
          console.log('Meeting department field during add:', meeting.department);
          
          const startDate = new Date(`${meeting.date}T${meeting.start_time}`);
          const endDate = new Date(`${meeting.date}T${meeting.end_time}`);
          const pad = n => n.toString().padStart(2, '0');
          const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
          const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

          // Extract assignee from to_participant
          const assignee = meeting.to_participant?.user || null;
          
          // Extract CC members from other_participants
          const ccMembers = meeting.other_participants?.map(p => p.user) || [];

          // Check if current user is the assignee
          const isMyMeeting = assignee?.id === user?.id;
          
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
            color: isMyMeeting ? 'from-cyan-400 to-cyan-300' : 'from-blue-200 to-blue-100',
            icon: <CalendarDays className={`w-5 h-5 ${isMyMeeting ? 'text-white' : 'text-blue-500'}`} />,
            isMyMeeting,
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
        assignee: user?.role === 'BD' ? null : (allUsers[0] || null),
        cc_members: [],
        jd_link: '',
        resume_link: '',
      });
      toast.success('Meeting created successfully!');
    } catch (err) {
      console.error('Failed to add meeting:', err);
      toast.error('Failed to add meeting.');
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
            {/* Only show Add Meeting button if user is not a Member, Closer, or Guest */}
            {user?.role !== 'Member' && user?.role !== 'Closer' && user?.role !== 'Guest' && (
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
                {/* Timezone labels at the top */}
                <div className="h-12 flex items-center justify-end pr-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <div className="text-right">
                    <div>PKT</div>
                    <div>{getEasternTimezoneAbbr()}</div>
                  </div>
                </div>
                
                {TIME_SLOTS.map((slot, idx) => {
                  // Convert slot time to EST using moment-timezone
                  const estTime = convertSlotToEastern(slot);
                  
                  return (
                    <div key={slot} className="h-12 flex items-center justify-end pr-2 text-xs text-gray-400 dark:text-gray-500">
                      <div className="text-right">
                        <div className="font-medium">{slot}</div>
                        <div className="opacity-70">{estTime}</div>
                      </div>
                    </div>
                  );
                })}
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
                    
                    // Convert times to EST for display
                    const estStart = convertToEastern(meeting.start, meeting.date);
                    const estEnd = convertToEastern(meeting.end, meeting.date);
                    
                    return (
                      <MeetingBox
                        key={meeting.id}
                        meeting={{
                          ...meeting,
                          start: `${meeting.start} (${estStart})`,
                          end: `${meeting.end} (${estEnd})`
                        }}
                        top={top}
                        left={left}
                        width={width}
                        height={height}
                        onClick={() => openModal(meeting)}
                        onMouseEnter={() => setHoveredMeetingId(meeting.id)}
                        onMouseLeave={() => setHoveredMeetingId(null)}
                        isHovered={hoveredMeetingId === meeting.id}
                      />
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
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 shadow-2xl">
          {selectedMeeting && !editMode && (
            <div className="relative">
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
              <div className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
              
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="truncate">{selectedMeeting.title}</span>
                      {selectedMeeting.assignee?.id === user?.id && (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full px-2 py-1 text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          Your Meeting
                        </span>
                      )}
                    </div>
                  </DialogTitle>
                  {/* Only show edit button if user is not a Member, Closer, or Guest */}
                  {user?.role !== 'Member' && user?.role !== 'Closer' && user?.role !== 'Guest' && (
                    <Button size="icon" variant="ghost" className="hover:bg-blue-100 dark:hover:bg-blue-900/30" onClick={startEdit} aria-label="Edit meeting">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Three Card Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                
                {/* Card 1: Schedule Details */}
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-blue-800 dark:text-blue-300">Schedule Details</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-3 text-center">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</div>
                      <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                        {selectedMeeting.date ? new Date(selectedMeeting.date).toLocaleDateString([], { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        }) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {selectedMeeting.date ? new Date(selectedMeeting.date).toLocaleDateString([], { 
                          year: 'numeric' 
                        }) : ''}
                      </div>
                    </div>
                    
                    <div className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-3 text-center">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time (PKT)</div>
                      <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                        {mounted ? new Date(`${selectedMeeting.date}T${selectedMeeting.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    {' - '}
                    {mounted ? new Date(`${selectedMeeting.date}T${selectedMeeting.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {getEasternTimezoneAbbr()}: {convertToEastern(selectedMeeting.start, selectedMeeting.date)} - {convertToEastern(selectedMeeting.end, selectedMeeting.date)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Meeting Details */}
                <div className="bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 rounded-2xl p-4 border border-green-200/50 dark:border-green-700/50 shadow-lg">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <CalendarDays className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-green-800 dark:text-green-300">Meeting Details</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Lead Type</div>
                      <div className="text-base font-bold text-gray-800 dark:text-gray-200">{selectedMeeting.meeting_type || 'N/A'}</div>
                    </div>
                    
                    <div className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Department</div>
                      <div className="text-base font-bold text-gray-800 dark:text-gray-200">{selectedMeeting.department_name || 'N/A'}</div>
                    </div>
                    
                    <div className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Created by</div>
                      <div className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        {selectedMeeting.created_by?.name || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Participants & Other Details */}
                <div className="bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-800/30 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-purple-800 dark:text-purple-300">Participants & More</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Primary Assignee</div>
                      <div className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {selectedMeeting.assignee?.name || 'N/A'}

                      </div>
                    </div>
                    
                    <div className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">CC Members</div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {selectedMeeting.cc_members?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedMeeting.cc_members.map((m, index) => (
                              <span key={m.id} className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 rounded-full px-2 py-1 text-xs font-medium dark:from-pink-900/30 dark:to-purple-900/30 dark:text-pink-300">
                                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                                {m.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">None</span>
                        )}
                      </div>
                    </div>
                    
                    {(selectedMeeting.jd_link || selectedMeeting.resume_link) && (
                      <div className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-3">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Resources</div>
                        <div className="space-y-2">
                          {selectedMeeting.jd_link && (
                            <a 
                              href={selectedMeeting.jd_link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block text-purple-600 hover:text-purple-800 underline font-medium dark:text-purple-400 dark:hover:text-purple-300 text-sm"
                            >
                              📄 Job Description
                            </a>
                          )}
                          {selectedMeeting.resume_link && (
                            <a 
                              href={selectedMeeting.resume_link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block text-purple-600 hover:text-purple-800 underline font-medium dark:text-purple-400 dark:hover:text-purple-300 text-sm"
                            >
                              📋 Resume
                            </a>
                          )}
                </div>
                </div>
                    )}
                </div>
                </div>
              </div>

              {/* Description & Remarks Section */}
              <div className="space-y-4">
                {/* Description */}
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-100/50 dark:border-gray-700/50">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 dark:text-gray-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Description
                  </label>
                  <div className="bg-white/80 dark:bg-gray-700/80 rounded-lg p-4">
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {selectedMeeting.description || 'No description provided.'}
                    </div>
                  </div>
                </div>
                
                {/* Remarks Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800/60 dark:to-gray-700/60 rounded-xl p-4 border border-yellow-100/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-yellow-500" />
                      Meeting Remarks
                    </label>
                      {!remarksEditMode && (user?.role === 'Member' || user?.role === 'Closer') && user?.role !== 'Guest' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={startRemarksEdit}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {remarksEditMode ? (
                    <div className="space-y-3">
                        <textarea
                        className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-3 text-gray-700 focus:ring-2 focus:ring-yellow-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100 placeholder-gray-400 min-h-[80px] resize-none"
                          value={remarksText}
                          onChange={(e) => setRemarksText(e.target.value)}
                          placeholder="Enter meeting remarks..."
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default" 
                            onClick={handleSaveRemarks}
                            disabled={savingRemarks}
                          className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                          >
                            {savingRemarks ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={cancelRemarksEdit}
                            disabled={savingRemarks}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                    <div className="bg-white/80 dark:bg-gray-700/80 rounded-lg p-4">
                      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                        {selectedMeeting.remarks || 'No remarks added yet.'}
                  </div>
                  </div>
                )}
                  </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
              <DialogClose>
                  <Button 
                    variant="outline" 
                    className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:text-gray-800 font-semibold px-6 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500"
                  >
                    Close
                  </Button>
              </DialogClose>
              </div>
            </div>
          )}
          {selectedMeeting && editMode && editData && (
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
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Lead Type</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      value={editData.meeting_type || ''}
                      onChange={e => handleEditChange('meeting_type', e.target.value)}
                      required
                    >
                      <option value="">Select lead type...</option>
                      <option value="W2">W2 (Permanent)</option>
                      <option value="10.99">10.99 (Contract)</option>
                      <option value="C2C">C2C (Contract)</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Department</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      value={editData.department || ''}
                      onChange={e => handleEditChange('department', Number(e.target.value))}
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
                      const user = allUsers.find(u => u.id === userId);
                      handleEditChange('assignee', user);
                    }}
                    disabled={allUsers.length === 0}
                  >
                    <option value="">Select assignee (optional)...</option>
                    {/* Include current assignee if not in allUsers */}
                    {editData.assignee && !allUsers.some(u => u.id === editData.assignee.id) && (
                      <option key={editData.assignee.id} value={editData.assignee.id}>
                        {editData.assignee.name} (Current)
                      </option>
                    )}
                    {allUsers
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
          <DialogContent className="max-h-[85vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 shadow-2xl">
            <div className="relative">
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
              <div className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
              
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                Schedule New Meeting
              </DialogTitle>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create a new meeting with all the details</p>
            </div>
            
            <form onSubmit={handleAddMeeting} className="space-y-6">
              {/* Meeting Title Section */}
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-blue-100/50 dark:border-gray-700/50 backdrop-blur-sm">
                <label className="block text-sm font-semibold text-gray-800 mb-2 dark:text-gray-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Meeting Title
                </label>
                <input
                  className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100 placeholder-gray-400"
                  value={addForm.title}
                  onChange={e => handleAddFormChange('title', e.target.value)}
                  placeholder="Enter meeting title..."
                  required
                />
              </div>

              {/* Meeting Description Section */}
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-blue-100/50 dark:border-gray-700/50 backdrop-blur-sm">
                <label className="block text-sm font-semibold text-gray-800 mb-2 dark:text-gray-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Description
                </label>
                <textarea
                  className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100 placeholder-gray-400 min-h-[80px] resize-none"
                  value={addForm.description}
                  onChange={e => handleAddFormChange('description', e.target.value)}
                  placeholder="Describe the meeting agenda and objectives..."
                  required
                />
              </div>
              {/* Date & Time Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800/60 dark:to-gray-700/60 rounded-xl p-4 border border-blue-100/50 dark:border-gray-700/50">
                <label className="block text-sm font-semibold text-gray-800 mb-3 dark:text-gray-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Schedule Details
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">Date</label>
                  <input
                    type="date"
                      className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100"
                    value={addForm.date}
                    onChange={e => handleAddFormChange('date', e.target.value)}
                    required
                    min={getTodayDateString()}
                  />
                </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">Start Time</label>
                  <input
                    type="time"
                      className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100"
                    value={addForm.start_time}
                    onChange={e => handleAddFormChange('start_time', e.target.value)}
                    required
                    min="17:00"
                    max="02:00"
                  />
                </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">End Time</label>
                  <input
                    type="time"
                      className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100"
                    value={addForm.end_time}
                    onChange={e => handleAddFormChange('end_time', e.target.value)}
                    required
                    min="17:00"
                    max="02:00"
                  />
                </div>
              </div>
              </div>
              {/* Meeting Type & Department Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800/60 dark:to-gray-700/60 rounded-xl p-4 border border-green-100/50 dark:border-gray-700/50">
                <label className="block text-sm font-semibold text-gray-800 mb-3 dark:text-gray-200 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-green-500" />
                  Meeting Configuration
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">Lead Type</label>
                  <select
                      className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-green-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100"
                    value={addForm.meeting_type}
                    onChange={e => handleAddFormChange('meeting_type', e.target.value)}
                    required
                  >
                      <option value="">Select lead type...</option>
                    <option value="W2">W2 (Permanent)</option>
                    <option value="10.99">10.99 (Contract)</option>
                    <option value="C2C">C2C (Contract)</option>
                  </select>
                </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">Department</label>
                  <select
                      className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-green-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100"
                    value={addForm.department}
                    onChange={e => handleAddFormChange('department', Number(e.target.value))}
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
              </div>
              {/* Participants Section */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-800/60 dark:to-gray-700/60 rounded-xl p-4 border border-orange-100/50 dark:border-gray-700/50">
                <label className="block text-sm font-semibold text-gray-800 mb-3 dark:text-gray-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  Meeting Participants
                </label>
                <div className={`grid gap-4 ${user?.role === 'BD' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {user?.role !== 'BD' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">Primary Assignee</label>
                    <select
                        className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-orange-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100"
                      value={addForm.assignee?.id || ''}
                      onChange={e => {
                        const userId = Number(e.target.value);
                        const user = allUsers.find(u => u.id === userId);
                        handleAddFormChange('assignee', user);
                      }}
                      disabled={allUsers.length === 0}
                    >
                        <option value="">Select primary assignee...</option>
                      {allUsers
                        .filter(u => !addForm.cc_members.some(m => m.id === u.id))
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                  </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">CC Members</label>
                  {/* Selected CC members as chips */}
                    <div className="flex flex-wrap gap-2 mb-2 min-h-[42px] border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-2 shadow-sm">
                    {addForm.cc_members.length === 0 ? (
                      <span className="text-gray-400 text-sm self-center">No CC members selected</span>
                    ) : (
                      addForm.cc_members.map((m) => (
                          <span key={m.id} className="flex items-center gap-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 rounded-full px-3 py-1 text-xs font-medium shadow-sm dark:from-pink-900/30 dark:to-purple-900/30 dark:text-pink-300">
                          {m.name}
                          <button
                            type="button"
                              className="ml-1 text-pink-500 hover:text-pink-700 focus:outline-none dark:text-pink-400 dark:hover:text-pink-300"
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
                      className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-orange-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100"
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
              </div>

              {/* Links Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-gray-800/60 dark:to-gray-700/60 rounded-xl p-4 border border-indigo-100/50 dark:border-gray-700/50">
                <label className="block text-sm font-semibold text-gray-800 mb-3 dark:text-gray-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Additional Resources
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">Job Description Link</label>
                  <input
                    type="url"
                      className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100 placeholder-gray-400"
                    value={addForm.jd_link}
                    onChange={e => handleAddFormChange('jd_link', e.target.value)}
                    placeholder="https://example.com/job-description"
                  />
                </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">Resume Link</label>
                  <input
                    type="url"
                      className="w-full border-0 bg-white/80 dark:bg-gray-700/80 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-200 shadow-sm dark:text-gray-100 placeholder-gray-400"
                    value={addForm.resume_link}
                    onChange={e => handleAddFormChange('resume_link', e.target.value)}
                    placeholder="https://example.com/resume"
                  />
                </div>
              </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  variant="default" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-800 font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500" 
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Dialog>
      <Toaster />
    </div>
  );
}