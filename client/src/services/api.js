import axios from "axios";

const api = axios.create({
  baseURL: "https://projectflow-backend-af3g.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to protected requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("projectflow_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;