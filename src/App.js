import React, {  useEffect, useState } from "react";
import { useNetwork } from "./hooks/useNetwork";
import "./App.css";
import { recursoPorUsuario } from "./components/recursos"
import  NavBar  from "./components/NavBar";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";
import  Inventario  from "./components/Inventario";
import  Ayuda  from "./components/Ayuda";
import  PopupScreen  from "./components/PopupScreen";
import { transform } from "./components/Helpers"
import {  BrowserRouter,  Routes,  Route} from "react-router-dom";
import axios from "axios";

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
  };

  const retrieveData = (url) => {
    axios.get(url)
    .then((response)=>{
      let allPesajes = transform(response.data); 
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

  const networkState = useNetwork();
  const {
    online,
    since
  } = networkState;

  useEffect(()=>{
    retrieveData(url);
  },[url]);

  const handleRefresh = () => {
    retrieveData(url);
  }

  return( 
    (popupUsuario?.length!==0) ?
   <BrowserRouter>
   <div className="main-container">
      <NavBar/>   
      <button  className={online? "refresh-button-online" : "refresh-button-offline"} onClick={handleRefresh}> &#x21bb; </button>
    </div>
    <Routes>
      <Route path="/pesajes" element={<Pesajes />}/>
      <Route path="/inventario" element={<Inventario />}/>
      <Route path="/ganancias" element={<Ganancias />}/>
      <Route path="/ayuda" element={<Ayuda />}/>
    </Routes>
  </BrowserRouter> 
  :
  <PopupScreen onClose={handlePopupClose} />
)}

