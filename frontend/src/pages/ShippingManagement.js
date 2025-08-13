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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ShippingManagement = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter for orders that are not cancelled or delivered, as these are typically managed elsewhere
      setOrders(response.data.filter(order => order.status !== 'Cancelled' && order.status !== 'Delivered'));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch order data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(); // Refresh orders after update
    } catch (err) {
      console.error('Error updating order status:', err.response?.data || err.message);
      alert('Failed to update order status.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <CircularProgress />
        <Typography>Loading shipping data...</Typography>
      </Container>
    );
  }

  if (error && !orders.length) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shipping Management
      </Typography>

      {orders.length === 0 ? (
        <Typography>No active orders for shipping management.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Shipping Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.first_name} {order.last_name} ({order.email})</TableCell>
                  <TableCell>{order.shipping_address}, {order.municipal}, {order.district}, {order.province}</TableCell>
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
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      href={`/order/${order.id}`}
                    >
                      View Order
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ShippingManagement;
