import pool from '../config/db.js';

/**
 * Create a new review
 * @param {Object} reviewData - { buyer_id, craft_id, order_id, rating, review_text, images }
 * @returns {Object} Created review
 */
export const createReview = async (reviewData) => {
  const { buyer_id, craft_id, order_id, rating, review_text, images } = reviewData;
  
  try {
    // Check if buyer already reviewed this craft
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE buyer_id = $1 AND craft_id = $2',
      [buyer_id, craft_id]
    );
    
    if (existingReview.rows.length > 0) {
      throw new Error('You have already reviewed this craft');
    }
    
    // Verify the buyer purchased this craft
    const orderCheck = await pool.query(
      `SELECT 1 FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.buyer_id = $1 AND oi.craft_id = $2 AND o.status = 'delivered'
       LIMIT 1`,
      [buyer_id, craft_id]
    );
    
    if (orderCheck.rows.length === 0) {
      throw new Error('You can only review crafts you have purchased and received');
    }
    
    const query = `
      INSERT INTO reviews (buyer_id, craft_id, order_id, rating, review_text, images)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      buyer_id,
      craft_id,
      order_id,
      rating,
      review_text || null,
      images ? JSON.stringify(images) : null
    ]);
    
    // Update craft's average rating
    await updateCraftRating(craft_id);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

/**
 * Get reviews for a specific craft
 * @param {number} craftId - Craft ID
 * @param {Object} options - { sortBy, limit, offset }
 * @returns {Array} Reviews with buyer details
 */
export const getReviewsByCraft = async (craftId, options = {}) => {
  const { sortBy = 'recent', limit = 10, offset = 0, rating_filter } = options;
  
  let orderClause;
  switch (sortBy) {
    case 'highest':
      orderClause = 'r.rating DESC, r.created_at DESC';
      break;
    case 'lowest':
      orderClause = 'r.rating ASC, r.created_at DESC';
      break;
    case 'helpful':
      orderClause = 'r.helpful_count DESC, r.created_at DESC';
      break;
    default:
      orderClause = 'r.created_at DESC';
  }
  
  let query = `
    SELECT 
      r.*,
      u.name as buyer_name,
      u.profile_image as buyer_image,
      COALESCE(r.helpful_count, 0) as helpful_count
    FROM reviews r
    JOIN users u ON r.buyer_id = u.id
    WHERE r.craft_id = $1
  `;
  
  const queryParams = [craftId];
  
  if (rating_filter) {
    query += ` AND r.rating = $${queryParams.length + 1}`;
    queryParams.push(rating_filter);
  }
  
  query += ` ORDER BY ${orderClause} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
  queryParams.push(limit, offset);
  
  try {
    const result = await pool.query(query, queryParams);
    
    // Parse images JSON
    const reviews = result.rows.map(review => ({
      ...review,
      images: review.images ? JSON.parse(review.images) : []
    }));
    
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

/**
 * Get review statistics for a craft
 * @param {number} craftId - Craft ID
 * @returns {Object} Review statistics
 */
export const getReviewStats = async (craftId) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
      WHERE craft_id = $1
    `;
    
    const result = await pool.query(query, [craftId]);
    const stats = result.rows[0];
    
    return {
      total_reviews: parseInt(stats.total_reviews),
      average_rating: parseFloat(stats.average_rating).toFixed(1),
      rating_distribution: {
        5: parseInt(stats.five_star),
        4: parseInt(stats.four_star),
        3: parseInt(stats.three_star),
        2: parseInt(stats.two_star),
        1: parseInt(stats.one_star)
      }
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    throw error;
  }
};

/**
 * Get reviews by a specific buyer
 * @param {number} buyerId - Buyer ID
 * @returns {Array} Buyer's reviews with craft details
 */
export const getReviewsByBuyer = async (buyerId) => {
  try {
    const query = `
      SELECT 
        r.*,
        c.title as craft_title,
        c.images as craft_images,
        u.name as artisan_name
      FROM reviews r
      JOIN crafts c ON r.craft_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE r.buyer_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await pool.query(query, [buyerId]);
    
    const reviews = result.rows.map(review => ({
      ...review,
      images: review.images ? JSON.parse(review.images) : [],
      craft_images: review.craft_images ? JSON.parse(review.craft_images) : []
    }));
    
    return reviews;
  } catch (error) {
    console.error('Error fetching buyer reviews:', error);
    throw error;
  }
};

