import React, { useState, useEffect } from 'react';
import { Users, Save, CheckCircle2, AlertCircle, Shield, Briefcase, Crown, UserCheck, X } from 'lucide-react';
import { fetchTeams, updateTeams } from '../../services/teamService.js';
import { fetchEmployees } from '../../services/employeeService.js';
import { Team, Employee } from '../../types/index.js';
import { AvatarWithFallback } from '../common/AvatarWithFallback.js';

export const TeamManager: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([fetchTeams(), fetchEmployees()])
      .then(([teamData, empData]) => {
        setTeams(teamData);
        setEmployees(empData);
      })
      .catch((err) => setMessage({ type: 'error', text: 'Error loading team configurations.' }))
      .finally(() => setLoading(false));
  }, []);

  const handleNameChange = (index: number, newName: string) => {
    const updated = [...teams];
    updated[index].name = newName;
    setTeams(updated);
  };

  const handleDescChange = (index: number, newDesc: string) => {
    const updated = [...teams];
    updated[index].description = newDesc;
    setTeams(updated);
  };

  const handleLeaderChange = (index: number, employeeId: string) => {
    const updated = [...teams];
    if (!employeeId || employeeId === '') {
      updated[index].teamLeaderEmployeeId = null;
      updated[index].teamLeader = null;
    } else {
      updated[index].teamLeaderEmployeeId = employeeId;
      const matchedEmp = employees.find((e) => e.employeeId === employeeId);
      if (matchedEmp) {
        updated[index].teamLeader = {
          employeeId: matchedEmp.employeeId,
          fullName: matchedEmp.fullName,
          designation: matchedEmp.designation,
          imageUrl: matchedEmp.imageUrl,
          team: matchedEmp.team,
        };
      }
    }
    setTeams(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = teams.map((t, idx) => ({
        slotNumber: idx + 1,
        teamId: t.teamId || `TEAM-0${idx + 1}`,
        name: t.name.trim(),
        description: t.description?.trim() || '',
        teamLeaderEmployeeId: t.teamLeaderEmployeeId || null,
        active: t.active !== false,
      }));
      const updated = await updateTeams(payload);
      setTeams(updated);
      setMessage({ type: 'success', text: 'Team configurations and designated team leaders updated successfully in database.' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update teams.',
      });
    } finally {
      setSaving(false);
    }
  };

  const getTeamMemberCount = (teamName: string) => {
    return employees.filter((e) => e.team?.toLowerCase() === teamName.toLowerCase() && e.active).length;
  };

  // Find employee details for a team's designated leader
  const getLeaderForTeam = (team: Team) => {
    if (team.teamLeader) return team.teamLeader;
    if (team.teamLeaderEmployeeId) {
      const emp = employees.find((e) => e.employeeId === team.teamLeaderEmployeeId);
      if (emp) {
        return {
          employeeId: emp.employeeId,
          fullName: emp.fullName,
          designation: emp.designation,
          imageUrl: emp.imageUrl,
        };
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-amber-400" />
          <span>Team Management</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure official company teams and assign permanent designated team leaders for automatic weekly recognition. Photos are automatically retrieved from the employee directory and Cloudinary.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-700/60 text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading team management data...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team, idx) => {
              const memberCount = getTeamMemberCount(team.name);
              const leader = getLeaderForTeam(team);

              return (
                <div
                  key={team.slotNumber || idx}
                  className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-5 hover:border-slate-700 transition"
                >
                  {/* Card Header: Slot and Member Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 font-bold text-amber-400 text-xs flex items-center justify-center font-mono shadow-sm">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider block">
                          {team.teamId || `TEAM-0${idx + 1}`}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Team Slot {idx + 1}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] px-3 py-1 rounded-full bg-navy-900 border border-slate-700 text-slate-300 font-medium">
                      {memberCount} Active Members
                    </span>
                  </div>

                  {/* Team Name Input */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Official Team Name
                    </label>
                    <input
                      type="text"
                      required
                      value={team.name}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      placeholder={`Team ${idx + 1} Name`}
                      className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white font-bold text-sm focus:border-amber-400"
                    />
                  </div>

                  {/* Designated Team Leader Section */}
                  <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Designated Team Leader</span>
                      </label>
                      {leader && (
                        <button
                          type="button"
                          onClick={() => handleLeaderChange(idx, '')}
                          className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Clear Leader</span>
                        </button>
                      )}
                    </div>

                    {/* Preview of current leader if assigned */}
                    {leader ? (
                      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-navy-900/90 border border-amber-500/30">
                        <div className="relative shrink-0">
                          <AvatarWithFallback
                            src={leader.imageUrl || ''}
                            alt={leader.fullName}
                            rank={1}
                            className="w-14 h-14 rounded-xl object-cover ring-2 ring-amber-400/50 shadow-md"
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                            <Crown className="w-2.5 h-2.5 text-navy-950 fill-navy-950" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">
                              {leader.fullName}
                            </h4>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-950 text-amber-300 border border-slate-700">
                              {leader.employeeId}
                            </span>
                          </div>
                          <p className="text-xs text-amber-200/90 truncate font-medium">
                            {leader.designation}
                          </p>
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                            <UserCheck className="w-3 h-3" />
                            <span>Designated Leader for Recognition</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-950/20 border border-dashed border-amber-600/30 text-center">
                        <span className="text-xs text-amber-300/80 italic">
                          No team leader assigned. Select an employee below.
                        </span>
                      </div>
                    )}

                    {/* Select dropdown to pick or change team leader */}
                    <div>
                      <select
                        value={team.teamLeaderEmployeeId || ''}
                        onChange={(e) => handleLeaderChange(idx, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-slate-200 text-xs focus:border-amber-400 cursor-pointer"
                      >
                        <option value="">-- Choose Leader from Employee Directory --</option>
                        {employees
                          .filter((e) => e.active)
                          .map((emp) => (
                            <option key={emp.employeeId} value={emp.employeeId}>
                              {emp.fullName} ({emp.employeeId}) — {emp.team || emp.department} • {emp.designation}
                            </option>
                          ))}
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Select any active employee. Their profile photo and designation will appear automatically.
                      </p>
                    </div>
                  </div>

                  {/* Team Purpose / Scope (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Team Scope / Mission (Optional)
                    </label>
                    <input
                      type="text"
                      value={team.description || ''}
                      onChange={(e) => handleDescChange(idx, e.target.value)}
                      placeholder="e.g. Core Enterprise Solutions & Cloud Infrastructure"
                      className="w-full px-3 py-2 rounded-xl bg-navy-900/60 border border-slate-800 text-slate-300 text-xs focus:border-amber-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save 8 Team Configurations'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
