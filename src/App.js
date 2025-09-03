import React, { useEffect, useState, useCallback, useMemo } from "react";
import { EventEmitter } from "events";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { dataService } from "./services/DataService";
import { exportTableAsHTML } from "./utils/exportUtils";
import NavBar from "./components/NavBar";
import Inventario from "./components/Inventario";
import Pesajes from "./components/Pesajes";
import Ganancias from "./components/Ganancias";
import Ayuda from "./components/Ayuda";
import "./App.css";

export function App() {
  const [online, setOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState({ data: [], columns: [], title: '' });

  const eventEmitter = useMemo(() => new EventEmitter(), []);
  
  // --- START: ROBUST ONLINE DETECTION ---
  useEffect(() => {
    // The browser's event listeners are a good first-line defense for instant feedback.
    const handleEventOnline = () => setOnline(true);
    const handleEventOffline = () => setOnline(false);

    window.addEventListener('online', handleEventOnline);
    window.addEventListener('offline', handleEventOffline);

    // A more reliable "heartbeat" check to verify actual internet connectivity.
    const checkConnectivity = async () => {
      try {
        // We fetch a small, non-cached resource. A failed request will throw an error.
        // The random query string `?_=${new Date().getTime()}` prevents the browser from returning a cached result.
        await fetch('https://www.google.com/favicon.ico?_=' + new Date().getTime(), {
          method: 'HEAD', // Use HEAD to be lightweight; we only care if the server is reachable.
          mode: 'no-cors', // Use no-cors for cross-origin requests where we don't need the response body.
          cache: 'no-store', // Explicitly tell the browser not to cache.
        });
        setOnline(true);
      } catch (error) {
        // A TypeError: Failed to fetch indicates a network-level error.
        setOnline(false);
      }
    };

    // Check connectivity immediately on component mount and then every 15 seconds.
    checkConnectivity();
    const intervalId = setInterval(checkConnectivity, 15000); // 15 seconds

    // Cleanup function to remove listeners and the interval when the component unmounts.
    return () => {
      window.removeEventListener('online', handleEventOnline);
      window.removeEventListener('offline', handleEventOffline);
      clearInterval(intervalId);
    };
  }, []); // The empty array ensures this effect runs only once.
  // --- END: ROBUST ONLINE DETECTION ---

  useEffect(() => {
    console.log('Connection status changed:', online ? 'ONLINE' : 'OFFLINE');
  }, [online]);
  
  // Define the default URL as a fallback.
  const hardcodedUrl = "https://sheets.googleapis.com/v4/spreadsheets/1ZfXM4qnajw8QSaxrx6aXKa_xbMDZe3ryWt8E3alSyEE/values/PesajesPorCodigo!A:H?key=AIzaSyCGW3gRbBisLX950bZJDylH-_QJTR7ogd8";
  
  const dataUrl = localStorage.getItem('googleSheetDataUrl') || hardcodedUrl;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dataService.fetchData(dataUrl);
      if (data) {
        eventEmitter.emit('dataRefreshed');
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dataUrl, eventEmitter]); // Add eventEmitter as a dependency

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for table data updates from components
  useEffect(() => {
    const handleTableDataUpdate = (tableInfo) => {
      setTableData(tableInfo);
    };

    eventEmitter.on('tableDataUpdate', handleTableDataUpdate);
    return () => {
      eventEmitter.off('tableDataUpdate', handleTableDataUpdate);
    };
  }, [eventEmitter]);

  const handleExportTable = useCallback(() => {
    exportTableAsHTML(tableData);
  }, [tableData]);

  // Define the style objects for the button's online/offline states.
  const onlineStyle = {
    background: 'linear-gradient(135deg, #28a745, #20c997)',
  };

  const offlineStyle = {
    background: 'linear-gradient(135deg, #dc3545, #c82333)',
    animation: 'pulse-red 2s infinite',
  };
  
  return (
    <BrowserRouter>
      <div className="main-container">
        <div className="header-container">
          <NavBar />
          <div className="controls-container">
            <div className="header-buttons">
              <button
                className={`refresh-button ${online ? "online" : "offline"}`}
                // Apply the style directly based on the 'online' state.
                style={online ? onlineStyle : offlineStyle}
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
                disabled={!tableData.data || tableData.data.length === 0}
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

