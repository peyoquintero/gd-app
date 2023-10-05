import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {  App,  HisPesajes,  HisCodigos, GananciasDiarias,AyudaGD} from "./App";
import {  BrowserRouter,  Routes,  Route} from "react-router-dom";
import { register as registerServiceWorker } from './serviceWorkerRegistration';

registerServiceWorker();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
   <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/pesajes" element={<HisPesajes />}/>
      <Route path="/codigos" element={<HisCodigos />}/>
      <Route path="/ganancias" element={<GananciasDiarias />}/>
      <Route path="/ayuda" element={<AyudaGD />}/>
    </Routes>
  </BrowserRouter> 
   </React.StrictMode>
   
);

