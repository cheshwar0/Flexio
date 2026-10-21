import { Request, Response, NextFunction } from 'express';
import { Employee } from '../models/Employee.js';
import { Team } from '../models/Team.js';
import { uploadEmployeeImage, deleteCloudinaryImage } from '../services/cloudinaryService.js';

/**
 * Normalizes image URLs from Google Drive or spreadsheets into direct renderable image links
 */
export function formatDirectImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  // Support Google Drive share links: /file/d/FILE_ID or ?id=FILE_ID
  const driveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return trimmed;
}

export async function getEmployees(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { search, team, department, activeOnly } = req.query;
    const query: any = {};

    if (activeOnly === 'true') {
      query.active = true;
    }

    if (team && typeof team === 'string' && team !== 'All' && team !== 'All Teams') {
      query.team = team;
    }

    if (department && typeof department === 'string' && department !== 'All') {
      query.department = department;
    }

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { fullName: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex },
        { team: searchRegex },
        { department: searchRegex },
      ];
    }

    const employees = await Employee.find(query).sort({ fullName: 1 });
    res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (err) {
    next(err);
  }
}

export async function getEmployeeById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }
    res.json({ success: true, employee });
  } catch (err) {
    next(err);
  }
}

export async function createEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { employeeId, fullName, team, designation, department, imageUrl } = req.body;

    if (!employeeId || !fullName || !team || !designation) {
      res.status(400).json({
        success: false,
        message: 'Employee ID, full name, team, and designation are required.',
      });
      return;
    }

    // Validate team against configured 8 teams
    const configuredTeams = await Team.find();
    if (configuredTeams.length > 0) {
      const validNames = configuredTeams.map((t) => t.name.toLowerCase());
      if (!validNames.includes(team.trim().toLowerCase())) {
        res.status(400).json({
          success: false,
          message: `Team "${team}" is not one of the company's 8 configured teams.`,
        });
        return;
      }
    }

    const cleanId = employeeId.trim().toUpperCase();
    const existing = await Employee.findOne({ employeeId: cleanId });
    if (existing) {
      res.status(400).json({
        success: false,
        message: `Employee ID "${cleanId}" is already registered in the directory.`,
      });
      return;
    }

    const employee = await Employee.create({
      employeeId: cleanId,
      fullName: fullName.trim(),
      team: team.trim(),
      designation: designation.trim(),
      department: department?.trim() || team.trim(),
      imageUrl:
        formatDirectImageUrl(imageUrl) ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      active: true,
    });

    res.status(201).json({
      success: true,
      message: 'Employee permanently registered in directory.',
      employee,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { fullName, team, designation, department, active, imageUrl } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }

    if (team) {
      // Validate team against configured teams
      const configuredTeams = await Team.find();
      if (configuredTeams.length > 0) {
        const validNames = configuredTeams.map((t) => t.name.toLowerCase());
        if (!validNames.includes(team.trim().toLowerCase())) {
          res.status(400).json({
            success: false,
            message: `Team "${team}" is not one of the company's 8 configured teams.`,
          });
          return;
        }
      }
      employee.team = team.trim();
    }

    if (fullName !== undefined) employee.fullName = fullName.trim();
    if (designation !== undefined) employee.designation = designation.trim();
    if (department !== undefined) employee.department = department.trim();
    if (active !== undefined) employee.active = Boolean(active);
    if (imageUrl !== undefined) employee.imageUrl = formatDirectImageUrl(imageUrl);

    await employee.save();

    res.json({
      success: true,
      message: 'Employee details updated successfully.',
      employee,
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleEmployeeStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }

    employee.active = !employee.active;
    await employee.save();

    res.json({
      success: true,
      message: `Employee ${employee.active ? 'activated' : 'deactivated'} successfully. Past rankings remain preserved.`,
      employee,
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadEmployeePhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file uploaded.' });
      return;
    }

    // Clean up old Cloudinary photo if one exists
    if (employee.cloudinaryPublicId) {
      await deleteCloudinaryImage(employee.cloudinaryPublicId);
    }

    const uploadResult = await uploadEmployeeImage(
      req.file.buffer,
      req.file.mimetype,
      employee.employeeId
    );

    employee.imageUrl = uploadResult.imageUrl;
    employee.cloudinaryPublicId = uploadResult.cloudinaryPublicId || '';
    await employee.save();

    res.json({
      success: true,
      message: 'Employee photo saved to Cloudinary and permanently associated with employee profile.',
      imageUrl: employee.imageUrl,
      cloudinaryPublicId: employee.cloudinaryPublicId,
      employee,
    });
  } catch (err) {
    next(err);
  }
}

export async function bulkImportEmployees(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { employees: batch } = req.body;

    if (!batch || !Array.isArray(batch) || batch.length === 0) {
      res.status(400).json({
        success: false,
        message: 'A non-empty array of employee objects is required for bulk import.',
      });
      return;
    }

    const configuredTeams = await Team.find();
    const validTeamMap = new Map(configuredTeams.map((t) => [t.name.toLowerCase(), t.name]));

    const existingEmployees = await Employee.find().select('employeeId');
    const existingIdSet = new Set(existingEmployees.map((e) => e.employeeId.toUpperCase()));

    const batchIdSet = new Set<string>();
    const validDocs: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const rowNum = i + 1;

      if (!row.employeeId || !row.fullName || !row.team || !row.designation) {
        errors.push(`Row ${rowNum}: Missing required fields (Employee ID, Full Name, Team, or Designation).`);
        continue;
      }

      const cleanId = String(row.employeeId).trim().toUpperCase();

      if (batchIdSet.has(cleanId)) {
        errors.push(`Row ${rowNum}: Duplicate Employee ID "${cleanId}" within CSV import file.`);
        continue;
      }
      batchIdSet.add(cleanId);

      if (existingIdSet.has(cleanId)) {
        errors.push(`Row ${rowNum}: Employee ID "${cleanId}" is already registered in permanent directory.`);
        continue;
      }

      const teamKey = String(row.team).trim().toLowerCase();
      if (validTeamMap.size > 0 && !validTeamMap.has(teamKey)) {
        errors.push(
          `Row ${rowNum} (${cleanId}): Team "${row.team}" is not one of the company's 8 configured teams.`
        );
        continue;
      }
      const canonicalTeam = validTeamMap.get(teamKey) || String(row.team).trim();

      validDocs.push({
        employeeId: cleanId,
        fullName: String(row.fullName).trim(),
        team: canonicalTeam,
        designation: String(row.designation).trim(),
        department: row.department ? String(row.department).trim() : canonicalTeam,
        imageUrl:
          row.imageUrl && String(row.imageUrl).trim() !== ''
            ? formatDirectImageUrl(String(row.imageUrl).trim())
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        active: true,
      });
    }

    if (validDocs.length > 0) {
      await Employee.insertMany(validDocs);
    }

    res.json({
      success: true,
      message: `Bulk import completed: ${validDocs.length} employees imported into directory. ${errors.length} rows skipped with issues.`,
      importedCount: validDocs.length,
      skippedCount: errors.length,
      errors,
    });
  } catch (err) {
    next(err);
  }
}

export function getCsvTemplate(req: Request, res: Response): void {
  const headers = 'employeeId,fullName,team,designation,department,imageUrl\n';
  const sample1 = 'EMP-2001,Sarah Jenkins,Engineering,Senior Backend Engineer,Engineering,https://images.unsplash.com/photo-1573496359142-b8d87734a5a2\n';
  const sample2 = 'EMP-2002,Michael Chang,Sales & Revenue,Account Executive,Sales,\n';
  const csvContent = headers + sample1 + sample2;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="employee_bulk_import_template.csv"');
  res.send(csvContent);
}
