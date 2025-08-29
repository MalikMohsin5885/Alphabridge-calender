"use client";

import React from "react";
import { CalendarDays, Clock } from "lucide-react";
import { fetchMeetings } from "../services/meetingService";
import { fetchDepartmentsAndUsers } from "../services/departmentService";

export default function ScheduleLeftBottomBox({ selectedDate }) {
  const [meetings, setMeetings] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [allDepartments, setAllDepartments] = React.useState([]);

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId) => {
    if (!departmentId || !Array.isArray(allDepartments)) {
      return "N/A";
    }

    let department = allDepartments.find((dep) => dep.id === departmentId);

    if (!department) {
      if (typeof departmentId === "string") {
        department = allDepartments.find(
          (dep) => dep.id === parseInt(departmentId)
        );
      } else if (typeof departmentId === "number") {
        department = allDepartments.find(
          (dep) => dep.id === departmentId.toString()
        );
      }
    }

    return department ? department.name : "N/A";
  };

  // Fetch departments on mount
  React.useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await fetchDepartmentsAndUsers();
        setAllDepartments(
          Array.isArray(data.departments) ? data.departments : []
        );
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setAllDepartments([]);
      }
    };

    loadDepartments();
  }, []);

  // Fetch meetings for the selected date
  React.useEffect(() => {
    if (
      !selectedDate ||
      !Array.isArray(allDepartments) ||
      allDepartments.length === 0
    ) {
      setMeetings([]);
      return;
    }

    const loadMeetings = async () => {
      setLoading(true);
      try {
        const data = await fetchMeetings(selectedDate);

        // Filter meetings to only include those matching the selected date
        const mappedMeetings = data
          .filter((meeting) => {
            if (!meeting.date || !meeting.start_time) return false;
            const meetingDate = new Date(
              `${meeting.date}T${meeting.start_time}`
            );
            return (
              meetingDate.getFullYear() === selectedDate.getFullYear() &&
              meetingDate.getMonth() === selectedDate.getMonth() &&
              meetingDate.getDate() === selectedDate.getDate()
            );
          })
          .map((meeting) => {
            const startDate = new Date(`${meeting.date}T${meeting.start_time}`);
            const endDate = new Date(`${meeting.date}T${meeting.end_time}`);
            const pad = (n) => n.toString().padStart(2, "0");
            const start = `${pad(startDate.getHours())}:${pad(
              startDate.getMinutes()
            )}`;
            const end = `${pad(endDate.getHours())}:${pad(
              endDate.getMinutes()
            )}`;

            // Extract assignee from to_participant
            const assignee = meeting.to_participant?.user || null;

            // Extract CC members from other_participants
            const ccMembers =
              meeting.other_participants?.map((p) => p.user) || [];

            return {
              id: meeting.id,
              title: meeting.title,
              time: `${start} - ${end}`,
              assignee: assignee?.name || "N/A",
              cc_members: ccMembers,
              meeting_type: meeting.meeting_type,
              department_name: getDepartmentName(meeting.department),
              color: "bg-blue-100 dark:bg-blue-900/30",
              icon: <CalendarDays className="w-5 h-5 text-blue-500" />,
            };
          });

        setMeetings(mappedMeetings);
      } catch (err) {
        console.error("Failed to fetch meetings:", err);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [selectedDate, allDepartments]);

  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime()))
      return "Today";
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col transition-all duration-300 hover:shadow-2xl dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2 dark:text-gray-100">
        <Clock className="w-5 h-5 text-blue-500" />
        {selectedDate
          ? `${formatDate(selectedDate)}'s Meetings`
          : "Today's Meetings"}
      </h3>
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              Loading meetings...
            </span>
          </div>
        ) : meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 shadow-sm ${meeting.color} transition-all duration-200 hover:scale-[1.02] dark:border-gray-600`}
            >
              <div>{meeting.icon}</div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-gray-800 text-sm truncate dark:text-gray-100">
                  {meeting.title}
                </span>
                <span className="text-xs text-gray-500 font-medium dark:text-gray-400">
                  {meeting.time}
                </span>
                <span className="text-xs text-gray-600 font-medium dark:text-gray-300">
                  Assignee: {meeting.assignee}
                </span>
                {meeting.cc_members.length > 0 && (
                  <span className="text-xs text-gray-600 font-medium dark:text-gray-300">
                    CC: {meeting.cc_members.map((m) => m.name).join(", ")}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-sm text-center mt-6 dark:text-gray-500">
            {selectedDate
              ? `No meetings on ${formatDate(selectedDate)}`
              : "No meetings today"}
          </div>
        )}
      </div>
    </div>
  );
}
