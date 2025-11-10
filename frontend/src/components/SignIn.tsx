import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import "../styles/SignIn.css"; // Import CSS for styling

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  if (!authContext) return null; // Ensure context is available
  const { login } = authContext;

  const handleLogin = async (email: string, password: string) => {
    const response = await fetch("http://localhost:5000/user/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    return response; // Ensure response is returned so that we can check response.ok in the submit handler
  };
    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (email && password) {
      try {
        const response = await handleLogin(email, password); // Make sure handleLogin returns the response object
        
        if (response.ok) {
          const data = await response.json(); // Get token from response
          console.log("Login response data: ", data);  // Add this for debugging
          login(data.token, data.email); // Store token in context and localStorage
          navigate("/newsfeed"); // Redirect
        } else {
          alert("Login failed");
        }
      } catch (err) {
        console.error("Error during login:", err);
        alert("An error occurred during login.");
      }
    } 
    else {
      console.log("Please provide both email and password.");
    }
  }; 

  return (
    <div className="sign-in-container">
      {/* Logo and Brand */}
      <div className="heartecho-logo">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <h1 className="heartecho-title">heartecho</h1>
      
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
      </form>
      <div className="auth-links">
        <p>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
