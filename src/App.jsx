import { useState } from "react";

import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoginUser from "./Pages/LoginUser";
import RegisterUser from "./Pages/RegisterUser";
import Dashboard from "./Pages/Dashboard";
import AttendacneHistory from "./Pages/AttendanceHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/register-user" element={<RegisterUser />} />

        <Route path="/" element={<Sidebar />}>
          <Route index element={<Dashboard />} />
          <Route path="/attendance-history" element={<AttendacneHistory />}/>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
