import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {  App,  Pesajes,  Codigos,} from "./App";
import {  BrowserRouter,  Routes,  Route} from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
   <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/pesajes" element={<Pesajes />}/>
      <Route
        path="/codigos"
        element={<Codigos />}
      />
    </Routes>
  </BrowserRouter> 
   </React.StrictMode>
);
