import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { LanguageContext } from "../../context/LanguageContext";
import "./Notifications.css";

export default function NotificationBell() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const content = {
    en: {
      title: "Notifications",
      markAllRead: "Mark all as read",
      noNotifications: "No notifications",
      viewAll: "View All Notifications",
      types: {
        new_order: "New Order",
        order_status: "Order Update",
        message: "New Message",
        review: "New Review",
        low_stock: "Low Stock Alert",
        craft_approved: "Craft Approved",
      },
    },
    te: {
      title: "నోటిఫికేషన్లు",
      markAllRead: "అన్నింటిని చదివినట్లు మార్క్ చేయండి",
      noNotifications: "నోటిఫికేషన్లు లేవు",
      viewAll: "అన్ని నోటిఫికేషన్లు చూడండి",
      types: {
        new_order: "కొత్త ఆర్డర్",
        order_status: "ఆర్డర్ అప్‌డేట్",
        message: "కొత్త సందేశం",
        review: "కొత్త రివ్యూ",
        low_stock: "తక్కువ స్టాక్ అలర్ట్",
        craft_approved: "క్రాఫ్ట్ ఆమోదించబడింది",
      },
    },
  };

  const t = content[language] || content.en;

  // Sample notifications data (in production, fetch from API)
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // In production, fetch from API: GET /api/notifications
      // For now, use sample data based on user role
      
      const sampleNotifications = user?.role === "artisan"
        ? [
            {
              id: 1,
              type: "new_order",
              title: "New Order Received",
              message: "You have a new order #ORD-1234 from Rahul",
              created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
              read: false,
              link: "/artisan/orders",
            },
            {
              id: 2,
              type: "review",
              title: "New Review",
              message: 'Customer left a 5★ review on "Clay Pot"',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
              read: false,
              link: "/artisan/reviews",
            },
            {
              id: 3,
              type: "message",
              title: "New Message",
              message: "Priya sent you a message about custom order",
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
              read: true,
              link: "/artisan/messages",
            },
          ]
        : [
            {
              id: 1,
              type: "order_status",
              title: "Order Shipped",
              message: "Your order #ORD-5678 has been shipped!",
              created_at: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
              read: false,
              link: "/orders",
            },
            {
              id: 2,
              type: "message",
              title: "Message from Artisan",
              message: "Rajesh replied to your inquiry",
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
              read: true,
              link: "/messages",
            },
          ];

      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    // In production, call API: PUT /api/notifications/:id/read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    // In production, call API: PUT /api/notifications/read-all
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
      }
    }
    return "Just now";
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_order: "📦",
      order_status: "🚚",
      message: "💬",
      review: "⭐",
      low_stock: "⚠️",
      craft_approved: "✅",
    };
    return icons[type] || "🔔";
  };

  if (!user) return null;

  return (
    <div className="notification-bell" ref={panelRef}>
      <button
        className="bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3>{t.title}</h3>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                {t.markAllRead}
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔔</span>
                <p>{t.noNotifications}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? "" : "unread"}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {getTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  {!notification.read && <span className="unread-dot" />}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="panel-footer">
              <button
                className="view-all-btn"
                onClick={() => {
                  setIsOpen(false);
                  navigate(user?.role === "artisan" ? "/artisan/notifications" : "/notifications");
                }}
              >
                {t.viewAll}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
