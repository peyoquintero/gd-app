import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {  App,  HisPesajes,  HisCodigos,} from "./App";
import {  BrowserRouter,  Routes,  Route} from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
   <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/pesajes" element={<HisPesajes />}/>
      <Route path="/codigos" element={<HisCodigos />}
      />
    </Routes>
  </BrowserRouter> 
   </React.StrictMode>
);
