import React, { useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout.js';
import { DashboardOverview } from '../components/admin/DashboardOverview.js';
import { SelectWeeklyTop10 } from '../components/admin/SelectWeeklyTop10.js';
import { EmployeeManager } from '../components/admin/EmployeeManager.js';
import { TeamManager } from '../components/admin/TeamManager.js';
import { HistoryManager } from '../components/admin/HistoryManager.js';
import { SettingsManager } from '../components/admin/SettingsManager.js';

interface AdminDashboardPageProps {
  initialTab?: string;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview onNavigate={setActiveTab} />;
      case 'select-top10':
        return <SelectWeeklyTop10 />;
      case 'employees':
        return <EmployeeManager />;
      case 'teams':
        return <TeamManager />;
      case 'history':
        return <HistoryManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <DashboardOverview onNavigate={setActiveTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};
