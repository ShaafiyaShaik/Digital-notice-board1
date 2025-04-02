import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube, FaBell, FaHome, 
  FaClipboardList, FaAddressBook, FaUserEdit, FaCog, FaSignOutAlt, FaSearch, FaCalendarAlt, 
  FaListUl, FaMoon, FaSun, FaEye, FaExclamationTriangle } from "react-icons/fa";
import "./Studentpage.css";

const Student = ({ handleLogout: appHandleLogout }) => {
  // State variables
  const [darkMode, setDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [notices, setNotices] = useState([]);
  const [urgentNotices, setUrgentNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUrgentIndex, setCurrentUrgentIndex] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const fetchNotices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/notices");
      
      // Directly set notices as received from backend
      setNotices(response.data);
      
      // Filter urgent notices
      const urgent = response.data.filter(notice => notice.urgent);
      setUrgentNotices(urgent);
      
      // Check for new notices since last visit
      const lastVisitTime = localStorage.getItem("lastVisitTime") || 0;
      const currentTime = new Date().getTime();
      
      // Retrieve existing notifications from localStorage
      const existingNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      
      // Filter notices that are new since last visit and not already in existing notifications
      const newNotices = response.data.filter(notice => {
        const noticeDate = new Date(notice.createdAt || notice.date).getTime();
        return noticeDate > lastVisitTime && 
               !existingNotifications.some(existingNotif => existingNotif.id === notice._id);
      });
      
      // Update notifications only with truly new notices
      if (newNotices.length > 0) {
        const updatedNotifications = [
          ...newNotices.map(notice => ({
            id: notice._id,
            title: notice.title,
            date: notice.date,
            isRead: false,
            category: notice.category,
            urgent: notice.urgent
          })),
          ...existingNotifications
        ];
        
        setNotifications(updatedNotifications);
        
        // Update unread count
        const unreadNotifications = updatedNotifications.filter(notif => !notif.isRead);
        setUnreadCount(unreadNotifications.length);
      }
      
      // Update last visit time
      localStorage.setItem("lastVisitTime", currentTime);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  // Rotate through urgent notices
  useEffect(() => {
    if (urgentNotices.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentUrgentIndex(prevIndex => 
        prevIndex === urgentNotices.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change notice every 5 seconds
    
    return () => clearInterval(interval);
  }, [urgentNotices]);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const savedUser = JSON.parse(localStorage.getItem("user"));
      
      if (!token || !savedUser) {
        // Redirect to login with history state to prevent back button issues
        navigate("/login", { replace: true });
        return false;
      }
      
      // Verify user role
      if (savedUser.role !== "student") {
        // Redirect to appropriate page based on role
        if (savedUser.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        return false;
      }
      
      // User is authenticated as student
      setUserName(savedUser.name);
      return true;
    };
    
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    
    if (isAuth) {
      // Set dark mode preferences
      const savedDarkMode = localStorage.getItem("darkMode") === "true";
      setDarkMode(savedDarkMode);
      document.body.classList.toggle("dark-mode", savedDarkMode);
      
      // Fetch notices
      fetchNotices();
      
      // Load saved notifications from localStorage
      const savedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      setNotifications(savedNotifications);
      
      // Calculate unread count
      const unreadNotifications = savedNotifications.filter(notif => !notif.isRead);
      setUnreadCount(unreadNotifications.length);
      
      // Set up polling to check for new notices every minute
      const intervalId = setInterval(fetchNotices, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [navigate, location.pathname]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle("dark-mode", newMode);
    localStorage.setItem("darkMode", newMode);
  };
  
  // Filter notices based on search, date, and category
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate ? notice.date === selectedDate : true;
    const matchesCategory = selectedCategory ? notice.category === selectedCategory : true;
    
    return matchesSearch && matchesDate && matchesCategory;
  });

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationOpen(false); // Close notification dropdown if open
  };
  
  const toggleNotifications = (e) => {
    e.stopPropagation();
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false); // Close account dropdown if open
  };
  
  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  };
  
  // View notification details
  const viewNotificationDetails = (id) => {
    markAsRead(id);
    const notice = notices.find(notice => notice._id === id);
    setSelectedNotice(notice);
    setIsModalOpen(true);
    setIsNotificationOpen(false);
  };

  // View notice details
  const viewNoticeDetails = (notice) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("notifications");
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Set active tab and close mobile menu
  const setTab = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".account-container") && !event.target.closest(".notification-container")) {
        setIsDropdownOpen(false);
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle logout with history replacement to prevent back button issues
  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">📌</span>
            <span className={`logo-text ${isSidebarCollapsed ? 'hidden' : ''}`}>Notice Board</span>
          </div>
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <div className="sidebar-menu">
          <ul>
            <li className={activeTab === "home" ? "active" : ""} onClick={() => setTab("home")}>
              <FaHome className="menu-icon" />
              <span className={`menu-text ${isSidebarCollapsed ? 'hidden' : ''}`}>Home</span>
            </li>
            <li className={activeTab === "notices" ? "active" : ""} onClick={() => setTab("notices")}>
              <FaClipboardList className="menu-icon" />
              <span className={`menu-text ${isSidebarCollapsed ? 'hidden' : ''}`}>Notices</span>
            </li>
          </ul>
        </div>
  
        <div className="sidebar-footer">
          <button className="sidebar-btn" onClick={toggleDarkMode}>
            {darkMode ? <FaSun className="menu-icon" /> : <FaMoon className="menu-icon" />}
            <span className={`menu-text ${isSidebarCollapsed ? 'hidden' : ''}`}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
          <button className="sidebar-btn logout" onClick={onLogout}>
            <FaSignOutAlt className="menu-icon" />
            <span className={`menu-text ${isSidebarCollapsed ? 'hidden' : ''}`}>Logout</span>
          </button>
        </div>
      </div>
  
      {/* Main Content */}
      <div className="main-content">
        {/* Top Navbar */}
        <div className="top-navbar">
          <div className="mobile-toggle" onClick={toggleMobileMenu}>
            <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
  
          <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <ul>
              <li onClick={() => setTab("home")}>Home</li>
              <li onClick={() => setTab("notices")}>Notices</li>
              <li onClick={toggleDarkMode}>{darkMode ? "Light Mode" : "Dark Mode"}</li>
              <li onClick={onLogout}>Logout</li>
            </ul>
          </div>
  
          <div className="page-title">
            {activeTab === "home" && "Student Dashboard"}
            {activeTab === "notices" && "Notice Board"}
          </div>
  
          <div className="nav-actions">
            {/* Notification Bell */}
            <div className="notification-container" onClick={toggleNotifications}>
              <div className="notification-icon">
                <FaBell />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </div>
              
              {isNotificationOpen && (
                <div className="notification-dropdown active">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <div className="notification-actions">
                      <button className="mark-all-btn" onClick={markAllAsRead}>
                        Mark all as read
                      </button>
                      <button className="clear-all-btn" onClick={clearAllNotifications}>
                        Clear all
                      </button>
                    </div>
                  </div>
                  
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                          onClick={() => viewNotificationDetails(notification.id)}
                        >
                          <div className="notification-content">
                            <h4>{notification.title}</h4>
                            <p className="notification-date">{notification.date}</p>
                            {notification.category && (
                              <span className="notification-category">{notification.category}</span>
                            )}
                            {notification.urgent && (
                              <span className="notification-urgent">Urgent</span>
                            )}
                          </div>
                          {!notification.isRead && (
                            <span className="notification-dot"></span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="no-notifications">No new notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>
  
            {/* User Account Section */}
            <div className="account-container" onClick={toggleDropdown}>
              <div className="account-avatar">
                {userName ? userName.charAt(0).toUpperCase() : '?'}
              </div>
              {userName && <span className="account-name">{userName}</span>}
              {isDropdownOpen && userName && (
                <div className="dropdown-menu active">
                  <Link to="/student/edit-profile" className="dropdown-item">
                    <FaUserEdit className="dropdown-icon" />
                    <span>Edit Profile</span>
                  </Link>
                  <Link to="/student/settings" className="dropdown-item">
                    <FaCog className="dropdown-icon" />
                    <span>Settings</span>
                  </Link>
                  <button className="dropdown-item logout" onClick={onLogout}>
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
  
        {/* Content */}
        <div className="content-area">
          {/* Urgent Banner (conditionally shown and scrolling) */}
          {urgentNotices.length > 0 && (
            <div className="urgent-banner-container">
              <div className="urgent-banner">
                <FaExclamationTriangle className="banner-icon" />
                <div className="urgent-notice-content">
                  {urgentNotices.map((notice, index) => (
                    <div 
                      key={notice._id}
                      className={`urgent-notice-item ${index === currentUrgentIndex ? 'active' : ''}`}
                      onClick={() => viewNoticeDetails(notice)}
                    >
                      <span className="urgent-title">{notice.title}</span>
                      {urgentNotices.length > 1 && (
                        <span className="banner-indicator">
                          {index + 1}/{urgentNotices.length}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {urgentNotices.length > 1 && (
                  <div className="banner-dots">
                    {urgentNotices.map((_, index) => (
                      <span 
                        key={index} 
                        className={`dot ${index === currentUrgentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentUrgentIndex(index)}
                      ></span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
  
          {/* Home Tab Content */}
          {activeTab === "home" && (
            <div className="home-content">
              <div className="welcome-card">
                <h2>Welcome back, {userName}!</h2>
                <p>Stay updated with the latest notices and announcements.</p>
              </div>
  
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon notices-icon"></div>
                  <div className="stat-info">
                    <h3>{notices.length}</h3>
                    <p>Total Notices</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon urgent-icon"></div>
                  <div className="stat-info">
                    <h3>{urgentNotices.length}</h3>
                    <p>Urgent Notices</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon unread-icon"></div>
                  <div className="stat-info">
                    <h3>{unreadCount}</h3>
                    <p>Unread Notifications</p>
                  </div>
                </div>
              </div>
  
              <h2 className="section-title">Recent Notices</h2>
              <div className="recent-notices">
                {notices.slice(0, 3).map((notice, index) => (
                  <div key={index} className="recent-notice-card" onClick={() => viewNoticeDetails(notice)}>
                    <h3>{notice.title}</h3>
                    <p className="notice-preview">{notice.description?.substring(0, 100)}...</p>
                    <div className="notice-meta">
                      <span className="notice-category">{notice.category}</span>
                      <span className="notice-date">{notice.date}</span>
                      {notice.urgent && <span className="urgent-badge">Urgent</span>}
                    </div>
                    <button className="view-details-btn">
                      <FaEye className="btn-icon" />
                      <span>View Details</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Notices Tab Content */}
          {activeTab === "notices" && (
            <div className="notices-content">
              {/* Search Section */}
              <div className="search-container">
                <div className="search-bar-wrapper">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    className="search-bar" 
                    placeholder="Search notices..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="date-picker-wrapper">
                  <FaCalendarAlt className="date-icon" />
                  <input 
                    type="date" 
                    className="date-picker" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="category-dropdown-wrapper">
                  <FaListUl className="category-icon" />
                  <select 
                    className="category-dropdown"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="academic">Academic</option>
                    <option value="events">Events</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
  
              <div className="notices-grid">
                {filteredNotices.length > 0 ? (
                  filteredNotices.map((notice, index) => (
                    <div key={index} className="notice-card" onClick={() => viewNoticeDetails(notice)}>
                      <h3>{notice.title}</h3>
                      <p className="notice-description">{notice.description}</p>
                      <div className="notice-footer">
                        <div className="notice-tags">
                          <span className="notice-category">{notice.category}</span>
                          <span className="notice-date">{notice.date}</span>
                        </div>
                        {notice.urgent && <span className="urgent-badge">Urgent</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notices">
                    <div className="empty-state">
                      <div className="empty-icon"></div>
                      <h3>No notices found</h3>
                      <p>No notices match your search criteria. Try adjusting your filters.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
  
          {/* Notice Detail Modal */}
          {isModalOpen && selectedNotice && (
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                
                <div className="notice-detail-header">
                  <h2>{selectedNotice.title}</h2>
                  {selectedNotice.urgent && (
                    <span className="urgent-badge large">Urgent</span>
                  )}
                </div>
                
                <div className="notice-meta-info">
                  <div className="meta-item">
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">{selectedNotice.category}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Date:</span>
                    <span className="meta-value">{selectedNotice.date}</span>
                  </div>
                  {selectedNotice.publisher && (
                    <div className="meta-item">
                      <span className="meta-label">Published by:</span>
                      <span className="meta-value">{selectedNotice.publisher}</span>
                    </div>
                  )}
                </div>
                
                <div className="notice-detail-content">
                  <p>{selectedNotice.description}</p>
                </div>
                
                {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                  <div className="notice-attachments">
                    <h3>Attachments</h3>
                    <ul>
                      {selectedNotice.attachments.map((attachment, index) => (
                        <li key={index}>
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            {attachment.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Student;