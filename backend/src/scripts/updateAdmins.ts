import bcrypt from 'bcryptjs';
import { AdminUser } from '../models/AdminUser.js';
import { connectDB } from '../config/db.js';

async function updateAdminCredentials() {
  try {
    await connectDB();
    console.log('Connected to database. Updating admin accounts...');

    const allowedAdmins = [
      {
        email: 'cheshwar4400@gmail.com',
        password: 'Eshwar@4400',
        name: 'Eshwar Rao',
        role: 'superadmin' as const,
      },
      {
        email: 'hari@sayfix.com',
        password: 'Hari@7898',
        name: 'Hari',
        role: 'superadmin' as const,
      },
      {
        email: 'gtejanaidu.info@gmail.com',
        password: 'Teja@4858#%',
        name: 'Teja Naidu',
        role: 'superadmin' as const,
      },
    ];

    const allowedEmails = allowedAdmins.map((a) => a.email.toLowerCase());

    // 1. Remove all old admin accounts that are not in the allowed list
    const deleteResult = await AdminUser.deleteMany({
      email: { $nin: allowedEmails },
    });
    console.log(`Removed ${deleteResult.deletedCount} old admin accounts.`);

    // 2. Upsert each allowed admin with plain-text password
    for (const admin of allowedAdmins) {
      const updated = await AdminUser.findOneAndUpdate(
        { email: admin.email.toLowerCase() },
        {
          name: admin.name,
          email: admin.email.toLowerCase(),
          password: admin.password,
          passwordHash: '',
          role: admin.role,
        },
        { upsert: true, new: true }
      );

      console.log(`Admin account [${admin.email}] updated with plain-text password: ${updated?.password}`);
    }

    // 3. Output current admin users in database
    const allAdmins = await AdminUser.find({}, 'name email role createdAt');
    console.log('Current authorized admin accounts in database:');
    console.log(JSON.stringify(allAdmins, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Failed to update admin accounts:', err);
    process.exit(1);
  }
}

updateAdminCredentials();
