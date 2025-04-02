import React, { useState } from "react";
import axios from "axios";

const CreateNotice = ({ fetchNotices, categories, darkMode }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [date, setDate] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [file, setFile] = useState(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [notificationInfo, setNotificationInfo] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !date) {
      alert("⚠️ Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    
    const newNotice = { 
      title, 
      description, 
      category, 
      date, 
      urgent,
      file: file ? URL.createObjectURL(file) : null
    };

    try {
      const response = await axios.post("http://localhost:5000/notices", newNotice, {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });
      
      // Reset form after successful submission
      setTitle("");
      setDescription("");
      setCategory("general");
      setDate("");
      setUrgent(false);
      setFile(null);
      
      // Show success message with notification info
      setSuccessMessage("Notice created successfully!");
      
      // Get user count for notification message
      try {
        const userResponse = await axios.get("http://localhost:5000/users/count", {
          headers: {
            Authorization: localStorage.getItem("token")
          }
        });
        setNotificationInfo(`Email notifications sent to ${userResponse.data.count} users`);
      } catch (error) {
        console.error("Error fetching user count:", error);
        setNotificationInfo("Email notifications sent to users");
      }
      
      setTimeout(() => {
        setSuccessMessage("");
        setNotificationInfo(null);
      }, 5000);
      
      // Refresh notices list
      fetchNotices();
    } catch (error) {
      console.error("Error adding notice:", error);
      alert("Failed to create notice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`, paddingBottom: "10px", marginBottom: "20px" }}>Create Notice</h2>
      
      {successMessage && (
        <div style={{ 
          padding: "15px", 
          marginBottom: "20px", 
          background: "#d4edda", 
          color: "#155724", 
          borderRadius: "4px",
          border: "1px solid #c3e6cb"
        }}>
          <div>✅ {successMessage}</div>
          {notificationInfo && <div style={{ marginTop: "8px", fontSize: "0.9em" }}>📧 {notificationInfo}</div>}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ 
        background: darkMode ? "#2a2a2a" : "#fff", 
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Title *</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notice title"
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
          <label style={{ display: "block", marginBottom: "5px" }}>Description *</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter notice description"
            style={{ 
              width: "100%", 
              padding: "10px", 
              borderRadius: "4px", 
              border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
              background: darkMode ? "#333" : "#fff",
              color: darkMode ? "#fff" : "#000",
              minHeight: "150px"
            }}
          />
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>Category *</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "10px", 
                borderRadius: "4px", 
                border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
                background: darkMode ? "#333" : "#fff",
                color: darkMode ? "#fff" : "#000" 
              }}
            >
              {["general", "academic", "events", ...categories].filter((value, index, self) => self.indexOf(value) === index).map((cat, index) => (
                <option key={index} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>Date *</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
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
        </div>
        
        <div style={{ marginBottom: "15px", display: "flex", gap: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={urgent} 
              onChange={(e) => setUrgent(e.target.checked)}
              style={{ marginRight: "8px" }} 
            />
            Mark as Urgent
          </label>
          
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={sendEmail} 
              onChange={(e) => setSendEmail(e.target.checked)}
              style={{ marginRight: "8px" }} 
            />
            Send email notifications
          </label>
        </div>
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Attachment</label>
          <input 
            type="file" 
            onChange={handleFileChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              borderRadius: "4px", 
              border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
              background: darkMode ? "#333" : "#fff",
              color: darkMode ? "#fff" : "#000" 
            }} 
          />
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: darkMode ? "#aaa" : "#666" }}>
            Supported formats: JPG, PNG, PDF (Max size: 5MB)
          </p>
        </div>
        
        <button 
          type="submit"
          disabled={isSubmitting}
          style={{ 
            width: "100%",
            padding: "12px", 
            background: "#007bff", 
            color: "#fff", 
            border: "none",
            borderRadius: "4px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            fontSize: "16px"
          }}
        >
          {isSubmitting ? "Creating..." : "Create Notice"}
        </button>
      </form>
    </div>
  );
};

export default CreateNotice;