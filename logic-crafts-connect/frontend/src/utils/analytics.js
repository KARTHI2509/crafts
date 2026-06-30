import axios from 'axios';

// Get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('crafthub_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('crafthub_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Track client-side interactions and send events to backend analytics.
 * @param {string} eventType - Event classification (e.g. 'page_visit', 'product_click')
 * @param {object} payload - Optional properties and details (e.g. productId, search query)
 */
export const trackEvent = async (eventType, payload = {}) => {
  try {
    const sessionId = getSessionId();
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    // Set CSRF header if available
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    await axios.post(`${apiUrl}/analytics/track`, {
      eventType,
      sessionId,
      payload
    }, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(csrfToken && { 'x-xsrf-token': csrfToken })
      }
    });
  } catch (error) {
    // Fail silently in production, console log in dev
    console.debug('Analytics Tracking Error:', error.message);
  }
};
