import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";
import axios from "axios";
import { useTranslation } from "react-i18next";

function Login({ setAuth, setUser }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/api/login", {
        email, 
        password,
      });
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        setUser({ name: res.data.name || email, email });
        setAuth(true);
      }
    } catch (err) {
      alert(t("Invalid credentials"));
      setAuth(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "60px auto",
        padding: 32,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <img
          src="/sccci_logo.png"
          alt="SCCCI Logo"
          style={{ width: 220, marginBottom: 24 }}
        />
        <h2 style={{ margin: 0 }}>
          <span style={{ color: "#d0021b", fontWeight: "bold" }}>SCCCI</span>{" "}
          {t("Admin Page")}
        </h2>
      </div>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: "bold" }}>{t("Work Email")}</label>
          <input
            type="email"
            placeholder={t("example@gmail.com")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 10px",
              marginTop: 6,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
            required
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: "bold" }}>{t("Password")}</label>
          <input
            type="password"
            placeholder={t("Password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 10px",
              marginTop: 6,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#111",
            color: "#fff",
            padding: "14px 0",
            border: "none",
            borderRadius: 6,
            fontSize: 18,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {t("Continue")}
        </button>
      </form>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        {t("New user?")} <Link to="/register">{t("Create an account")}</Link>
      </Typography>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        <Link to="/forgot-password">{t("Forgot password?")}</Link>
      </Typography>
    </div>
  );
}

export default Login;