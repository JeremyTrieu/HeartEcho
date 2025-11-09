import React, { createContext, useState, useEffect } from "react";

interface User {
  email: string | null;
}

// interface AuthContextType {
//   isAuthenticated: boolean;
//   login: (token: string) => void;
//   logout: () => void;
// }

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("authToken"));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userEmail = localStorage.getItem("userEmail");
    setIsAuthenticated(!!token);
    if (userEmail) {
      setUser({ email: userEmail });
    }
    else {
      setUser(null);
    }
  }, []);

  const login = (token: string, email: string) => {
    console.log("User logged in: ", email); // Add this line to debug
    localStorage.setItem("authToken", token);
    localStorage.setItem("userEmail", email);
    document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
    setIsAuthenticated(true);
    setUser({ email });
    
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
