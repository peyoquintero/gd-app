import React, {  useEffect, useState } from "react";
import EventEmitter from 'eventemitter3';
import { useNetwork } from "./hooks/useNetwork";
import "./App.css";
import { recursoPorUsuario } from "./components/recursos"
import  NavBar  from "./components/NavBar";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";
import  Inventario  from "./components/Inventario";
import  Ayuda  from "./components/Ayuda";
import  PopupScreen  from "./components/PopupScreen";
import { mapApiDataToPesajes } from "./components/Helpers"
import {  BrowserRouter,  Routes,  Route} from "react-router-dom";
import axios from "axios";

export function App() {
  const [popupUsuario, setPopupResult] = useState(localStorage.getItem("usuario")??'');
  const eventEmitter = new EventEmitter();

  let dataUrl = ''
  const handlePopupClose = (result) => {
    setPopupResult(result);
    if (result?.length>0)
    {
      localStorage.setItem("usuario", result.toLowerCase());
    }
  };
 
  if (popupUsuario?.length>0)
  {
    dataUrl = recursoPorUsuario(popupUsuario)
  };

  const retrieveData = (dataUrl) => {
    if(online)
    {
      axios.get(dataUrl)
      .then((response)=>{
        let allPesajes = mapApiDataToPesajes(response.data); 
        localStorage.setItem("spreadsheetData", JSON.stringify(allPesajes));
        const now = new Date();
        const localTimeString = now.toLocaleDateString(navigator.language, {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        localStorage.setItem("lastRefresh", localTimeString);
      })
      .catch((error) =>  {   
        console.log("error getting spreadsheet")
      });
   }
  }

  const networkState = useNetwork();
  const { online } = networkState;

  useEffect(()=>{
    retrieveData(dataUrl);
    setPopupResult(localStorage.getItem("usuario")??'');
    },[dataUrl]);

  const handleRefresh = () => {
    retrieveData(dataUrl);
    eventEmitter.emit('refresh');
  }
 
  return( 
    (popupUsuario?.length!==0) ?
   <BrowserRouter>
   <div className="main-container">
      <NavBar/>  
      <button  className={online? "refresh-button-online" : "refresh-button-offline"} onClick={handleRefresh}> 
        <div className="refresh-symbol">&#8635;</div> 
      </button>
    </div>
    <Routes>
      <Route exact path="/" element={<Inventario  eventEmitter={eventEmitter} />}/>
      <Route path="/inventario" element={<Inventario eventEmitter={eventEmitter} />}/>
      <Route path="/pesajes" element={<Pesajes eventEmitter={eventEmitter} />}/>
      <Route path="/ganancias" element={<Ganancias eventEmitter={eventEmitter} />}/>
      <Route path="/ayuda" element={<Ayuda eventEmitter={eventEmitter} />}/>
    </Routes>
  </BrowserRouter> 
  :
  <PopupScreen onClose={handlePopupClose} />
)}

