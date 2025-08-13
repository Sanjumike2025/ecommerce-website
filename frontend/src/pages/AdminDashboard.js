import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import OrderManagement from './OrderManagement'; // Import the new component
import ClientManagement from './ClientManagement';
import ShippingManagement from './ShippingManagement';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null, name: '', description: '', price: '', imageUrl: '', stock: '', discount: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [tabValue, setTabValue] = useState(0); // State for tab selection

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (tabValue === 0) { // Only fetch products if on the Product Management tab
      fetchProducts();
    }
  }, [token, tabValue]);

  const handleOpen = (product = { id: null, name: '', description: '', price: '', imageUrl: '', stock: '' }) => {
    setCurrentProduct(product);
    setSelectedFile(null); // Clear selected file on dialog open
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('name', currentProduct.name);
    formData.append('description', currentProduct.description);
    formData.append('price', currentProduct.price);
    formData.append('stock', currentProduct.stock);
    formData.append('discount', currentProduct.discount);
    if (selectedFile) {
      formData.append('productImage', selectedFile); // 'productImage' must match multer field name
    } else if (currentProduct.imageUrl) {
      formData.append('image_url', currentProduct.imageUrl); // Keep existing URL if no new file
    }

    try {
      if (currentProduct.id) {
        // Update product
        await axios.put(`http://localhost:5000/api/products/${currentProduct.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });
      } else {
        // Add new product
        await axios.post('http://localhost:5000/api/products', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error.response?.data || error.message);
      alert('Failed to save product.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product.');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab label="Product Management" />
          <Tab label="Order Management" />
          <Tab label="Client Management" />
          <Tab label="Shipping Management" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
              Add New Product
            </Button>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom>
            Product Management
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {products.map((product) => (
              <Paper key={product.id} sx={{ p: 2, width: 200, textAlign: 'center' }}>
                <img src={product.image_url ? `http://localhost:5000${product.image_url}` : 'https://via.placeholder.com/300x200?text=No+Image'} alt={product.name} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2">${parseFloat(product.price).toFixed(2)}</Typography>
                <Typography variant="body2">Stock: {product.stock}</Typography>
                <Button size="small" onClick={() => handleOpen(product)}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleDelete(product.id)}>Delete</Button>
              </Paper>
            ))}
          </Box>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{currentProduct.id ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Product Name"
                type="text"
                fullWidth
                variant="standard"
                value={currentProduct.name}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="description"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="standard"
                value={currentProduct.description}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="price"
                label="Price"
                type="number"
                fullWidth
                variant="standard"
                value={currentProduct.price}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="stock"
                label="Stock"
                type="number"
                fullWidth
                variant="standard"
                value={currentProduct.stock}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="discount"
                label="Discount (%)"
                type="number"
                fullWidth
                variant="standard"
                value={currentProduct.discount}
                onChange={handleChange}
              />
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  multiple
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="contained" component="span">
                    {selectedFile ? selectedFile.name : 'Upload Image'}
                  </Button>
                </label>
                {currentProduct.imageUrl && !selectedFile && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Current Image: <a href={`http://localhost:5000${currentProduct.imageUrl}`} target="_blank" rel="noopener noreferrer">View</a>
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit}>{currentProduct.id ? 'Update' : 'Add'}</Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {tabValue === 1 && (
        <OrderManagement />
      )}

      {tabValue === 2 && (
        <ClientManagement />
      )}

      {tabValue === 3 && (
        <ShippingManagement />
      )}
    </Container>
  );
};

export default AdminDashboard;
