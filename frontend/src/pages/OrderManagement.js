import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Select, MenuItem, FormControl, InputLabel, Collapse, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, FormLabel, Radio } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const OrderManagement = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedOrderIdToCancel, setSelectedOrderIdToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelledOrders, setShowCancelledOrders] = useState(false);

  const cancellationReasons = [
    'Out of stock',
    'Change of mind (not accepted)',
    'Sourcing delay',
    'Found cheaper elsewhere',
    'Delivery time too long',
    'Other',
  ];

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredOrders = response.data.filter(order =>
        showCancelledOrders ? order.status === 'Cancelled' : order.status !== 'Cancelled'
      );
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, showCancelledOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status.');
    }
  };

  const handleClick = async (orderId) => {
    if (openOrder === orderId) {
      setOpenOrder(null);
    } else {
      setLoadingItems(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Update the specific order in the state with its items
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, items: response.data.items } : order
          )
        );
        setOpenOrder(orderId);
      } catch (error) {
        console.error('Error fetching order items:', error.response?.data || error.message);
        alert('Failed to load order details.');
      } finally {
        setLoadingItems(false);
      }
    }
  };

  const handleOpenCancelDialog = (orderId) => {
    setSelectedOrderIdToCancel(orderId);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setSelectedOrderIdToCancel(null);
    setCancelReason('');
  };

  const handleAdminCancelOrder = async () => {
    if (!cancelReason) {
      alert('Please select a cancellation reason.');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/orders/${selectedOrderIdToCancel}/cancel`, { reason: cancelReason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Order cancelled successfully!');
      handleCloseCancelDialog();
      fetchOrders(); // Refresh orders after cancellation
    } catch (err) {
      console.error('Error cancelling order:', err.response?.data?.message || err.message);
      alert('Failed to cancel order: ' + (err.response?.data?.message || 'Please try again.'));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Order Management
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setShowCancelledOrders(!showCancelledOrders)}
        >
          {showCancelledOrders ? 'Show Active Orders' : 'Show Cancelled Orders'}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <TableRow>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.user_first_name} {order.user_last_name} ({order.user_email})</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      to={`/order/${order.id}`}
                    >
                      View Details
                    </Button>
                    {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => handleOpenCancelDialog(order.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleClick(order.id)}>
                      {openOrder === order.id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={openOrder === order.id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Order Items
                        </Typography>
                        {loadingItems && openOrder === order.id ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={20} /></Box>
                        ) : (
                          <Table size="small" aria-label="purchases">
                            <TableHead>
                              <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.cancellation_reason && (
                                <TableRow>
                                  <TableCell colSpan={4}>
                                    <Typography variant="body2" color="error">
                                      <strong>Cancellation Reason:</strong> {order.cancellation_reason}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell component="th" scope="row">
                                      {item.name}
                                      {item.image_url && (
                                        <img src={`http://localhost:5000${item.image_url}`} alt={item.name} style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: '4px', marginLeft: '10px' }} />
                                      )}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell align="right">${parseFloat(item.price).toFixed(2)}</TableCell>
                                    <TableCell align="right">${(parseFloat(item.price) * item.quantity).toFixed(2)}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow><TableCell colSpan={4}>No items found for this order.</TableCell></TableRow>
                              )}
                            </TableBody>
                          </Table>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
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
          <Button onClick={handleCloseCancelDialog}>No</Button>
          <Button onClick={handleAdminCancelOrder} color="error" variant="contained">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManagement;