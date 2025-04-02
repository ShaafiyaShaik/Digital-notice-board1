import React from "react";
import { Link } from "react-router-dom";

const Dashboard = ({ notices, categories, darkMode }) => {
  // Calculate dashboard statistics
  const totalNotices = notices.length;
  const urgentNotices = notices.filter(notice => notice.urgent).length;
  const expiredNotices = notices.filter(notice => new Date(notice.date) < new Date()).length;
  const activeNotices = totalNotices - expiredNotices;
  
  // Get 5 most recent notices
  const recentNotices = [...notices]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate notices by category
  const noticesByCategory = {};
  categories.forEach(category => {
    noticesByCategory[category] = notices.filter(notice => notice.category === category).length;
  });

  const cardStyle = {
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    background: darkMode ? "#2a2a2a" : "#fff",
    color: darkMode ? "#fff" : "#333",
  };

  return (
    <div>
      <h2 style={{ borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`, paddingBottom: "10px", marginBottom: "20px" }}>Dashboard</h2>
      
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ ...cardStyle, background: darkMode ? "#2a2a2a" : "#e3f2fd" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Total Notices</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "0" }}>{totalNotices}</p>
        </div>
        <div style={{ ...cardStyle, background: darkMode ? "#2a2a2a" : "#fff8e1" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Active Notices</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "0" }}>{activeNotices}</p>
        </div>
        <div style={{ ...cardStyle, background: darkMode ? "#2a2a2a" : "#ffebee" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Urgent Notices</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "0" }}>{urgentNotices}</p>
        </div>

      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
        <Link to="/admin/create" style={{ 
          textDecoration: "none", 
          padding: "12px 20px", 
          background: "#007bff", 
          color: "#fff", 
          borderRadius: "5px",
          display: "inline-block"
        }}>
          ✏️ Create New Notice
        </Link>
        <Link to="/admin/manage" style={{ 
          textDecoration: "none", 
          padding: "12px 20px", 
          background: darkMode ? "#555" : "#f0f0f0", 
          color: darkMode ? "#fff" : "#333", 
          borderRadius: "5px",
          display: "inline-block"
        }}>
          📋 Manage Notices
        </Link>
        
      </div>

      {/* Recent Notices */}
      <div style={{ 
        ...cardStyle, 
        marginBottom: "30px"
      }}>
        <h3 style={{ borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`, paddingBottom: "10px" }}>Recent Notices</h3>
        {recentNotices.length > 0 ? (
          <div>
            {recentNotices.map((notice, index) => (
              <div key={index} style={{ 
                padding: "10px", 
                marginBottom: "10px", 
                borderBottom: index < recentNotices.length - 1 ? `1px solid ${darkMode ? "#444" : "#eee"}` : "none"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: "0" }}>{notice.title}</h4>
                  <span style={{ 
                    backgroundColor: notice.urgent ? "#dc3545" : (new Date(notice.date) < new Date() ? "#6c757d" : "#28a745"), 
                    color: "#fff", 
                    padding: "2px 6px", 
                    borderRadius: "3px", 
                    fontSize: "12px" 
                  }}>
                    {notice.urgent ? "URGENT" : (new Date(notice.date) < new Date() ? "EXPIRED" : "ACTIVE")}
                  </span>
                </div>
                <p style={{ margin: "5px 0", color: darkMode ? "#ccc" : "#666" }}>{notice.date} | {notice.category}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No notices available</p>
        )}
      </div>

      {/* Notices by Category */}
      <div style={cardStyle}>
        <h3 style={{ borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`, paddingBottom: "10px" }}>Notices by Category</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "15px" }}>
          {categories.map((category, index) => (
            <div key={index} style={{ 
              padding: "15px", 
              borderRadius: "5px", 
              background: darkMode ? "#333" : "#f9f9f9", 
              minWidth: "150px",
              flex: "1"
            }}>
              <p style={{ margin: "0 0 5px 0", fontWeight: "bold", textTransform: "capitalize" }}>{category}</p>
              <p style={{ margin: "0", fontSize: "24px" }}>{noticesByCategory[category] || 0}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;