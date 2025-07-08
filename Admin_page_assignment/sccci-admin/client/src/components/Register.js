import React, { useState } from "react";
import { TextField, Button, Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationError = validatePassword(password);
    if (validationError) {
      setMsg(validationError);
      return;
    }
    try {
      await axios.post("http://localhost:3001/api/register", { email, password });
      setMsg(t("Account created! Redirecting to login..."));
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || t("Registration failed"));
    }
  };

  function validatePassword(password) {
    if (password.length < 8) return t("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(password)) return t("Password must include an uppercase letter.");
    if (!/[a-z]/.test(password)) return t("Password must include a lowercase letter.");
    if (!/[0-9]/.test(password)) return t("Password must include a digit.");
    if (!/[!@#$%^&*]/.test(password)) return t("Password must include a special character (!@#$%^&*).");
    return "";
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <IconButton onClick={() => navigate("/")} sx={{ mt: 2, mb: 1 }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h5" mb={2}>{t("Create Account")}</Typography>
      <form onSubmit={handleRegister}>
        <TextField
          label={t("Email")}
          fullWidth
          margin="normal"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <TextField
          label={t("Password")}
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          {t("Register")}
        </Button>
      </form>
      {msg && <Typography color="primary" mt={2}>{msg}</Typography>}
    </Box>
  );
}