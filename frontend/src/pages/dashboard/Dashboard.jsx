import React from 'react';
import { useSelector } from 'react-redux';
import CitizenDashboard from './CitizenDashboard';
import OfficialDashboard from './OfficialDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const role = user?.role?.replace('ROLE_', '') || 'CITIZEN';

  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'OFFICIAL':
    case 'SOCIAL_WORKER':
      return <OfficialDashboard />;
    case 'CITIZEN':
    default:
      return <CitizenDashboard />;
  }
};

export default Dashboard;
