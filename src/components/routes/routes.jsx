import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  // Example auth check (adjust to your logic)
  const isAuthenticated = JSON.parse(localStorage.getItem("data") || "{}");

  return isAuthenticated.token ? children : <Navigate to="/login-user" replace />;
};

export default PrivateRoute;