import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import GeneralAnalytics from "./pages/GeneralAnalytics";
import ProfileSetup from "./pages/ProfileSetup";
import JobTracker from "./pages/JobTracker";
import ViewProfile from "./pages/ViewProfile";
import JobSearch from "./pages/JobSearch";
import Analytics from "./pages/Analytics"; // Import the Analytics component
import CoverLetterGenerator from "./pages/CoverLetter";
import PasswordReset from "./pages/PasswordReset";
import ScrapetableForm from "./pages/ScrapeTableForm";
import ResumeGenerator from "./pages/ResumeGenerator";

function App() {
  // Track authentication state dynamically
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("token") !== null);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem("token") !== null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Redirect to Dashboard if logged in */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />} />
        
        {/* Pass setIsAuthenticated to login/signup for immediate updates */}
        <Route path="/login" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<SignUp setIsAuthenticated={setIsAuthenticated} />} />

        {/* Password Reset Route (No Authentication Required) */}
        <Route path="/password-reset" element={<PasswordReset />} /> {/* âœ… Added Route */}

        {/* Protect routes: Redirect to homepage if not authenticated */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/profile" element={isAuthenticated ? <ProfileSetup /> : <Navigate to="/" replace />} />
        <Route path="/viewProfile" element={isAuthenticated ? <ViewProfile /> : <Navigate to="/" replace />} />
        <Route path="/jobtracker" element={isAuthenticated ? <JobTracker /> : <Navigate to="/" replace />} />
        <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/" replace />} />
        <Route path="/coverletter" element={isAuthenticated ? <CoverLetterGenerator /> : <Navigate to="/" replace />} />
        <Route path="/job-search" element={isAuthenticated ? <JobSearch /> : <Navigate to="/" replace />} />
        <Route path="/general-analytics" element={isAuthenticated ? <GeneralAnalytics /> : <Navigate to="/" replace />} />
        <Route path="/getsocials" element={isAuthenticated ? <ScrapetableForm /> : <Navigate to="/" replace />} />
        <Route path="/resume" element={isAuthenticated ? <ResumeGenerator /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;