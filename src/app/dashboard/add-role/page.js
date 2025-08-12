"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Pencil, Save, X } from "lucide-react";
import { useUser } from '../../../context/UserContext';
import { useRouter } from 'next/navigation';
import withPrivateRoute from '../../../components/withPrivateRoute';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

function AddRolePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  
  // State management
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState([]);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!loading && user?.role !== 'Supervisor') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Fetch roles and permissions from API
  const fetchRolesAndPermissions = async () => {
    setLoadingData(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/roles-permissions/', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roles and permissions');
      }

      const data = await response.json();
      setRoles(data.roles || []);
      setAllPermissions(data.permissions || []);
    } catch (error) {
      console.error('Failed to fetch roles and permissions:', error);
      setRoles([]);
      setAllPermissions([]);
    } finally {
      setLoadingData(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (!loading && user?.role === 'Supervisor') {
      fetchRolesAndPermissions();
    }
  }, [loading, user]);

  // Handle role selection
  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    if (roleId) {
      const selectedRoleData = roles.find(role => role.id == roleId);
      setRolePermissions(selectedRoleData?.permissions || []);
    } else {
      setRolePermissions([]);
    }
  };

  // Handle edit permissions
  const handleEditPermissions = () => {
    setEditingPermissions([...rolePermissions]);
    setEditDialogOpen(true);
  };

  // Handle permission toggle in edit mode
  const handlePermissionToggle = (permissionId) => {
    setEditingPermissions(prev => {
      const isSelected = prev.some(p => p.id === permissionId);
      if (isSelected) {
        return prev.filter(p => p.id !== permissionId);
      } else {
        const permission = allPermissions.find(p => p.id === permissionId);
        return permission ? [...prev, permission] : prev;
      }
    });
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      // Calculate permissions to add and remove
      const currentPermissionIds = rolePermissions.map(p => p.id);
      const newPermissionIds = editingPermissions.map(p => p.id);
      
      const addPermissions = newPermissionIds.filter(id => !currentPermissionIds.includes(id));
      const removePermissions = currentPermissionIds.filter(id => !newPermissionIds.includes(id));

      const payload = {
        role_id: parseInt(selectedRole),
        add_permissions: addPermissions,
        remove_permissions: removePermissions
      };

      const response = await fetch('http://127.0.0.1:8000/api/roles-permissions/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update permissions');
      }

      // Update local state
      setRolePermissions(editingPermissions);
      setEditDialogOpen(false);
      toast.success('Permissions updated successfully!');
      
      // Refresh the roles data to get updated permissions
      await fetchRolesAndPermissions();
    } catch (error) {
      console.error('Failed to update permissions:', error);
      toast.error(`Failed to update permissions: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by category (extract category from permission name)
  const groupPermissionsByCategory = (permissions) => {
    const grouped = {};
    permissions.forEach(permission => {
      const category = permission.name.split('.')[0] || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  };

  // Format permission name for display
  const formatPermissionName = (permissionName) => {
    return permissionName
      .split('.')
      .slice(1) // Remove the category part
      .join('.')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading || user?.role !== 'Supervisor') {
    return null;
  }

  if (loadingData) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-blue-600 dark:text-blue-400">Loading roles and permissions...</div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight dark:text-blue-300 mb-2">
            Role Management
          </h1>

        </div>

        {/* Role Selection */}
        <div className="bg-white/80 backdrop-blur border border-blue-100 rounded-2xl shadow-xl p-6 mb-6 dark:bg-gray-800/80 dark:border-gray-700">
          <label className="block text-lg font-semibold text-gray-800 mb-3 dark:text-gray-200">
            Select Role
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <option value="">Choose a role...</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>

        {/* Permissions Display */}
        {selectedRole && (
          <div className="bg-white/80 backdrop-blur border border-blue-100 rounded-2xl shadow-xl p-6 dark:bg-gray-800/80 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Permissions for {roles.find(r => r.id == selectedRole)?.name}
              </h2>
              <Button
                onClick={handleEditPermissions}
                className="flex items-center gap-2 shadow-md"
              >
                <Pencil className="w-4 h-4" />
                Edit Permissions
              </Button>
            </div>

            {loadingPermissions ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-blue-600 dark:text-blue-400">Loading permissions...</div>
              </div>
            ) : rolePermissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No permissions assigned to this role
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupPermissionsByCategory(rolePermissions)).map(([category, permissions]) => (
                  <div key={category} className="border border-gray-200 rounded-xl p-4 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 dark:text-gray-200">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map(permission => (
                        <div
                          key={permission.id}
                          className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {formatPermissionName(permission.name)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Permissions Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogTitle className="text-2xl font-bold">
              Edit Permissions for {roles.find(r => r.id == selectedRole)?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Select or deselect permissions for this role. Changes will be saved when you click Save.
            </DialogDescription>
            
            <div className="space-y-6 mt-6">
              {Object.entries(groupPermissionsByCategory(allPermissions)).map(([category, permissions]) => (
                <div key={category} className="border border-gray-200 rounded-xl p-4 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 dark:text-gray-200">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions.map(permission => {
                      const isSelected = editingPermissions.some(p => p.id === permission.id);
                      return (
                        <label
                          key={permission.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-100 border-2 border-blue-300 dark:bg-blue-900/30 dark:border-blue-600'
                              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className={`font-medium ${
                            isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {formatPermissionName(permission.name)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                onClick={handleSavePermissions}
                disabled={saving}
                className="flex items-center gap-2 flex-1"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
                className="flex items-center gap-2 flex-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Toaster />
      </div>
    </div>
  );
}

export default withPrivateRoute(AddRolePage);