import React, { useState } from "react";
import { Box, TextField, Button, Typography, IconButton } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setMsg(t("Passwords do not match."));
      return;
    }
    try {
      await axios.post("http://localhost:3001/api/forgot-password", {
        email,
        newPassword,
      });
      setMsg(t("Password updated! Redirecting to login..."));
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || t("Failed to reset password."));
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <IconButton onClick={() => navigate("/")} sx={{ mt: 2, mb: 1 }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h5" mb={2}>{t("Forgot Password")}</Typography>
      <form onSubmit={handleReset}>
        <TextField
          label={t("Registered Email")}
          fullWidth
          margin="normal"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <TextField
          label={t("New Password")}
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <TextField
          label={t("Confirm New Password")}
          type="password"
          fullWidth
          margin="normal"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          {t("Reset Password")}
        </Button>
      </form>
      {msg && <Typography color="primary" mt={2}>{msg}</Typography>}
    </Box>
  );
}