const { Pool } = require('pg');
const config = require('../config');
const bcrypt = require('bcryptjs');

const pool = new Pool(config.db);

const getUserById = async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: You can only view your own profile' });
  }
  try {
    const result = await pool.query('SELECT id, first_name, last_name, email, role, mobile_number, address, province, district, municipal FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, password, mobile_number, address, province, district, municipal } = req.body;

  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
  }

  if (mobile_number && !validateMobileNumber(mobile_number)) {
    return res.status(400).json({ message: 'Invalid Nepali mobile number format. Must start with 980 and be 10 digits long.' });
  }

  try {
    const setClauses = [];
    const params = [];
    let paramIndex = 1;

    if (first_name) {
      setClauses.push(`first_name = $${paramIndex++}`);
      params.push(first_name);
    }
    if (last_name) {
      setClauses.push(`last_name = $${paramIndex++}`);
      params.push(last_name);
    }
    if (email) {
      setClauses.push(`email = $${paramIndex++}`);
      params.push(email);
    }
    if (mobile_number) {
      setClauses.push(`mobile_number = $${paramIndex++}`);
      params.push(mobile_number);
    }
    if (address) {
      setClauses.push(`address = $${paramIndex++}`);
      params.push(address);
    }
    if (province) {
      setClauses.push(`province = $${paramIndex++}`);
      params.push(province);
    }
    if (district) {
      setClauses.push(`district = $${paramIndex++}`);
      params.push(district);
    }
    if (municipal) {
      setClauses.push(`municipal = $${paramIndex++}`);
      params.push(municipal);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      setClauses.push(`password_hash = $${paramIndex++}`);
      params.push(hashedPassword);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING id, first_name, last_name, email, role, mobile_number, address, province, district, municipal`;

    const result = await pool.query(query, params);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === '23505') { // Unique violation code
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const validateMobileNumber = (mobileNumber) => {
  const regex = /^980[0-9]{7}$/;
  return regex.test(mobileNumber);
};

module.exports = { getUserById, updateUserById };
