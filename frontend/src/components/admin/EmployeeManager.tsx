import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Power,
  Upload,
  AlertCircle,
  CheckCircle,
  X,
  FileSpreadsheet,
  Camera,
} from 'lucide-react';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  uploadEmployeePhoto,
} from '../../services/employeeService.js';
import { fetchTeams } from '../../services/teamService.js';
import { Employee, Team } from '../../types/index.js';
import { AvatarWithFallback } from '../common/AvatarWithFallback.js';
import { BulkImportModal } from './BulkImportModal.js';

export const EmployeeManager: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [photoTarget, setPhotoTarget] = useState<Employee | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Employee | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formTeam, setFormTeam] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Direct Photo Upload State for Add/Edit Modal
  const [createPhotoFile, setCreatePhotoFile] = useState<File | null>(null);
  const [createPhotoPreview, setCreatePhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Photo Upload State for Table Quick Action
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, teamData] = await Promise.all([fetchEmployees(), fetchTeams()]);
      setEmployees(empData);
      setTeams(teamData);
      if (teamData.length > 0 && !formTeam) {
        setFormTeam(teamData[0].name);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load employee directory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesTeam = selectedTeam === 'All' || emp.team === selectedTeam;
    const matchesSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase()) ||
      emp.team?.toLowerCase().includes(search.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormEmployeeId('');
    setFormFullName('');
    setFormTeam('');
    setFormDesignation('');
    setFormDepartment('');
    setFormImageUrl('');
    setCreatePhotoFile(null);
    setCreatePhotoPreview(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormEmployeeId(emp.employeeId);
    setFormFullName(emp.fullName);
    setFormTeam(emp.team || (teams.length > 0 ? teams[0].name : ''));
    setFormDesignation(emp.designation);
    setFormDepartment(emp.department || '');
    setFormImageUrl(emp.imageUrl);
    setCreatePhotoFile(null);
    setCreatePhotoPreview(emp.imageUrl);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee._id, {
          fullName: formFullName.trim(),
          team: formTeam,
          designation: formDesignation.trim(),
          department: (formDepartment || formTeam).trim(),
          imageUrl: formImageUrl || undefined,
        });

        // If a new photo file was picked, upload directly to Cloudinary
        if (createPhotoFile) {
          await uploadEmployeePhoto(editingEmployee._id, createPhotoFile);
        }

        setMessage({ type: 'success', text: 'Employee details and photo updated in permanent directory.' });
        setEditingEmployee(null);
      } else {
        const res = await createEmployee({
          fullName: formFullName.trim(),
          team: formTeam,
          designation: formDesignation.trim(),
          department: (formDepartment || formTeam).trim(),
          imageUrl: formImageUrl || undefined,
        });

        // If photo file was selected, upload directly to Cloudinary immediately
        if (createPhotoFile && res.employee?._id) {
          await uploadEmployeePhoto(res.employee._id, createPhotoFile);
        }

        setMessage({ type: 'success', text: 'Employee registered in permanent directory and photo saved to Cloudinary.' });
        setShowAddModal(false);
      }
      setCreatePhotoFile(null);
      setCreatePhotoPreview(null);
      loadData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Error saving employee details.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(confirmDelete._id);
      setMessage({
        type: 'success',
        text: `Employee ${confirmDelete.fullName} permanently deleted from directory.`,
      });
      const deletedId = confirmDelete._id;
      setConfirmDelete(null);
      if (editingEmployee && editingEmployee._id === deletedId) {
        setEditingEmployee(null);
      }
      loadData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to delete employee.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmToggle) return;
    try {
      await toggleEmployeeStatus(confirmToggle._id);
      setMessage({
        type: 'success',
        text: `Employee ${confirmToggle.active ? 'deactivated' : 'reactivated'}. Past rankings remain intact.`,
      });
      setConfirmToggle(null);
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update employee status.' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoTarget || !uploadFile) return;
    setIsUploading(true);
    try {
      await uploadEmployeePhoto(photoTarget._id, uploadFile);
      setMessage({ type: 'success', text: 'Photo uploaded to Cloudinary and permanently saved to profile.' });
      setPhotoTarget(null);
      setUploadFile(null);
      setUploadPreview(null);
      loadData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Photo upload failed.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display">
            Permanent Employee Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registered corporate employees across all 8 teams. Details and Cloudinary photos persist permanently.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBulkImport(true)}
            className="px-4 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Employee</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start justify-between gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-700/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name, team, or designation..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs uppercase font-semibold text-slate-400 whitespace-nowrap">
            Team:
          </span>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
          >
            <option value="All">All 8 Teams</option>
            {teams.map((t) => (
              <option key={t.slotNumber} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permanent Employees Directory Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-navy-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Team</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Loading permanent directory...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No employees found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-navy-900/40 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <AvatarWithFallback
                        src={emp.imageUrl}
                        alt={emp.fullName}
                        className="w-10 h-10 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block">{emp.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium text-xs">
                        {emp.team}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{emp.designation}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          emp.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            emp.active ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {emp.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPhotoTarget(emp)}
                          title="Upload/Replace Cloudinary Headshot"
                          className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-amber-400 transition"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Details"
                          className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-amber-400 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmToggle(emp)}
                          title={emp.active ? 'Deactivate Employee' : 'Reactivate Employee'}
                          className={`p-2 rounded-lg transition ${
                            emp.active
                              ? 'bg-navy-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400'
                              : 'bg-navy-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(emp)}
                          title="Delete Employee Permanently"
                          className="p-2 rounded-lg bg-navy-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {(showAddModal || editingEmployee) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 md:p-8 glass-panel border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingEmployee(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white font-display mb-1">
              {editingEmployee ? 'Edit Permanent Employee Details' : 'Register New Employee in Directory'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Saved details and Cloudinary photos remain permanent across all weeks.
            </p>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="e.g. Alexander Hamilton"
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Team (1 of 8 Teams)
                  </label>
                  <select
                    required
                    value={formTeam}
                    onChange={(e) => setFormTeam(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
                  >
                    <option value="" disabled>
                      -- Select Company Team (1 of 8) --
                    </option>
                    {teams.map((t) => (
                      <option key={t.slotNumber} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="e.g. Lead Architect"
                    className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Profile Photo (Direct File or URL)
                </label>

                {/* Option 1: Direct File Upload to Cloudinary */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-navy-900/90 border border-slate-700">
                  {createPhotoPreview ? (
                    <img
                      src={createPhotoPreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400 shrink-0 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-navy-850 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-5 h-5 text-amber-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      id="modalPhotoInput"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCreatePhotoFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setCreatePhotoPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="modalPhotoInput"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-slate-600 text-xs font-semibold text-slate-200 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{createPhotoFile ? 'Change File' : 'Choose Photo from Computer'}</span>
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      {createPhotoFile
                        ? `Selected: ${createPhotoFile.name}`
                        : 'Saves directly to your Cloudinary storage'}
                    </p>
                  </div>
                </div>

                {/* Option 2: Image URL or Google Drive Link */}
                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Or paste Image URL / Google Drive link
                  </span>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => {
                      setFormImageUrl(e.target.value);
                      if (!createPhotoFile && e.target.value.trim()) {
                        setCreatePhotoPreview(e.target.value.trim());
                      }
                    }}
                    placeholder="https://... or Google Drive share link"
                    className="w-full px-4 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white text-xs focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Google Drive links are automatically converted to direct raw images.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
                {editingEmployee ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(editingEmployee)}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Employee</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingEmployee(null);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-sm tracking-wide shadow flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                        <span>Saving to Cloudinary...</span>
                      </>
                    ) : (
                      <span>{editingEmployee ? 'Update Details' : 'Register Employee'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cloudinary Photo Upload Modal */}
      {photoTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 md:p-8 glass-panel border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => {
                setPhotoTarget(null);
                setUploadFile(null);
                setUploadPreview(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white font-display mb-1">
              Upload Cloudinary Headshot
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Saved permanently to {photoTarget.fullName}'s profile for automatic inclusion in weekly leaderboards.
            </p>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-2xl mb-4 bg-navy-900/40">
              {uploadPreview ? (
                <img
                  src={uploadPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-2xl object-cover ring-2 ring-amber-400 mb-3 shadow-lg"
                />
              ) : (
                <AvatarWithFallback
                  src={photoTarget.imageUrl}
                  alt={photoTarget.fullName}
                  className="w-24 h-24 mb-3"
                />
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileChange}
                id="photoUploadInput"
                className="hidden"
              />
              <label
                htmlFor="photoUploadInput"
                className="cursor-pointer px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-slate-600 text-xs font-semibold text-slate-200 transition"
              >
                Choose Photo from Computer
              </label>
              <p className="text-[10px] text-slate-500 mt-2">JPEG, PNG, WEBP up to 5MB</p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setPhotoTarget(null);
                  setUploadFile(null);
                  setUploadPreview(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!uploadFile || isUploading}
                onClick={handleUploadPhoto}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-sm tracking-wide shadow disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Save to Cloudinary</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Status Toggle */}
      {confirmToggle && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 glass-panel border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display mb-2">
              Confirm {confirmToggle.active ? 'Deactivation' : 'Reactivation'}
            </h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to {confirmToggle.active ? 'deactivate' : 'reactivate'}{' '}
              <span className="font-semibold text-white">{confirmToggle.fullName}</span>?
              {confirmToggle.active && (
                <span className="block mt-2 text-xs text-amber-300">
                  Note: Historical rankings from previous weeks remain permanently intact.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmToggle(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-xl font-bold text-sm ${
                  confirmToggle.active
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Permanent Employee Deletion */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 glass-panel border border-rose-500/30 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2">
              Delete Employee?
            </h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-white">{confirmDelete.fullName}</span>?
              <span className="block mt-2 text-xs text-rose-400 font-medium">
                This action is permanent and removes their profile, photo, and directory records.
              </span>
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteEmployee}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {showBulkImport && (
        <BulkImportModal
          teams={teams}
          existingEmployees={employees}
          onClose={() => setShowBulkImport(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
