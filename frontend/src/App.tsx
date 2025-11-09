import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext"; 
import NewsFeed from "./components/NewsFeed";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import CreatePost from "./components/CreatePost";
import Profile from "./components/Profile";
// import PostsList from "./components/PostList";
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";

const App: React.FC = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) return <div>Loading...</div>; // Prevent crashing on null context

  const { isAuthenticated } = authContext;

  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route path="/newsfeed" element={<NewsFeed />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/profile" element={<Profile />} />
          {/* <Route path="/posts" element={<PostsList />} /> */}
          <Route path="*" element={<Navigate to="/newsfeed" />} />
        </>
      ) : (
        <>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/signin" />} />
        </>
      )}
    </Routes>
  );
};

export default App;
