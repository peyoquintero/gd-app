import React, { useState, useEffect, useCallback } from "react";
import "../App.css";
import IntegerMatrix from "./Matrix";
import { resurrect, findPotentialMatches } from "./Helpers"; // Import the new function
import Duplicados from "./Duplicados";
import RevisionCodigos from "./RevisionCodigos"; // Import the new component
import { dataService } from "../services/DataService";


const Ayuda = ({ eventEmitter }) => {
  const [filtros, setFiltros] = useState({
    selectedOption: "optionInconsistencias",
    dailyGain: "0.350", // Default daily gain
    tolerance: "0.30"   // Default tolerance
  });
  const [cleanDataRange, setCleanDataRange] = useState(() => {
    return localStorage.getItem('cleanDataRange') || '-0200/1750';
  });
  const [gridDups, setGridDups] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState([]); // New state for matches
  const [hisPesajes, setHisPesajes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataUrl, setDataUrl] = useState('');
  // --- START: FIX ---
  // Use state to hold the last update time, so we can trigger re-renders.
  const [lastUpdate, setLastUpdate] = useState(dataService.getLastUpdate());

  // This effect listens for the 'dataRefreshed' event from App.js
  useEffect(() => {
    const handleDataRefresh = () => {
      // When the event is received, update our local state with the new time.
      setLastUpdate(dataService.getLastUpdate());
    };

    eventEmitter.on('dataRefreshed', handleDataRefresh);

    // Cleanup: remove the listener when the component unmounts.
    return () => {
      eventEmitter.off('dataRefreshed', handleDataRefresh);
    };
  }, [eventEmitter]); // Dependency array ensures this runs once.
  // --- END: FIX ---

  const handleOptionChange = useCallback((event) => {
    setFiltros(prev => ({
      ...prev,
      selectedOption: event.target.value
    }));
  }, []);


  const handleCleanDataRangeChange = useCallback((event) => {
    const value = event.target.value;
    setCleanDataRange(value);
    localStorage.setItem('cleanDataRange', value);
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const initializeData = useCallback(() => {
    // --- START: FIX ---
    // 1. Get the original, complete dataset.
    const originalPesajes = dataService.getCachedData();
    if (!originalPesajes) return;

    // Parse values from state, with fallbacks to defaults
    const dailyGain = parseFloat(filtros.dailyGain) || 0.350;
    const tolerance = parseFloat(filtros.tolerance) || 0.30;

    // Pass the configurable values to the matching function
    setPotentialMatches(findPotentialMatches(originalPesajes, dailyGain, tolerance));

    // 3. Now, create a cleaned version for other calculations like 'resurrect'.
    const cleanedPesajes = originalPesajes.filter(w => w.Codigo && w.Marca && w.Operacion && w.Fecha && !w.Codigo.includes("?"));
    setHisPesajes(cleanedPesajes);
    setGridDups(resurrect(cleanedPesajes));
    // --- END: FIX ---
  }, [filtros.dailyGain, filtros.tolerance]); // Re-run when these values change

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      initializeData();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [initializeData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (hisPesajes.length > 0) {
      // Refresh processed data when raw data changes
      setGridDups(resurrect(hisPesajes));
    }
  }, [hisPesajes]);

  useEffect(() => {
    const refreshHandler = () => {
      loadData();
    };
    eventEmitter.on("refresh", refreshHandler);
    return () => {
      eventEmitter.off("refresh", refreshHandler);
    };
  }, [eventEmitter, loadData]);

  // On component mount, load the currently saved URL from localStorage
  useEffect(() => {
    const savedUrl = localStorage.getItem('googleSheetDataUrl');
    if (savedUrl) {
      setDataUrl(savedUrl);
    }
  }, []);

  const handleUrlChange = (event) => {
    setDataUrl(event.target.value);
  };

  const handleSaveUrl = () => {
    if (dataUrl && dataUrl.trim() !== '') {
      localStorage.setItem('googleSheetDataUrl', dataUrl.trim());
      alert('URL guardada exitosamente!');
    } else {
      // If the input is empty, remove the key to revert to the default URL
      localStorage.removeItem('googleSheetDataUrl');
      setDataUrl('');
      alert('URL eliminada. La aplicación usará la URL por defecto cuando refresque los datos.');
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

 return (
    <div className="ayuda-filters">
      <section className="filter-section">
        <div className="filters-row">
          {/* This single div will contain all the filters in a row */}
          <div className="filter-group radio-group-horizontal">
            <label className="radio-label">
              <input
                type="radio"
                name="details"
                value="optionInconsistencias"
                checked={filtros.selectedOption === "optionInconsistencias"}
                onChange={handleOptionChange}
              />
              Inconsistencias
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="details"
                value="optionRevisionCodigos"
                checked={filtros.selectedOption === "optionRevisionCodigos"}
                onChange={handleOptionChange}
              />
              Mapeo de Correcciones
            </label>
          </div>
          </div>
        <div className="filters-row">
          <div className="filter-group">
            <label>Rango Ganancias</label>
            <input
              type="text"
              value={cleanDataRange}
              onChange={handleCleanDataRangeChange}
              placeholder="-0200/1750"
              className="freeinputsmall"
              style={{ width: '100px' }}
            />
          </div>
        </div>
        {/* Conditionally render inputs for Mapeo de Correcciones */}
        {filtros.selectedOption === "optionRevisionCodigos" && (
          <div className="filters-row" style={{ marginTop: '10px' }}>
            <div className="filter-group">
              <label>GDP (kg/día)</label>
              <input
                type="text"
                name="dailyGain"
                value={filtros.dailyGain}
                onChange={handleFilterChange}
                className="freeinputsmall"
                style={{ width: '80px' }}
              />
            </div>
            <div className="filter-group">
              <label>Tolerancia (%)</label>
              <input
                type="text"
                name="tolerance"
                value={filtros.tolerance}
                onChange={handleFilterChange}
                className="freeinputsmall"
                style={{ width: '80px' }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="content-section">
        {filtros.selectedOption === "optionInconsistencias" && gridDups?.length > 0 && (
            <IntegerMatrix
              nColumns={5}
              integers={gridDups}
            />
        )}
        {/* --- START: RENDER NEW COMPONENT --- */}
        {filtros.selectedOption === "optionRevisionCodigos" && (
          <RevisionCodigos matches={potentialMatches} />
        )}
        {/* --- END: RENDER NEW COMPONENT --- */}
        {filtros.selectedOption === "optionDuplicados" && <Duplicados />}
      </section>
      <section className="version-info">
        {/* Display the last update time from our state variable */}
        <label>Version 2.1.0 - {lastUpdate}</label>
      </section>
      <section style={{ marginTop: '30px' }}>
        <div style={{ marginTop: '15px' }}>
          <h2>Configuración de Origen de Datos</h2>
          <label htmlFor="data-url-input" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            URL de Google Sheets:
          </label>
          <input
            id="data-url-input"
            type="text"
            value={dataUrl}
            onChange={handleUrlChange}
            placeholder="Si guarda campo en blanco, se usara la URL configurada por defecto."
            style={{ width: '100%',minWidth:'400px', padding: '8px', boxSizing: 'border-box', marginBottom: '10px' }}
          />
          <button
            onClick={handleSaveUrl}
            style={{ padding: '10px 15px',minWidth:'80px', cursor: 'pointer' }}
          >
            Guardar
          </button>
        </div>
      </section>
    </div>
  );
};

export default Ayuda;
