import { useState, useEffect } from "react";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check authentication status (e.g., from localStorage or API)
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return { isAuthenticated };
};

export default useAuth;
