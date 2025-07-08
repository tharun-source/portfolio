import React, { useEffect, useRef, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Link
} from "@mui/material";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

function CertificateUpload({ staffId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("certificate", file);
    await axios.post(`/api/staff/${staffId}/upload-certificate`, formData);
    setUploading(false);
    setFile(null);
    if (inputRef.current) inputRef.current.value = ""; // clear file input
    onUploaded(); // Refresh the staff list
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
      />
      <Button onClick={handleUpload} disabled={!file || uploading} size="small" variant="contained">
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </Box>
  );
}

export default function OnboardingStatus() {
  const [staffList, setStaffList] = useState([]);

  const fetchStaff = async () => {
    const { data } = await axios.get("/api/staff");
    setStaffList(data);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Onboarding Status</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Certificate</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffList.map((staff) => (
              <TableRow key={staff.staffId}>
                <TableCell>{staff.name}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>{staff.onboardingStatus}</TableCell>
                <TableCell>
                  {staff.trainingCertificateUrl ? (
                    <>
                      {/\.(jpg|jpeg|png|gif)$/i.test(staff.trainingCertificateUrl) ? (
                        <img
                          src={`http://localhost:3001${staff.trainingCertificateUrl}`}
                          alt="Certificate"
                          style={{ maxWidth: 100, maxHeight: 100, verticalAlign: "middle" }}
                        />
                      ) : (
                        <Link
                          href={`http://localhost:3001${staff.trainingCertificateUrl}`}
                          target="_blank"
                          rel="noopener"
                          style={{ verticalAlign: "middle" }}
                        >
                          View Certificate
                        </Link>
                      )}
                      <IconButton
                        aria-label="delete"
                        color="error"
                        size="small"
                        onClick={async () => {
                          await axios.delete(`/api/staff/${staff.staffId}/delete-certificate`);
                          fetchStaff();
                        }}
                        style={{ marginLeft: 8, verticalAlign: "middle" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <span style={{ color: "red" }}>Not uploaded</span>
                  )}
                </TableCell>
                <TableCell>
                  <CertificateUpload staffId={staff.staffId} onUploaded={fetchStaff} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}