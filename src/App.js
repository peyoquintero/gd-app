import React, {  useEffect } from "react";
import "./App.css";
import { recursoPorUsuario } from "./components/recursos"
import { Link } from "react-router-dom";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";
import  Codigos  from "./components/Codigos";
import  Ayuda  from "./components/Ayuda";
import { transform } from "./components/helpers"
import axios from "axios";

export function GananciasDiarias() {
  return (
    <div>
      <nav>
        <Link to="/pesajes">Pesajes</Link>
        <Link to="/codigos">Codigos</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/">Ganancias</Link>
        <Link to="/ayuda">Ayuda</Link>
      </nav>
      <Ganancias/>
    </div>
  );
}

export function HisPesajes() {
  return (
    <div > 
      <nav>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/">Pesajes</Link>
        <Link to="/codigos">Codigos</Link>
        <Link to="/">Ganancias</Link>
        <Link to="/ayuda">Ayuda</Link>
      </nav>
      <Pesajes/>
    </div>
  );
}

export function HisCodigos() {
  return (
    <div>
      <nav>
        <Link to="/pesajes">Pesajes</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/">Codigos</Link>
        <Link to="/">Ganancias</Link>
        <Link to="/ayuda">Ayuda</Link>
      </nav>
      <Codigos/>
    </div>
  );
}

export function AyudaGD() {
  return (
    <div>
      <nav>
        <Link to="/pesajes">Pesajes</Link>
        <Link to="/codigos">Codigos</Link>
        <Link to="/">Ganancias</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/">Ayuda</Link>
      </nav>
      <Ayuda/>
    </div>
  );
}

export function App() {
  const url = recursoPorUsuario("PLQ")
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

  return <HisPesajes/>;
}
