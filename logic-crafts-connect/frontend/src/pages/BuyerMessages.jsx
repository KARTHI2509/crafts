import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { messageAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./BuyerMessages.css";

export default function BuyerMessages() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const content = {
    en: {
      title: "Messages",
      subtitle: "Communicate with artisans about your orders and inquiries",
      conversations: "Conversations",
      noConversations: "No conversations yet",
      noConversationsDesc: "Start a conversation by contacting an artisan from their profile or product page",
      searchPlaceholder: "Search conversations...",
      typeMessage: "Type your message...",
      send: "Send",
      you: "You",
      unread: "unread",
      selectConversation: "Select a conversation to view messages",
      noMessages: "No messages in this conversation",
      online: "Online",
      lastSeen: "Last seen",
      browseArtisans: "Browse Artisans",
    },
    te: {
      title: "సందేశాలు",
      subtitle: "మీ ఆర్డర్లు మరియు విచారణల గురించి ఆర్టిసన్లతో కమ్యూనికేట్ చేయండి",
      conversations: "సంభాషణలు",
      noConversations: "ఇంకా సంభాషణలు లేవు",
      noConversationsDesc: "ఆర్టిసన్ ప్రొఫైల్ లేదా ఉత్పత్తి పేజీ నుండి సంప్రదించడం ద్వారా సంభాషణను ప్రారంభించండి",
      searchPlaceholder: "సంభాషణలను శోధించండి...",
      typeMessage: "మీ సందేశాన్ని టైప్ చేయండి...",
      send: "పంపు",
      you: "మీరు",
      unread: "చదవనివి",
      selectConversation: "సందేశాలను చూడటానికి సంభాషణను ఎంచుకోండి",
      noMessages: "ఈ సంభాషణలో సందేశాలు లేవు",
      browseArtisans: "ఆర్టిసన్లను బ్రౌజ్ చేయండి",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchConversations();
  }, [user, navigate]);

  useEffect(() => {
    // Check if there's an artisan ID in the URL params to auto-select
    const artisanId = searchParams.get("artisan");
    if (artisanId && conversations.length > 0) {
      const conv = conversations.find((c) => c.other_user_id === artisanId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.other_user_id);
      markAsRead(selectedConversation.other_user_id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getInbox();

      if (response.success) {
        setConversations(response.data?.conversations || []);
      }
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await messageAPI.getConversation(otherUserId);

      if (response.success) {
        setMessages(response.data?.messages || []);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  const markAsRead = async (otherUserId) => {
    try {
      await messageAPI.markAsRead(otherUserId);
      // Update local state
      setConversations((prev) =>
        prev.map((c) =>
          c.other_user_id === otherUserId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await messageAPI.send({
        receiver_id: selectedConversation.other_user_id,
        content: newMessage,
      });

      if (response.success) {
        // Add message to local state
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender_id: user.id,
            content: newMessage,
            created_at: new Date(),
            is_mine: true,
          },
        ]);
        setNewMessage("");

        // Update conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.other_user_id === selectedConversation.other_user_id
              ? { ...c, last_message: newMessage, last_message_at: new Date() }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Send message error:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="buyer-messages loading">
        <div className="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="buyer-messages">
      {/* Sidebar - Conversations List */}
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h2>{t.conversations}</h2>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <div className="no-conversations">
              <span className="empty-icon">💬</span>
              <p>{t.noConversations}</p>
              <small>{t.noConversationsDesc}</small>
              <button 
                className="btn-primary" 
                onClick={() => navigate("/explore")}
              >
                {t.browseArtisans}
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.other_user_id}
                className={`conversation-item ${
                  selectedConversation?.other_user_id === conv.other_user_id ? "active" : ""
                } ${conv.unread_count > 0 ? "unread" : ""}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="conv-avatar">
                  {conv.other_user_image ? (
                    <img src={conv.other_user_image} alt={conv.other_user_name} />
                  ) : (
                    <span>{conv.other_user_name?.charAt(0)?.toUpperCase() || "A"}</span>
                  )}
                </div>
                <div className="conv-content">
                  <div className="conv-header">
                    <h4>{conv.other_user_name}</h4>
                    <span className="conv-time">{formatTime(conv.last_message_at)}</span>
                  </div>
                  <p className="conv-preview">{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="unread-badge">{conv.unread_count}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div 
                className="chat-user"
                onClick={() => navigate(`/artisan/${selectedConversation.other_user_id}`)}
              >
                <div className="chat-avatar">
                  {selectedConversation.other_user_image ? (
                    <img 
                      src={selectedConversation.other_user_image} 
                      alt={selectedConversation.other_user_name} 
                    />
                  ) : (
                    <span>
                      {selectedConversation.other_user_name?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  )}
                </div>
                <div className="chat-user-info">
                  <h3>{selectedConversation.other_user_name}</h3>
                  <span className="user-status">Artisan</span>
                </div>
              </div>
              <button 
                className="view-profile-btn"
                onClick={() => navigate(`/artisan/${selectedConversation.other_user_id}`)}
              >
                View Profile
              </button>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>{t.noMessages}</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender_id === user.id || msg.is_mine ? "sent" : "received"}`}
                  >
                    <div className="message-content">
                      <p>{msg.content}</p>
                      <span className="message-time">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t.typeMessage}
                disabled={sending}
              />
              <button type="submit" disabled={sending || !newMessage.trim()}>
                {sending ? "..." : "➤"}
              </button>
            </form>
          </>
        ) : (
          <div className="no-selection">
            <div className="no-selection-content">
              <span className="icon">💬</span>
              <h3>{t.selectConversation}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
