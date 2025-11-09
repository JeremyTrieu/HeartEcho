import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext

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
