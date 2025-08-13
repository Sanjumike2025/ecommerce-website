const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(config.db);

const register = async (req, res) => {
  const { first_name, last_name, email, password, mobile_number, address, province, district, municipal } = req.body;

  if (mobile_number && !validateMobileNumber(mobile_number)) {
    return res.status(400).json({ message: 'Invalid Nepali mobile number format. Must start with 980 and be 10 digits long.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash, mobile_number, address, province, district, municipal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, first_name, last_name, email, role, mobile_number, address, province, district, municipal',
      [first_name, last_name, email, hashedPassword, mobile_number, address, province, district, municipal]
    );
    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === '23505') { // Unique violation code
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT id, first_name, last_name, email, password_hash, role, mobile_number, address, province, district, municipal FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = jwt.sign(
      { id: user.id, first_name: user.first_name, last_name: user.last_name, role: user.role },
      config.secretKey,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    res.json({ token: accessToken, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, mobile_number: user.mobile_number, address: user.address, province: user.province, district: user.district, municipal: user.municipal } });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const validateMobileNumber = (mobileNumber) => {
  const regex = /^980[0-9]{7}$/;
  return regex.test(mobileNumber);
};

const me = (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, me };
