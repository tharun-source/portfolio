import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { sendMessage } from "../services/api"; 


const WelcomeMessages = () => {
  const [template, setTemplate] = useState("");
  const [staffId, setStaffId] = useState("");
  const [delay, setDelay] = useState(0); // in minutes
  const [history, setHistory] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetch("/api/staff")
      .then((res) => res.json())
      .then((data) => setStaffList(data));
  }, []);

  useEffect(() => {
    fetch("/api/welcome/history")
      .then((res) => res.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []));
  }, []);

  // Filter history: only show messages sent within the last hour and not failed
  const filteredHistory = history.filter((msg) => {
    const now = new Date();
    const sentAt = new Date(msg.sentAt);
    const diffMinutes = (now - sentAt) / (60 * 1000);
    return (
      diffMinutes <= 60 &&
      (msg.status === "Delivered" || msg.status === "Pending")
    );
  });

  const handleSend = async () => {
  if (!staffId) {
    alert("Please select a staff ID.");
    return;
  }
  try {
    await sendMessage({
      staffId,
      staffName: staffList.find(s => s.staffId === staffId)?.name || "",
      sentDate: new Date().toISOString().split("T")[0],
      delay,
    });
    // Refresh history after sending
    const res = await fetch("/api/welcome/history");
    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
  } catch (err) {
    alert("Failed to send message.");
  }
};

  const handleGenerateAI = async () => {
    if (!staffId) return alert("Please select a staff ID.");
    setLoadingAI(true);
    try {
      const res = await fetch("/api/welcome/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
      });
      const data = await res.json();
      console.log("AI response:", data); // <-- Add this line
      setTemplate(data.message || template);
    } catch {
      alert("Failed to generate message with AI.");
    }
    setLoadingAI(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Welcome Message Management
      </Typography>

      <Box
        sx={{
          border: "2px solid #888",
          borderRadius: 2,
          p: 2,
          mb: 4,
          background: "#fff",
        }}
      >
        <Typography fontWeight={600} mb={1}>
          Message Template
        </Typography>
        <TextField
          multiline
          fullWidth
          rows={4}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl sx={{ minWidth: 180, mr: 2, mb: 2 }}>
          <InputLabel id="staff-id-label">Enter Staff Id:</InputLabel>
          <Select
            labelId="staff-id-label"
            value={staffId}
            label="Enter Staff Id:"
            onChange={(e) => setStaffId(e.target.value)}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {staffList.map((staff) => (
              <MenuItem key={staff.staffId} value={staff.staffId}>
                {staff.staffId} - {staff.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180, mr: 2, mb: 2 }}>
          <InputLabel id="delay-label">Send delay (minutes)</InputLabel>
          <Select
            labelId="delay-label"
            value={delay}
            label="Send delay (minutes)"
            onChange={(e) => setDelay(Number(e.target.value))}
          >
            {[0, 1, 5, 10, 15, 30, 45, 60].map((min) => (
              <MenuItem key={min} value={min}>{min}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mr: 2 }}
            onClick={handleSend}
          >
            Send Text Message
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateAI}
            disabled={loadingAI}
          >
            {loadingAI ? "Generating..." : "Generate with AI"}
          </Button>
        </Box>
      </Box>

      <Typography fontWeight={600} mb={1}>
        Message History
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ border: "2px solid #888", borderRadius: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Staff ID</b>
              </TableCell>
              <TableCell>
                <b>Staff Name</b>
              </TableCell>
              <TableCell>
                <b>Sent Date</b>
              </TableCell>
              <TableCell>
                <b>Status</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No recent messages.
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((msg, idx) => (
                <TableRow key={idx}>
                  <TableCell>{msg.staffId}</TableCell>
                  <TableCell>{msg.staffName}</TableCell>
                  <TableCell>
                    {msg.sentDate ? msg.sentDate.split("T")[0] : ""}
                  </TableCell>
                  <TableCell>
                    {msg.status === "Delivered" ? (
                      <Chip
                        label="Delivered"
                        sx={{
                          background: "#b6f7c1",
                          color: "#1b5e20",
                        }}
                      />
                    ) : (
                      <Chip
                        label="Pending"
                        sx={{
                          background: "#fff9c4",
                          color: "#bfa600",
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WelcomeMessages;