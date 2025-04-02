import React, { useState } from "react";
import axios from "axios";

const ManageNotices = ({ notices, fetchNotices, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sorting, setSorting] = useState("date");
  const [viewMode, setViewMode] = useState("grid");
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [date, setDate] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [file, setFile] = useState(null);

  const handleEdit = (notice) => {
    setEditingId(notice._id);
    setTitle(notice.title);
    setDescription(notice.description);
    setCategory(notice.category || "general");
    setDate(notice.date || "");
    setUrgent(notice.urgent || false);
    // File can't be pre-filled due to security restrictions
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async () => {
    if (!title || !description || !date) {
      alert("⚠️ Please fill all required fields");
      return;
    }

    const updatedNotice = { 
      title, 
      description, 
      category, 
      date, 
      urgent,
      // Only include file if a new one is selected
      ...(file && { file: URL.createObjectURL(file) })
    };

    try {
      await axios.put(`http://localhost:5000/notices/${editingId}`, updatedNotice, {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });
      
      fetchNotices();
      resetForm();
    } catch (error) {
      console.error("Error updating notice:", error);
      alert("Failed to update notice. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await axios.delete(`http://localhost:5000/notices/${id}`, {
          headers: {
            Authorization: localStorage.getItem("token")
          }
        });
        fetchNotices();
      } catch (error) {
        console.error("Error deleting notice:", error);
        alert("Failed to delete notice. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("general");
    setDate("");
    setUrgent(false);
    setFile(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Apply filters and sorting
  const filteredNotices = [...notices]
    .filter(notice => 
      (notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       notice.description.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (filterCategory === "all" || notice.category === filterCategory)
    )
    .sort((a, b) => {
      if (sorting === "date") {
        return new Date(b.date) - new Date(a.date);
      } else if (sorting === "title") {
        return a.title.localeCompare(b.title);
      } else if (sorting === "category") {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

  // Get unique categories from notices
  const categories = ["general", "academic", "events", ...new Set(notices.map(notice => notice.category))].filter(Boolean);

  return (
    <div>
      <h2 style={{ borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`, paddingBottom: "10px", marginBottom: "20px" }}>Manage Notices</h2>

      {/* Edit Form (conditionally rendered) */}
      {editingId && (
        <div style={{ 
          padding: "20px", 
          marginBottom: "20px", 
          border: `1px solid ${darkMode ? "#444" : "#ddd"}`,
          borderRadius: "8px",
          background: darkMode ? "#2a2a2a" : "#f9f9f9"
        }}>
          <h3 style={{ borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`, paddingBottom: "10px", marginBottom: "15px" }}>
            Edit Notice
          </h3>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
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
              style={{ 
                width: "100%", 
                padding: "10px", 
                borderRadius: "4px", 
                border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
                background: darkMode ? "#333" : "#fff",
                color: darkMode ? "#fff" : "#000",
                minHeight: "100px"
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
                {categories.map((cat, index) => (
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
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={urgent} 
                onChange={(e) => setUrgent(e.target.checked)}
                style={{ marginRight: "8px" }} 
              />
              Mark as Urgent
            </label>
          </div>
          <div style={{ marginBottom: "15px" }}>
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
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={handleUpdate}
              style={{ 
                padding: "10px 20px", 
                background: "#007bff", 
                color: "#fff", 
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Update Notice
            </button>
            <button 
              onClick={resetForm}
              style={{ 
                padding: "10px 20px", 
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

      {/* Filters and Search */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "10px", 
        marginBottom: "20px",
        padding: "15px",
        background: darkMode ? "#2a2a2a" : "#f9f9f9",
        borderRadius: "8px"
      }}>
        <input 
          type="text" 
          placeholder="Search notices..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            flex: "1", 
            minWidth: "200px",
            padding: "10px", 
            borderRadius: "4px", 
            border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
            background: darkMode ? "#333" : "#fff",
            color: darkMode ? "#fff" : "#000"
          }}
        />
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ 
            padding: "10px", 
            borderRadius: "4px", 
            border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
            background: darkMode ? "#333" : "#fff",
            color: darkMode ? "#fff" : "#000"
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <select 
          value={sorting}
          onChange={(e) => setSorting(e.target.value)}
          style={{ 
            padding: "10px", 
            borderRadius: "4px", 
            border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
            background: darkMode ? "#333" : "#fff",
            color: darkMode ? "#fff" : "#000"
          }}
        >
          <option value="date">Sort by Date</option>
          <option value="title">Sort by Title</option>
          <option value="category">Sort by Category</option>
        </select>
        <div style={{ display: "flex", border: `1px solid ${darkMode ? "#555" : "#ddd"}`, borderRadius: "4px", overflow: "hidden" }}>
          <button 
            onClick={() => setViewMode("grid")}
            style={{ 
              padding: "10px 15px", 
              background: viewMode === "grid" ? (darkMode ? "#555" : "#e6e6e6") : (darkMode ? "#333" : "#fff"),
              border: "none",
              cursor: "pointer",
              color: darkMode ? "#fff" : "#000"
            }}
          >
            📱 Grid
          </button>
          <button 
            onClick={() => setViewMode("list")}
            style={{ 
              padding: "10px 15px", 
              background: viewMode === "list" ? (darkMode ? "#555" : "#e6e6e6") : (darkMode ? "#333" : "#fff"),
              border: "none",
              cursor: "pointer",
              color: darkMode ? "#fff" : "#000"
            }}
          >
            📃 List
          </button>
        </div>
      </div>

      {/* Notices Display */}
      {filteredNotices.length === 0 ? (
        <div style={{ 
          padding: "20px", 
          textAlign: "center", 
          background: darkMode ? "#2a2a2a" : "#f9f9f9",
          borderRadius: "8px"
        }}>
          <p>No notices found matching your criteria.</p>
        </div>
      ) : (
        <div style={{ 
          display: viewMode === "grid" ? "grid" : "block", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: "15px" 
        }}>
          {filteredNotices.map((notice) => (
            <div 
              key={notice._id} 
              style={{ 
                padding: "15px", 
                marginBottom: viewMode === "list" ? "15px" : "0",
                borderRadius: "8px",
                border: `1px solid ${darkMode ? "#444" : "#ddd"}`,
                background: darkMode ? "#2a2a2a" : "#fff",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {notice.urgent && (
                <div style={{ 
                  position: "absolute", 
                  top: "10px", 
                  right: "10px", 
                  background: "#dc3545", 
                  color: "#fff", 
                  padding: "3px 8px", 
                  borderRadius: "3px", 
                  fontSize: "12px" 
                }}>
                  URGENT
                </div>
              )}
              
              <h3 style={{ marginTop: "0", marginBottom: "10px" }}>{notice.title}</h3>
              
              <div style={{ 
                display: "flex", 
                gap: "10px", 
                marginBottom: "10px", 
                fontSize: "14px", 
                color: darkMode ? "#aaa" : "#666" 
              }}>
                <div>📅 {notice.date}</div>
                <div>🏷️ {notice.category}</div>
              </div>
              
              <p style={{ 
                margin: "0 0 15px 0",
                maxHeight: "100px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: "3",
                WebkitBoxOrient: "vertical"
              }}>
                {notice.description}
              </p>
              
              {notice.file && (
                <div style={{ marginBottom: "15px" }}>
                  <img 
                    src={notice.file} 
                    alt="Attachment" 
                    style={{ 
                      width: "100%", 
                      height: "120px", 
                      objectFit: "cover", 
                      borderRadius: "4px" 
                    }} 
                  />
                </div>
              )}
              
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  onClick={() => handleEdit(notice)}
                  style={{ 
                    flex: "1",
                    padding: "8px", 
                    background: "#007bff", 
                    color: "#fff", 
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDelete(notice._id)}
                  style={{ 
                    flex: "1",
                    padding: "8px", 
                    background: "#dc3545", 
                    color: "#fff", 
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageNotices;