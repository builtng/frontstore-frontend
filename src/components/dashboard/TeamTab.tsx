'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Users, Loader2 } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import Modal from '@/components/Modal';
import SearchableSelect from '@/components/SearchableSelect';
import Toggle from '@/components/Toggle';

interface TeamTabProps {
  isPro: boolean;
  navigateDashboardTab: (tab: 'billing') => void;
}

const TEAM_PERMISSIONS = [
  { id: 'manage team members', label: 'Manage Team Members', desc: 'Invite, edit, and remove staff' },
  { id: 'view orders', label: 'View Orders', desc: 'Read-only access to order data' },
  { id: 'edit orders', label: 'Edit / Process Orders & Refunds', desc: 'Update statuses and process refunds' },
  { id: 'access analytics', label: 'View Profit & Expenses', desc: 'Access financial reports' },
  { id: 'access customer data', label: 'Inbox & Customer Profiles', desc: 'Read and reply to customer messages' },
];

export default function TeamTab({ isPro, navigateDashboardTab }: TeamTabProps) {
  const apiUrl = getApiUrl();

  const [teamData, setTeamData] = useState<{ owner: any, staff: any[] }>({ owner: null, staff: [] });
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamInvitations, setTeamInvitations] = useState<any[]>([]);
  const [teamRoles, setTeamRoles] = useState<any[]>([]);
  const [teamActivityLogs, setTeamActivityLogs] = useState<any[]>([]);
  const [teamLoginHistory, setTeamLoginHistory] = useState<any[]>([]);
  const [isInviteStaffOpen, setIsInviteStaffOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [teamTab, setTeamTab] = useState<'members' | 'invites' | 'roles' | 'activity' | 'login_history'>('members');

  const fetchTeamData = async () => {
    if (!isPro) return;
    try {
      setTeamLoading(true);
      const [resMembers, resInvites, resRoles, resLogs, resLogin] = await Promise.all([
        fetch(`${apiUrl}/v1/team/members`, { credentials: 'include' }),
        fetch(`${apiUrl}/v1/team/invitations`, { credentials: 'include' }),
        fetch(`${apiUrl}/v1/team/roles`, { credentials: 'include' }),
        fetch(`${apiUrl}/v1/team/activity-logs`, { credentials: 'include' }),
        fetch(`${apiUrl}/v1/team/login-history`, { credentials: 'include' }),
      ]);
      if (resMembers.ok) setTeamData((await resMembers.json()).data);
      if (resInvites.ok) setTeamInvitations((await resInvites.json()).data);
      if (resRoles.ok) setTeamRoles((await resRoles.json()).data);
      if (resLogs.ok) setTeamActivityLogs((await resLogs.json()).data.data || []);
      if (resLogin.ok) setTeamLoginHistory((await resLogin.json()).data.data || []);
    } catch (e) {
      toast.error('Failed to load team data.');
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const res = await fetch(`${apiUrl}/v1/team/members/${memberId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        toast.success('Team member removed.');
        fetchTeamData();
      } else {
        toast.error('Failed to remove team member.');
      }
    } catch { toast.error('Error removing team member.'); }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/team/invitations/${inviteId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        toast.success('Invitation cancelled.');
        fetchTeamData();
      } else {
        toast.error('Failed to cancel invitation.');
      }
    } catch { toast.error('Error cancelling invitation.'); }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this custom role?')) return;
    try {
      const res = await fetch(`${apiUrl}/v1/team/roles/${roleId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        toast.success('Role deleted.');
        fetchTeamData();
      } else {
        toast.error('Failed to delete role.');
      }
    } catch { toast.error('Error deleting role.'); }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/v1/team/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, phone_number: invitePhone, role_id: inviteRoleId || null }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Invitation sent!');
        setIsInviteStaffOpen(false);
        setInviteEmail('');
        setInvitePhone('');
        setInviteRoleId('');
        fetchTeamData();
      } else {
        toast.error(json.message || 'Failed to send invite.');
      }
    } catch { toast.error('Error sending invitation.'); }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRolePermissions.length === 0) { toast.warning('Please select at least one permission.'); return; }
    try {
      const res = await fetch(`${apiUrl}/v1/team/roles`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName, permissions: newRolePermissions }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Custom role created!');
        setIsCreateRoleOpen(false);
        setNewRoleName('');
        setNewRolePermissions([]);
        fetchTeamData();
      } else {
        toast.error(json.message || 'Failed to create role.');
      }
    } catch { toast.error('Error creating custom role.'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {!isPro ? (
        <div className="card text-center" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--r-full)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
          }}>
            <Users size={28} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Team & Staff Management</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              Add managers, sales agents, and support staff to run your store together. Set custom permissions, view login histories, and audit activity logs.
            </p>
          </div>
          <button onClick={() => navigateDashboardTab('billing')} className="btn btn-primary clickable" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}>
            🚀 Upgrade to Pro Plan
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Team & Staff</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage staff members, custom roles, and security audit logs.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setIsCreateRoleOpen(true)} className="btn btn-outline clickable" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>
                + Create Custom Role
              </button>
              <button onClick={() => setIsInviteStaffOpen(true)} className="btn btn-primary clickable" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>
                + Invite Staff Member
              </button>
            </div>
          </div>

          {/* Sub-nav */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 1 }}>
            {(['members', 'invites', 'roles', 'activity', 'login_history'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTeamTab(t)}
                className="clickable"
                style={{
                  padding: '10px 16px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  borderBottom: teamTab === t ? '2px solid var(--primary)' : 'none',
                  color: teamTab === t ? 'var(--text)' : 'var(--text-muted)',
                }}
              >
                {t === 'members' && 'Staff Members'}
                {t === 'invites' && 'Pending Invites'}
                {t === 'roles' && 'Custom Roles'}
                {t === 'activity' && 'Activity Logs'}
                {t === 'login_history' && 'Login Histories'}
              </button>
            ))}
          </div>

          {/* Content Panels */}
          {teamLoading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} /></div>
          ) : (
            <>
              {teamTab === 'members' && (
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Name</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Email</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Role</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Date Joined</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamData.owner && (
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{teamData.owner.name}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13 }}>{teamData.owner.email}</td>
                          <td style={{ padding: '14px 18px' }}><span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>Owner</span></td>
                          <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>Original Creator</td>
                          <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>—</td>
                        </tr>
                      )}
                      {teamData.staff?.map((member: any) => (
                        <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{member.name}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13 }}>{member.email}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                              {member.role?.name || 'Staff'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                            {new Date(member.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="clickable"
                              style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: 12.5, fontWeight: 700 }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!teamData.staff || teamData.staff.length === 0) && (
                        <tr>
                          <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                            No staff members added yet. Invite your first employee above!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {teamTab === 'invites' && (
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Email</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Role</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamInvitations.map((invite: any) => (
                        <tr key={invite.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{invite.email}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13 }}>{invite.role?.name || 'Staff'}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <span className="badge" style={{ background: invite.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: invite.status === 'pending' ? '#d97706' : 'var(--danger)' }}>
                              {invite.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <button
                              onClick={() => handleCancelInvite(invite.id)}
                              className="clickable"
                              style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: 12.5, fontWeight: 700 }}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                      {teamInvitations.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                            No pending staff invitations.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {teamTab === 'roles' && (
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Role Name</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Granted Permissions</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamRoles.map((role: any) => (
                        <tr key={role.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{role.name}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13, maxWidth: 400 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {role.permissions?.map((perm: string) => (
                                <span key={perm} className="badge" style={{ background: 'var(--card-hover)', color: 'var(--text-muted)', fontSize: 11 }}>
                                  {perm}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {role.store_id ? (
                              <button
                                onClick={() => handleDeleteRole(role.id)}
                                className="clickable"
                                style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: 12.5, fontWeight: 700 }}
                              >
                                Delete
                              </button>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>System Default</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {teamTab === 'activity' && (
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>User</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Details</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamActivityLogs.map((log: any) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{log.user?.name || 'System'}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13 }}><span className="badge" style={{ background: 'var(--card-hover)' }}>{log.action}</span></td>
                          <td style={{ padding: '14px 18px', fontSize: 13 }}>{log.details}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {teamActivityLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                            No activity history logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {teamTab === 'login_history' && (
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>User</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>IP Address</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Browser / Device</th>
                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Login Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamLoginHistory.map((login: any) => (
                        <tr key={login.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{login.user?.name || 'User'}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13 }}>{login.ip_address}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{login.user_agent}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                            {new Date(login.login_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {teamLoginHistory.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                            No login histories logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── MODAL: INVITE STAFF MEMBER ── */}
      <Modal
        open={isInviteStaffOpen}
        onClose={() => setIsInviteStaffOpen(false)}
        title="Invite Staff Member"
        maxWidth={460}
      >
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -10, marginBottom: 16 }}>Send an email invite to join your team</p>
        <form onSubmit={handleInviteStaff} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field-group">
            <label className="form-label">Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="email" value={inviteEmail} onChange={(e: any) => setInviteEmail(e.target.value)} required className="form-control" placeholder="teammate@example.com" />
          </div>

          <div className="field-group">
            <label className="form-label">WhatsApp Phone <span style={{ color: 'var(--text-faint)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(Optional)</span></label>
            <input type="text" value={invitePhone} onChange={(e: any) => setInvitePhone(e.target.value)} className="form-control" placeholder="+234 800 000 0000" />
          </div>

          <div className="field-group">
            <label className="form-label">Assign Role <span style={{ color: 'var(--danger)' }}>*</span></label>
            <SearchableSelect
              value={inviteRoleId}
              onChange={val => setInviteRoleId(val)}
              options={[
                { value: '', label: '— Choose a role —' },
                ...teamRoles.map((role: any) => ({ value: role.id, label: role.name, sublabel: role.description || undefined })),
              ]}
              placeholder="Search roles..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsInviteStaffOpen(false)} className="btn btn-outline clickable">Cancel</button>
            <button type="submit" className="btn btn-primary clickable">Send Invite</button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: CREATE CUSTOM ROLE ── */}
      <Modal
        open={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        title="Create Custom Role"
        maxWidth={460}
      >
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -10, marginBottom: 16 }}>Define a role and select its permissions</p>
        <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field-group">
            <label className="form-label">Role Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" value={newRoleName} onChange={(e: any) => setNewRoleName(e.target.value)} required placeholder="e.g. Sales Representative" className="form-control" />
          </div>

          <div>
            <label className="form-label">Permissions <span style={{ color: 'var(--danger)' }}>*</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 2 }}>
              {TEAM_PERMISSIONS.map(p => {
                const checked = newRolePermissions.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (checked) setNewRolePermissions(prev => prev.filter(x => x !== p.id));
                      else setNewRolePermissions(prev => [...prev, p.id]);
                    }}
                    className={`permission-row${checked ? ' checked' : ''}`}
                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{p.label}</div>
                      <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 2 }}>{p.desc}</div>
                    </div>
                    <span onClick={e => e.stopPropagation()}>
                      <Toggle
                        checked={checked}
                        onChange={(val) => {
                          if (val) setNewRolePermissions(prev => [...prev, p.id]);
                          else setNewRolePermissions(prev => prev.filter(x => x !== p.id));
                        }}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsCreateRoleOpen(false)} className="btn btn-outline clickable">Cancel</button>
            <button type="submit" className="btn btn-primary clickable">Create Role</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
