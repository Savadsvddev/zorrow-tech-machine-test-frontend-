import axios from "axios";
import { API_BASE_URL } from "../API_BASE_URL";

// ✅ Axios instance setup
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

// ✅ Request interceptor: attach token + content-type
axiosInstance.interceptors.request.use((config) => {
  const data = JSON.parse(localStorage.getItem("data") || "{}");

  if (data.token) {
    config.headers.Authorization = `Bearer ${data.token}`;
  }

  return config;
});

// ✅ Response interceptor: logout on 401
axiosInstance.interceptors.response.use(
  (response) => response, // pass through successful response
  (error) => {
    console.log("error", error);
    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 401)
    ) {
      // Token expired or invalid
      alert("Unauthorized: Logging out...");

      // Clear local storage
      localStorage.removeItem("data");

      // Redirect to login page (adjust path as needed)
      window.location.href = "/login-user";
    }

    // Forward the error to the calling function
    return Promise.reject(error);
  }
);

export default axiosInstance;
