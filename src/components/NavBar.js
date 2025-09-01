import React from 'react';
import {  Link, NavLink } from "react-router-dom";

const NavBar= () =>{
  return (
    <div className="navbar">
		    <ul >        
            <li>
              <NavLink to="/inventario" className={({ isActive }) => isActive ? "active-link" : "inactive-link"}>Inventario</NavLink>
            </li>
            <li>
              <NavLink to="/pesajes" className={({ isActive }) => isActive ? "active-link" : "inactive-link"}>Pesajes</NavLink>
            </li>
            <li>
              <NavLink  to="/ganancias" className={({ isActive }) => isActive ? "active-link" : "inactive-link"}>Ganancias</NavLink>
            </li>
            <li>
              <NavLink to="/ayuda" className={({ isActive }) => isActive ? "active-link" : "inactive-link"}>Ayuda</NavLink>
            </li>
         </ul>
    </div>
  );
}
export default NavBar;

