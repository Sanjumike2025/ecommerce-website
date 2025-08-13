import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import ProductCarousel from '../components/ProductCarousel';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products?searchTerm=${searchTerm}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]); // Re-fetch products when searchTerm changes

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Container sx={{ py: 4 }}>
      <ProductCarousel products={products} />
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Our Products
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <TextField
          label="Search Products"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: '100%', maxWidth: 500 }}
        />
      </Box>

      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Link to={`/product/${product.id}`}>
                <CardMedia
                  component="img"
                  sx={{
                    // 16:9
                    pt: '56.25%',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                  image={product.image_url ? `http://localhost:5000${product.image_url}` : 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={product.name}
                />
              </Link>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {product.name}
                </Typography>
                <Typography>
                  {product.description.substring(0, 100)}...
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {product.discount > 0 ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: 'grey', marginRight: '8px' }}>
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      ${(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)}
                    </>
                  ) : (
                    `${parseFloat(product.price).toFixed(2)}`
                  )}
                  {/* Assuming 'discount' field comes from backend for offers */}
                  {product.discount > 0 && (
                    <Typography component="span" sx={{ ml: 1, color: 'green', fontWeight: 'bold' }}>
                      ({product.discount}% Off)
                    </Typography>
                  )}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to={`/product/${product.id}`}>
                  View
                </Button>
                <Button size="small" onClick={() => addToCart(product)}>
                  Add to Cart
                </Button>
                <Button size="small" onClick={() => {
                  addToCart(product);
                  navigate('/cart'); // Assuming '/cart' is your cart page route
                }}>
                  Buy Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage;
