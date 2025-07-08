import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001/api",
});

// Staff API
export const getStaff = () => API.get("/staff");
export const createStaff = (staff) => API.post("/staff", staff);
export const updateStaff = (id, staff) => API.put(`/staff/${id}`, staff);
export const deleteStaff = (id) => API.delete(`/staff/${id}`);

// Welcome Messages API
export const getTemplate = () => API.get("/welcome/template");
export const sendMessage = (message) => API.post("/welcome/send", message);
export const getMessageHistory = () => API.get("/welcome/history");
export const saveTemplate = (data) => API.post("/welcome/template", data);