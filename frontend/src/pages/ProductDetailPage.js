import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  CardMedia,
  Paper,
} from '@mui/material';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" align="center">Loading product details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CardMedia
            component="img"
            image={product.image_url ? `http://localhost:5000${product.image_url}` : 'https://via.placeholder.com/400x300?text=No+Image'}
            alt={product.name}
            sx={{ maxWidth: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain' }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {product.description}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            ${parseFloat(product.price).toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            In Stock: {product.stock}
          </Typography>
          <Button variant="contained" color="primary" size="large" onClick={() => addToCart(product)}>
            Add to Cart
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            sx={{ ml: 2 }}
            onClick={() => {
              addToCart(product);
              navigate('/cart');
            }}
          >
            Buy Now
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductDetailPage;