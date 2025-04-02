import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ darkMode }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  
  return (
    <div style={{ 
      width: "250px", 
      background: darkMode ? "#333" : "#fff", 
      color: darkMode ? "#fff" : "#000",
      borderRight: `1px solid ${darkMode ? "#444" : "#ddd"}`,
      padding: "20px 0"
    }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2>📢 Admin Panel</h2>
        <p>Digital Notice Board</p>
      </div>
      <nav>
        <NavItem to="/" label="📊 Dashboard" darkMode={darkMode} />
        <NavItem to="/manage" label="📝 Manage Notices" darkMode={darkMode} />
        <NavItem to="/create" label="➕ Create Notice" darkMode={darkMode} />
        <NavItem to="/settings" label="⚙️ Settings" darkMode={darkMode} />
        <div 
          onClick={handleLogout}
          style={{ 
            padding: "12px 20px", 
            cursor: "pointer",
            margin: "8px 0",
            borderRadius: "5px",
            background: darkMode ? "#444" : "#f1f1f1",
            color: darkMode ? "#fff" : "#000",
            marginTop: "50px"
          }}
        >
          🚪 Logout
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ to, label, darkMode }) => (
  <Link to={to} style={{ textDecoration: "none" }}>
    <div style={{ 
      padding: "12px 20px", 
      cursor: "pointer",
      margin: "8px 0",
      borderRadius: "5px",
      background: darkMode ? "#444" : "#f1f1f1",
      color: darkMode ? "#fff" : "#000"
    }}>
      {label}
    </div>
  </Link>
);

export default Navbar;