/**
 * Update a review
 * @param {number} reviewId - Review ID
 * @param {number} buyerId - Buyer ID (for authorization)
 * @param {Object} updateData - { rating, review_text, images }
 * @returns {Object} Updated review
 */
export const updateReview = async (reviewId, buyerId, updateData) => {
  const { rating, review_text, images } = updateData;
  
  try {
    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT craft_id FROM reviews WHERE id = $1 AND buyer_id = $2',
      [reviewId, buyerId]
    );
    
    if (ownerCheck.rows.length === 0) {
      throw new Error('Review not found or unauthorized');
    }
    
    const query = `
      UPDATE reviews
      SET 
        rating = COALESCE($1, rating),
        review_text = COALESCE($2, review_text),
        images = COALESCE($3, images)
      WHERE id = $4 AND buyer_id = $5
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      rating,
      review_text,
      images ? JSON.stringify(images) : null,
      reviewId,
      buyerId
    ]);
    
    // Update craft's average rating
    const craftId = ownerCheck.rows[0].craft_id;
    await updateCraftRating(craftId);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Delete a review
 * @param {number} reviewId - Review ID
 * @param {number} buyerId - Buyer ID (for authorization)
 * @returns {boolean} Success status
 */
export const deleteReview = async (reviewId, buyerId) => {
  try {
    // Get craft_id before deleting
    const reviewData = await pool.query(
      'SELECT craft_id FROM reviews WHERE id = $1 AND buyer_id = $2',
      [reviewId, buyerId]
    );
    
    if (reviewData.rows.length === 0) {
      throw new Error('Review not found or unauthorized');
    }
    
    const craftId = reviewData.rows[0].craft_id;
    
    await pool.query('DELETE FROM reviews WHERE id = $1 AND buyer_id = $2', [reviewId, buyerId]);
    
    // Update craft's average rating
    await updateCraftRating(craftId);
    
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/**
 * Mark review as helpful
 * @param {number} reviewId - Review ID
 * @param {number} userId - User marking as helpful
 * @returns {Object} Updated helpful count
 */
export const markReviewHelpful = async (reviewId, userId) => {
  try {
    // Check if user already marked this review as helpful
    const existingMark = await pool.query(
      'SELECT 1 FROM review_helpful WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );
    
    if (existingMark.rows.length > 0) {
      throw new Error('You have already marked this review as helpful');
    }
    
    // Add to review_helpful tracking (create table if needed)
    await pool.query(
      'INSERT INTO review_helpful (review_id, user_id) VALUES ($1, $2)',
      [reviewId, userId]
    );
    
    // Increment helpful count
    const result = await pool.query(
      `UPDATE reviews 
       SET helpful_count = COALESCE(helpful_count, 0) + 1 
       WHERE id = $1 
       RETURNING helpful_count`,
      [reviewId]
    );
    
    return { helpful_count: result.rows[0].helpful_count };
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    throw error;
  }
};

/**
 * Add artisan reply to a review
 * @param {number} reviewId - Review ID
 * @param {number} artisanId - Artisan ID
 * @param {string} replyText - Reply text
 * @returns {Object} Updated review
 */
export const addArtisanReply = async (reviewId, artisanId, replyText) => {
  try {
    // Verify artisan owns the craft being reviewed
    const verifyQuery = `
      SELECT r.id FROM reviews r
      JOIN crafts c ON r.craft_id = c.id
      WHERE r.id = $1 AND c.user_id = $2
    `;
    
    const verification = await pool.query(verifyQuery, [reviewId, artisanId]);
    
    if (verification.rows.length === 0) {
      throw new Error('Unauthorized to reply to this review');
    }
    
    const query = `
      UPDATE reviews
      SET artisan_reply = $1, reply_date = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [replyText, reviewId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding artisan reply:', error);
    throw error;
  }
};

/**
 * Update craft's average rating
 * @param {number} craftId - Craft ID
 */
const updateCraftRating = async (craftId) => {
  try {
    const query = `
      UPDATE crafts
      SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE craft_id = $1
      )
      WHERE id = $1
    `;
    
    await pool.query(query, [craftId]);
  } catch (error) {
    console.error('Error updating craft rating:', error);
    throw error;
  }
};

export default {
  createReview,
  getReviewsByCraft,
  getReviewStats,
  getReviewsByBuyer,
  updateReview,
  deleteReview,
  markReviewHelpful,
  addArtisanReply
};
