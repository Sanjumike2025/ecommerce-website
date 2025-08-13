import React from 'react';
import Carousel from 'react-material-ui-carousel';
import {
  Paper,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';

function ProductCarousel({ products }) {
  return (
    <Carousel
      autoPlay={true}
      animation="slide"
      indicators={true}
      navButtonsAlwaysVisible={true}
      cycleNavigation={true}
      fullHeightHover={false}
      sx={{ mt: 4, mb: 4 }}
    >
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </Carousel>
  );
}

function ProductItem({ product }) {
  return (
    <Paper
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 400,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card sx={{ maxWidth: 345 }}>
        <CardMedia
          component="img"
          height="140"
          image={product.image_url ? `http://localhost:5000${product.image_url}` : 'https://via.placeholder.com/150'}
          alt={product.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.description}
          </Typography>
          <Typography variant="h6" color="primary">
            ${parseFloat(product.price).toFixed(2)}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" component={Link} to={`/product/${product.id}`}>
            View Details
          </Button>
        </CardActions>
      </Card>
    </Paper>
  );
}

export default ProductCarousel;
