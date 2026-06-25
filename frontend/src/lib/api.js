import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const getSitePayload = () => api.get("/site").then((r) => r.data);
export const subscribe = (email) => api.post("/subscribe", { email }).then((r) => r.data);
export const listConceptArt = (category) =>
  api.get("/concept-art", { params: category && category !== "all" ? { category } : {} }).then((r) => r.data);

// Admin
export const adminHeaders = (pw) => ({ "X-Admin-Password": pw });
export const adminVerify = (pw) => api.post("/admin/verify", null, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminCreateProject = (pw, data) =>
  api.post("/admin/projects", data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminDeleteProject = (pw, id) =>
  api.delete(`/admin/projects/${id}`, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminCreateArt = (pw, data) =>
  api.post("/admin/concept-art", data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminDeleteArt = (pw, id) =>
  api.delete(`/admin/concept-art/${id}`, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminCreateUpdate = (pw, data) =>
  api.post("/admin/updates", data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminDeleteUpdate = (pw, id) =>
  api.delete(`/admin/updates/${id}`, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminSubscribers = (pw) =>
  api.get("/admin/subscribers", { headers: adminHeaders(pw) }).then((r) => r.data);
