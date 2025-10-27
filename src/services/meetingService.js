const API_BASE_URL = 'https://alphabridge-backend-34902771404.europe-west1.run.app/api';

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
    status: meetingData.status || 'scheduled',
    department: meetingData.department,
    to_id: meetingData.assignee?.id,
    cc_ids: (meetingData.cc_members || []).map(m => m.id),
    // remarks: meetingData.remarks || '',
    jd_link: meetingData.jd_link || '',
    resume_link: meetingData.resume_link || '',
  };

  const response = await fetch(`${API_BASE_URL}/meetings/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // try to parse error body for better message without exposing full stack
    let errBody = null;
    try {
      errBody = await response.json();
    } catch (e) {
      try {
        errBody = await response.text();
      } catch (e2) {
        errBody = null;
      }
    }

    // prefer a short message from backend (e.g., { detail: '...' } or {message:'...'})
    const backendMessage = errBody?.detail || errBody?.message || (typeof errBody === 'string' ? errBody : null);
    const message = backendMessage ? `${backendMessage}` : `Failed to add meeting: ${response.status} ${response.statusText}`;
    return { ok: false, message, status: response.status };
  }

  const data = await response.json();
  return { ok: true, data };
};
export const addRemark = async (meetingId, remarkText) => {
  const headers = getAuthHeaders();
  console.log("👉 Sending remark API call", {
    meetingId,
    remarkText,
    headers,
  });

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/remarks/`, {
  method: "POST",
  headers,
  body: JSON.stringify({ remark: remarkText }),
});


  if (!response.ok) {
    throw new Error(`Failed to save remark: ${response.statusText}`);
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
    status: meetingData.status || 'scheduled',
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

// Update only the status field of a meeting
export const updateMeetingStatus = async (meetingId, status) => {
  console.log('Calling updateMeetingStatus', { meetingId, status });
  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/edit`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  console.log('updateMeetingStatus response status', response.status);

  if (!response.ok) {
    // try to parse backend message
    let body = null;
    try { body = await response.json(); } catch (e) { try { body = await response.text(); } catch (e2) { body = null } }
    const backendMessage = body?.detail || body?.message || (typeof body === 'string' ? body : null);
    const message = backendMessage ? `${backendMessage}` : `Failed to update meeting status: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return response.json();
};