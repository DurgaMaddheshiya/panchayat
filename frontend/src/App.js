import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/layout/Layout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard';
import ComplaintList from './pages/complaints/ComplaintList';
import ComplaintDetails from './pages/complaints/ComplaintDetails';
import CreateComplaint from './pages/complaints/CreateComplaint';
import MyComplaints from './pages/complaints/MyComplaints';
import AssignedComplaints from './pages/complaints/AssignedComplaints';
import EditComplaint from './pages/complaints/EditComplaint';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';
import CreateUser from './pages/admin/CreateUser';
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';
import DeletedComplaints from './pages/admin/DeletedComplaints';
import NotFound from './pages/NotFound';

const theme = createTheme({
  palette: {
    primary: { main: '#667eea', light: '#8fa4f0', dark: '#4a5cd4' },
    secondary: { main: '#764ba2', light: '#9b6fc4', dark: '#5a3480' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    success: { main: '#10b981' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
});

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />

        {/* Protected — wrapped in Layout */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Complaints — /create MUST come before /:id */}
          <Route path="/complaints/create" element={<CreateComplaint />} />
          <Route path="/complaints/:id/edit" element={<EditComplaint />} />
          <Route path="/complaints/:id" element={<ComplaintDetails />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/assigned-complaints" element={<AssignedComplaints />} />

          {/* Profile */}
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin only */}
          <Route path="/admin/create-user" element={<CreateUser />} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/admin/deleted-complaints" element={<DeletedComplaints />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
