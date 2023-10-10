import React, {  useEffect, useState } from "react";
import "./App.css";
import { recursoPorUsuario } from "./components/recursos"
import { Link } from "react-router-dom";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";
import  Inventario  from "./components/Inventario";
import  Ayuda  from "./components/Ayuda";
import { transform } from "./components/helpers"
import PopupScreen from "./components/PopupScreen";
import axios from "axios";

export function GananciasDiarias() {
  return (
    <div>
      <nav>
        <button className="refresh-button" onclick="location.reload()">&#x21bb; </button>
        <Link to="/pesajes">Pesajes</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/ganancias">Ganancias</Link>
        <Link to="/inventario">Inventario</Link>
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
        <button className="refresh-button" onclick="location.reload()">&#x21bb; </button>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/pesajes">Pesajes</Link>
        <Link to="/ganancias">Ganancias</Link>
        <Link to="/inventario">Inventario</Link>
        <Link to="/ayuda">Ayuda</Link>
      </nav>
      <Pesajes/>
    </div>
  );
}


export function Inventarios() {
  return (
    <div>
      <nav>
        <button className="refresh-button" onclick="location.reload()">&#x21bb; </button>
        <Link to="/pesajes">Pesajes</Link>
        <Link to="/ganancias">Ganancias</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/inventario">Inventario</Link>
        <Link to="/ayuda">Ayuda</Link>
      </nav>
      <Inventario/>
    </div>
  );
}

export function AyudaGD() {
  return (
    <div>
      <nav>
        <button className="refresh-button" onclick="location.reload()">&#x21bb; </button>
        <Link to="/pesajes">Pesajes</Link>
        <Link to="/inventario">Inventario</Link>
        <Link to="/ganancias">Ganancias</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/ayuda">Ayuda</Link>
      </nav>
      <Ayuda/>
    </div>
  );
}

export function App() {
  const [popupUsuario, setPopupResult] = useState(localStorage.getItem("usuario")??'');
  let url = '';

  const handlePopupClose = (result) => {
    setPopupResult(result);
    if (result?.length>0)
    {
      localStorage.setItem("usuario", result.toLowerCase());
    }
  };
 
  if (popupUsuario?.length>0)
  {
    url = recursoPorUsuario(popupUsuario)
  }

  useEffect(()=>{
    axios.get(url)
    .then((response)=>{
      let allPesajes = transform(response.data); 
      localStorage.setItem("spreadsheetData", JSON.stringify(allPesajes));
    })
    .catch((error) =>  {   
      console.log("error getting spreadsheet")
    })
  },[url]);
  return  (popupUsuario?.length>0) ?
   <HisPesajes/> :
      <PopupScreen onClose={handlePopupClose} />
}

