export interface Performer {
  rank: number;
  employeeId: string;
  fullName: string;
  team: string;
  designation: string;
  department?: string;
  imageUrl: string;
  performanceScore: number;
  achievementDescription?: string;
}

export interface LeaderboardData {
  weekId: string;
  title: string;
  presentedBy?: string;
  weekStartDate: string;
  weekEndDate: string;
  publishedAt?: string;
  performers: Performer[];
}

export interface SettingsData {
  companyName: string;
  companyLogoUrl: string;
  presentedBy?: string;
  motivationalMessage: string;
  carouselIntervalSeconds: number;
  dataRefreshIntervalSeconds: number;
  teamLeaderSlideDurationSeconds?: number;
}

export interface WinningTeamLeaderItem {
  teamId: string;
  teamName: string;
  employeeCount: number;
  teamLeaderEmployeeId?: string | null;
  teamLeaderName?: string | null;
  teamLeaderDesignation?: string | null;
  teamLeaderImageUrl?: string | null;
  teamLeader?: {
    employeeId: string;
    fullName: string;
    designation: string;
    imageUrl: string;
  } | null;
  hasConfiguredLeader?: boolean;
}

export interface TopTeamLeaderRecognition {
  success?: boolean;
  published: boolean;
  message?: string;
  weekId?: string;
  weekTitle?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  publishedAt?: string;
  isTie: boolean;
  maxEmployeeCount: number;
  totalPublishedPerformers?: number;
  winningTeams: WinningTeamLeaderItem[];
  allTeamCounts?: Array<{ teamName: string; count: number }>;
  teamId?: string | null;
  teamName?: string | null;
  employeeCount?: number;
  teamLeaderEmployeeId?: string | null;
  teamLeaderName?: string | null;
  teamLeaderDesignation?: string | null;
  teamLeaderImageUrl?: string | null;
  teamLeader?: {
    employeeId: string;
    fullName: string;
    designation: string;
    imageUrl: string;
  } | null;
}

export interface DisplayResponse {
  success: boolean;
  published: boolean;
  message?: string;
  fetchedAt?: string;
  settings: SettingsData;
  leaderboard: LeaderboardData | null;
  topTeamLeader?: TopTeamLeaderRecognition | null;
}

export interface Employee {
  _id: string;
  employeeId: string;
  fullName: string;
  team: string;
  designation: string;
  department?: string;
  cloudinaryPublicId?: string;
  imageUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  _id?: string;
  teamId?: string;
  slotNumber: number;
  name: string;
  description?: string;
  teamLeaderEmployeeId?: string | null;
  active?: boolean;
  teamLeader?: {
    employeeId: string;
    fullName: string;
    designation: string;
    imageUrl: string;
    team?: string;
  } | null;
}


export interface WeeklyRankingItem {
  _id?: string;
  employeeId: string;
  rank: number;
  performanceScore: number;
  achievementDescription?: string;
  fullName?: string;
  team?: string;
  designation?: string;
  department?: string;
  imageUrl?: string;
  active?: boolean;
}

export interface Week {
  _id: string;
  weekId: string;
  title: string;
  presentedBy?: string;
  weekStartDate: string;
  weekEndDate: string;
  status: 'draft' | 'published';
  isCurrent?: boolean;
  publishedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
