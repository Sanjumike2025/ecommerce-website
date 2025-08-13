import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NepaliAddressSelector from '../components/NepaliAddressSelector';

const UserProfilePage = () => {
  const { user, token, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMunicipal, setSelectedMunicipal] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !token) return;
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
        setSelectedProvince(response.data.province || '');
        setSelectedDistrict(response.data.district || '');
        setSelectedMunicipal(response.data.municipal || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!profile) return;

    try {
      const updateData = { ...profile, province: selectedProvince, district: selectedDistrict, municipal: selectedMunicipal };
      if (newPassword) {
        updateData.password = newPassword;
      }

      const response = await axios.put(`http://localhost:5000/api/users/${user.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setNewPassword(''); // Clear password field after successful update
      setSuccess('Profile updated successfully!');

      // If username or email changed, re-login to update context (optional, but good practice)
      if (response.data.first_name !== user.first_name || response.data.last_name !== user.last_name || response.data.email !== user.email) {
        // This is a simplified re-login. In a real app, you might just update the user context directly
        // or prompt user to re-login for security.
        // For now, we'll just update the user object in AuthContext if needed.
        login(response.data.email, newPassword || 'current_password_placeholder'); // This is a simplification
      }

    } catch (err) {
      console.error('Error updating profile:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" align="center">Loading profile...</Typography>
      </Container>
    );
  }

  if (error && !profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" align="center">No profile data found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="first_name"
            label="First Name"
            name="first_name"
            value={profile.first_name || ''}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="last_name"
            label="Last Name"
            name="last_name"
            value={profile.last_name || ''}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            value={profile.email || ''}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="mobile_number"
            label="Mobile Number"
            name="mobile_number"
            value={profile.mobile_number || ''}
            onChange={handleChange}
            inputProps={{ pattern: "^980[0-9]{7}$" }} // Nepal mobile number validation
            helperText="Enter 10-digit Nepali mobile number (e.g., 980xxxxxxx)"
          />
          <NepaliAddressSelector
            onAddressChange={({ province, district, municipal }) => {
              setSelectedProvince(province);
              setSelectedDistrict(district);
              setSelectedMunicipal(municipal);
            }}
            initialProvince={selectedProvince}
            initialDistrict={selectedDistrict}
            initialMunicipal={selectedMunicipal}
          />
          <TextField
            margin="normal"
            fullWidth
            name="password"
            label="New Password (leave blank to keep current)"
            type="password"
            id="new-password"
            value={newPassword}
            onChange={handlePasswordChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Update Profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfilePage;