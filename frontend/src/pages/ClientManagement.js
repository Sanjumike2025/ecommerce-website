import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NepaliAddressSelector from '../components/NepaliAddressSelector';

const ClientManagement = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClient, setCurrentClient] = useState(null); // For edit/add
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [municipal, setMunicipal] = useState('');
  const [password, setPassword] = useState(''); // For adding new client or changing password

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter to show only clients, not admins
      setClients(response.data.filter(user => user.role === 'client'));
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to fetch client data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  const handleOpenDialog = (client = null) => {
    setCurrentClient(client);
    if (client) {
      setFirstName(client.first_name || '');
      setLastName(client.last_name || '');
      setEmail(client.email || '');
      setMobileNumber(client.mobile_number || '');
      setAddress(client.address || '');
      setProvince(client.province || '');
      setDistrict(client.district || '');
      setMunicipal(client.municipal || '');
      setPassword(''); // Password is not pre-filled for security
    } else {
      // Reset for new client
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobileNumber('');
      setAddress('');
      setProvince('');
      setDistrict('');
      setMunicipal('');
      setPassword('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentClient(null);
    setError(null);
  };

  const handleSaveClient = async () => {
    setError(null);
    const clientData = {
      first_name: firstName,
      last_name: lastName,
      email,
      mobile_number: mobileNumber,
      address,
      province,
      district,
      municipal,
    };

    if (!currentClient && !password) {
      setError('Password is required for new clients.');
      return;
    }
    if (password) {
      clientData.password = password;
    }

    try {
      if (currentClient) {
        // Update existing client
        await axios.put(`http://localhost:5000/api/users/${currentClient.id}`, clientData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Add new client
        await axios.post('http://localhost:5000/api/auth/register', { ...clientData, password }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchClients();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving client:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to save client.');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchClients();
      } catch (err) {
        console.error('Error deleting client:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to delete client.');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <CircularProgress />
        <Typography>Loading clients...</Typography>
      </Container>
    );
  }

  if (error && !clients.length) { // Only show error if no clients could be loaded
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Client Management
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add New Client
        </Button>
      </Box>

      {clients.length === 0 ? (
        <Typography>No clients found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.id}</TableCell>
                  <TableCell>{client.first_name} {client.last_name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.mobile_number}</TableCell>
                  <TableCell>{client.address}, {client.municipal}, {client.district}, {client.province}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleOpenDialog(client)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteClient(client.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{currentClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!!currentClient} // Email cannot be changed for existing clients
          />
          <TextField
            margin="dense"
            label="Mobile Number"
            type="tel"
            fullWidth
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Street Address / Tole"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <NepaliAddressSelector
            onAddressChange={({ province, district, municipal }) => {
              setProvince(province);
              setDistrict(district);
              setMunicipal(municipal);
            }}
            initialProvince={province}
            initialDistrict={district}
            initialMunicipal={municipal}
          />
          {!currentClient && ( // Password only for new clients
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveClient} variant="contained">
            {currentClient ? 'Update' : 'Add'} Client
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClientManagement;
