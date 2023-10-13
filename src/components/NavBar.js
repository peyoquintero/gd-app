import React from 'react';
import {  Link, NavLink } from "react-router-dom";

const NavBar= () =>{
  return (
    <div className="navbar">
		    <ul >        
            <li>
              <NavLink to="/pesajes" activeClassName="active">Pesajes</NavLink>
            </li>
            <li>
              <NavLink  to="/ganancias" activeClassName="active">Ganancias</NavLink>
            </li>
            <li>
              <NavLink to="/inventario" activeClassName="active">Inventario</NavLink>
            </li>
            <li>
              <NavLink to="/ayuda" activeClassName="active">Ayuda</NavLink>
            </li>
         </ul>
    </div>
  );
}
export default NavBar;

