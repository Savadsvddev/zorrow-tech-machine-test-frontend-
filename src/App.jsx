import { useState } from "react";

import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import LoginUser from "./Pages/LoginUser";
import RegisterUser from "./Pages/RegisterUser";
import Dashboard from "./Pages/Dashboard";
import AttendacneHistory from "./Pages/AttendanceHistory";
import PrivateRoute from "./components/routes/routes";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>

        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/register-user" element={<RegisterUser />} />

        <Route path="/" element={<PrivateRoute><Sidebar /></PrivateRoute>}>
          <Route index element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/attendance-history" element={<PrivateRoute><AttendacneHistory /></PrivateRoute>} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
