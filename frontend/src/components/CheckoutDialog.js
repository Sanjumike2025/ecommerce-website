import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@mui/material';
import NepaliAddressSelector from './NepaliAddressSelector';

const CheckoutDialog = ({ open, onClose, onPlaceOrder, cartItems, total, user }) => {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile_number || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [selectedProvince, setSelectedProvince] = useState(user?.province || '');
  const [selectedDistrict, setSelectedDistrict] = useState(user?.district || '');
  const [selectedMunicipal, setSelectedMunicipal] = useState(user?.municipal || '');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Default payment method

  console.log('CheckoutDialog: user prop', user);

  useEffect(() => {
    console.log('CheckoutDialog: useEffect triggered by user change', user);
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setEmail(user?.email || '');
    setMobileNumber(user?.mobile_number || '');
    setShippingAddress(user?.address || '');
    setSelectedProvince(user?.province || '');
    setSelectedDistrict(user?.district || '');
    setSelectedMunicipal(user?.municipal || '');
  }, [user]);

  const handleConfirmOrder = () => {
    if (!shippingAddress || !firstName || !lastName || !email || !mobileNumber || !selectedProvince || !selectedDistrict || !selectedMunicipal) {
      alert('Please fill in all shipping details and select a full address.');
      return;
    }
    onPlaceOrder({ firstName, lastName, email, mobileNumber, shippingAddress, province: selectedProvince, district: selectedDistrict, municipal: selectedMunicipal, paymentMethod });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Proceed to Checkout</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>Order Summary</Typography>
        <List disablePadding>
          {cartItems.map((item) => (
            <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
              <ListItemText primary={item.name} secondary={`Quantity: ${item.quantity}`} />
              <Typography variant="body2">${parseFloat(item.price).toFixed(2)}</Typography>
            </ListItem>
          ))}
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary="Total" />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              ${total.toFixed(2)}
            </Typography>
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Shipping Details</Typography>
        <TextField
          margin="dense"
          id="firstName"
          label="First Name"
          type="text"
          fullWidth
          variant="outlined"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <TextField
          margin="dense"
          id="lastName"
          label="Last Name"
          type="text"
          fullWidth
          variant="outlined"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <TextField
          margin="dense"
          id="email"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          margin="dense"
          id="mobileNumber"
          label="Mobile Number"
          type="tel"
          fullWidth
          variant="outlined"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
          inputProps={{ pattern: "^980[0-9]{7}$" }} // Nepal mobile number validation
          helperText="Enter 10-digit Nepali mobile number (e.g., 980xxxxxxx)"
        />
        <TextField
          autoFocus
          margin="dense"
          id="shippingAddress"
          label="Street Address / Tole"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={2}
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          required
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

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Payment Method</Typography>
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Select Payment Method</FormLabel>
          <RadioGroup
            aria-label="payment method"
            name="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel value="COD" control={<Radio />} label="Cash on Delivery (COD)" />
            <FormControlLabel value="Esewa" control={<Radio />} label="Esewa" />
            <FormControlLabel value="Khalti" control={<Radio />} label="Khalti" />
            <FormControlLabel value="Bank" control={<Radio />} label="Bank Transfer" />
          </RadioGroup>
        </FormControl>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirmOrder}>
          Confirm Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutDialog;
