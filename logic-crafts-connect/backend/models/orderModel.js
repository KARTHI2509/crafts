/**
 * ============================================
 * ORDER MODEL
 * ============================================
 * Handles all database operations for orders
 * - Create orders
 * - Get orders by buyer/artisan
 * - Update order status
 * - Track orders
 * - Cancel/Return orders
 */

import pool from '../config/db.js';

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-XXXXX
 */
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Create a new order
 * @param {Object} orderData - Order details
 * @returns {Object} - Created order with items
 */
export const createOrder = async (orderData) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      buyer_id,
      artisan_id,
      items, // Array of {craft_id, quantity, price}
      total_amount,
      shipping_address,
      buyer_phone,
      payment_method,
      notes
    } = orderData;

    const order_number = generateOrderNumber();

    // Create order
    const orderQuery = `
      INSERT INTO orders (
        order_number, buyer_id, artisan_id, total_amount,
        shipping_address, buyer_phone, payment_method, notes,
        status, payment_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'placed', 'pending')
      RETURNING *
    `;

    const orderValues = [
      order_number, buyer_id, artisan_id, total_amount,
      shipping_address, buyer_phone, payment_method, notes
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const order = orderResult.rows[0];

    // Create order items
    const itemPromises = items.map(item => {
      const itemQuery = `
        INSERT INTO order_items (order_id, craft_id, quantity, price_at_purchase, subtotal)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const subtotal = item.quantity * item.price;
      return client.query(itemQuery, [order.id, item.craft_id, item.quantity, item.price, subtotal]);
    });

    const itemResults = await Promise.all(itemPromises);
    const orderItems = itemResults.map(result => result.rows[0]);

    await client.query('COMMIT');

    return {
      ...order,
      items: orderItems
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get orders by buyer
 * @param {number} buyerId - Buyer user ID
 * @param {Object} filters - Optional filters (status, date range)
 * @returns {Array} - Array of orders with items
 */
export const getOrdersByBuyer = async (buyerId, filters = {}) => {
  let query = `
    SELECT o.*, 
           u.name as artisan_name,
           u.email as artisan_email
    FROM orders o
    JOIN users u ON o.artisan_id = u.id
    WHERE o.buyer_id = $1
  `;

  const values = [buyerId];
  let paramCount = 1;

  if (filters.status) {
    paramCount++;
    query += ` AND o.status = $${paramCount}`;
    values.push(filters.status);
  }

  if (filters.from_date) {
    paramCount++;
    query += ` AND o.created_at >= $${paramCount}`;
    values.push(filters.from_date);
  }

  if (filters.to_date) {
    paramCount++;
    query += ` AND o.created_at <= $${paramCount}`;
    values.push(filters.to_date);
  }

  query += ' ORDER BY o.created_at DESC';

  const result = await pool.query(query, values);
  
  // Get order items for each order
  const orders = await Promise.all(result.rows.map(async (order) => {
    const itemsQuery = `
      SELECT oi.*, c.name as craft_name, c.image_url
      FROM order_items oi
      JOIN crafts c ON oi.craft_id = c.id
      WHERE oi.order_id = $1
    `;
    const itemsResult = await pool.query(itemsQuery, [order.id]);
    return {
      ...order,
      items: itemsResult.rows
    };
  }));

  return orders;
};

/**
 * Get orders by artisan
 * @param {number} artisanId - Artisan user ID
 * @returns {Array} - Array of orders
 */
export const getOrdersByArtisan = async (artisanId, filters = {}) => {
  let query = `
    SELECT o.*, 
           u.name as buyer_name,
           u.email as buyer_email
    FROM orders o
    JOIN users u ON o.buyer_id = u.id
    WHERE o.artisan_id = $1
  `;

  const values = [artisanId];
  let paramCount = 1;

  if (filters.status) {
    paramCount++;
    query += ` AND o.status = $${paramCount}`;
    values.push(filters.status);
  }

  query += ' ORDER BY o.created_at DESC';

  const result = await pool.query(query, values);
  
  const orders = await Promise.all(result.rows.map(async (order) => {
    const itemsQuery = `
      SELECT oi.*, c.name as craft_name, c.image_url
      FROM order_items oi
      JOIN crafts c ON oi.craft_id = c.id
      WHERE oi.order_id = $1
    `;
    const itemsResult = await pool.query(itemsQuery, [order.id]);
    return {
      ...order,
      items: itemsResult.rows
    };
  }));

  return orders;
};

/**
 * Get single order by ID
 * @param {number} orderId - Order ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Object} - Order with items
 */
export const getOrderById = async (orderId, userId) => {
  const query = `
    SELECT o.*, 
           buyer.name as buyer_name, buyer.email as buyer_email, buyer.phone as buyer_contact,
           artisan.name as artisan_name, artisan.email as artisan_email, artisan.phone as artisan_contact
    FROM orders o
    JOIN users buyer ON o.buyer_id = buyer.id
    JOIN users artisan ON o.artisan_id = artisan.id
    WHERE o.id = $1 AND (o.buyer_id = $2 OR o.artisan_id = $2)
  `;

  const result = await pool.query(query, [orderId, userId]);
  
  if (result.rows.length === 0) {
    return null;
  }

  const order = result.rows[0];

  // Get order items
  const itemsQuery = `
    SELECT oi.*, c.name as craft_name, c.image_url, c.description
    FROM order_items oi
    JOIN crafts c ON oi.craft_id = c.id
    WHERE oi.order_id = $1
  `;
  const itemsResult = await pool.query(itemsQuery, [orderId]);

  return {
    ...order,
    items: itemsResult.rows
  };
};

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @param {number} userId - User ID (for authorization)
 * @returns {Object} - Updated order
 */
export const updateOrderStatus = async (orderId, status, userId) => {
  const query = `
    UPDATE orders
    SET status = $1,
        delivered_at = CASE WHEN $1 = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END
    WHERE id = $2 AND artisan_id = $3
    RETURNING *
  `;

  const result = await pool.query(query, [status, orderId, userId]);
  return result.rows[0];
};

/**
 * Cancel order
 * @param {number} orderId - Order ID
 * @param {number} buyerId - Buyer ID
 * @param {string} reason - Cancellation reason
 * @returns {Object} - Updated order
 */
export const cancelOrder = async (orderId, buyerId, reason) => {
  const query = `
    UPDATE orders
    SET status = 'cancelled',
        cancelled_at = CURRENT_TIMESTAMP,
        cancellation_reason = $1
    WHERE id = $2 AND buyer_id = $3 AND status IN ('placed', 'confirmed')
    RETURNING *
  `;

  const result = await pool.query(query, [reason, orderId, buyerId]);
  return result.rows[0];
};

/**
 * Request order return
 * @param {number} orderId - Order ID
 * @param {number} buyerId - Buyer ID
 * @param {string} reason - Return reason
 * @returns {Object} - Updated order
 */
export const returnOrder = async (orderId, buyerId, reason) => {
  const query = `
    UPDATE orders
    SET status = 'returned',
        return_reason = $1
    WHERE id = $2 AND buyer_id = $3 AND status = 'delivered'
    RETURNING *
  `;

  const result = await pool.query(query, [reason, orderId, buyerId]);
  return result.rows[0];
};

/**
 * Update tracking number
 * @param {number} orderId - Order ID
 * @param {string} trackingNumber - Tracking number
 * @param {Date} estimatedDelivery - Estimated delivery date
 * @returns {Object} - Updated order
 */
export const updateTracking = async (orderId, trackingNumber, estimatedDelivery) => {
  const query = `
    UPDATE orders
    SET tracking_number = $1,
        estimated_delivery = $2
    WHERE id = $3
    RETURNING *
  `;

  const result = await pool.query(query, [trackingNumber, estimatedDelivery, orderId]);
  return result.rows[0];
};

/**
 * Get order statistics for buyer
 * @param {number} buyerId - Buyer ID
 * @returns {Object} - Order statistics
 */
export const getBuyerOrderStats = async (buyerId) => {
  const query = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
      SUM(CASE WHEN status IN ('placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery') THEN 1 ELSE 0 END) as active_orders,
      SUM(total_amount) as total_spent
    FROM orders
    WHERE buyer_id = $1
  `;

  const result = await pool.query(query, [buyerId]);
  return result.rows[0];
};

/**
 * Get recent orders
 * @param {number} userId - User ID
 * @param {number} limit - Number of orders to fetch
 * @returns {Array} - Recent orders
 */
export const getRecentOrders = async (userId, limit = 5) => {
  const query = `
    SELECT o.*, 
           CASE 
             WHEN o.buyer_id = $1 THEN artisan.name
             ELSE buyer.name
           END as other_party_name
    FROM orders o
    LEFT JOIN users buyer ON o.buyer_id = buyer.id
    LEFT JOIN users artisan ON o.artisan_id = artisan.id
    WHERE o.buyer_id = $1 OR o.artisan_id = $1
    ORDER BY o.created_at DESC
    LIMIT $2
  `;

  const result = await pool.query(query, [userId, limit]);
  return result.rows;
};
