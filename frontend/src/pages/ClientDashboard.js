import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Collapse, IconButton, CircularProgress, Button } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showCancelledOrders, setShowCancelledOrders] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter orders based on showCancelledOrders state
      const filteredOrders = response.data.filter(order =>
        showCancelledOrders ? order.status === 'Cancelled' : order.status !== 'Cancelled'
      );
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchOrders();
    }
  }, [user, token, showCancelledOrders]);

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
        console.error('Error fetching order items:', error);
        alert('Failed to load order details.');
      } finally {
        setLoadingItems(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {user ? user.username : 'Client'}!
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" component={Link} to="/profile">
          Edit Profile
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {showCancelledOrders ? 'Your Cancelled Orders' : 'Your Active Orders'}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setShowCancelledOrders(!showCancelledOrders)}
          sx={{ mb: 2 }}
        >
          {showCancelledOrders ? 'Show Active Orders' : 'Show Cancelled Orders'}
        </Button>
        {orders.length === 0 ? (
          <Typography>{showCancelledOrders ? 'You have no cancelled orders.' : 'You have no active orders yet.'}</Typography>
        ) : (
          <List>
            {orders.map((order) => (
              <Paper key={order.id} sx={{ mb: 2, p: 2 }}>
                <ListItem button onClick={() => handleClick(order.id)}>
                  <ListItemText
                    primary={`Order ID: ${order.id} - Tracking: ${order.tracking_number || 'N/A'} - Total: ${parseFloat(order.total_amount).toFixed(2)}`}
                    secondary={`Date: ${new Date(order.order_date).toLocaleDateString()} | Status: ${order.status}`}
                  />
                  {openOrder === order.id ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openOrder === order.id} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 4, pt: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>Order Items:</Typography>
                    {loadingItems && openOrder === order.id ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={20} /></Box>
                    ) : (
                      <List component="div" disablePadding>
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <ListItem key={index} sx={{ pl: 4 }}>
                              <ListItemText
                                primary={`${item.name} x ${item.quantity}`}
                                secondary={`${parseFloat(item.price).toFixed(2)} each`}
                              />
                              {item.image_url && (
                                <img src={`http://localhost:5000${item.image_url}`} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }} />
                              )}
                            </ListItem>
                          ))
                        ) : (
                          <ListItem sx={{ pl: 4 }}><ListItemText primary="No items found for this order." /></ListItem>
                        )}
                      </List>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2 }}
                      component={Link}
                      to={`/order/${order.id}`}
                    >
                      View Details
                    </Button>
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
};

export default ClientDashboard;