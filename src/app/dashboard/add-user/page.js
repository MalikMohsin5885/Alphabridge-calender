"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import {
  fetchAllUsers,
  addUser,
  updateUser,
  fetchRolesDepartmentsAdministrators,
} from "../../../services/userService";
import withPrivateRoute from "../../../components/withPrivateRoute";

function AddUserPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [administrators, setAdministrators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    administrator: "",
    is_active: true,
    priority: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "",
    department: "",
    administrator: "",
    priority: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch roles, departments, and administrators from the new API
        const data = await fetchRolesDepartmentsAdministrators();
        console.log("Fetched data:", data);
        console.log("Roles:", data.roles);
        console.log("Departments:", data.departments);
        console.log("Administrators:", data.supervisors);

        setRoles(data.roles || []);
        setDepartments(data.departments || []);
        setAdministrators(data.supervisors || []);

        // Log if any data is missing
        if (!data.roles || data.roles.length === 0) {
          console.warn("No roles found in API response");
        }
        if (!data.departments || data.departments.length === 0) {
          console.warn("No departments found in API response");
        }
        if (!data.supervisors || data.supervisors.length === 0) {
          console.warn("No administrators found in API response");
        }

        // Fetch users from the existing API
        const usersData = await fetchAllUsers();
        setUsers(usersData || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setUsers([]);
        setDepartments([]);
        setRoles([]);
        setAdministrators([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addUser(formData);

      // Refresh the users list
      const usersData = await fetchAllUsers();
      setUsers(usersData || []);

      // Reset form and close dialog
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        department: "",
        administrator: "",
        is_active: true,
        priority: "",
      });
      setDialogOpen(false);
      toast.success("User added successfully!");
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Failed to add user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditing(true);

    try {
      await updateUser(editingUser.id, {
        name: editFormData.name,
        role: editFormData.role,
        department: editFormData.department,
        supervisor: editFormData.administrator,
        priority: editFormData.priority,
        is_active: editFormData.is_active,
      });

      // Refresh the users list
      const usersData = await fetchAllUsers();
      setUsers(usersData || []);

      // Reset form and close dialog
      setEditFormData({
        name: "",
        role: "",
        department: "",
        administrator: "",
        priority: "",
        is_active: true,
      });
      setEditingUser(null);
      setEditDialogOpen(false);
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setEditing(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      role: user.role || "",
      department: user.department || "",
      administrator: user.supervisor || "",
      priority: user.priority || "",
      is_active: user.is_active ?? true,
    });
    setEditDialogOpen(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.is_active;
      await updateUser(user.id, {
        name: user.name,
        department: user.department,
        priority: user.priority,
        is_active: newStatus,
      });

      // Refresh the users list
      const usersData = await fetchAllUsers();
      setUsers(usersData || []);
      toast.success(
        `User status updated to ${newStatus ? "Active" : "Inactive"}!`
      );
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status. Please try again.");
    }
  };

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId) => {
    if (!departmentId || !Array.isArray(departments)) return "N/A";
    const department = departments.find((dep) => dep.id === departmentId);
    return department ? department.name : "N/A";
  };

  // Helper function to get role name by ID
  const getRoleName = (roleId) => {
    if (!roleId || !Array.isArray(roles)) return "N/A";
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : `Role ${roleId}`;
  };

  // Helper function to get administrator name by ID
  const getAdministratorName = (administratorId) => {
    if (!administratorId || !Array.isArray(administrators)) return "N/A";
    const administrator = administrators.find((s) => s.id === administratorId);
    return administrator ? administrator.name : `User ${administratorId}`;
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center dark:from-gray-900 dark:to-gray-800">
        <div className="text-blue-900 dark:text-blue-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight dark:text-blue-300">
          Users List
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button variant="default" size="lg" className="shadow-md">
              + Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogTitle>Register New User</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new user.
            </DialogDescription>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loading && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Loading form data...
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => handleFormChange("password", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                  {roles.length === 0 && !loading && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={formData.role}
                  onChange={(e) =>
                    handleFormChange("role", Number(e.target.value))
                  }
                  required
                  disabled={roles.length === 0}
                >
                  <option value="">
                    {roles.length === 0 ? "Loading roles..." : "Select role..."}
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {roles.length === 0 && !loading && (
                  <p className="text-xs text-red-500 mt-1">
                    No roles available
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                  {departments.length === 0 && !loading && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={formData.department}
                  onChange={(e) =>
                    handleFormChange("department", Number(e.target.value))
                  }
                  required
                  disabled={departments.length === 0}
                >
                  <option value="">
                    {departments.length === 0
                      ? "Loading departments..."
                      : "Select department..."}
                  </option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
                {departments.length === 0 && !loading && (
                  <p className="text-xs text-red-500 mt-1">
                    No departments available
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lead
                  {administrators.length === 0 && !loading && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={formData.administrator}
                  onChange={(e) =>
                    handleFormChange("Lead", Number(e.target.value))
                  }
                  required
                  disabled={administrators.length === 0}
                >
                  <option value="">
                    {administrators.length === 0
                      ? "Loading Leads..."
                      : "Select lead..."}
                  </option>
                  {administrators.map((administrator) => (
                    <option key={administrator.id} value={administrator.id}>
                      {administrator.name}
                    </option>
                  ))}
                </select>
                {administrators.length === 0 && !loading && (
                  <p className="text-xs text-red-500 mt-1">
                    No Leads available
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={formData.is_active ? "true" : "false"}
                  onChange={(e) =>
                    handleFormChange("is_active", e.target.value === "true")
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  placeholder="Enter priority (1-100)"
                  value={formData.priority}
                  onChange={(e) =>
                    handleFormChange("priority", Number(e.target.value))
                  }
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" disabled={submitting}>
                  {submitting ? "Adding..." : "Register"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details.</DialogDescription>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {loading && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                Loading form data...
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                placeholder="Enter name"
                value={editFormData.name || ""}
                onChange={(e) => handleEditFormChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
                {roles.length === 0 && !loading && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={editFormData.role || ""}
                onChange={(e) =>
                  handleEditFormChange("role", Number(e.target.value))
                }
                required
                disabled={roles.length === 0}
              >
                <option value="">
                  {roles.length === 0 ? "Loading roles..." : "Select role..."}
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {roles.length === 0 && !loading && (
                <p className="text-xs text-red-500 mt-1">No roles available</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
                {departments.length === 0 && !loading && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={editFormData.department || ""}
                onChange={(e) =>
                  handleEditFormChange("department", Number(e.target.value))
                }
                required
                disabled={departments.length === 0}
              >
                <option value="">
                  {departments.length === 0
                    ? "Loading departments..."
                    : "Select department..."}
                </option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
              {departments.length === 0 && !loading && (
                <p className="text-xs text-red-500 mt-1">
                  No departments available
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lead
                {administrators.length === 0 && !loading && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={editFormData.administrator || ""}
                onChange={(e) =>
                  handleEditFormChange("Lead", Number(e.target.value))
                }
                required
                disabled={administrators.length === 0}
              >
                <option value="">
                  {administrators.length === 0
                    ? "Loading Leads..."
                    : "Select lead..."}
                </option>
                {administrators.map((administrator) => (
                  <option key={administrator.id} value={administrator.id}>
                    {administrator.name}
                  </option>
                ))}
              </select>
              {administrators.length === 0 && !loading && (
                <p className="text-xs text-red-500 mt-1">No Leads available</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={editFormData.is_active ? "true" : "false"}
                onChange={(e) =>
                  handleEditFormChange("is_active", e.target.value === "true")
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <input
                type="number"
                min="1"
                max="100"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                placeholder="Enter priority (1-100)"
                value={editFormData.priority || ""}
                onChange={(e) =>
                  handleEditFormChange("priority", Number(e.target.value))
                }
                required
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={editing}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={editing}>
                {editing ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />

      <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/80 backdrop-blur border border-blue-100 dark:bg-gray-800/80 dark:border-gray-700">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-blue-100/60 dark:bg-gray-700/60">
              <th className="px-6 py-4 font-semibold text-blue-900 dark:text-blue-300">
                Name
              </th>
              <th className="px-6 py-4 font-semibold text-blue-900 dark:text-blue-300">
                Email
              </th>
              <th className="px-6 py-4 font-semibold text-blue-900 dark:text-blue-300">
                Role
              </th>
              <th className="px-6 py-4 font-semibold text-blue-900 dark:text-blue-300">
                Department
              </th>
              <th className="px-6 py-4 font-semibold text-blue-900 dark:text-blue-300">
                Lead
              </th>
              <th className="px-6 py-4 font-semibold text-blue-900 dark:text-blue-300">
                Status
              </th>
              <th className="px-6 py-4 font-semibold text-blue-900 dark:text-blue-300">
                Priority
              </th>
              <th className="px-6 py-4 font-semibold text-blue-900 dark:text-blue-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr
                  key={user.id}
                  className={
                    idx % 2 === 0
                      ? "bg-white/70 hover:bg-blue-50 transition dark:bg-gray-700/70 dark:hover:bg-gray-600"
                      : "bg-blue-50/60 hover:bg-blue-100 transition dark:bg-gray-600/60 dark:hover:bg-gray-500"
                  }
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-blue-800 dark:text-blue-400 font-semibold">
                    {getRoleName(user.role)}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {getDepartmentName(user.department)}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {getAdministratorName(user.supervisor)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 ${
                        user.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      }`}
                      title={`Click to change status to ${
                        user.is_active ? "Inactive" : "Active"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {user.priority || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default withPrivateRoute(AddUserPage);
