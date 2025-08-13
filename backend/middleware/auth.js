const jwt = require('jsonwebtoken');
const config = require('../config');
const { Pool } = require('pg');

const pool = new Pool(config.db);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, config.secretKey, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
      if (result.rows.length === 0) {
        return res.sendStatus(401);
      }
      req.user = result.rows[0];
      next();
    } catch (error) {
      res.sendStatus(500);
    }
  });
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorize };
