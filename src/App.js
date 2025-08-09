import React, { useEffect, useState, useCallback, useMemo } from "react";
import { EventEmitter } from "events";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNetwork } from "./hooks/useNetwork";
import { dataService } from "./services/DataService";
import NavBar from "./components/NavBar";
import Inventario from "./components/Inventario";
import Pesajes from "./components/Pesajes";
import Ganancias from "./components/Ganancias";
import Ayuda from "./components/Ayuda";

export function App() {
  const eventEmitter = useMemo(() => new EventEmitter(), []); // Stable reference
  const [isLoading, setIsLoading] = useState(false);
  const { online } = useNetwork();
  
  const dataUrl = "https://sheets.googleapis.com/v4/spreadsheets/1ZfXM4qnajw8QSaxrx6aXKa_xbMDZe3ryWt8E3alSyEE/values/PesajesPorCodigo?key=AIzaSyCGW3gRbBisLX950bZJDylH-_QJTR7ogd8";

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (online && !dataService.isCacheValid()) {
        await dataService.fetchData(dataUrl);
      }
      eventEmitter.emit('refresh');
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [online, eventEmitter, dataUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <BrowserRouter>
      <div className="main-container">
        <NavBar />
        <button 
          className={online ? "refresh-button-online" : "refresh-button-offline"} 
          onClick={loadData}
          disabled={isLoading}
        >
          <div className="refresh-symbol">
            {isLoading ? "..." : "⟳"}
          </div>
        </button>
      </div>
      <Routes>
        <Route exact path="/" element={<Inventario eventEmitter={eventEmitter} />}/>
        <Route path="/inventario" element={<Inventario eventEmitter={eventEmitter} />}/>
        <Route path="/pesajes" element={<Pesajes eventEmitter={eventEmitter} />}/>
        <Route path="/ganancias" element={<Ganancias eventEmitter={eventEmitter} />}/>
        <Route path="/ayuda" element={<Ayuda eventEmitter={eventEmitter} />}/>
      </Routes>
    </BrowserRouter>
  );
}