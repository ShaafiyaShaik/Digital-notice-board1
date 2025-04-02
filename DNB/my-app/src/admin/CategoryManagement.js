import React, { useState, useEffect } from "react";

const CategoriesManagement = ({ categories, setCategories, darkMode }) => {
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Add default categories if none exist
  useEffect(() => {
    if (!categories || categories.length === 0) {
      setCategories(["general", "academic", "events"]);
    }
  }, [categories, setCategories]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError("Please enter a category name");
      return;
    }

    // Check if category already exists (case-insensitive comparison)
    if (categories.some(cat => cat.toLowerCase() === newCategory.toLowerCase().trim())) {
      setError("This category already exists");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // In a real implementation, this would be a server call
      // For now, just update the local state
      setCategories(prev => [...prev, newCategory.toLowerCase().trim()]);
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (index) => {
    setEditingIndex(index);
    setEditingValue(categories[index]);
    setError("");
  };

  const handleUpdateCategory = async (index) => {
    if (!editingValue.trim()) {
      setError("Category name cannot be empty");
      return;
    }

    // Check if category already exists and it's not the same one we're editing
    if (
      categories.some(
        (cat, i) => 
          i !== index && 
          cat.toLowerCase() === editingValue.toLowerCase().trim()
      )
    ) {
      setError("This category already exists");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // In a real implementation, this would be a server call
      
      // For now, just update the local state
      const updatedCategories = [...categories];
      updatedCategories[index] = editingValue.toLowerCase().trim();
      setCategories(updatedCategories);
      setEditingIndex(null);
    } catch (error) {
      console.error("Error updating category:", error);
      setError("Failed to update category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (index) => {
    // Don't allow deleting default categories
    if (["general", "academic", "events"].includes(categories[index])) {
      setError("Cannot delete default categories");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${categories[index]}"?`)) {
      return;
    }

    setError("");

    try {
      // In a real implementation, this would be a server call
      
      // For now, just update the local state
      const updatedCategories = categories.filter((_, i) => i !== index);
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Failed to delete category. Please try again.");
    }
  };

  return (
    <div>
      <h2 style={{ borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`, paddingBottom: "10px", marginBottom: "20px" }}>Categories Management</h2>
      
      {/* Add Category Form */}
      <div style={{ 
        background: darkMode ? "#2a2a2a" : "#fff", 
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <h3 style={{ marginTop: "0", marginBottom: "15px" }}>Add New Category</h3>
        
        {error && (
          <div style={{ 
            padding: "10px", 
            marginBottom: "15px", 
            background: "#f8d7da", 
            color: "#721c24", 
            borderRadius: "4px",
            border: "1px solid #f5c6cb"
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          <input 
            type="text" 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            style={{ 
              padding: "8px", 
              width: "60%",
              borderRadius: "4px", 
              border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
              background: darkMode ? "#333" : "#fff",
              color: darkMode ? "#fff" : "#000",
              textAlign: "center"
            }}  
          />

          <button 
            onClick={handleAddCategory}
            disabled={isSubmitting}
            style={{ 
              background: "#007bff", 
              color: "#fff", 
              border: "none",
              borderRadius: "4px",
              width:"140px",
              height: "40px",
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "Adding..." : "Add Category"}
          </button>
        </div>
      </div>
      
      {/* Categories List */}
      <div style={{ 
        background: darkMode ? "#2a2a2a" : "#fff", 
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginTop: "0", marginBottom: "15px" }}>Existing Categories</h3>
        
        {categories.length === 0 ? (
          <p>No categories available.</p>
        ) : (
          <div>
            {categories.map((category, index) => (
              <div key={index} style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                padding: "12px",
                borderBottom: index < categories.length - 1 ? `1px solid ${darkMode ? "#444" : "#eee"}` : "none",
                background: index % 2 === 0 ? (darkMode ? "#333" : "#f9f9f9") : "transparent"
              }}>
                {editingIndex === index ? (
                  <input 
                    type="text" 
                    value={editingValue} 
                    onChange={(e) => setEditingValue(e.target.value)}
                    autoFocus
                    style={{ 
                      flex: "1",
                      padding: "8px", 
                      borderRadius: "4px", 
                      border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
                      background: darkMode ? "#444" : "#fff",
                      color: darkMode ? "#fff" : "#000",
                      marginRight: "10px"
                    }} 
                  />
                ) : (
                  <span style={{ 
                    flex: "1", 
                    fontWeight: ["general", "academic", "events"].includes(category) ? "bold" : "normal",
                    textTransform: "capitalize"
                  }}>
                    {category} {["general", "academic", "events"].includes(category) && "(Default)"}
                  </span>
                )}
                
                <div style={{ display: "flex", gap: "5px" }}>
                  {editingIndex === index ? (
                    <>
                      <button 
                        onClick={() => handleUpdateCategory(index)}
                        style={{ 
                          padding: "5px 10px", 
                          background: "#28a745", 
                          color: "#fff", 
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => {
                          setEditingIndex(null);
                          setError("");
                        }}
                        style={{ 
                          padding: "5px 10px", 
                          background: darkMode ? "#555" : "#f0f0f0",
                          color: darkMode ? "#fff" : "#333",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleEditCategory(index)}
                        style={{ 
                          padding: "5px 10px", 
                          background: "#007bff", 
                          color: "#fff", 
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          opacity: ["general", "academic", "events"].includes(category) ? 0.5 : 1,
                          pointerEvents: ["general", "academic", "events"].includes(category) ? "none" : "auto"
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(index)}
                        style={{ 
                          padding: "5px 10px", 
                          background: "#dc3545", 
                          color: "#fff", 
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          opacity: ["general", "academic", "events"].includes(category) ? 0.5 : 1,
                          pointerEvents: ["general", "academic", "events"].includes(category) ? "none" : "auto"
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesManagement;