// import React, { useEffect, useState, useContext } from "react";
// import { LanguageContext } from "../context/LanguageContext";
// // import { adminAPI } from "../utils/api";
// import "./AdminDashboard_Role.css";
// export default function DashboardAdmin() {
//   const { language } = useContext(LanguageContext);

//   // ----------------------------
//   // State Management
//   // ----------------------------
//   const [pendingCrafts, setPendingCrafts] = useState([]);
//   const [showEventForm, setShowEventForm] = useState(false);

//   const [stats, setStats] = useState({
//     totalCrafts: 0,
//     totalUsers: 0,
//     pendingApprovals: 0,
//     totalEvents: 0,
//   });

//   const [eventForm, setEventForm] = useState({
//     name: "",
//     description: "",
//     location: "",
//     date: "",
//     time: "",
//   });

//   // ----------------------------
//   // Language Content
//   // ----------------------------
//   const content = {
//     en: {
//       title: "Admin Dashboard",
//       subtitle: "Manage crafts, users, and platform settings",
//       totalCrafts: "Total Crafts",
//       totalUsers: "Total Users",
//       pendingApprovals: "Pending Approvals",
//       totalEvents: "Total Events",
//       pendingApprovalsList: "Pending Approvals",
//       noPending: "No pending crafts",
//       approve: "Approve",
//       reject: "Reject",
//       eventsManagement: "Events Management",
//       createEvent: "Create New Event",
//       eventName: "Event Name",
//       eventDescription: "Event Description",
//       eventLocation: "Location",
//       eventDate: "Date",
//       eventTime: "Time",
//       submit: "Submit Event",
//       cancel: "Cancel",
//     },
//     te: {
//       title: "అడ్మిన్ డాష్‌బోర్డ్",
//       subtitle: "హస్తకళలు, వినియోగదారులు మరియు ప్లాట్‌ఫారమ్ సెట్టింగ్‌లను నిర్వహించండి",
//       totalCrafts: "మొత్తం హస్తకళలు",
//       totalUsers: "మొత్తం వినియోగదారులు",
//       pendingApprovals: "పెండింగ్ ఆమోదాలు",
//       totalEvents: "మొత్తం ఈవెంట్‌లు",
//       pendingApprovalsList: "పెండింగ్ ఆమోదాలు",
//       noPending: "పెండింగ్ హస్తకళలు లేవు",
//       approve: "ఆమోదించు",
//       reject: "తిరస్కరించు",
//       eventsManagement: "ఈవెంట్‌ల నిర్వహణ",
//       createEvent: "కొత్త ఈవెంట్‌ను సృష్టించండి",
//       eventName: "ఈవెంట్ పేరు",
//       eventDescription: "ఈవెంట్ వివరణ",
//       eventLocation: "స్థానం",
//       eventDate: "తేదీ",
//       eventTime: "సమయం",
//       submit: "ఈవెంట్‌ను సమర్పించండి",
//       cancel: "రద్దు చేయి",
//     },
//   };

//   const t = content[language] || content.en;

//   // ----------------------------
//   // Load Dashboard Data
//   // ----------------------------
//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = () => {
//     // Mock Pending Crafts
//     const mockPending = [
//       {
//         id: 11,
//         name: "Clay Lamp",
//         craftType: "Pottery",
//         location: "Village A",
//         artisan: "Ramesh Kumar",
//         imageUrl:
//           "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=150&h=100&fit=crop",
//         price: "₹250",
//         story: "Traditional clay lamps made for festivals",
//       },
//       {
//         id: 12,
//         name: "Handwoven Mat",
//         craftType: "Textiles",
//         location: "Village B",
//         artisan: "Lakshmi Devi",
//         imageUrl:
//           "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=100&fit=crop",
//         price: "₹600",
//         story: "Eco-friendly mats woven from natural fibers",
//       },
//     ];

//     setPendingCrafts(mockPending);

//     setStats({
//       totalCrafts: 156,
//       totalUsers: 87,
//       pendingApprovals: mockPending.length,
//       totalEvents: 8,
//     });
//   };

//   // ----------------------------
//   // Handle Craft Action
//   // ----------------------------
//   const handleCraftAction = (id, actionType) => {
//     // Future API:
//     // adminAPI[actionType](id)

//     setPendingCrafts((prev) =>
//       prev.filter((craft) => craft.id !== id)
//     );

//     setStats((prev) => ({
//       ...prev,
//       pendingApprovals: prev.pendingApprovals - 1,
//     }));
//   };

//   // ----------------------------
//   // Handle Form Input Change
//   // ----------------------------
//   const handleInputChange = (field, value) => {
//     setEventForm((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   // ----------------------------
//   // Handle Event Creation
//   // ----------------------------
//   const handleEventSubmit = (e) => {
//     e.preventDefault();

//     console.log("New Event:", eventForm);

//     alert("Event created successfully!");

//     setEventForm({
//       name: "",
//       description: "",
//       location: "",
//       date: "",
//       time: "",
//     });

//     setShowEventForm(false);

//     setStats((prev) => ({
//       ...prev,
//       totalEvents: prev.totalEvents + 1,
//     }));
//   };

//   return (
//     <div className="container dashboard-admin">

//       {/* Dashboard Header */}
//       <h2>{t.title}</h2>
//       <p>{t.subtitle}</p>

//       {/* Stats Section */}
//       <div className="stats-grid">
//         {Object.entries(stats).map(([key, value]) => (
//           <div key={key} className="stat-card">
//             <h4>{t[key]}</h4>
//             <div className="stat-number">{value}</div>
//           </div>
//         ))}
//       </div>

//       {/* Pending Approvals */}
//       <h3 style={{ marginTop: "32px", marginBottom: "16px" }}>
//         {t.pendingApprovalsList}
//       </h3>

//       <div className="craft-list">
//         {pendingCrafts.length === 0 ? (
//           <div className="panel">{t.noPending}</div>
//         ) : (
//           pendingCrafts.map((craft) => (
//             <div key={craft.id} className="craft-card admin-craft-card">
//               <div className="admin-craft-content">

//                 <img
//                   src={craft.imageUrl}
//                   alt={craft.name}
//                   className="admin-craft-image"
//                 />

//                 <div className="admin-craft-info">
//                   <h3>{craft.name}</h3>
//                   <p>
//                     {craft.craftType} • {craft.location}
//                   </p>

//                   <p>
//                     <strong>Artisan:</strong> {craft.artisan}
//                   </p>

//                   <p>
//                     <strong>Price:</strong> {craft.price}
//                   </p>

//                   <p>
//                     <em>"{craft.story}"</em>
//                   </p>
//                 </div>

//                 <div className="admin-craft-actions">
//                   <button
//                     className="btn"
//                     onClick={() =>
//                       handleCraftAction(craft.id, "approve")
//                     }
//                   >
//                     ✓ {t.approve}
//                   </button>

//                   <button
//                     className="btn danger"
//                     onClick={() =>
//                       handleCraftAction(craft.id, "reject")
//                     }
//                   >
//                     ✗ {t.reject}
//                   </button>
//                 </div>

//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Events Section */}
//       <h3 style={{ marginTop: "32px", marginBottom: "16px" }}>
//         {t.eventsManagement}
//       </h3>

//       <div className="panel">
//         <button
//           className="btn"
//           onClick={() => setShowEventForm(!showEventForm)}
//         >
//           {showEventForm ? t.cancel : `+ ${t.createEvent}`}
//         </button>

//         {showEventForm && (
//           <form
//             onSubmit={handleEventSubmit}
//             className="event-form"
//             style={{ marginTop: "20px" }}
//           >
//             {["name", "description", "location"].map((field) => (
//               <div key={field} className="field">
//                 <label>{t[`event${field.charAt(0).toUpperCase() + field.slice(1)}`]}</label>

//                 {field === "description" ? (
//                   <textarea
//                     className="input"
//                     value={eventForm[field]}
//                     onChange={(e) =>
//                       handleInputChange(field, e.target.value)
//                     }
//                     required
//                   />
//                 ) : (
//                   <input
//                     type="text"
//                     className="input"
//                     value={eventForm[field]}
//                     onChange={(e) =>
//                       handleInputChange(field, e.target.value)
//                     }
//                     required
//                   />
//                 )}
//               </div>
//             ))}

//             {/* Date & Time */}
//             <div className="row" style={{ gap: "12px" }}>
//               <div className="field" style={{ flex: 1 }}>
//                 <label>{t.eventDate}</label>
//                 <input
//                   type="date"
//                   className="input"
//                   value={eventForm.date}
//                   onChange={(e) =>
//                     handleInputChange("date", e.target.value)
//                   }
//                   required
//                 />
//               </div>

//               <div className="field" style={{ flex: 1 }}>
//                 <label>{t.eventTime}</label>
//                 <input
//                   type="time"
//                   className="input"
//                   value={eventForm.time}
//                   onChange={(e) =>
//                     handleInputChange("time", e.target.value)
//                   }
//                   required
//                 />
//               </div>
//             </div>

//             {/* Buttons */}
//             <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
//               <button type="submit" className="btn">
//                 {t.submit}
//               </button>

//               <button
//                 type="button"
//                 className="btn secondary"
//                 onClick={() => setShowEventForm(false)}
//               >
//                 {t.cancel}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

import mysql.connector as c


