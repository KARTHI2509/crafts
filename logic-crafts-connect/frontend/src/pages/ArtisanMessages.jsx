import React, { useState, useEffect, useContext } from "react";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { useSocket } from "../context/SocketContext";
import "./ArtisanMessages.css";

export default function ArtisanMessages() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const socket = useSocket();

  // ----------------------------
  // State Management
  // ----------------------------
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ----------------------------
  // Language Content
  // ----------------------------
  const content = {
    en: {
      title: "Messages",
      subtitle: "Communicate with buyers and manage inquiries",
      conversations: "Conversations",
      noConversations: "No conversations yet",
      typeMessage: "Type your message...",
      send: "Send",
      you: "You",
      selectConversation: "Select a conversation to start messaging",
      stats: {
        total: "Total Conversations",
        unread: "Unread Messages",
        sent: "Messages Sent",
        received: "Messages Received",
      },
    },
  };

  const t = content[language] || content.en;

  // ----------------------------
  // Initial Data Load
  // ----------------------------
  useEffect(() => {
    if (!user) return;

    loadInitialData();
  }, [user]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedConversation) return;

    fetchMessages(selectedConversation.other_user_id);
    markAsRead(selectedConversation.other_user_id);
  }, [selectedConversation]);

  // Handle incoming real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // If the message is part of the currently active conversation, append it
      if (selectedConversation && (message.sender_id === selectedConversation.other_user_id)) {
        setMessages((prev) => [...prev, message]);
        markAsRead(selectedConversation.other_user_id);
      }
      
      // Update the conversations list and stats
      fetchConversations();
      fetchStats();
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedConversation]);

  // Load all startup data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchConversations(),
        fetchStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Fetch Conversations
  // ----------------------------
  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/inbox",
        { headers }
      );

      if (response.data.success) {
        setConversations(
          response.data.data.conversations
        );
      }
    } catch (error) {
      console.error("Fetch conversations error:", error);
    }
  };

  // ----------------------------
  // Fetch Statistics
  // ----------------------------
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/stats",
        { headers }
      );

      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  // ----------------------------
  // Fetch Messages
  // ----------------------------
  const fetchMessages = async (otherUserId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/conversation/${otherUserId}`,
        { headers }
      );

      if (response.data.success) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  // ----------------------------
  // Mark Conversation as Read
  // ----------------------------
  const markAsRead = async (senderId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/messages/mark-read/${senderId}`,
        {},
        { headers }
      );

      fetchConversations();
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  // ----------------------------
  // Send Message
  // ----------------------------
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);

      const response = await axios.post(
        "http://localhost:5000/api/messages",
        {
          receiver_id:
            selectedConversation.other_user_id,
          message_text: newMessage,
          craft_id: selectedConversation.craft_id,
        },
        { headers }
      );

      if (response.data.success) {
        setNewMessage("");

        await fetchMessages(
          selectedConversation.other_user_id
        );

        fetchConversations();
      }
    } catch (error) {
      console.error("Send message error:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // ----------------------------
  // Format Time
  // ----------------------------
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const diff = now - date;
    const hours = Math.floor(
      diff / (1000 * 60 * 60)
    );

    if (hours < 1) {
      const minutes = Math.floor(
        diff / (1000 * 60)
      );
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // ----------------------------
  // Loading UI
  // ----------------------------
  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <div className="artisan-messages-page">
      <div className="container">

        {/* Header */}
        <div className="page-header">
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="message-stats">
            {[
              ["💬", stats.conversation_count, t.stats.total],
              ["📩", stats.unread_count, t.stats.unread],
              ["📤", stats.sent_count, t.stats.sent],
              ["📥", stats.received_count, t.stats.received],
            ].map(([icon, value, label], index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{icon}</div>

                <div className="stat-info">
                  <div className="stat-value">
                    {value || 0}
                  </div>

                  <div className="stat-label">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Layout */}
        <div className="messages-container">

          {/* Conversations */}
          <div className="conversations-panel">
            <div className="panel-header">
              <h3>{t.conversations}</h3>
            </div>

            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="no-conversations">
                  {t.noConversations}
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${
                      selectedConversation?.id === conv.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedConversation(conv)
                    }
                  >
                    <div className="conversation-avatar">
                      {conv.other_user_name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h4>{conv.other_user_name}</h4>

                        <span className="conversation-time">
                          {formatTime(conv.created_at)}
                        </span>
                      </div>

                      <div className="conversation-preview">
                        {conv.sender_id === user.id && (
                          <span className="you">
                            {t.you}:{" "}
                          </span>
                        )}
                        {conv.message_text}
                      </div>
                    </div>

                    {conv.unread_count > 0 && (
                      <div className="unread-badge">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="messages-panel">
            {selectedConversation ? (
              <>
                <div className="messages-header">
                  <div className="header-user-info">
                    <div className="user-avatar">
                      {selectedConversation.other_user_name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h3>
                        {
                          selectedConversation.other_user_name
                        }
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="messages-body">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${
                        msg.sender_id === user.id
                          ? "sent"
                          : "received"
                      }`}
                    >
                      <div className="message-bubble">
                        <p>{msg.message_text}</p>

                        <span className="message-time">
                          {new Date(
                            msg.created_at
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Message */}
                <form
                  className="message-input-form"
                  onSubmit={handleSendMessage}
                >
                  <input
                    type="text"
                    className="message-input"
                    placeholder={t.typeMessage}
                    value={newMessage}
                    onChange={(e) =>
                      setNewMessage(e.target.value)
                    }
                    disabled={sending}
                  />

                  <button
                    type="submit"
                    className="send-button"
                    disabled={
                      sending || !newMessage.trim()
                    }
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