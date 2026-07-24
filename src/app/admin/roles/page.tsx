'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin, Role, UserDetails } from '../AdminContext';
import { toast } from 'sonner';
import {
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Check,
  Loader2,
  ArrowLeft,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { SkeletonGrid, EmptyState, TableSkeleton } from '../components';

const PERMISSIONS = [
  { value: 'overview', label: 'View Dashboard Stats', desc: 'Allows access to the console overview dashboard and metrics.' },
  { value: 'stores', label: 'Manage Stores', desc: 'Can suspend, activate, and launch merchant stores.' },
  { value: 'products', label: 'Manage Products', desc: 'Can toggle sponsored/featured products promotion.' },
  { value: 'orders', label: 'View Orders', desc: 'Can view and track all merchant platform order transactions.' },
  { value: 'categories', label: 'Manage Categories', desc: 'Can create, edit, and delete global product categories.' },
  { value: 'payouts', label: 'Manage Payouts', desc: 'Can audit and approve/reject escrow payouts & withdrawals.' },
  { value: 'verifications', label: 'Manage Verifications', desc: 'Can review and approve/reject merchant KYC verifications.' },
  { value: 'coupons', label: 'Manage Coupons', desc: 'Can create, toggle, and delete subscription coupon codes.' },
  { value: 'payments', label: 'Manage Payments Settings', desc: 'Can edit global payment gateway configurations.' },
  { value: 'health', label: 'View System Health', desc: 'Can check Twilio, Paystack, and database connection status.' },
  { value: 'settings', label: 'Manage Settings', desc: 'Can modify global settings like App name, disclaimer, SMTP, etc.' },
  { value: 'roles', label: 'Manage Roles & Staff', desc: 'Can configure staff roles and modify user permission roles.' },
  { value: 'emails', label: 'Send Merchant Emails', desc: 'Can compose and send bulk emails to merchant audience segments.' },
];

export default function AdminRolesPage() {
  const {
    token,
    roles,
    rolesLoading,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    users,
    usersLoading,
    loadUsers,
    assignUserRole,
    inviteStaff,
    openConfirmationDialog,
  } = useAdmin();

  // Active sub-tab: 'roles' or 'staff'
  const [activeSubTab, setActiveSubTab] = useState<'roles' | 'staff'>('roles');

  // Staff Invite Form States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [inviteIsAdmin, setInviteIsAdmin] = useState(false);
  const [inviteSaving, setInviteSaving] = useState(false);

  // Role Form States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleSaving, setRoleSaving] = useState(false);

  // Staff Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [userAssigningId, setUserAssigningId] = useState<string | number | null>(null);

  useEffect(() => {
    if (token) {
      loadRoles();
      loadUsersData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadUsersData = async (search = searchQuery, page = usersPage) => {
    const data = await loadUsers(search, page, 15);
    if (data) {
      setUsersTotalPages(data.last_page || 1);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsersPage(1);
    loadUsersData(searchQuery, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= usersTotalPages) {
      setUsersPage(newPage);
      loadUsersData(searchQuery, newPage);
    }
  };

  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleName('');
    setSelectedPermissions([]);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedPermissions(role.permissions || []);
    setIsRoleModalOpen(true);
  };

  const handlePermissionToggle = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.warning('Please enter a role name.');
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.warning('Please select at least one permission.');
      return;
    }

    try {
      setRoleSaving(true);
      if (editingRole) {
        await updateRole(editingRole.id, roleName.trim(), selectedPermissions);
      } else {
        await createRole(roleName.trim(), selectedPermissions);
      }
      setIsRoleModalOpen(false);
      loadUsersData(); // Reload users list in case roles cached inside users changed
    } catch (err) {
      // toast is already handled in context
    } finally {
      setRoleSaving(false);
    }
  };

  const handleDeleteRole = (role: Role) => {
    openConfirmationDialog(
      'Delete Role',
      `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteRole(role.id);
        } catch (err: any) {
          // Toast warning in case role is assigned
        }
      },
      'Delete Role',
      'Cancel'
    );
  };

  const handleOpenInviteStaff = () => {
    setInviteName('');
    setInviteEmail('');
    setInviteRoleId('');
    setInviteIsAdmin(false);
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.warning('Please enter a name and email address.');
      return;
    }
    if (!inviteIsAdmin && !inviteRoleId) {
      toast.warning('Select a role for this staff member, or mark them as a full administrator.');
      return;
    }

    try {
      setInviteSaving(true);
      await inviteStaff(inviteName.trim(), inviteEmail.trim(), inviteRoleId ? parseInt(inviteRoleId) : null, inviteIsAdmin);
      setIsInviteModalOpen(false);
    } catch (err) {
      // toast already handled in context
    } finally {
      setInviteSaving(false);
    }
  };

  const handleUserRoleChange = async (userId: string | number, roleIdVal: string) => {
    const roleId = roleIdVal === 'none' ? null : parseInt(roleIdVal);
    try {
      setUserAssigningId(userId);
      await assignUserRole(userId, roleId);
    } catch (err) {
      // error handled in context
    } finally {
      setUserAssigningId(null);
    }
  };

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2>Roles & User Permissions</h2>
          <p>Create access control roles for platform staff, and assign privileges to any registered user.</p>
        </div>
        {activeSubTab === 'roles' ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateRole}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} /> Create Role
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenInviteStaff}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} /> Invite Staff Member
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        marginBottom: 24,
        gap: 16,
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('roles')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeSubTab === 'roles' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeSubTab === 'roles' ? 'var(--primary)' : 'var(--text-muted)',
            padding: '10px 14px',
            fontSize: 14.5,
            fontWeight: 750,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Shield size={16} /> Platform Roles
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('staff')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeSubTab === 'staff' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeSubTab === 'staff' ? 'var(--primary)' : 'var(--text-muted)',
            padding: '10px 14px',
            fontSize: 14.5,
            fontWeight: 750,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} /> Users & Staff Assignment
          </span>
        </button>
      </div>

      {activeSubTab === 'roles' ? (
        rolesLoading && roles.length === 0 ? (
          <SkeletonGrid />
        ) : roles.length === 0 ? (
          <EmptyState label="No platform roles have been configured yet." />
        ) : (
          <div className="admin-metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {roles.map((role) => (
              <div
                key={role.id}
                className="admin-panel animate-fade-in"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  minHeight: 220,
                  border: '1.5px solid var(--border)',
                  background: 'linear-gradient(180deg, var(--surface) 0%, rgba(20, 20, 22, 0.95) 100%)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>{role.name}</h3>
                    <span
                      className="admin-chip admin-chip--green"
                      style={{ fontSize: 11, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Check size={11} /> {role.permissions?.length} Modules
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                    Granted access to key console operations.
                  </p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {role.permissions?.map((perm) => {
                      const match = PERMISSIONS.find((p) => p.value === perm);
                      return (
                        <span
                          key={perm}
                          className="admin-chip admin-chip--gray"
                          style={{ fontSize: 10.5, textTransform: 'capitalize', padding: '2px 6px', fontWeight: 650 }}
                          title={match?.desc}
                        >
                          {match?.label || perm}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: 12,
                  paddingTop: 16,
                  borderTop: '1px solid var(--border)',
                  marginTop: 'auto',
                }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleOpenEditRole(role)}
                    style={{ flex: 1, justifyContent: 'center', fontSize: 13, padding: '8px 12px' }}
                  >
                    <Edit2 size={13} style={{ marginRight: 6 }} /> Edit Permissions
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline danger"
                    onClick={() => handleDeleteRole(role)}
                    style={{ padding: '8px 12px' }}
                    title="Delete Role"
                  >
                    <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Staff & User Assignment View */
        <div className="admin-panel animate-fade-in" style={{ padding: 24 }}>
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, marginBottom: 24, maxWidth: 500 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="input-field"
                placeholder="Search user name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 40, height: 42 }}
              />
              <Search size={17} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-faint)'
              }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', height: 42 }}>
              Search
            </button>
          </form>

          {usersLoading && users.length === 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Role Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  <TableSkeleton rows={8} columns={4} />
                </tbody>
              </table>
            </div>
          ) : users.length === 0 ? (
            <EmptyState label="No platform users match your search." />
          ) : (
            <>
              <div className="admin-table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                      <th>Privilege Type</th>
                      <th>Assigned Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: 'var(--text)', fontSize: 14.5 }}>{user.name || 'Anonymous Merchant'}</strong>
                            <small style={{ color: 'var(--text-faint)', fontSize: 11 }}>Registered {new Date(user.created_at).toLocaleDateString()}</small>
                          </div>
                        </td>
                        <td>{user.email || <span style={{ color: 'var(--text-faint)' }}>None</span>}</td>
                        <td>{user.phone_number}</td>
                        <td>
                          {user.is_admin ? (
                            <span className="admin-chip admin-chip--green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                              <Shield size={11} /> Super Admin
                            </span>
                          ) : user.role_id ? (
                            <span className="admin-chip admin-chip--green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, background: 'rgba(18, 140, 126, 0.1)', color: 'var(--primary)' }}>
                              <UserCheck size={11} /> Console Staff
                            </span>
                          ) : (
                            <span className="admin-chip admin-chip--gray" style={{ fontSize: 11 }}>
                              Merchant Account
                            </span>
                          )}
                        </td>
                        <td>
                          {user.is_admin ? (
                            <span style={{ fontSize: 13.5, color: 'var(--text-muted)', fontWeight: 650 }}>Full System Bypass</span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <select
                                className="input-field"
                                value={user.role_id || 'none'}
                                onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                disabled={userAssigningId === user.id}
                                style={{
                                  padding: '4px 10px',
                                  background: 'var(--surface-2)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '6px',
                                  color: 'var(--text)',
                                  fontSize: 13.5,
                                  fontWeight: 650,
                                  height: '32px',
                                  width: 180,
                                  cursor: 'pointer',
                                  outline: 'none',
                                }}
                              >
                                <option value="none">No Console Role</option>
                                {roles.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))}
                              </select>
                              {userAssigningId === user.id && (
                                <Loader2 className="admin-spin" size={14} style={{ color: 'var(--primary)' }} />
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {usersTotalPages > 1 && (
                <div className="admin-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: '0 4px' }}>
                  <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                    Page <strong>{usersPage}</strong> of {usersTotalPages}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={usersPage <= 1}
                      onClick={() => handlePageChange(usersPage - 1)}
                      style={{ padding: '8px 12px', minHeight: 34 }}
                    >
                      <ArrowLeft size={14} /> Prev
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={usersPage >= usersTotalPages}
                      onClick={() => handlePageChange(usersPage + 1)}
                      style={{ padding: '8px 12px', minHeight: 34 }}
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Role Creation/Editing Modal Dialog */}
      {isRoleModalOpen && (
        <div
          className="admin-modal-backdrop animate-fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="admin-panel animate-scale-up"
            style={{
              width: '100%',
              maxWidth: 560,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 28,
              position: 'relative',
              background: 'var(--surface)',
              border: '1.5px solid var(--border-strong)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={22} />
            </button>
            
            <h3 style={{ fontSize: 19, fontWeight: 900, marginBottom: 8, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={20} style={{ color: 'var(--primary)' }} />
              {editingRole ? 'Edit Console Role' : 'Create Custom Staff Role'}
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20 }}>
              Specify a title for this role and toggle module privileges selectively.
            </p>

            <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Role Name / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Platform Support, Billing Auditor"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--surface-2)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: 14.5,
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, marginBottom: 12, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  Module Permissions Matrix
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto', paddingRight: 6 }}>
                  {PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.value);
                    return (
                      <div
                        key={perm.value}
                        onClick={() => handlePermissionToggle(perm.value)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: 12,
                          borderRadius: 8,
                          background: isChecked ? 'rgba(18, 140, 126, 0.05)' : 'var(--surface-2)',
                          border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            border: isChecked ? 'none' : '2px solid var(--border-strong)',
                            background: isChecked ? 'var(--primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 2,
                            color: '#ffffff',
                          }}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: 13.5, color: isChecked ? 'var(--text)' : 'var(--text-2)' }}>
                            {perm.label}
                          </strong>
                          <small style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                            {perm.desc}
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsRoleModalOpen(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={roleSaving}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  {roleSaving ? <Loader2 size={16} className="admin-spin" /> : editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Invite Modal Dialog */}
      {isInviteModalOpen && (
        <div
          className="admin-modal-backdrop animate-fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="admin-panel animate-scale-up"
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 28,
              position: 'relative',
              background: 'var(--surface)',
              border: '1.5px solid var(--border-strong)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <h3 style={{ fontSize: 19, fontWeight: 900, marginBottom: 8, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={20} style={{ color: 'var(--primary)' }} />
              Invite Staff Member
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20 }}>
              They'll get an email with a link to set their own password and access the console.
            </p>

            <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ada Okafor"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 14px', background: 'var(--surface-2)',
                    border: '1.5px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
                    fontSize: 14.5, fontWeight: 600, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="staff@frontstore.ng"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 14px', background: 'var(--surface-2)',
                    border: '1.5px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
                    fontSize: 14.5, fontWeight: 600, outline: 'none',
                  }}
                />
              </div>

              <div
                onClick={() => setInviteIsAdmin(!inviteIsAdmin)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 8,
                  background: inviteIsAdmin ? 'rgba(18, 140, 126, 0.05)' : 'var(--surface-2)',
                  border: inviteIsAdmin ? '1px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: inviteIsAdmin ? 'none' : '2px solid var(--border-strong)',
                  background: inviteIsAdmin ? 'var(--primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, color: '#fff',
                }}>
                  {inviteIsAdmin && <Check size={12} strokeWidth={3} />}
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: 13.5, color: 'var(--text)' }}>Full Administrator</strong>
                  <small style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                    Bypasses all module permissions. Leave unchecked to assign a scoped role instead.
                  </small>
                </div>
              </div>

              {!inviteIsAdmin && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Console Role
                  </label>
                  <select
                    value={inviteRoleId}
                    onChange={(e) => setInviteRoleId(e.target.value)}
                    required={!inviteIsAdmin}
                    style={{
                      width: '100%', padding: '12px 14px', background: 'var(--surface-2)',
                      border: '1.5px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
                      fontSize: 14.5, fontWeight: 600, outline: 'none', cursor: 'pointer',
                    }}
                  >
                    <option value="">Select a role...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  {roles.length === 0 && (
                    <small style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--text-faint)' }}>
                      No roles created yet — create one under Platform Roles first.
                    </small>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 4, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsInviteModalOpen(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={inviteSaving}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  {inviteSaving ? <Loader2 size={16} className="admin-spin" /> : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
