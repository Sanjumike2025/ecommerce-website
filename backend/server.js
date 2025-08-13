const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const config = require('./config');
require('./config/passport');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const errorMiddleware = require('./middleware/errorMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorMiddleware);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
