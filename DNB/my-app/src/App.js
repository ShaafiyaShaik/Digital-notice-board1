import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Login from "./Loginpage";
import Register from "./Registerpage";
import Homepage from "./Home";
import AdminApp from "./AdminApp";
import Student from "./Studentpage";

// Protected route wrapper component that handles navigation
const ProtectedRouteWrapper = ({ allowedRoles, children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (!token || !user) {
        setIsAuthenticated(false);
        setUserRole(null);
        return;
      }
      
      setIsAuthenticated(true);
      setUserRole(user.role);
    };
    
    checkAuth();
    setLoading(false);
  }, [location.pathname]);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/login", { replace: true });
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If user doesn't have required role, redirect to appropriate page
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    switch (userRole) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "student":
        return <Navigate to="/student" replace />;
      case "faculty":
        return <Navigate to="/faculty" replace />;
      case "librarian":
        return <Navigate to="/librarian" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  // User is authenticated and has the required role, render the protected component
  const childrenWithProps = React.Children.map(children, child => {
    return React.cloneElement(child, { handleLogout });
  });
  
  return <>{childrenWithProps}</>;
};

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserRole(storedUser.role);
    }
    setLoading(false);
  }, []);

  // Main app handler for login
  const handleLogin = (role) => {
    setUserRole(role);
  };

  if (loading) {
    return <div>Loading application...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          userRole ? (
            userRole === "admin" ? <Navigate to="/admin" replace /> :
            userRole === "student" ? <Navigate to="/student" replace /> :
            userRole === "faculty" ? <Navigate to="/faculty" replace /> :
            userRole === "librarian" ? <Navigate to="/librarian" replace /> :
            <Homepage />
          ) : (
            <Homepage />
          )
        } />
        
        <Route path="/login" element={
          userRole ? (
            userRole === "admin" ? <Navigate to="/admin" replace /> :
            userRole === "student" ? <Navigate to="/student" replace /> :
            userRole === "faculty" ? <Navigate to="/faculty" replace /> :
            userRole === "librarian" ? <Navigate to="/librarian" replace /> :
            <Navigate to="/" replace />
          ) : (
            <Login setUserRole={handleLogin} />
          )
        } />
        
        <Route path="/register" element={
          userRole ? (
            userRole === "admin" ? <Navigate to="/admin" replace /> :
            userRole === "student" ? <Navigate to="/student" replace /> :
            userRole === "faculty" ? <Navigate to="/faculty" replace /> :
            userRole === "librarian" ? <Navigate to="/librarian" replace /> :
            <Navigate to="/" replace />
          ) : (
            <Register />
          )
        } />
        
        {/* Protected routes */}
        <Route path="/admin/*" element={
          <ProtectedRouteWrapper allowedRoles={["admin"]}>
            <AdminApp />
          </ProtectedRouteWrapper>
        } />
        
        <Route path="/student/*" element={
          <ProtectedRouteWrapper allowedRoles={["student"]}>
            <Student />
          </ProtectedRouteWrapper>
        } />
        
        <Route path="/faculty/*" element={
          <ProtectedRouteWrapper allowedRoles={["faculty"]}>
            <div>Faculty Dashboard</div>
          </ProtectedRouteWrapper>
        } />
        
        <Route path="/librarian/*" element={
          <ProtectedRouteWrapper allowedRoles={["librarian"]}>
            <div>Librarian Dashboard</div>
          </ProtectedRouteWrapper>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;