import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp, IoMdMenu, IoMdClose } from "react-icons/io";
import { BsShopWindow, BsPeople } from "react-icons/bs";
import axios from "axios";

function Sidebar() {

  
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  

  const attendanceItems = [
    { id: 1, name: "Dashboard", to: "/" },
    { id: 2, name: "Attendance History", to: "attendance-history" },
   
  ];

  // const userManagementItems = [
  //   { id: 1, name: "User Registration", to: "user-registration" },
    
  // ];

  return (
    <div className="flex h-screen relative">

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileSidebar(!mobileSidebar)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
      >
        {mobileSidebar ? <IoMdClose size={24} /> : <IoMdMenu size={24} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none ${
        mobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>

        {/* Logo */}
        <div className="p-4 text-xl font-bold border-b border-gray-700 flex items-center justify-between">
                   <button
            onClick={() => setMobileSidebar(false)}
            className="lg:hidden p-1 hover:bg-gray-800 rounded"
          >
            <IoMdClose size={20} />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 p-3 space-y-2">

          {/* Dropdown Menu - Shop Attendance */}
          <div>
            <div
              onClick={() => toggleMenu("attendance")}
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700"
            >
              <div className="flex items-center gap-2">
                <BsShopWindow />
                <span>Shop Attendance</span>
              </div>

              {openMenu === "attendance" ? (
                <IoIosArrowUp />
              ) : (
                <IoIosArrowDown />
              )}
            </div>

            {/* Submenu */}
            {openMenu === "attendance" && (
              <div className="ml-6 mt-2 space-y-2">
                {attendanceItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    onClick={() => setMobileSidebar(false)}
                    className={({ isActive }) =>
                      `block p-2 rounded-md text-sm ${
                        isActive
                          ? "bg-blue-500"
                          : "hover:bg-gray-700"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown Menu - User Management */}
          {/* <div>
            <div
              onClick={() => toggleMenu("user-management")}
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700"
            >
              <div className="flex items-center gap-2">
                <BsPeople />
                <span>User Management</span>
              </div>

              {openMenu === "user-management" ? (
                <IoIosArrowUp />
              ) : (
                <IoIosArrowDown />
              )}
            </div>

            {openMenu === "user-management" && (
              <div className="ml-6 mt-2 space-y-2">
                {userManagementItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    onClick={() => setMobileSidebar(false)}
                    className={({ isActive }) =>
                      `block p-2 rounded-md text-sm ${
                        isActive
                          ? "bg-blue-500"
                          : "hover:bg-gray-700"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div> */}

        </div>

       

      </div>

      {/* Right Content */}
      <div className="flex-1 p-4 lg:p-6 bg-gray-100 overflow-auto">
        <Outlet />
      </div>

    </div>
  );
}

export default Sidebar;