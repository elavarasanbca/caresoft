import React, { useState } from "react";
import { FaBars, FaUser, FaCog, FaBoxOpen } from "react-icons/fa";
import { FaTicket } from "react-icons/fa6";
import logos from '../../assets/Images/logo.png';
import "./Navbar.css";

// Define menu items dynamically
const menuItems = [
  { name: "Dashboard", icon: <FaBoxOpen /> },
  { name: "New Ticket", icon: <FaTicket /> },
  { name: "Customers", icon: <FaUser /> },
  { name: "Settings", icon: <FaCog /> },
  
];

const Navbar = ({ setActivePage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard"); // Default active item

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="menu-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
        <FaBars />
      </button>
      <div className="container">

     
      <ul className="nav-list">
        {menuItems.map((item) => (
          <li    >
            <a  key={item.name} 
            className={activeItem === item.name ? "active" : ""}
              href="#" 
              onClick={() => {
                setActivePage(item.name);
                setActiveItem(item.name);
              }}
            >
              {item.icon}
              <span className="nav-text">{item.name}</span>
            </a>
          </li>
        ))} 
      </ul>
      <div className="logo">
        <img src={logos} alt="Logo Here" width={"100%"}/>
      </div>
      </div>

    </div>
  );
};

export default Navbar;
