import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Footer from './components/Footer';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const ClientManagement = lazy(() => import('./pages/ClientManagement'));
const ShippingManagement = lazy(() => import('./pages/ShippingManagement'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/clients" element={<ClientManagement />} />
                  <Route path="/admin/shipping" element={<ShippingManagement />} />
                </Route>
                <Route element={<PrivateRoute allowedRoles={['client', 'admin']} />}>
                  <Route path="/client" element={<ClientDashboard />} />
                  <Route path="/profile" element={<UserProfilePage />} />
                  <Route path="/order/:id" element={<OrderDetailsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;