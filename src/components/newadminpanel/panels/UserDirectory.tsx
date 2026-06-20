'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Mail, Phone, Calendar, Plus, X, Edit, Save, UserPlus } from 'lucide-react';
import { newAdminApi } from '@/lib/api/admin';

export default function UserDirectoryPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeUser, setActiveUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });

  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', phone: '', email: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await newAdminApi.listUsers(page, limit, search);
      setUsers(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSelectUser = async (userId: string) => {
    try {
      const res = await newAdminApi.getUser(userId);
      const userObj = res.user;
      const email = res.profile?.email || '';
      const fullUser = { ...userObj, email };
      setActiveUser(fullUser);
      setEditForm({ name: fullUser.name || '', phone: fullUser.phone || '', email });
      setIsEditing(false);
      setIsCreating(false);
    } catch (err: any) {
      alert(err.message || 'Failed to get user details');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    try {
      await newAdminApi.updateUser(activeUser.id, editForm);
      alert('User updated successfully');
      setIsEditing(false);
      handleSelectUser(activeUser.id);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await newAdminApi.createUser(createForm);
      alert('User created successfully');
      setIsCreating(false);
      setCreateForm({ name: '', phone: '', email: '' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await newAdminApi.deleteUser(userId);
      alert('User deleted successfully');
      if (activeUser && activeUser.id === userId) {
        setActiveUser(null);
      }
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="flex relative h-full animate-fade-in gap-6">
      {/* Left side list panel */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">User Directory</h1>
            <p className="text-zinc-500 text-sm">Monitor system users, configure authentication, and manage profile records.</p>
          </div>
          <button 
            onClick={() => {
              setIsCreating(true);
              setActiveUser(null);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Create User
          </button>
        </div>

        {/* Filter controls */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search users by name or phone number..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-800"
          />
        </div>

        {error && <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl border border-red-200">{error}</div>}

        {/* Table View */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-sm text-zinc-400">Loading user directory data...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-400">No users found match criteria.</div>
          ) : (
            <table className="w-full text-sm text-left text-zinc-500">
              <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map(u => (
                  <tr 
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className="hover:bg-zinc-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-zinc-900">{u.name || 'Unnamed User'}</td>
                    <td className="px-6 py-4 text-zinc-700">{u.phone}</td>
                    <td className="px-6 py-4 text-zinc-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg border border-red-100 text-red-650 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center text-xs text-zinc-500 pt-2">
          <span>Showing {users.length} of {total} users</span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              disabled={page * limit >= total}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Right side slide-over/detail drawer */}
      {(activeUser || isCreating) && (
        <div className="w-96 bg-white border border-zinc-200 rounded-2xl p-6 shadow-md space-y-6 overflow-y-auto max-h-[85vh] animate-fade-in shrink-0">
          {isCreating ? (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                <h2 className="text-lg font-bold text-zinc-900">Create New User</h2>
                <button type="button" onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={createForm.name}
                    onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Phone Number</label>
                  <input 
                    type="text"
                    required
                    placeholder="+91..."
                    value={createForm.phone}
                    onChange={e => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Email Address</label>
                  <input 
                    type="email"
                    value={createForm.email}
                    onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-xs mt-4"
              >
                <Save className="w-4 h-4" /> Save User Profile
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                <h2 className="text-lg font-bold text-zinc-900">User Details</h2>
                <button onClick={() => setActiveUser(null)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {activeUser.name ? activeUser.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">{activeUser.name || 'Unnamed User'}</h3>
                  <p className="text-[10px] text-zinc-400 select-all">ID: {activeUser.id}</p>
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Name</label>
                    <input 
                      type="text"
                      required
                      value={editForm.name}
                      onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Phone</label>
                    <input 
                      type="text"
                      required
                      value={editForm.phone}
                      onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Email</label>
                    <input 
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      type="submit" 
                      className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-250 text-zinc-800 rounded-xl font-bold transition-colors text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3 pt-2">
                    {activeUser.email && (
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span className="truncate">{activeUser.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>{activeUser.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>Joined {activeUser.createdAt ? new Date(activeUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-zinc-100">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
                    >
                      <Edit className="w-4 h-4" /> Edit Profile
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(activeUser.id)}
                      className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl transition-colors border border-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
