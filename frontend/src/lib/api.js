import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

// Make /api/uploads/xxx URLs absolute using REACT_APP_BACKEND_URL.
export const resolveImage = (url) => {
  if (!url) return url;
  if (url.startsWith("/api/")) return `${BACKEND_URL}${url}`;
  return url;
};

export const getSitePayload = () => api.get("/site").then((r) => r.data);
export const subscribe = (email) => api.post("/subscribe", { email }).then((r) => r.data);
export const listConceptArt = (category) =>
  api.get("/concept-art", { params: category && category !== "all" ? { category } : {} }).then((r) => r.data);

// Admin
export const adminHeaders = (pw) => ({ "X-Admin-Password": pw });
export const adminVerify = (pw) => api.post("/admin/verify", null, { headers: adminHeaders(pw) }).then((r) => r.data);

export const adminCreateProject = (pw, data) =>
  api.post("/admin/projects", data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminUpdateProject = (pw, id, data) =>
  api.put(`/admin/projects/${id}`, data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminDeleteProject = (pw, id) =>
  api.delete(`/admin/projects/${id}`, { headers: adminHeaders(pw) }).then((r) => r.data);

export const adminCreateArt = (pw, data) =>
  api.post("/admin/concept-art", data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminUpdateArt = (pw, id, data) =>
  api.put(`/admin/concept-art/${id}`, data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminDeleteArt = (pw, id) =>
  api.delete(`/admin/concept-art/${id}`, { headers: adminHeaders(pw) }).then((r) => r.data);

export const adminCreateUpdate = (pw, data) =>
  api.post("/admin/updates", data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminUpdateUpdate = (pw, id, data) =>
  api.put(`/admin/updates/${id}`, data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminDeleteUpdate = (pw, id) =>
  api.delete(`/admin/updates/${id}`, { headers: adminHeaders(pw) }).then((r) => r.data);

// Fragments
export const adminListFragments = (pw) =>
  api.get("/admin/fragments", { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminCreateFragment = (pw, data) =>
  api.post("/admin/fragments", data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminUpdateFragment = (pw, id, data) =>
  api.put(`/admin/fragments/${id}`, data, { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminDeleteFragment = (pw, id) =>
  api.delete(`/admin/fragments/${id}`, { headers: adminHeaders(pw) }).then((r) => r.data);

export const adminSubscribers = (pw) =>
  api.get("/admin/subscribers", { headers: adminHeaders(pw) }).then((r) => r.data);

export const adminGetSettings = (pw) =>
  api.get("/admin/settings", { headers: adminHeaders(pw) }).then((r) => r.data);
export const adminUpdateSettings = (pw, data) =>
  api.put("/admin/settings", data, { headers: adminHeaders(pw) }).then((r) => r.data);

export const adminUpload = (pw, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api
    .post("/admin/upload", fd, {
      headers: { ...adminHeaders(pw), "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};
