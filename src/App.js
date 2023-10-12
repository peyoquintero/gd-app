import React, {  useEffect, useState } from "react";
import { useNetwork } from "./hooks/useNetwork";
import "./App.css";
import { recursoPorUsuario } from "./components/recursos"
import { Link } from "react-router-dom";
import  NavBar  from "./components/NavBar";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";
import  Inventario  from "./components/Inventario";
import  Ayuda  from "./components/Ayuda";
import { transform } from "./components/Helpers"
import {  BrowserRouter,  Routes,  Route} from "react-router-dom";
import axios from "axios";

export function GananciasDiarias() {
  return (
    <div>
      <nav>
        <Link to="/pesajes">Pesajes</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/ganancias">Ganancias</Link>
        <Link to="/inventario">Inventario</Link>
        <Link to="/ayuda">Ayuda</Link>
        <button className= {true?"refresh-button":"refresh-button-offline"} >&#x21bb; </button>
      </nav>
      
      <Ganancias/>
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
    });
  },[url]);
  return( 
   <BrowserRouter>
   <NavBar/>
    <Routes>
      <Route path="/pesajes" element={<Pesajes />}/>
      <Route path="/inventario" element={<Inventario />}/>
      <Route path="/ganancias" element={<Ganancias />}/>
      <Route path="/ayuda" element={<Ayuda />}/>
    </Routes>
  </BrowserRouter> 
/*
  return  (popupUsuario?.length!==0) ?
     <><label>{online?"ON":"OFF"}{since}</label>
     <HisPesajes/> </>:
      <PopupScreen onClose={handlePopupClose} />
      */
)}

