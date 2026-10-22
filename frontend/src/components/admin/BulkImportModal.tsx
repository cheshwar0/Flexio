import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle2, AlertCircle, X, AlertTriangle } from 'lucide-react';
import { downloadCsvTemplate, bulkImportEmployees } from '../../services/employeeService.js';
import { Team, Employee } from '../../types/index.js';

interface BulkImportModalProps {
  teams: Team[];
  existingEmployees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedRow {
  rowNum: number;
  employeeId: string;
  fullName: string;
  team: string;
  designation: string;
  department?: string;
  imageUrl?: string;
  isValid: boolean;
  error?: string;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  teams,
  existingEmployees,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    importedCount: number;
    skippedCount: number;
    errors: string[];
  } | null>(null);

  const existingIds = new Set(existingEmployees.map((e) => e.employeeId.toUpperCase()));
  const validTeamNames = new Set(teams.map((t) => t.name.toLowerCase()));

  // Simple, robust CSV line parser
  const parseCSV = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim() !== '');
    if (lines.length < 2) {
      alert('CSV must contain a header row and at least one employee data row.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idIdx = headers.indexOf('employeeid');
    const nameIdx = headers.indexOf('fullname');
    const teamIdx = headers.indexOf('team');
    const desigIdx = headers.indexOf('designation');
    const deptIdx = headers.indexOf('department');
    const imgIdx = headers.indexOf('imageurl');

    if (nameIdx === -1 || teamIdx === -1 || desigIdx === -1) {
      alert('CSV must contain fullName, team, and designation columns.');
      return;
    }

    const rows: ParsedRow[] = [];
    const seenInBatch = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex handling quoted commas
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim());

      let employeeId = idIdx !== -1 ? (cols[idIdx] || '').toUpperCase() : '';
      if (!employeeId) {
        employeeId = `EMP-${1001 + existingIds.size + i}`;
      }

      const fullName = cols[nameIdx] || '';
      const team = cols[teamIdx] || '';
      const designation = cols[desigIdx] || '';
      const department = deptIdx !== -1 ? cols[deptIdx] : team;
      const imageUrl = imgIdx !== -1 ? cols[imgIdx] : '';

      let isValid = true;
      let error = '';

      if (!fullName || !team || !designation) {
        isValid = false;
        error = 'Missing required fields (Name, team, or designation)';
      } else if (seenInBatch.has(employeeId)) {
        isValid = false;
        error = `Duplicate employee in CSV file`;
      } else if (existingIds.has(employeeId)) {
        isValid = false;
        error = `Employee is already registered in directory`;
      } else if (validTeamNames.size > 0 && !validTeamNames.has(team.toLowerCase())) {
        isValid = false;
        error = `Team "${team}" does not match any of the 8 configured company teams`;
      }

      seenInBatch.add(employeeId);

      rows.push({
        rowNum: i,
        employeeId,
        fullName,
        team,
        designation,
        department,
        imageUrl,
        isValid,
        error,
      });
    }

    setParsedRows(rows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSV(text);
      };
      reader.readAsText(selected);
    }
  };

  const handleExecuteImport = async () => {
    const validData = parsedRows
      .filter((r) => r.isValid)
      .map((r) => ({
        employeeId: r.employeeId,
        fullName: r.fullName,
        team: r.team,
        designation: r.designation,
        department: r.department,
        imageUrl: r.imageUrl,
      }));

    if (validData.length === 0) return;

    setImporting(true);
    try {
      const res = await bulkImportEmployees(validData);
      setImportResult(res);
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl glass-panel border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Bulk Employee CSV Import</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Rapidly register employees across the 8 company teams into the permanent directory.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Template Download */}
          <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Need the CSV Template?</h4>
                <p className="text-xs text-slate-400">
                  Includes formatted columns: fullName, team, designation, department, imageUrl.
                </p>
              </div>
            </div>
            <button
              onClick={downloadCsvTemplate}
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition shrink-0"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Step 2: Upload CSV File */}
          <div className="p-8 border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-2xl bg-navy-950/60 text-center flex flex-col items-center justify-center transition">
            <Upload className="w-10 h-10 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white">
              {file ? file.name : 'Select or Drop Employee CSV File'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              UTF-8 encoded .csv file with employee details and team assignments.
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              id="csvFileInput"
              className="hidden"
            />
            <label
              htmlFor="csvFileInput"
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-navy-950 font-bold text-xs uppercase tracking-wider shadow"
            >
              Browse CSV File
            </label>
          </div>

          {/* Step 3: Verification & Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              {/* Validation Summary Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{validCount} Ready to Import</span>
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-rose-400 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{invalidCount} Issues to Skip</span>
                    </span>
                  )}
                </div>
                <span className="text-slate-400">Total rows: {parsedRows.length}</span>
              </div>

              {/* Rows Preview Table */}
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-navy-900 text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Team</th>
                      <th className="px-4 py-2.5">Designation</th>
                      <th className="px-4 py-2.5">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {parsedRows.map((r) => (
                      <tr key={r.rowNum} className={r.isValid ? 'hover:bg-navy-900/40' : 'bg-rose-950/20'}>
                        <td className="px-4 py-2">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Valid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Error</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 font-semibold text-white">{r.fullName}</td>
                        <td className="px-4 py-2">{r.team}</td>
                        <td className="px-4 py-2">{r.designation}</td>
                        <td className="px-4 py-2 text-rose-400 text-[11px]">{r.error || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Result Feedback */}
          {importResult && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-sm">
              <p className="font-bold">
                Successfully imported {importResult.importedCount} employees into the permanent directory!
              </p>
              {importResult.skippedCount > 0 && (
                <p className="text-xs text-amber-300 mt-1">
                  {importResult.skippedCount} rows skipped due to duplicate IDs or team discrepancies.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3 bg-navy-950">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm">
            Close
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={validCount === 0 || importing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-sm tracking-wide shadow disabled:opacity-50 flex items-center gap-2"
          >
            {importing ? (
              <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Import {validCount} Valid Employees</span>
          </button>
        </div>
      </div>
    </div>
  );
};
