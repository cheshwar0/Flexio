import bcrypt from 'bcryptjs';
import { AdminUser } from '../models/AdminUser.js';
import { Employee } from '../models/Employee.js';
import { WeeklyPerformance } from '../models/WeeklyPerformance.js';
import { WeeklyRanking } from '../models/WeeklyRanking.js';
import { Settings } from '../models/Settings.js';
import { Team } from '../models/Team.js';
import { DEFAULT_8_TEAMS } from '../controllers/teamController.js';
import { connectDB } from '../config/db.js';

const DEMO_EMPLOYEES = [
  {
    employeeId: 'EMP-1001',
    fullName: 'Sophia Montgomery',
    team: 'Alpha',
    designation: 'Senior Enterprise Account Executive',
    department: 'Alpha',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1002',
    fullName: 'Marcus Vance',
    team: 'Beta',
    designation: 'Staff Cloud Infrastructure Architect',
    department: 'Beta',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1003',
    fullName: 'Elena Rostova',
    team: 'Gamma',
    designation: 'Lead Product Experience Designer',
    department: 'Gamma',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1004',
    fullName: 'David Sterling',
    team: 'Delta',
    designation: 'Global Customer Success Director',
    department: 'Delta',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1005',
    fullName: 'Amara Okafor',
    team: 'Omega',
    designation: 'Senior Machine Learning Engineer',
    department: 'Omega',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1006',
    fullName: 'Julian Hayes',
    team: 'Sigma',
    designation: 'Head of Growth Marketing',
    department: 'Sigma',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1007',
    fullName: 'Chloe Lin',
    team: 'Appex',
    designation: 'Principal Security Analyst',
    department: 'Appex',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1008',
    fullName: 'Alexander Wright',
    team: 'Zta',
    designation: 'Operations Strategy Manager',
    department: 'Zta',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1009',
    fullName: 'Priya Sharma',
    team: 'Alpha',
    designation: 'Senior DevOps Solutions Lead',
    department: 'Alpha',
    imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1010',
    fullName: 'Lucas Silva',
    team: 'Beta',
    designation: 'Financial Planning & Analysis Lead',
    department: 'Beta',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1011',
    fullName: 'Rachel Green',
    team: 'Gamma',
    designation: 'Talent Acquisition Partner',
    department: 'Gamma',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    employeeId: 'EMP-1012',
    fullName: 'Nathaniel Cole',
    team: 'Delta',
    designation: 'Solutions Engineering Consultant',
    department: 'Delta',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
];

const DEMO_RANKINGS = [
  {
    employeeId: 'EMP-1001',
    rank: 1,
    performanceScore: 994,
    achievementDescription: 'Closed $2.4M enterprise deal and exceeded quarterly target by 142%',
  },
  {
    employeeId: 'EMP-1002',
    rank: 2,
    performanceScore: 981,
    achievementDescription: 'Delivered multi-region zero-downtime architecture ahead of schedule',
  },
  {
    employeeId: 'EMP-1003',
    rank: 3,
    performanceScore: 968,
    achievementDescription: 'Redesigned core checkout funnel, raising customer conversion by 34%',
  },
  {
    employeeId: 'EMP-1004',
    rank: 4,
    performanceScore: 955,
    achievementDescription: 'Achieved 99.4% CSAT score across 450+ client escalation cases',
  },
  {
    employeeId: 'EMP-1005',
    rank: 5,
    performanceScore: 942,
    achievementDescription: 'Deployed custom LLM inference engine cutting server costs by 48%',
  },
  {
    employeeId: 'EMP-1006',
    rank: 6,
    performanceScore: 935,
    achievementDescription: 'Generated 4,200 qualified inbound leads via viral product campaign',
  },
  {
    employeeId: 'EMP-1007',
    rank: 7,
    performanceScore: 924,
    achievementDescription: 'Resolved critical vulnerability audits with zero compliance gaps',
  },
  {
    employeeId: 'EMP-1008',
    rank: 8,
    performanceScore: 915,
    achievementDescription: 'Optimized vendor contracts saving $180,000 in annual SaaS spend',
  },
  {
    employeeId: 'EMP-1009',
    rank: 9,
    performanceScore: 908,
    achievementDescription: 'Reduced CI/CD build deployment cycle from 45 min down to 6 min',
  },
  {
    employeeId: 'EMP-1010',
    rank: 10,
    performanceScore: 896,
    achievementDescription: 'Automated global billing reconciliation with 100% precision',
  },
];

export async function seedInitialData() {
  try {
    // 1. Ensure Settings exists
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({
        companyName: 'FLEXIO',
        companyLogoUrl: '/flexio-logo.png',
        motivationalMessage: 'EXCELLENCE DESERVES RECOGNITION',
        carouselIntervalSeconds: 5,
        dataRefreshIntervalSeconds: 60,
        teamLeaderSlideDurationSeconds: 5,
      });
      console.log('Default company settings seeded.');
    } else if (!existingSettings.companyLogoUrl) {
      existingSettings.companyName = 'FLEXIO';
      existingSettings.companyLogoUrl = '/flexio-logo.png';
      if (!existingSettings.teamLeaderSlideDurationSeconds) {
        existingSettings.teamLeaderSlideDurationSeconds = 5;
      }
      await existingSettings.save();
    }

    // 2. Ensure 8 Company Teams exist and have designated team leaders
    const teamCount = await Team.countDocuments();
    if (teamCount === 0) {
      await Team.insertMany(DEFAULT_8_TEAMS);
      console.log('Configured initial 8 company teams with designated leaders.');
    } else {
      for (const defTeam of DEFAULT_8_TEAMS) {
        const teamDoc = await Team.findOne({ slotNumber: defTeam.slotNumber });
        if (teamDoc) {
          let updated = false;
          if (!teamDoc.teamId) {
            teamDoc.teamId = defTeam.teamId;
            updated = true;
          }
          if (!teamDoc.teamLeaderEmployeeId) {
            teamDoc.teamLeaderEmployeeId = defTeam.teamLeaderEmployeeId;
            updated = true;
          }
          if (teamDoc.active === undefined) {
            teamDoc.active = true;
            updated = true;
          }
          if (updated) {
            await teamDoc.save();
          }
        }
      }
    }

    // 3. Ensure authorized Admin accounts exist
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
      const salt1 = await bcrypt.genSalt(12);
      const hash1 = await bcrypt.hash('Eshwar@4400', salt1);
      await AdminUser.create({
        name: 'Eshwar Rao',
        email: 'cheshwar4400@gmail.com',
        passwordHash: hash1,
        role: 'superadmin',
      });

      const salt2 = await bcrypt.genSalt(12);
      const hash2 = await bcrypt.hash('Hari@7898', salt2);
      await AdminUser.create({
        name: 'Hari',
        email: 'hari@sayfix.com',
        passwordHash: hash2,
        role: 'superadmin',
      });

      const salt3 = await bcrypt.genSalt(12);
      const hash3 = await bcrypt.hash('Teja@4858#%', salt3);
      await AdminUser.create({
        name: 'Teja Naidu',
        email: 'gtejanaidu.info@gmail.com',
        passwordHash: hash3,
        role: 'superadmin',
      });
      console.log('Authorized admin accounts created: cheshwar4400@gmail.com, hari@sayfix.com & gtejanaidu.info@gmail.com');
    }


    // 4. Ensure Employees exist in Permanent Directory
    const employeeCount = await Employee.countDocuments();
    if (employeeCount === 0) {
      await Employee.insertMany(DEMO_EMPLOYEES);
      console.log(`Seeded ${DEMO_EMPLOYEES.length} employees across 8 company teams.`);
    }

    // 5. Ensure at least one published active week exists
    const publishedWeekCount = await WeeklyPerformance.countDocuments({ status: 'published' });
    if (publishedWeekCount === 0) {
      const today = new Date();
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);

      const weekId = `2026-W${Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 3600 * 1000))}`;

      const week = await WeeklyPerformance.create({
        weekId,
        title: 'Weekly Performance Championship',
        presentedBy: 'Alpha Team',
        weekStartDate: lastMonday,
        weekEndDate: lastSunday,
        status: 'published',
        isCurrent: true,
        publishedAt: new Date(),
        createdBy: 'HR Leadership Team',
      });

      const rankingsWithWeek = DEMO_RANKINGS.map((r) => ({
        ...r,
        weekId: week.weekId,
      }));

      await WeeklyRanking.insertMany(rankingsWithWeek);
      console.log(`Seeded active published week "${week.weekId}" with Top 10 corporate rankings.`);
    }
  } catch (err) {
    console.error('Error during initial data seeding:', err);
  }
}

// Support executing directly as a standalone CLI script: npm run seed
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedInitialData();
    console.log('Standalone seeding complete.');
    process.exit(0);
  })();
}
