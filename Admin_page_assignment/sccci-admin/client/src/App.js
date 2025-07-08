import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import StaffManagement from "./components/StaffManagement";
import WelcomeMessages from "./components/WelcomeMessages";
import OnboardingStatus from "./components/OnboardingStatus";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import SettingsPage from "./components/SettingsPage";
import "./i18n";

function App() {
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route
          path="/"
          element={
            isAuth ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setAuth={setAuth} setUser={setUser} />
            )
          }
        />
        <Route
          path="/login"
          element={<Login setAuth={setAuth} setUser={setUser} />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="*"
          element={
            isAuth ? (
              <Box sx={{ display: "flex" }}>
                <Sidebar setAuth={setAuth} user={user} />
                <Box component="main" sx={{ flexGrow: 1, ml: "230px", p: 3 }}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/staff-management" element={<StaffManagement />} />
                    <Route path="/welcome-messages" element={<WelcomeMessages />} />
                    <Route path="/onboarding-status" element={<OnboardingStatus />} />
                    <Route path="/settings" element={<SettingsPage setUser={setUser} />} />
                  </Routes>
                </Box>
              </Box>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;