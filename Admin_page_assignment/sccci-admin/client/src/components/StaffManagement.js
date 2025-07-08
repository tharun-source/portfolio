import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import {
    Box,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    IconButton,
    InputAdornment
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { getStaff, createStaff, updateStaff, deleteStaff } from "../services/api";

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentStaff, setCurrentStaff] = useState({});
    const [search, setSearch] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        const { data } = await getStaff();
        console.log(data); // <-- Add this line
        setStaff(data);
    };

    const handleOpen = () => {
        setCurrentStaff({});
        setIsEditMode(false);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentStaff({});
    };

    const handleEdit = (staff) => {
        setCurrentStaff(staff);
        setIsEditMode(true);
        setOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (staffToDelete) {
            await deleteStaff(staffToDelete.staffId);
            fetchStaff();
            setDeleteDialogOpen(false);
            setStaffToDelete(null);
        }
    };

    const handleSubmit = async () => {
        // Simple validation
        if (
            !currentStaff.staffId ||
            !currentStaff.name ||
            !currentStaff.email ||
            !currentStaff.role ||
            !currentStaff.onboardingStatus 
        ) {
            alert("Please fill in all fields.");
            return;
        }
            if (isEditMode) {
            await updateStaff(currentStaff.staffId, currentStaff);
            fetchStaff();
            handleClose();
        } else {
            try {
                await createStaff(currentStaff);
                fetchStaff();
                handleClose();
        } catch (error) {
            console.log(error.response);
            if (
                error.response &&
                error.response.status === 400 &&
                error.response.data.message &&
                error.response.data.message.includes("exists")
            ) {
                alert("Staff ID already exists");
                return;
            } else {
                alert("An error occurred while creating staff.");
                return;
            }
            }
        }
    };

    // Filter staff by name only
    const filteredStaff = staff.filter(
        (s) => s.name && s.name.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { field: "staffId", headerName: "Staff ID", width: 100 },
        { field: "name", headerName: "Name", width: 200 },
        { field: "email", headerName: "Email", width: 250 },
        { field: "role", headerName: "Role", width: 200 },
        {
            field: "onboardingStatus", // was "status"
            headerName: "Onboarding Status",
            width: 180,
            renderCell: (params) => {
                let color = "#e0e0e0";
                let textColor = "#333";
                let label = params.value;

                if (label === "Completed") {
                    color = "#8ff5b5";
                    textColor = "#1b5e20";
                } else if (label === "Pending") {
                    color = "#f0f0f0";
                    textColor = "#333";
                } else if (label === "In Progress") {
                    color = "#fff9c4";
                    textColor = "#bfa600";
                }

                return (
                    <span
                        style={{
                            background: color,
                            color: textColor,
                            borderRadius: 16,
                            padding: "4px 16px",
                            fontWeight: 600,
                            fontSize: 14,
                            display: "inline-block",
                            minWidth: 90,
                            textAlign: "center"
                        }}
                    >
                        {label}
                    </span>
                );
            }
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton color="primary" size="small" onClick={() => handleEdit(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        size="small"
                        onClick={() => {
                            setStaffToDelete(params.row);
                            setDeleteDialogOpen(true);
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h4" fontWeight={700}>
                    <span style={{ color: "#d0021b" }}>SCCCI</span> Staff Accounts
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ background: "#e57373", color: "#fff", fontWeight: 700, borderRadius: 2, px: 3 }}
                    onClick={handleOpen}
                >
                    Add Staffs
                </Button>
            </Box>
            <TextField
                variant="outlined"
                placeholder="Search Staff"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2, width: 300, background: "#fff" }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <Box sx={{ height: 500, width: "100%", background: "#fff", borderRadius: 2 }}>
                <DataGrid
                    rows={filteredStaff}
                    columns={columns}
                    pageSize={10}
                    getRowId={(row) => row.staffId}
                    disableSelectionOnClick
                />
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditMode ? "Edit Staff" : "Add Staff"}</DialogTitle>
                <DialogContent>
                    <TextField
                        id="staff-id"
                        name="staffId"
                        margin="dense"
                        label="Staff ID"
                        fullWidth
                        autoComplete="off"
                        value={currentStaff.staffId || ""}
                        onChange={(e) => setCurrentStaff({ ...currentStaff, staffId: e.target.value })}
                        disabled={isEditMode}
                    />
                    <TextField
                        id="staff-name"
                        name="name"
                        margin="dense"
                        label="Name"
                        fullWidth
                        autoComplete="name"
                        value={currentStaff.name || ""}
                        onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                    />
                    <TextField
                        id="staff-email"
                        name="email"
                        margin="dense"
                        label="Email"
                        fullWidth
                        autoComplete="email"
                        value={currentStaff.email || ""}
                        onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                            labelId="role-label"
                            id="staff-role"
                            name="role"
                            value={currentStaff.role || ""}
                            label="Role"
                            onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value })}
                        >
                            <MenuItem value="Marketing manager">Marketing manager</MenuItem>
                            <MenuItem value="Executive">Executive</MenuItem>
                            <MenuItem value="Senior Executive">Senior Executive</MenuItem>
                            <MenuItem value="Operations manager">Operations manager</MenuItem>
                            <MenuItem value="Events Coordinator">Events Coordinator</MenuItem>
                            <MenuItem value="Culture Director">Culture Director</MenuItem>
                            <MenuItem value="Communications Lead">Communications Lead</MenuItem>
                            <MenuItem value="Membership Exec">Membership Exec</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="staff-status-label">Status</InputLabel>
                        <Select
                            labelId="staff-status-label"
                            id="staff-status"
                            name="onboardingStatus" // was "status"
                            value={currentStaff.onboardingStatus || ""}
                            label="Status"
                            onChange={(e) => setCurrentStaff({ ...currentStaff, onboardingStatus: e.target.value })}
                            autoComplete="off"
                        >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ color: "#009688", fontWeight: 700 }}>Confirm Account Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to remove this account?
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        color="error"
                        variant="contained"
                    >
                        No
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="success"
                        variant="contained"
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StaffManagement;