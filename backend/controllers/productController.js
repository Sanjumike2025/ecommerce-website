const { Pool } = require('pg');
const config = require('../config');
const fs = require('fs');
const path = require('path');

const pool = new Pool(config.db);

const getProducts = async (req, res) => {
  const { searchTerm } = req.query;
  let query = 'SELECT id, name, description, price, image_url, stock, discount FROM products';
  let params = [];

  if (searchTerm) {
    query += ' WHERE name ILIKE $1 OR description ILIKE $1';
    params.push(`%${searchTerm}%`);
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    const product = result.rows[0];
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createProduct = async (req, res) => {
  const { name, description, price, stock } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, image_url, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [name, description, price, image_url, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, discount } = req.body;
  let image_url = req.body.image_url;

  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  try {
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, image_url = $4, stock = $5, discount = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *;',
      [name, description, price, image_url, stock, discount, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const productResult = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
    const imageUrl = productResult.rows[0]?.image_url;

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *;', [id]);
    if (result.rows.length > 0) {
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..' ,imageUrl);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting image file:', err);
        });
      }
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
