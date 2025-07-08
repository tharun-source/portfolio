import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Paper, Grid, LinearProgress } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MessageIcon from "@mui/icons-material/Message";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useNavigate } from "react-router-dom";
import { getStaff } from "../services/api";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    getStaff().then(({ data }) => setStaff(data));
  }, []);

  // Calculate onboarding stats dynamically
  const completedCount = staff.filter(s => s.onboardingStatus === "Completed").length;
  const inProgressCount = staff.filter(s => s.onboardingStatus === "In Progress").length;
  const pendingCount = staff.filter(s => s.onboardingStatus === "Pending").length;
  const total = staff.length || 1; // Prevent division by zero

  const stats = [
    { label: t("Total Staff"), value: staff.length, icon: <GroupIcon color="primary" /> }
  ];

  const onboarding = [
    { label: t("Completed"), value: completedCount, color: "#00C853" },
    { label: t("In Progress"), value: inProgressCount, color: "#FFD600" },
    { label: t("Pending"), value: pendingCount, color: "#D50000" },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        {t("Admin Dashboard")}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={4} key={stat.label}>
                <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
                  {stat.icon}
                  <Box ml={2}>
                    <Typography variant="body2">{stat.label}</Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            sx={{ mb: 2, background: "#e57373", color: "#fff" }}
            startIcon={<PeopleAltIcon />}
            onClick={() => navigate("/staff-management")}
          >
            {t("Manage Staffs")}
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ mb: 2, background: "#e57373", color: "#fff" }}
            startIcon={<MessageIcon />}
            onClick={() => navigate("/welcome-messages")}
          >
            {t("Manage Welcome Message")}
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ background: "#e57373", color: "#fff" }}
            startIcon={<AssignmentTurnedInIcon />}
            onClick={() => navigate("/onboarding-status")}
          >
            {t("Review Onboarding Status")}
          </Button>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          {t("Onboarding Overview")}
        </Typography>
        <Paper sx={{ p: 3 }}>
          {onboarding.map((item) => (
            <Box key={item.label} mb={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={500}>{item.label}</Typography>
                <Typography fontWeight={500}>{item.value}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(item.value / total) * 100}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  background: "#f3f3f3",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: item.color,
                  },
                }}
              />
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
}