import React, { useEffect, useState, useCallback, useMemo } from "react";
import { EventEmitter } from "events";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNetwork } from "./hooks/useNetwork";
import { dataService } from "./services/DataService";
import { exportTableAsHTML } from "./utils/exportUtils";
import NavBar from "./components/NavBar";
import Inventario from "./components/Inventario";
import Pesajes from "./components/Pesajes";
import Ganancias from "./components/Ganancias";
import Ayuda from "./components/Ayuda";
import "./App.css";

export function App() {
  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentTableData, setCurrentTableData] = useState({ data: [], columns: [], title: '' });
  const { online } = useNetwork();

  // Debug: Log connection status changes
  useEffect(() => {
    console.log('Connection status changed:', online ? 'ONLINE' : 'OFFLINE');
  }, [online]);
  
  const dataUrl = "https://sheets.googleapis.com/v4/spreadsheets/1ZfXM4qnajw8QSaxrx6aXKa_xbMDZe3ryWt8E3alSyEE/values/PesajesPorCodigo?key=AIzaSyCGW3gRbBisLX950bZJDylH-_QJTR7ogd8";

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (online) {
        // Always try to fetch new data when online
        const data = await dataService.fetchData(dataUrl);
        if (data) {
          setLastUpdate(new Date().toLocaleString());
          eventEmitter.emit('refresh');
        }
      } else {
        // When offline, just emit refresh to use cached data
        const cachedData = dataService.getCachedData();
        if (cachedData) {
          eventEmitter.emit('refresh');
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      // On error, try to use cached data
      const cachedData = dataService.getCachedData();
      if (cachedData) {
        eventEmitter.emit('refresh');
      }
    } finally {
      setIsLoading(false);
    }
  }, [online, eventEmitter, dataUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for table data updates from components
  useEffect(() => {
    const handleTableDataUpdate = (tableInfo) => {
      setCurrentTableData(tableInfo);
    };

    eventEmitter.on('tableDataUpdate', handleTableDataUpdate);
    return () => {
      eventEmitter.off('tableDataUpdate', handleTableDataUpdate);
    };
  }, [eventEmitter]);

  const handleExportTable = useCallback(() => {
    exportTableAsHTML(currentTableData);
  }, [currentTableData]);

  return (
    <BrowserRouter>
      <div className="main-container">
        <div className="header-container">
          <NavBar />
          <div className="controls-container">
            <div className="header-buttons">
              <button
                className={`refresh-button ${online ? "online" : "offline"}`}
                onClick={loadData}
                disabled={isLoading}
                title={`Status: ${online ? 'Online' : 'Offline'}`}
              >
                <div className="refresh-symbol">
                  {isLoading ? "..." : "⟳"}
                </div>
              </button>
              <button
                className="export-button"
                onClick={handleExportTable}
                disabled={!currentTableData.data || currentTableData.data.length === 0}
                title="Exportar tabla como HTML"
              >
                <div className="export-symbol">
                  📄
                </div>
              </button>
            </div>
          </div>
        </div>
      <div className="routes-container">
        <Routes>
          <Route exact path="/" element={<Inventario eventEmitter={eventEmitter} />}/>
          <Route path="/inventario" element={<Inventario eventEmitter={eventEmitter} />}/>
          <Route path="/pesajes" element={<Pesajes eventEmitter={eventEmitter} />}/>
          <Route path="/ganancias" element={<Ganancias eventEmitter={eventEmitter} />}/>
          <Route path="/ayuda" element={<Ayuda eventEmitter={eventEmitter} />}/>
        </Routes>
      </div>
      </div>
    </BrowserRouter>
  );
}

