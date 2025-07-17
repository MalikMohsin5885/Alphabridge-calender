"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const mockUsers = [
  { id: 1, name: "Abubakar", email: "Abubakar@example.com", status: "Active", role: "Supervisor" },
  { id: 2, name: "Shaheer", email: "Shaheer@example.com", status: "Inactive", role: "Member" },
  { id: 3, name: "Yahya", email: "Yahya@example.com", status: "Active", role: "Member" },
  { id: 4, name: "Junaid", email: "Junaid@example.com", status: "Inactive", role: "BD" },
];

export default function AddUserPage() {
  const [users] = useState(mockUsers);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Users List</h1>
        <Dialog>
          <DialogTrigger>
            <Button variant="default" size="lg" className="shadow-md">+ Add User</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogTitle>Register New User</DialogTitle>
            <DialogDescription>Fill in the details to add a new user.</DialogDescription>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter role" />
              </div>
              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="default">Register</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/80 backdrop-blur border border-blue-100">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-blue-100/60">
              <th className="px-6 py-4 font-semibold text-blue-900">Name</th>
              <th className="px-6 py-4 font-semibold text-blue-900">Email</th>
              <th className="px-6 py-4 font-semibold text-blue-900">Status</th>
              <th className="px-6 py-4 font-semibold text-blue-900">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr
                key={user.id}
                className={
                  idx % 2 === 0
                    ? "bg-white/70 hover:bg-blue-50 transition"
                    : "bg-blue-50/60 hover:bg-blue-100 transition"
                }
              >
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-gray-700">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={
                      user.status === "Active"
                        ? "inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
                        : "inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold"
                    }
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-blue-800 font-semibold">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
