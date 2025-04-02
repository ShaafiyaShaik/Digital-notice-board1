import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./admin/Dashboard";
import ManageNotices from "./admin/ManageNotices";
import CreateNotice from "./admin/CreateNotice";
import CategoriesManagement from "./admin/CategoryManagement";
import Settings from "./admin/Settings";
import axios from "axios";

const AdminApp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notices, setNotices] = useState([]);
  const [categories, setCategories] = useState(["general", "academic", "events"]);
  const location = useLocation();

  useEffect(() => {
    fetchNotices();
    setDarkMode(localStorage.getItem("darkMode") === "true");
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/notices");
      setNotices(response.data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", !darkMode);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: darkMode ? "#121212" : "#f9f9f9", color: darkMode ? "#fff" : "#000" }}>
      {/* Sidebar Navigation */}
      <div style={{ width: "250px", background: darkMode ? "#1E1E1E" : "#f0f0f0", padding: "20px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "30px" }}>📢 Admin Panel</h2>
        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "15px" }}>
              <Link to="/admin" style={{ textDecoration: "none", color: location.pathname === "/admin" ? "#007bff" : darkMode ? "#fff" : "#333", display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px" }}>🏠</span> Dashboard
              </Link>
            </li>
            <li style={{ marginBottom: "15px" }}>
              <Link to="/admin/manage" style={{ textDecoration: "none", color: location.pathname === "/admin/manage" ? "#007bff" : darkMode ? "#fff" : "#333", display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px" }}>📋</span> Manage Notices
              </Link>
            </li>
            <li style={{ marginBottom: "15px" }}>
              <Link to="/admin/create" style={{ textDecoration: "none", color: location.pathname === "/admin/create" ? "#007bff" : darkMode ? "#fff" : "#333", display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px" }}>✏️</span> Create Notice
              </Link>
            </li>
           
            <li style={{ marginBottom: "15px" }}>
              <Link to="/admin/settings" style={{ textDecoration: "none", color: location.pathname === "/admin/settings" ? "#007bff" : darkMode ? "#fff" : "#333", display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px" }}>⚙️</span> Settings
              </Link>
            </li>
            <li style={{ marginTop: "50px" }}>
              <button onClick={handleLogout} style={{ 
                background: "none", 
                border: "none", 
                color: darkMode ? "#fff" : "#333", 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                padding: "0",
                fontSize: "16px"
              }}>
                <span style={{ marginRight: "10px" }}>🚪</span> Logout
              </button>
            </li>
          </ul>
        </nav>
        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
          <button onClick={toggleDarkMode} style={{ 
            background: "none", 
            border: "1px solid", 
            borderColor: darkMode ? "#555" : "#ddd", 
            borderRadius: "5px",
            padding: "8px 12px", 
            cursor: "pointer", 
            color: darkMode ? "#fff" : "#333",
            width: "100%",
            textAlign: "left",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{ marginRight: "10px" }}>{darkMode ? "☀️" : "🌙"}</span> 
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Dashboard notices={notices} categories={categories} darkMode={darkMode} />} />
          <Route path="/manage" element={<ManageNotices notices={notices} fetchNotices={fetchNotices} darkMode={darkMode} />} />
          <Route path="/create" element={<CreateNotice fetchNotices={fetchNotices} categories={categories} darkMode={darkMode} />} />
          <Route path="/categories" element={<CategoriesManagement categories={categories} setCategories={setCategories} darkMode={darkMode} />} />
          <Route path="/settings" element={<Settings darkMode={darkMode} />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminApp;