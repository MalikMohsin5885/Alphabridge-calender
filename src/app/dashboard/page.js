"use client";
import React from 'react';
import { CalendarDays, Users, UserCheck, Clock } from 'lucide-react';
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

export default function page() {
  const [selectedUser, setSelectedUser] = React.useState(users[0].id);
  const userStats = callStats.find((c) => c.userId === selectedUser) || { placed: 0, received: 0 };
  const chartData = [
    { name: 'Placed', value: userStats.placed },
    { name: 'Received', value: userStats.received },
  ];

  return (
    <div className="p-8 mt-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`flex items-center gap-4 p-6 rounded-2xl shadow-lg border border-gray-100 ${stat.bg} transition-all hover:scale-[1.03] hover:shadow-2xl`}
          >
            <div className="flex items-center justify-center rounded-xl bg-white/80 shadow-inner p-3">
              {stat.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* User Call Stats Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">User Call Stats</h2>
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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barSize={60}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 16, fill: '#64748b' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 16, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, fontSize: 16 }}
              labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
            />
            <Legend wrapperStyle={{ fontSize: 16 }} />
            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Calls" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
