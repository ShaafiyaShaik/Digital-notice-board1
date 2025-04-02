import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Registerpage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const Register = () => {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Function to validate a strong password
  const isStrongPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isStrongPassword(password)) {
      alert("Password must be at least 8 characters long, contain at least one uppercase letter, one digit, and one special character.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/register", {
        registrationNumber,
        name,
        email,
        password,
        role,
      });

      alert(response.data.message);
      setTimeout(() => {
        navigate("/login"); // Redirect to login page
      }, 1000);
    } catch (err) {
      console.error("Registration error:", err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "Error registering user");
    }
  };

  return (
    <div className="register-page">
      {/* Back button */}
      <button className="back-button" onClick={() => navigate("/")}>← Back</button>
      <div className="register-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Registration Number"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/* Password input with toggle icon */}
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value.toLowerCase())}>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="librarian">Librarian</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Register</button>
        </form>
        {/* Link to login page */}
        <p className="login-link">
        Already have an account? <span onClick={() => navigate("/login")}>Log Up</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
