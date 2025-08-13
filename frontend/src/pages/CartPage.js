import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CheckoutDialog from '../components/CheckoutDialog'; // Import the new dialog

const CartPage = () => {
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false); // State for dialog

  const getEffectivePrice = (item) => {
    const originalPrice = parseFloat(item.price);
    if (item.discount_percentage && item.discount_percentage > 0) {
      return originalPrice * (1 - item.discount_percentage / 100);
    }
    return originalPrice;
  };

  const total = cartItems.reduce((sum, item) => sum + getEffectivePrice(item) * item.quantity, 0);

  const handleOpenCheckout = () => {
    if (!user) {
      alert('Please log in to proceed with checkout.');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    setOpenCheckoutDialog(true);
  };

  const handleCloseCheckout = () => {
    setOpenCheckoutDialog(false);
  };

  const handlePlaceOrder = async (shippingDetails) => {
    try {
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const { paymentMethod, ...restShippingDetails } = shippingDetails;

      await axios.post('http://localhost:5000/api/orders', { items: orderItems, shippingDetails: restShippingDetails, paymentMethod }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Order placed successfully!');
      clearCart();
      handleCloseCheckout();
      navigate('/client'); // Redirect to client dashboard after order

    } catch (error) {
      console.error('Error placing order:', error.response?.data?.message || error.message);
      alert('Failed to place order: ' + (error.response?.data?.message || 'Please try again.'));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Shopping Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Your cart is empty.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} href="/">
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 4 }}>
          <List>
            {cartItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="remove" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <RemoveIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="add" onClick={() => addToCart(item)}>
                        <AddIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => removeFromCart(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <>
                        {item.discount_percentage && item.discount_percentage > 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ${parseFloat(item.price).toFixed(2)} x {item.quantity}
                          </Typography>
                        ) : null}
                        <Typography variant="body2" color="text.secondary">
                          ${getEffectivePrice(item).toFixed(2)} x {item.quantity}
                        </Typography>
                      </>
                    }
                  />
                  <Typography variant="body1">
                    ${(getEffectivePrice(item) * item.quantity).toFixed(2)}
                  </Typography>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Typography variant="h6">
              Total: ${total.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" color="error" onClick={clearCart}>
              Clear Cart
            </Button>
            <Button variant="contained" color="primary" size="large" onClick={handleOpenCheckout}>
              Proceed to Checkout
            </Button>
          </Box>
        </Paper>
      )}
      <CheckoutDialog
        open={openCheckoutDialog}
        onClose={handleCloseCheckout}
        onPlaceOrder={handlePlaceOrder}
        cartItems={cartItems}
        total={total}
        user={user}
      />
    </Container>
  );
};

export default CartPage;
