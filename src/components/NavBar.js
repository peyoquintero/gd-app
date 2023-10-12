import React from 'react';
import {  Link } from "react-router-dom";
import "./NavBar.css"
const NavBar= () =>{
  return (
    <header class="header">
    <div class="left">
        <a href="#">...</a>
    </div>
    <div class="mid">
		<ul class="navbar">        
            <li>
            <Link to="/pesajes">Pesajes</Link>
            </li>
            <li>
            <Link style={{color:'rgb(0, 106, 255)'}} to="/ganancias">Ganancias</Link>
            </li>
            <li>
            <Link to="/inventario">Inventario</Link>
            </li>
            <li>
            <Link to="/ayuda">Ayuda</Link>
            </li>
         </ul>
    </div>
	<div class="right">
    <button className= {true?"refresh-button":"refresh-button-offline"} >&#x21bb; </button>
    </div>
  </header>
  );
}
export default NavBar;

