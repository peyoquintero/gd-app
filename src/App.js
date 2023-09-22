import React, {  useEffect } from "react";
import "./App.css";

import { Link } from "react-router-dom";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";
import  Codigos  from "./components/Codigos";
import { transform } from "./components/helpers"
import axios from "axios";

function GananciasDiarias(isonline) {
  return (
    <div>
      <nav>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/">Ganancias</Link>
        <Link to="/pesajes">Pesajes</Link>
        <Link to="/codigos">Codigos</Link>
      </nav>
      <Ganancias/>
    </div>
  );
}

export function HisPesajes() {
  return (
    <div > 
      <nav>
        <Link to="/">Ganancias</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/">Pesajes</Link>
        <Link to="/codigos">Codigos</Link>
      </nav>
      <Pesajes/>
    </div>
  );
}

export function HisCodigos() {
  return (
    <div>
      <nav>
        <Link to="/">Ganancias</Link>
        <Link to="/pesajes">Pesajes</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/">Codigos</Link>
      </nav>
      <Codigos/>
    </div>
  );
}

export function App() {
  const url = "https://sheets.googleapis.com/v4/spreadsheets/1ZfXM4qnajw8QSaxrx6aXKa_xbMDZe3ryWt8E3alSyEE/values/PesajesPorCodigo?key=AIzaSyCGW3gRbBisLX950bZJDylH-_QJTR7ogd8";
  let onLine = true;
  useEffect(()=>{
    axios.get(url)
    .then((response)=>{
      let allPesajes = transform(response.data); 
      localStorage.setItem("spreadsheetData", JSON.stringify(allPesajes));
    })
    .catch((error) =>  {   
      onLine = false;
    })
  },[]);

  return <GananciasDiarias onLine={onLine}/>;
}
