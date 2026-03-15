import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Stable style object to avoid re-creating on each render
const USER_CARD_STYLE = {
  backgroundColor: "rgba(255,255,255,0.04)",
  borderColor: "rgba(255,255,255,0.1)",
  borderWidth: '1px'
};
import {

  Save,
  X,
  UserPlus,
  Users,
  Edit,
  Trash2,
  Key,
  Shield,
  ShieldCheck,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Mail,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const ROLES = [
  { id: 'admin', label: 'Administrator', description: 'Full access to all features', color: 'purple' },
  { id: 'editor', label: 'Editor', description: 'Can edit content and portfolio', color: 'blue' },
  { id: 'viewer', label: 'Viewer', description: 'Read-only access', color: 'gray' },
];

const PERMISSIONS = [
  { id: 'manage_users', label: 'Manage Users', description: 'Create, edit, delete users' },
  { id: 'manage_content', label: 'Manage Content', description: 'Edit site content and sections' },
  { id: 'manage_portfolio', label: 'Manage Portfolio', description: 'Add, edit, delete portfolio items' },
  { id: 'manage_media', label: 'Manage Media', description: 'Upload and delete media files' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'Change site settings' },
  { id: 'view_messages', label: 'View Messages', description: 'Access contact form submissions' },
  { id: 'view_analytics', label: 'View Analytics', description: 'Access analytics dashboard' },
];

const UserManager = () => {
  const { theme } = useAdminTheme();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'editor',
    permissions: ['manage_content', 'manage_portfolio', 'manage_media'],
  });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async (signal) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API}/users/list`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      setUsers(response.data.users || []);
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      console.error('Failed to fetch users:', error);
      toast({ title: 'Failed to load users', variant: 'destructive' });
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, [fetchUsers]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (role) => {
    // Set default permissions based on role
    let defaultPermissions = [];
    if (role === 'admin') {
      defaultPermissions = PERMISSIONS.map((p) => p.id);
    } else if (role === 'editor') {
      defaultPermissions = ['manage_content', 'manage_portfolio', 'manage_media', 'view_messages'];
    } else {
      defaultPermissions = ['view_analytics'];
    }
    setFormData({ ...formData, role, permissions: defaultPermissions });
  };

  const togglePermission = (permId) => {
    const perms = formData.permissions.includes(permId)
      ? formData.permissions.filter((p) => p !== permId)
      : [...formData.permissions, permId];
    setFormData({ ...formData, permissions: perms });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    setNewPassword(password);
    return password;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Password copied to clipboard',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast({
        title: 'Invalid password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const endpoint = editingUser ? `${API}/users/${editingUser.id}` : `${API}/auth/register`;
      const method = editingUser ? 'put' : 'post';

      const response = await axios[method](endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success || response.data.user_id) {
        toast({
          title: editingUser ? 'User updated!' : 'User created!',
          description: `User ${formData.username} has been ${editingUser ? 'updated' : 'created'} successfully.`,
        });
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'editor',
          permissions: ['manage_content', 'manage_portfolio', 'manage_media'],
        });
        setShowForm(false);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      toast({
        title: 'Failed',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: 'Invalid password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(
        `${API}/users/${selectedUser.id}/password`,
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: 'Password changed!',
        description: `Password for ${selectedUser.username} has been updated.`,
      });
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast({
        title: 'Failed',
        description: error.response?.data?.detail || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      toast({
        title: 'Cannot delete',
        description: 'You cannot delete your own account',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) return;

    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'User deleted',
        description: `User ${user.username} has been removed.`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: 'Failed',
        description: error.response?.data?.detail || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'editor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-purple-500" />
            User Management
          </h2>
          <p className="text-gray-400 mt-1">Manage admin users, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700 gap-2">
              <UserPlus className="w-4 h-4" />
              Create User
            </Button>
          )}
        </div>
      </div>

      {/* Create/Edit User Form */}
      {showForm && (
        <Card style={{ 
          backgroundColor: "transparent",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: '1px'
        }}>
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>{editingUser ? 'Edit User' : 'Create New User'}</span>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                  setFormData({
                    username: '',
                    email: '',
                    password: '',
                    role: 'editor',
                    permissions: ['manage_content', 'manage_portfolio', 'manage_media'],
                  });
                }}
                variant="ghost"
                size="icon"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Username *</Label>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: theme.textPrimary
                    }}
                    placeholder="johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Email *</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: theme.textPrimary
                    }}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-gray-300">Password {!editingUser && '*'}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required={!editingUser}
                      minLength={6}
                      className="pr-10"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.04)",
                        borderColor: "rgba(255,255,255,0.08)",
                        color: theme.textPrimary
                      }}
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Min 6 characters'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <Button type="button" onClick={generatePassword} variant="outline" className="gap-2">
                    <Key className="w-4 h-4" />
                    Generate
                  </Button>
                  {formData.password && (
                    <Button
                      type="button"
                      onClick={() => copyToClipboard(formData.password)}
                      variant="outline"
                      size="icon"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-gray-300">Role</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.role === role.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {role.id === 'admin' ? (
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Shield className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-white font-medium">{role.label}</span>
                      </div>
                      <p className="text-gray-500 text-xs">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <Label className="text-gray-300">Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {PERMISSIONS.map((perm) => (
                    <button
                      key={perm.id}
                      type="button"
                      onClick={() => togglePermission(perm.id)}
                      disabled={formData.role === 'admin'}
                      className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                        formData.permissions.includes(perm.id)
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.15]'
                      } ${formData.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          formData.permissions.includes(perm.id)
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-600'
                        }`}
                      >
                        {formData.permissions.includes(perm.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{perm.label}</p>
                        <p className="text-gray-500 text-xs">{perm.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {formData.role === 'admin' && (
                  <p className="text-purple-400 text-xs">Administrators have all permissions by default</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {loading ? 'Saving...' : <><Save className="mr-2 w-4 h-4" /> {editingUser ? 'Update' : 'Create'} User</>}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card style={{ 
        backgroundColor: "transparent",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: '1px'
      }}>
        <CardHeader>
          <CardTitle className="text-white">All Users</CardTitle>
          <CardDescription>Manage existing admin accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto mb-4 text-gray-600" size={48} />
              <p className="text-gray-400">No users found</p>
              <p className="text-gray-500 text-sm mt-1">Create your first admin user above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg transition-colors hover:opacity-90"
                  style={USER_CARD_STYLE}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <span className="text-white font-bold">{user.username?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{user.username}</p>
                        <Badge className={getRoleBadgeColor(user.role || 'admin')}>
                          {user.role || 'Admin'}
                        </Badge>
                        {user.id === currentUser?.id && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-gray-500 text-sm">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        {user.created_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPasswordModal(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Key className="w-3 h-3" />
                      Password
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingUser(user);
                        setFormData({
                          username: user.username,
                          email: user.email,
                          password: '',
                          role: user.role || 'admin',
                          permissions: user.permissions || PERMISSIONS.map((p) => p.id),
                        });
                        setShowForm(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(user)}
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                      disabled={user.id === currentUser?.id}
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" style={{ 
            backgroundColor: "transparent",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: '1px'
          }}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-500" />
                Change Password
              </CardTitle>
              <CardDescription>Set a new password for {selectedUser.username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">New Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.04)",
                        borderColor: "rgba(255,255,255,0.08)",
                        color: theme.textPrimary
                      }}
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <Button
                    onClick={() => {
                      const pwd = generatePassword();
                      setNewPassword(pwd);
                    }}
                    variant="outline"
                    size="icon"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {newPassword && (
                <div className="flex items-center gap-2 p-3 bg-white/[0.04] rounded-lg">
                  <code className="text-green-400 flex-1 font-mono text-sm">{newPassword}</code>
                  <Button onClick={() => copyToClipboard(newPassword)} variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <p className="text-yellow-400 text-xs">
                  Share this password securely with the user. They should change it after first login.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleChangePassword} disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {loading ? 'Saving...' : 'Update Password'}
                </Button>
                <Button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManager;
