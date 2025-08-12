const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function to convert time to HH:mm:ss format
const toTimeWithSeconds = (time) => {
  if (!time) return '';
  return time.length === 5 ? `${time}:00` : time;
};

// Fetch meetings for a specific date
export const fetchMeetings = async (selectedDate) => {
  const yyyy = selectedDate.getFullYear();
  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const dd = String(selectedDate.getDate()).padStart(2, '0');
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  
  const response = await fetch(`${API_BASE_URL}/meetings/?date=${formattedDate}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch meetings');
  }
  
  return response.json();
};

// Add a new meeting
export const addMeeting = async (meetingData) => {
  const payload = {
    title: meetingData.title,
    description: meetingData.description,
    date: meetingData.date,
    start_time: toTimeWithSeconds(meetingData.start_time),
    end_time: toTimeWithSeconds(meetingData.end_time),
    meeting_type: meetingData.meeting_type,
    department: meetingData.department,
    to_id: meetingData.assignee?.id,
    cc_ids: (meetingData.cc_members || []).map(m => m.id),
    remarks: meetingData.remarks || '',
    jd_link: meetingData.jd_link || '',
    resume_link: meetingData.resume_link || '',
  };

  const response = await fetch(`${API_BASE_URL}/meetings/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to add meeting');
  }

  return response.json();
};

// Edit an existing meeting
export const editMeeting = async (meetingId, meetingData) => {
  const payload = {
    title: meetingData.title,
    description: meetingData.description,
    date: meetingData.date,
    start_time: toTimeWithSeconds(meetingData.start_time),
    end_time: toTimeWithSeconds(meetingData.end_time),
    meeting_type: meetingData.meeting_type,
    department: meetingData.department,
    to_id: meetingData.assignee?.id,
    cc_ids: (meetingData.cc_members || []).map(m => m.id),
    remarks: meetingData.remarks || '',
    jd_link: meetingData.jd_link || '',
    resume_link: meetingData.resume_link || '',
  };

  console.log('Edit meeting payload:', payload); // Debug log
  
  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/edit`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Edit meeting error response:', errorText);
    throw new Error(`Failed to update meeting: ${response.status} ${response.statusText}`);
  }

  return response.json();
}; 

// Update meeting remarks
export const updateMeetingRemarks = async (meetingId, remarks) => {
  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/remarks/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ remarks }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update remarks error response:', errorText);
    throw new Error(`Failed to update meeting remarks: ${response.status} ${response.statusText}`);
  }

  return response.json();
}; 