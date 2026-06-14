import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../App.css";
import IntegerMatrix from "./Matrix";
import { resurrect, findPotentialMatches, compareNumAlphas } from "./Helpers"; // Import compareNumAlphas
import Duplicados from "./Duplicados";
import RevisionCodigos from "./RevisionCodigos";
import { dataService } from "../services/DataService";


const Ayuda = ({ eventEmitter }) => {
  const [filtros, setFiltros] = useState({
    selectedOption: "optionInconsistencias",
    dailyGain: "0.350",
    tolerance: "0.30",
    forceDailyGain: false // Add state for the new checkbox
  });
  const [cleanDataRange, setCleanDataRange] = useState(() => {
    return localStorage.getItem('cleanDataRange') || '-0200/1800/1000';
  });
  const [gridDups, setGridDups] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState([]);
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
    const { name, value, type, checked } = event.target;
    // Handle both text inputs and checkboxes
    setFiltros(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // --- START: NEW SORTING STATE ---
  const [sortConfig, setSortConfig] = useState({ key: 'Codigo', direction: 'ascending' });
  // --- END: NEW SORTING STATE ---

  // --- START: NEW SORTING HANDLER ---
  const handleSort = useCallback((key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);
  // --- END: NEW SORTING HANDLER ---

  // --- START: MEMOIZED SORTING LOGIC ---
  const sortedMatches = useMemo(() => {
    let sortableItems = [...potentialMatches];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        const comparison = compareNumAlphas(valA, valB);
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [potentialMatches, sortConfig]);
  // --- END: MEMOIZED SORTING LOGIC ---

  const initializeData = useCallback(() => {
    // --- START: FIX ---
    // 1. Get the original, complete dataset.
    const originalPesajes = dataService.getCachedData();
    if (!originalPesajes) return;

    const dailyGain = parseFloat(filtros.dailyGain) || 0.350;
    const tolerance = parseFloat(filtros.tolerance) || 0.30;
    const forceDailyGain = filtros.forceDailyGain; // Get the checkbox value

    // Pass the new override flag to the matching function
    setPotentialMatches(findPotentialMatches(originalPesajes, dailyGain, tolerance, forceDailyGain));

    // 3. Now, create a cleaned version for other calculations like 'resurrect'.
    const cleanedPesajes = originalPesajes.filter(w => w.Codigo && w.Marca && w.Operacion && w.Fecha && !w.Codigo.includes("?"));
    setHisPesajes(cleanedPesajes);
    setGridDups(resurrect(cleanedPesajes));
    // --- END: FIX ---
  }, [filtros.dailyGain, filtros.tolerance, filtros.forceDailyGain]); // Add new dependency

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
            <label>Rango Ganancias (min/máx≤90d/máx>90d)</label>
            <input
              type="text"
              value={cleanDataRange}
              onChange={handleCleanDataRangeChange}
              placeholder="-0200/1800/1000"
              className="freeinputsmall"
              style={{ width: '130px' }}
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
            {/* --- START: FIX --- */}
            <div className="filter-group" style={{ position: 'relative', bottom: '15px' }}>
              <label>Forzar GDP</label>
              {/* This container ensures the checkbox aligns vertically with the text inputs */}
              <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="forceDailyGain"
                  checked={filtros.forceDailyGain}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            {/* --- END: FIX --- */}
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
        {filtros.selectedOption === "optionRevisionCodigos" && (
          // Pass sorted data and handlers to the child component
          <RevisionCodigos 
            matches={sortedMatches} 
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        )}
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
