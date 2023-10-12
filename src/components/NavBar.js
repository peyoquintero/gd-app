import React from 'react';
import {  Link, NavLink } from "react-router-dom";
import "./NavBar.css"
const NavBar= () =>{
  return (
    <header className="header">
    <div className="left">
        <a href="#">...</a>
    </div>
    <div className="mid">
		<ul className="navbar">        
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
	<div className="right">
    <button className= {true?"refresh-button":"refresh-button-offline"} >&#x21bb; </button>
    </div>
  </header>
  );
}
export default NavBar;

