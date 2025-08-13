const { Pool } = require('pg');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool(config.db);

const getOrders = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let query = `
      SELECT
        o.id, o.user_id, o.order_date, o.total_amount, o.status, o.tracking_number, o.first_name, o.last_name, o.email, o.mobile_number, o.shipping_address, o.province, o.district, o.municipal,
        u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    let params = [];

    if (userRole === 'client') {
      query += ' WHERE o.user_id = $1';
      params.push(userId);
    }
    query += ' ORDER BY o.order_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let orderQuery = `
      SELECT
        o.id, o.user_id, o.order_date, o.total_amount, o.status, o.tracking_number, o.first_name, o.last_name, o.email, o.mobile_number, o.shipping_address, o.province, o.district, o.municipal, o.barcode_data, o.qr_code_data,
        u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `;
    let orderParams = [id];

    if (userRole === 'client') {
      orderQuery += ' AND o.user_id = $2'; // Ensure client can only see their own orders
      orderParams.push(userId);
    }

    const orderResult = await pool.query(orderQuery, orderParams);
    const order = orderResult.rows[0];

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemsResult = await pool.query(
      `SELECT oi.quantity, oi.price, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    order.items = itemsResult.rows;
    res.json(order);

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createOrder = async (req, res) => {
  const { items, shippingDetails, paymentMethod } = req.body; // items is an array of { productId, quantity }
  const userId = req.user.id;
  const { firstName, lastName, email, mobileNumber, shippingAddress, province, district, municipal } = shippingDetails;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain items' });
  }

  if (!firstName || !lastName || !email || !mobileNumber || !shippingAddress || !province || !district || !municipal) {
    return res.status(400).json({ message: 'All shipping details are required.' });
  }

  if (!paymentMethod) {
    return res.status(400).json({ message: 'Payment method is required.' });
  }

  const trackingNumber = uuidv4(); // Generate a unique tracking number

  let totalAmount = 0;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Calculate total amount and check stock
    for (const item of items) {
      const productResult = await client.query('SELECT price, stock FROM products WHERE id = $1', [item.productId]);
      const product = productResult.rows[0];

      if (!product || product.stock < item.quantity) {
        throw new Error(`Product ${item.productId} is out of stock or not found.`);
      }
      totalAmount += parseFloat(product.price) * item.quantity;
    }

    // Create order
    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, total_amount, tracking_number, first_name, last_name, email, mobile_number, shipping_address, province, district, municipal, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, order_date, total_amount, status, tracking_number;',
      [userId, totalAmount, trackingNumber, firstName, lastName, email, mobileNumber, shippingAddress, province, district, municipal, paymentMethod]
    );
    const orderId = orderResult.rows[0].id;

    // Add order items
    for (const item of items) {
      const productPriceResult = await pool.query('SELECT price FROM products WHERE id = $1', [item.productId]);
      const productPrice = productPriceResult.rows[0].price;

      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4);',
        [orderId, item.productId, item.quantity, productPrice]
      );
      // Decrease stock
      await pool.query('UPDATE products SET stock = stock - $1 WHERE id = $2;', [item.quantity, item.productId]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order created successfully', order: orderResult.rows[0] });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error.message);
    res.status(500).json({ message: error.message || 'Internal server error' });
  } finally {
    client.release();
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *;',
      [status, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!reason) {
    return res.status(400).json({ message: 'Cancellation reason is required.' });
  }

  try {
    const orderResult = await pool.query('SELECT user_id, status FROM orders WHERE id = $1', [id]);
    const order = orderResult.rows[0];

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check authorization
    if (userRole !== 'admin' && order.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only cancel your own orders.' });
    }

    // Prevent cancellation if already cancelled or delivered
    if (order.status === 'Cancelled' || order.status === 'Delivered') {
      return res.status(400).json({ message: `Order cannot be cancelled as it is already ${order.status}.` });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, cancellation_reason = $2 WHERE id = $3 RETURNING *;',
      ['Cancelled', reason, id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Order not found after update.' });
    }

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder };
