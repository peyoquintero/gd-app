import React, { useState, useEffect, useCallback } from "react";
import IntegerMatrix from "./Matrix";
import Table from "./Table";
import { resurrect } from "./Helpers";
import Duplicados from "./Duplicados";
import Codigos from "./Codigos";
import { dataService } from "../services/DataService";
import "../App.css";

const Ayuda = ({ eventEmitter }) => {
  const columnsMuertes = [
    { label: "Codigo", accessor: "Codigo", width: "30%" },
    { label: "Fecha", accessor: "Fecha", width: "40%" },
    { label: "Marca", accessor: "Marca", width: "30%" }
  ];

  const [filtros, setFiltros] = useState({
    filtroDups: false,
    filtroMuertos: false,
    selectedOption: ""
  });
  const [cleanDataRange, setCleanDataRange] = useState(() => {
    return localStorage.getItem('cleanDataRange') || '-0200/1750';
  });
  const [gridDups, setGridDups] = useState([]);
  const [gridMuertes, setGridMuertes] = useState([]);
  const [hisPesajes, setHisPesajes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionChange = useCallback((event) => {
    setFiltros(prev => ({
      ...prev,
      selectedOption: event.target.value
    }));
  }, []);

  const handleCheckboxChange = useCallback((event) => {
    const { name } = event.target;
    setFiltros(prev => ({
      ...prev,
      [name]: event.target.checked
    }));
  }, []);

  const handleCleanDataRangeChange = useCallback((event) => {
    const value = event.target.value;
    setCleanDataRange(value);
    localStorage.setItem('cleanDataRange', value);
  }, []);

  const initializeData = useCallback(() => {
    let allPesajes = dataService.getCachedData();
    if (!allPesajes) return;

    // Filter and clean data similar to Ganancias.js
    allPesajes = allPesajes.filter(w => w.Codigo && w.Marca && w.Operacion && w.Fecha && !w.Codigo.includes("?"));
    setHisPesajes(allPesajes);

    // Process data for grids
    setGridDups(resurrect(allPesajes));
    const muertes = allPesajes
      .filter(w => w.Operacion?.toUpperCase().trim() === 'MUERTE')
      .sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
    setGridMuertes(muertes);
  }, []);

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
      const muertes = hisPesajes
        .filter(w => w.Operacion?.toUpperCase().trim() === 'MUERTE')
        .sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
      setGridMuertes(muertes);
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

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="ayuda-filters">
      <section className="filter-section">
        <div className="filters-row">
          <div className="filter-group radio-group">
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
              Revision Codigos
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="details"
                value="optionDuplicados"
                checked={filtros.selectedOption === "optionDuplicados"}
                onChange={handleOptionChange}
              />
              Duplicados
            </label>
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
        </div>
      </section>

      <section className="content-section">
        {filtros.selectedOption === "optionInconsistencias" && gridDups?.length > 0 && (
          <IntegerMatrix nColumns={5} integers={gridDups} />
        )}
        {filtros.selectedOption === "optionRevisionCodigos" && (
          <Codigos eventEmitter={eventEmitter} />
        )}
        {filtros.selectedOption === "optionDuplicados" && <Duplicados />}
      </section>

      <section className="filter-section ayuda-bottom-filters">
        <div className="filters-row">
          <div className="filter-group checkbox-group">
            <label>Muertes</label>
            <input
              type="checkbox"
              name="filtroMuertos"
              onChange={handleCheckboxChange}
              checked={filtros.filtroMuertos}
            />
          </div>
        </div>
      </section>

      {filtros.filtroMuertos && (
        <section className="table-container">
          <Table data={gridMuertes} columns={columnsMuertes} />
        </section>
      )}

      <section className="version-info">
        <label>Version 1.0.25 - {dataService.getLastUpdate()}</label>
      </section>
    </div>
  );
};

export default Ayuda;
