"use client";
import withPrivateRoute from "../../components/withPrivateRoute";
import React from 'react';
import { CalendarDays, Users, UserCheck, Clock, Activity, CheckCircle, PhoneCall } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

const stats = [
  {
    label: 'Total Meetings',
    value: 42,
    icon: <CalendarDays className="w-7 h-7 text-blue-500" />,
    bg: 'bg-blue-50',
  },
  {
    label: 'Upcoming Meetings',
    value: 5,
    icon: <Clock className="w-7 h-7 text-green-500" />,
    bg: 'bg-green-50',
  },
  {
    label: 'Total Users',
    value: 18,
    icon: <Users className="w-7 h-7 text-purple-500" />,
    bg: 'bg-purple-50',
  },
  {
    label: 'Active Members',
    value: 12,
    icon: <UserCheck className="w-7 h-7 text-yellow-500" />,
    bg: 'bg-yellow-50',
  },
];

const users = [
  { id: 101, name: 'Ahmed Ali' },
  { id: 102, name: 'Sara Khan' },
  { id: 103, name: 'John Doe' },
  { id: 104, name: 'Emily Smith' },
];

const callStats = [
  { userId: 101, placed: 12, received: 8 },
  { userId: 102, placed: 7, received: 14 },
  { userId: 103, placed: 15, received: 10 },
  { userId: 104, placed: 5, received: 12 },
];

const activityFeed = [
  { id: 1, icon: <Activity className="w-5 h-5 text-blue-500" />, text: 'Ahmed Ali created a new meeting', time: '2 min ago' },
  { id: 2, icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: 'Sara Khan joined the project', time: '10 min ago' },
  { id: 3, icon: <PhoneCall className="w-5 h-5 text-purple-500" />, text: 'John Doe placed a call', time: '30 min ago' },
  { id: 4, icon: <Activity className="w-5 h-5 text-yellow-500" />, text: 'Emily Smith updated a meeting', time: '1 hr ago' },
];

const recentMeetings = [
  { id: 1, title: 'Team Sync', time: 'Today, 5:00 PM', members: ['Ahmed Ali', 'Sara Khan'] },
  { id: 2, title: 'Client Call', time: 'Today, 6:00 PM', members: ['Sara Khan', 'John Doe'] },
  { id: 3, title: 'Design Review', time: 'Yesterday, 11:00 PM', members: ['Ahmed Ali', 'John Doe'] },
  { id: 4, title: 'Planning Meeting', time: 'Yesterday, 8:00 PM', members: ['Emily Smith', 'Ahmed Ali'] },
];

function DashboardPage() {
  const [selectedUser, setSelectedUser] = React.useState(users[0].id);
  const userStats = callStats.find((c) => c.userId === selectedUser) || { placed: 0, received: 0 };
  const chartData = [
    { name: 'Placed', value: userStats.placed },
    { name: 'Received', value: userStats.received },
  ];

  return (
    <div className="p-6 mt-20 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`flex items-center gap-4 p-5 rounded-2xl shadow-lg border border-gray-100 ${stat.bg} transition-all hover:scale-[1.03] hover:shadow-2xl`}
          >
            <div className="flex items-center justify-center rounded-xl bg-white/80 shadow-inner p-2">
              {stat.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-800">{stat.value}</span>
              <span className="text-gray-500 text-xs font-medium">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Main Grid: Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart */}
        <div className="col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">User Call Stats</h2>
            <select
              className="border rounded-lg px-3 py-2 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
              value={selectedUser}
              onChange={e => setSelectedUser(Number(e.target.value))}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 14, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 14 }}
                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
              />
              <Legend wrapperStyle={{ fontSize: 14 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Calls" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Activity Feed</h2>
          <div className="flex flex-col gap-4">
            {activityFeed.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition">
                <div>{item.icon}</div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recent Meetings List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Meetings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 px-4 text-left font-semibold">Title</th>
                <th className="py-2 px-4 text-left font-semibold">Time</th>
                <th className="py-2 px-4 text-left font-semibold">Members</th>
              </tr>
            </thead>
            <tbody>
              {recentMeetings.map((meeting) => (
                <tr key={meeting.id} className="border-b hover:bg-blue-50 transition">
                  <td className="py-2 px-4 font-medium text-blue-900">{meeting.title}</td>
                  <td className="py-2 px-4">{meeting.time}</td>
                  <td className="py-2 px-4 text-gray-700">{meeting.members.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withPrivateRoute(DashboardPage);
