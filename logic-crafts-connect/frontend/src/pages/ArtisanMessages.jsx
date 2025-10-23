import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./ArtisanMessages.css";

export default function ArtisanMessages() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState(null);

  const content = {
    en: {
      title: "Messages",
      subtitle: "Communicate with buyers and manage inquiries",
      conversations: "Conversations",
      noConversations: "No conversations yet",
      searchPlaceholder: "Search conversations...",
      typeMessage: "Type your message...",
      send: "Send",
      you: "You",
      unread: "unread",
      selectConversation: "Select a conversation to start messaging",
      stats: {
        total: "Total Conversations",
        unread: "Unread Messages",
        sent: "Messages Sent",
        received: "Messages Received",
      },
    },
    te: {
      title: "సందేశాలు",
      subtitle: "కొనుగోలుదారులతో కమ్యూనికేట్ చేయండి మరియు విచారణలను నిర్వహించండి",
      conversations: "సంభాషణలు",
      noConversations: "ఇంకా సంభాషణలు లేవు",
      searchPlaceholder: "సంభాషణలను శోధించండి...",
      typeMessage: "మీ సందేశాన్ని టైప్ చేయండి...",
      send: "పంపు",
      you: "మీరు",
      unread: "చదవనివి",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.other_user_id);
      markAsRead(selectedConversation.other_user_id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/messages/inbox", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setConversations(response.data.data.conversations);
      }
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/messages/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/messages/conversation/${otherUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  const markAsRead = async (senderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/messages/mark-read/${senderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchConversations(); // Refresh to update unread count
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/messages",
        {
          receiver_id: selectedConversation.other_user_id,
          message_text: newMessage,
          craft_id: selectedConversation.craft_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setNewMessage("");
        fetchMessages(selectedConversation.other_user_id);
        fetchConversations();
      }
    } catch (error) {
      console.error("Send message error:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="artisan-messages-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="message-stats">
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-info">
                <div className="stat-value">{stats.conversation_count || 0}</div>
                <div className="stat-label">{t.stats.total}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📩</div>
              <div className="stat-info">
                <div className="stat-value">{stats.unread_count || 0}</div>
                <div className="stat-label">{t.stats.unread}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📤</div>
              <div className="stat-info">
                <div className="stat-value">{stats.sent_count || 0}</div>
                <div className="stat-label">{t.stats.sent}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📥</div>
              <div className="stat-info">
                <div className="stat-value">{stats.received_count || 0}</div>
                <div className="stat-label">{t.stats.received}</div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="messages-container">
          {/* Conversations List */}
          <div className="conversations-panel">
            <div className="panel-header">
              <h3>{t.conversations}</h3>
            </div>

            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>{t.noConversations}</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${
                      selectedConversation?.other_user_id === conv.other_user_id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="conversation-avatar">
                      {conv.other_user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h4>{conv.other_user_name}</h4>
                        <span className="conversation-time">
                          {formatTime(conv.created_at)}
                        </span>
                      </div>
                      <div className="conversation-preview">
                        <span className={conv.sender_id === user.id ? "you" : ""}>
                          {conv.sender_id === user.id && `${t.you}: `}
                        </span>
                        <span className="preview-text">{conv.message_text}</span>
                      </div>
                      {conv.craft_title && (
                        <div className="conversation-craft">
                          📦 {conv.craft_title}
                        </div>
                      )}
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="unread-badge">{conv.unread_count}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Panel */}
          <div className="messages-panel">
            {selectedConversation ? (
              <>
                <div className="messages-header">
                  <div className="header-user-info">
                    <div className="user-avatar">
                      {selectedConversation.other_user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{selectedConversation.other_user_name}</h3>
                      <p className="user-role">
                        {selectedConversation.other_user_role === "buyer"
                          ? "Buyer"
                          : "Artisan"}
                      </p>
                    </div>
                  </div>
                  {selectedConversation.craft_title && (
                    <div className="header-craft-info">
                      <span>📦 Regarding: {selectedConversation.craft_title}</span>
                    </div>
                  )}
                </div>

                <div className="messages-body">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${
                        msg.sender_id === user.id ? "sent" : "received"
                      }`}
                    >
                      <div className="message-bubble">
                        <p>{msg.message_text}</p>
                        <span className="message-time">
                          {new Date(msg.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <form className="message-input-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="message-input"
                    placeholder={t.typeMessage}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="send-button"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? "..." : t.send}
                  </button>
                </form>
              </>
            ) : (
              <div className="no-conversation-selected">
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <p>{t.selectConversation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
