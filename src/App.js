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

export function GananciasDiarias(isOnline) {
  return (
    <div>
      <nav>
        <Link to="/pesajes">Pesajes</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/ganancias">Ganancias</Link>
        <Link to="/inventario">Inventario</Link>
        <Link to="/ayuda">Ayuda</Link>
        <button className= {isOnline?"refresh-button":"refresh-button-offline"} onclick="location.reload()">&#x21bb; </button>
      </nav>
      
      <Ganancias/>
    </div>
  );
}

export function HisPesajes(isOnline) {
  return (
    <div > 
      <nav>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/pesajes">Pesajes</Link>
        <Link to="/ganancias">Ganancias</Link>
        <Link to="/inventario">Inventario</Link>
        <Link to="/ayuda">Ayuda</Link>
        <button className={isOnline?"refresh-button":"refresh-button-offline"} onclick="location.reload()">&#x21bb; </button>
      </nav>
      <Pesajes/>
    </div>
  );
}


export function Inventarios(isOnline) {
  return (
    <div>
      <nav>
        <Link to="/pesajes">Pesajes</Link>
        <Link to="/ganancias">Ganancias</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/inventario">Inventario</Link>
        <Link to="/ayuda">Ayuda</Link>
        <button className={isOnline?"refresh-button":"refresh-button-offline"} onclick="location.reload()">&#x21bb; </button>
      </nav>
      <Inventario/>
    </div>
  );
}

export function AyudaGD(isOnline) {
  return (
    <div>
      <nav>
        <Link to="/pesajes">Pesajes</Link>
        <Link to="/inventario">Inventario</Link>
        <Link to="/ganancias">Ganancias</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/ayuda">Ayuda</Link>
        <button className={isOnline?"refresh-button":"refresh-button-offline"} onclick="location.reload()">&#x21bb; </button>
      </nav>
      <Ayuda/>
    </div>
  );
}

export function App() {
  const [popupUsuario, setPopupResult] = useState(localStorage.getItem("usuario")??'');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
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
    });
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  },[url,isOnline]);
  return  (popupUsuario?.length>0) ?
   <HisPesajes isOnline={isOnline}/> :
      <PopupScreen onClose={handlePopupClose} />
}

