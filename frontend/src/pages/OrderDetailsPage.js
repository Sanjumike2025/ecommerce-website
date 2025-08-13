import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import JsBarcode from 'jsbarcode';


const OrderDetailsPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const cancellationReasons = [
    'Out of stock',
    'Change of mind (not accepted)',
    'Sourcing delay',
    'Found cheaper elsewhere',
    'Delivery time too long',
    'Other',
  ];

  const componentRef = useRef();
  const barcodeRef = useRef();

  const getEffectivePrice = (item) => {
    const originalPrice = parseFloat(item.price);
    if (item.discount_percentage && item.discount_percentage > 0) {
      return originalPrice * (1 - item.discount_percentage / 100);
    }
    return originalPrice;
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching order details for ID: ${id}`);
        const response = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Raw API response:', response); // Log the full response object
        setOrder(response.data);
        console.log('Order data fetched:', response.data); // This is the crucial log
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchOrderDetails();
    }
  }, [id, token]);

  useEffect(() => {
    if (order && order.tracking_number) {
      try {
                  JsBarcode(barcodeRef.current, order.tracking_number, {
          format: "CODE128",
          displayValue: true,
          height: 50,
          width: 2,
        });
      } catch (e) {
        console.error("Error generating barcode:", e);
      }
    }
  }, [order]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      alert('Please select a cancellation reason.');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/orders/${order.id}/cancel`, { reason: cancelReason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Order cancelled successfully!');
      setOpenCancelDialog(false);
      // Optionally, refetch order details to update status
      // fetchOrderDetails(); // You might need to make fetchOrderDetails accessible or re-trigger useEffect
      setOrder(prevOrder => ({ ...prevOrder, status: 'Cancelled', cancellation_reason: cancelReason }));
    } catch (err) {
      console.error('Error cancelling order:', err.response?.data?.message || err.message);
      alert('Failed to cancel order: ' + (err.response?.data?.message || 'Please try again.'));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <CircularProgress />
        <Typography>Loading order details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography>Order not found.</Typography>
      </Container>
    );
  }

  const calculatedTotalAmount = order.items.reduce((sum, item) => sum + getEffectivePrice(item) * item.quantity, 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <div ref={componentRef}>
        <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Order Details
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Order Information</Typography>
            <Typography><strong>Order ID:</strong> {order.id}</Typography>
            <Typography><strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}</Typography>
            <Typography><strong>Status:</strong> {order.status}</Typography>
            <Typography><strong>Total Amount:</strong> ${calculatedTotalAmount.toFixed(2)}</Typography>
            <Typography><strong>Tracking Number:</strong> {order.tracking_number || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Shipping Information</Typography>
            <Typography><strong>Name:</strong> {order.first_name} {order.last_name}</Typography>
            <Typography><strong>Email:</strong> {order.email}</Typography>
            <Typography><strong>Mobile:</strong> {order.mobile_number}</Typography>
            <Typography><strong>Address:</strong> {order.shipping_address}</Typography>
            <Typography><strong>Location:</strong> {order.municipal}, {order.district}, {order.province}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Order Items</Typography>
        <List>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText
                  primary={
                    <>
                      {item.name}
                      {item.discount_percentage && item.discount_percentage > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', ml: 1, display: 'inline' }}>
                          ${parseFloat(item.price).toFixed(2)}
                        </Typography>
                      )}
                    </>
                  }
                  secondary={`${getEffectivePrice(item).toFixed(2)} x ${item.quantity}`}
                />
                {item.image_url && (
                  <img src={`http://localhost:5000${item.image_url}`} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }} />
                )}
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="No items found for this order." /></ListItem>
          )}
        </List>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 3 }}>
          {order.tracking_number && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1">Barcode</Typography>
              <svg id="barcode" ref={barcodeRef}></svg>
            </Box>
          )}
          {order.tracking_number && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1">QR Code</Typography>
              <QRCodeCanvas value={order.tracking_number} size={128} level="H" />
            </Box>
          )}
        </Box>
      </Paper>
      </div>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button variant="contained" onClick={handlePrint}>
          Print Order
        </Button>
        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
          <Button
            variant="outlined"
            color="error"
            sx={{ ml: 2 }}
            onClick={() => setOpenCancelDialog(true)}
          >
            Cancel Order
          </Button>
        )}
      </Box>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this order?</Typography>
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Reason for cancellation:</FormLabel>
            <RadioGroup
              aria-label="cancel reason"
              name="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            >
              {cancellationReasons.map((reason) => (
                <FormControlLabel key={reason} value={reason} control={<Radio />} label={reason} />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>No</Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetailsPage;
