import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert, Pagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Block as BlockIcon,
  PersonAdd as AddIcon,
  CheckCircle as ActivateIcon,
  DeleteForever as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [error, setError] = useState('');

  const roles = ['CITIZEN', 'SOCIAL_WORKER', 'ADMIN'];
  const roleColors = {
    CITIZEN: 'default',
    SOCIAL_WORKER: 'info',
    OFFICIAL: 'warning',
    ADMIN: 'secondary',
  };

  useEffect(() => {
    fetchUsers();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/admin/users?page=${page}&size=10`);
      const data = response.data?.data || response.data;
      setUsers(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await api.put(`/api/admin/users/${editUser.id}`, {
        role: editUser.role,
        isActive: editUser.isActive,
      });
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/api/admin/users/${userId}`, { isActive: !isActive });
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/api/admin/users/${deleteConfirmUser.id}`);
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
      setDeleteConfirmUser(null);
    }
  };

  return (
    <Box>
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                👥 Manage Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage all system users, roles, and permissions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/create-user')}
            >
              Add New User
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Loader message="Loading users..." />
          ) : users.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">No users found</Typography>
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Mobile</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{user.fullName}</Typography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.mobile || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={roleColors[user.role] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {/* Edit */}
                        <IconButton
                          onClick={() => setEditUser(user)}
                          color="primary"
                          title="Edit Role/Status"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>

                        {/* Block / Unblock */}
                        <IconButton
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          color={user.isActive ? 'warning' : 'success'}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                          size="small"
                        >
                          {user.isActive ? <BlockIcon /> : <ActivateIcon />}
                        </IconButton>

                        {/* Delete - admin ko delete nahi kar sakte */}
                        {user.role !== 'ADMIN' && (
                          <IconButton
                            onClick={() => setDeleteConfirmUser(user)}
                            color="error"
                            title="Delete User"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={(_, newPage) => setPage(newPage - 1)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User — {editUser?.fullName}</DialogTitle>
        <DialogContent>
          <TextField
            select label="Role" value={editUser?.role || ''}
            onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
            fullWidth margin="normal"
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </TextField>
          <TextField
            select label="Status" value={editUser?.isActive ? 'true' : 'false'}
            onChange={(e) => setEditUser({ ...editUser, isActive: e.target.value === 'true' })}
            fullWidth margin="normal"
          >
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmUser} onClose={() => setDeleteConfirmUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>
          🗑️ Delete User?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete:
          </Typography>
          <Typography fontWeight={700} sx={{ mt: 1 }}>
            {deleteConfirmUser?.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {deleteConfirmUser?.email}
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmUser(null)}>Cancel</Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers;
