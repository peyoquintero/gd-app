import React, {  useEffect, useState } from "react";
import EventEmitter from 'eventemitter3';
import { useNetwork } from "./hooks/useNetwork";
import "./App.css";
import  NavBar  from "./components/NavBar";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";
import  Inventario  from "./components/Inventario";
import  Ayuda  from "./components/Ayuda";
import { mapApiDataToPesajes } from "./components/Helpers"
import {  BrowserRouter,  Routes,  Route} from "react-router-dom";
import axios from "axios";

export function App() {
  const eventEmitter = new EventEmitter();

  let dataUrl = "https://sheets.googleapis.com/v4/spreadsheets/1ZfXM4qnajw8QSaxrx6aXKa_xbMDZe3ryWt8E3alSyEE/values/PesajesPorCodigo?key=AIzaSyCGW3gRbBisLX950bZJDylH-_QJTR7ogd8"

  const retrieveData = async (dataUrl) => {
    if(online)
    {
      try{
        const response = await axios.get(dataUrl);
        const allPesajes = mapApiDataToPesajes(response.data); 
        localStorage.setItem("spreadsheetData", JSON.stringify(allPesajes));
        const now = new Date();
        const localTimeString = now.toLocaleDateString(navigator.language, {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        localStorage.setItem("lastRefresh", localTimeString);
        return () => {}
        }
      catch(error) {   
        console.log("error getting spreadsheet")
        return () => {}
      };
   }
  }

  const networkState = useNetwork();
  const { online } = networkState;

  const retrieveDataAsync = async (url) => {
    await retrieveData(url);
  } 

  useEffect( ()=>{
    retrieveDataAsync(dataUrl);
    },[dataUrl]);

  const handleRefresh = async () => {
    await retrieveData(dataUrl);
    eventEmitter.emit('refresh');
  }
 
  return( 
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
)}

