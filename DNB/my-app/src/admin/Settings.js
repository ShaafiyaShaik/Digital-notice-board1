import React, { useState, useEffect } from "react";
import axios from "axios";

const Settings = ({ darkMode }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  
  // For user roles management
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Set up axios defaults and interceptors
  useEffect(() => {
    // Set base URL
    axios.defaults.baseURL = "http://localhost:5000";
    
    // Log requests in development
    axios.interceptors.request.use(request => {
      console.log('Request:', request.method, request.url);
      return request;
    });
    
    // Log responses in development
    axios.interceptors.response.use(
      response => {
        console.log('Response:', response.status, response.data);
        return response;
      },
      error => {
        if (error.response) {
          console.error('Error Response:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('No Response Received');
        } else {
          console.error('Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }, []);
  
  // Test connection to server
  const testConnection = async () => {
    try {
      setErrorMessage("Testing connection to server...");
      const response = await axios.get("/test");
      setErrorMessage(`Connection successful! Server says: ${response.data.message}`);
      return true;
    } catch (error) {
      setErrorMessage("Cannot connect to server. Please check if backend is running on http://localhost:5000");
      return false;
    }
  };
  
  // Fetch users from backend
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setErrorMessage("");
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        setErrorMessage("No authentication token found. Please log in again.");
        setIsLoadingUsers(false);
        return;
      }
      
      // First test connection
      const isConnected = await testConnection();
      if (!isConnected) {
        setIsLoadingUsers(false);
        return;
      }
      
      // Make the request with the token in Authorization header
      const response = await axios.get("/users", {
        headers: {
          Authorization: token
        }
      });
      
      setUsers(response.data);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage("Your session has expired. Please log in again.");
        } else if (error.response.status === 403) {
          setErrorMessage("You don't have permission to view users.");
        } else {
          setErrorMessage(`Failed to load users: ${error.response.data.message || error.response.statusText}`);
        }
      } else {
        setErrorMessage("Failed to load users. Check console for details.");
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "All password fields are required" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters long" });
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordMessage({ type: "", text: "" });
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        setPasswordMessage({ 
          type: "error",
          text: "No authentication token found. Please log in again."
        });
        setIsChangingPassword(false);
        return;
      }
      
      // Make the API request
      const response = await axios.post(
        "/change-password", 
        { currentPassword, newPassword },
        { 
          headers: { 
            Authorization: token
          } 
        }
      );
      
      // Success
      setPasswordMessage({ type: "success", text: response.data.message || "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setPasswordMessage({ 
            type: "error", 
            text: "The current password you entered is incorrect."
          });
        } else if (error.response.status === 401) {
          setPasswordMessage({ 
            type: "error", 
            text: "Your session has expired. Please log in again."
          });
        } else {
          setPasswordMessage({ 
            type: "error", 
            text: error.response.data.message || "Failed to change password. Please try again."
          });
        }
      } else {
        setPasswordMessage({ 
          type: "error", 
          text: "Failed to change password. Check console for details."
        });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Your session has expired. Please log in again.");
        return;
      }
      
      // Make the API request
      const response = await axios.put(
        `/users/${userId}/role`,
        { role: newRole },
        { 
          headers: { 
            Authorization: token
          } 
        }
      );
      
      // Update local state
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      
      // Reset selection
      setSelectedUser(null);
      setSelectedRole("");
      
      alert("User role updated successfully");
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || "Failed to update user role.");
      } else {
        alert("Failed to update user role. Check console for details.");
      }
    }
  };
  
  return (
    <div>
      <h2 style={{ borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`, paddingBottom: "10px", marginBottom: "20px" }}>Settings</h2>
      
      {/* Connection Test Button */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={testConnection}
          style={{ 
            padding: "8px 15px", 
            background: "#17a2b8", 
            color: "#fff", 
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Test Server Connection
        </button>
      </div>
      
      {/* Password Change Section */}
      <div style={{ 
        background: darkMode ? "#2a2a2a" : "#fff", 
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <h3 style={{ marginTop: "0", marginBottom: "20px" }}>Change Admin Password</h3>
        
        {passwordMessage.text && (
          <div style={{ 
            padding: "10px 15px",
            marginBottom: "15px",
            borderRadius: "4px",
            background: passwordMessage.type === "success" ? "#d4edda" : "#f8d7da",
            color: passwordMessage.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${passwordMessage.type === "success" ? "#c3e6cb" : "#f5c6cb"}`
          }}>
            {passwordMessage.type === "success" ? "✅ " : "⚠️ "}
            {passwordMessage.text}
          </div>
        )}
        
        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Current Password</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "10px", 
                borderRadius: "4px", 
                border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
                background: darkMode ? "#333" : "#fff",
                color: darkMode ? "#fff" : "#000"
              }} 
            />
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "10px", 
                borderRadius: "4px", 
                border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
                background: darkMode ? "#333" : "#fff",
                color: darkMode ? "#fff" : "#000"
              }} 
            />
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "10px", 
                borderRadius: "4px", 
                border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
                background: darkMode ? "#333" : "#fff",
                color: darkMode ? "#fff" : "#000"
              }} 
            />
          </div>
          
          <button 
            type="submit"
            disabled={isChangingPassword}
            style={{ 
              padding: "10px 20px", 
              background: "#007bff", 
              color: "#fff", 
              border: "none",
              borderRadius: "4px",
              cursor: isChangingPassword ? "not-allowed" : "pointer"
            }}
          >
            {isChangingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
      
      {/* User Roles Management Section */}
      <div style={{ 
        background: darkMode ? "#2a2a2a" : "#fff", 
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginTop: "0", marginBottom: "20px" }}>Manage User Roles</h3>
        
        {errorMessage && (
          <div style={{ 
            padding: "10px 15px",
            marginBottom: "15px",
            borderRadius: "4px",
            background: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb"
          }}>
            {errorMessage}
          </div>
        )}
        
        <div style={{ marginBottom: "15px" }}>
          <button 
            onClick={fetchUsers}
            style={{ 
              padding: "8px 15px", 
              background: "#007bff", 
              color: "#fff", 
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Refresh User List
          </button>
        </div>
        
        {isLoadingUsers ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse", 
              marginBottom: "20px"
            }}>
              <thead>
                <tr style={{ background: darkMode ? "#333" : "#f0f0f0" }}>
                  <th style={{ 
                    padding: "10px", 
                    textAlign: "left", 
                    borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`
                  }}>Name</th>
                  <th style={{ 
                    padding: "10px", 
                    textAlign: "left", 
                    borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`
                  }}>Email</th>
                  <th style={{ 
                    padding: "10px", 
                    textAlign: "left", 
                    borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`
                  }}>Role</th>
                  <th style={{ 
                    padding: "10px", 
                    textAlign: "center", 
                    borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} style={{ 
                      background: user._id === selectedUser ? (darkMode ? "#444" : "#e6f7ff") : "transparent",
                      transition: "background-color 0.2s"
                    }}>
                      <td style={{ 
                        padding: "10px", 
                        borderBottom: `1px solid ${darkMode ? "#444" : "#eee"}`
                      }}>{user.name}</td>
                      <td style={{ 
                        padding: "10px", 
                        borderBottom: `1px solid ${darkMode ? "#444" : "#eee"}`
                      }}>{user.email}</td>
                      <td style={{ 
                        padding: "10px", 
                        borderBottom: `1px solid ${darkMode ? "#444" : "#eee"}`,
                        textTransform: "capitalize"
                      }}>
                        <span style={{ 
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "3px",
                          fontSize: "12px",
                          background: user.role === "admin" 
                            ? (darkMode ? "#863c50" : "#ffd8e2") 
                            : (user.role === "faculty" || user.role === "librarian"
                              ? (darkMode ? "#3a5069" : "#d0e8ff") 
                              : (darkMode ? "#3b5c3b" : "#d7f7d7")),
                          color: darkMode ? "#fff" : "#000"
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ 
                        padding: "10px", 
                        borderBottom: `1px solid ${darkMode ? "#444" : "#eee"}`,
                        textAlign: "center"
                      }}>
                        <button
                          onClick={() => {
                            setSelectedUser(user._id);
                            setSelectedRole(user.role);
                          }}
                          style={{ 
                            padding: "5px 10px", 
                            background: "#007bff", 
                            color: "#fff", 
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {selectedUser && (
              <div style={{ 
                padding: "15px", 
                borderRadius: "4px", 
                border: `1px solid ${darkMode ? "#444" : "#ddd"}`,
                background: darkMode ? "#333" : "#f9f9f9",
                marginBottom: "20px"
              }}>
                <h4 style={{ marginTop: "0", marginBottom: "15px" }}>
                  Change Role for {users.find(u => u._id === selectedUser)?.name}
                </h4>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
                  <label>Select New Role:</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{ 
                      padding: "8px", 
                      borderRadius: "4px", 
                      border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
                      background: darkMode ? "#444" : "#fff",
                      color: darkMode ? "#fff" : "#000"
                    }}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="librarian">Librarian</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleChangeUserRole(selectedUser, selectedRole)}
                    style={{ 
                      padding: "8px 15px", 
                      background: "#28a745", 
                      color: "#fff", 
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setSelectedRole("");
                    }}
                    style={{ 
                      padding: "8px 15px", 
                      background: darkMode ? "#555" : "#f0f0f0", 
                      color: darkMode ? "#fff" : "#333", 
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        <p style={{ color: darkMode ? "#aaa" : "#666", fontSize: "14px" }}>
          <strong>Roles explanation:</strong><br />
          - <strong>Admin:</strong> Full access to all features including user management<br />
          - <strong>Faculty:</strong> Can create and manage notices related to their department<br />
          - <strong>Librarian:</strong> Can manage notices related to library resources<br />
          - <strong>Student:</strong> Can only view notices
        </p>
      </div>
    </div>
  );
};

export default Settings;