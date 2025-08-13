import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

import NepaliAddressSelector from '../components/NepaliAddressSelector';

const RegisterPage = () => {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState(''); // New state for mobile number
  const [address, setAddress] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMunicipal, setSelectedMunicipal] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        first_name,
        last_name,
        email,
        password,
        mobile_number: mobileNumber, // Include mobile number
        address,
        province: selectedProvince,
        district: selectedDistrict,
        municipal: selectedMunicipal,
      });
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="first_name"
            label="First Name"
            name="first_name"
            autoComplete="given-name"
            autoFocus
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="last_name"
            label="Last Name"
            name="last_name"
            autoComplete="family-name"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            id="mobileNumber"
            label="Mobile Number"
            name="mobileNumber"
            autoComplete="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            inputProps={{ pattern: "^980[0-9]{7}$" }} // Nepal mobile number validation
            helperText="Enter 10-digit Nepali mobile number (e.g., 980xxxxxxx)"
          />
          <TextField
            margin="normal"
            fullWidth
            id="address"
            label="Street Address / Tole"
            name="address"
            multiline
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <NepaliAddressSelector
            onAddressChange={({ province, district, municipal }) => {
              setSelectedProvince(province);
              setSelectedDistrict(district);
              setSelectedMunicipal(municipal);
            }}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;
