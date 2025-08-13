import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            E-Commerce
          </Link>
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/" sx={{ fontWeight: 'bold', transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease', '&:hover': { backgroundColor: '#f44336', color: 'white', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' } }}>
            Products
          </Button>
          <Button color="inherit" component={Link} to="/offers" sx={{ fontWeight: 'bold', transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease', '&:hover': { backgroundColor: '#f44336', color: 'white', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' } }}>
            Offers
          </Button>
          <Button color="inherit" component={Link} to="/cart" sx={{ fontWeight: 'bold', transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease', '&:hover': { backgroundColor: '#f44336', color: 'white', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' } }}>
            Cart
          </Button>
          {user ? (
            <>
              {user.role === 'client' && (
                <Button color="inherit" component={Link} to="/client" sx={{ fontWeight: 'bold', transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease', '&:hover': { backgroundColor: '#f44336', color: 'white', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' } }}>
                  Orders
                </Button>
              )}
              {user.role === 'admin' && (
                <>
                  <Button color="inherit" component={Link} to="/admin" sx={{ fontWeight: 'bold', transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease', '&:hover': { backgroundColor: '#f44336', color: 'white', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' } }}>
                    Dashboard
                  </Button>
                  <Button color="inherit" component={Link} to="/admin/shipping" sx={{ fontWeight: 'bold', transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease', '&:hover': { backgroundColor: '#f44336', color: 'white', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' } }}>
                    Shipping Status
                  </Button>
                </>
              )}
              <Button color="inherit" onClick={logout} sx={{ fontWeight: 'bold', transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease', '&:hover': { backgroundColor: '#f44336', color: 'white', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' } }}>
                Logout ({user.first_name || user.email})
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login" sx={{ fontWeight: 'bold', transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease', '&:hover': { backgroundColor: '#f44336', color: 'white', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' } }}>
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register" sx={{ fontWeight: 'bold', transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease', '&:hover': { backgroundColor: '#f44336', color: 'white', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' } }}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;