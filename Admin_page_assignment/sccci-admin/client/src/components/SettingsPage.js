import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography, MenuItem, Divider, Paper
} from "@mui/material";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SettingsPage({ setUser, setAuth }) {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState({ username: "", email: "", language: "en" });
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/settings/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!isMounted) return;
        if (res.ok) {
          setProfile(data);
        } else {
          setMessage(data.error || "Failed to fetch profile.");
        }
      } catch {
        if (isMounted) setMessage("Failed to fetch profile.");
      }
      if (isMounted) setLoading(false);
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [token]);

  useEffect(() => {
    if (deleted) setMessage("");
  }, [deleted]);

  if (deleted) {
    return <Navigate to="/login" replace />;
  }
  if (loading) return <div>Loading...</div>;

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok && typeof setUser === "function") {
        setUser({ name: profile.username, email: profile.email });
      }
    } catch {
      setMessage("Failed to update profile.");
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch {
      setMessage("Failed to update password.");
    }
  };

  const handleLanguageChange = async (e) => {
    setProfile({ ...profile, language: e.target.value });
    i18n.changeLanguage(e.target.value);
    setMessage("");
    try {
      const res = await fetch("/api/settings/language", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ language: e.target.value }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch {
      setMessage("Failed to update language.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You are not logged in.");
      return;
    }
    try {
      const res = await fetch("/api/settings/account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = {};
      try {
        data = await res.json();
      } catch {}
      if (res.ok) {
        setDeleted(true);      // Set deleted first
        setMessage("");        // Clear any error message
        localStorage.removeItem("token");
        setAuth(false);
        return;
      }
      setMessage(data.error || "Failed to delete account.");
    } catch {
      setMessage("Failed to delete account.");
    }
  };

  console.log("deleted:", deleted, "message:", message, "loading:", loading);

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>{t("Profile Settings")}</Typography>
        <form onSubmit={handleProfileSave}>
          <TextField
            label={t("Username")}
            name="username"
            value={profile.username}
            onChange={handleProfileChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label={t("Email")}
            name="email"
            type="email"
            value={profile.email}
            onChange={handleProfileChange}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>{t("Save Profile")}</Button>
        </form>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>{t("Update Password")}</Typography>
        <form onSubmit={handlePasswordSave}>
          <TextField
            label={t("New Password")}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>{t("Update Password")}</Button>
        </form>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>{t("Language Preferences")}</Typography>
        <TextField
          select
          label={t("Language")}
          value={profile.language}
          onChange={handleLanguageChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="en">{t("English")}</MenuItem>
          <MenuItem value="zh">{t("Chinese")}</MenuItem>
        </TextField>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>{t("Privacy & Security")}</Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteAccount}
        >
          {t("Delete Account")}
        </Button>
        {message && !loading && !deleted && (
          <Typography color={message.includes("Failed") ? "error" : "primary"} sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}