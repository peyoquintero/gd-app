import React, { useState, useEffect, useCallback } from "react";
import Table from "./Table";
import { getInventario } from "./HelperInventario";
import { filteredGData } from "./Helpers";
import { dataService } from "../services/DataService";
import "../App.css";

const Inventario = ({ eventEmitter }) => {
  const columns = [
    { label: "Codigo", accessor: "Codigo", width: "12%" },
    { label: "Chapeta", accessor: "Chapeta", width: "12%" },
    { label: "Fecha Inicial", accessor: "FechaInicial", width: "20%" },
    { label: "Fecha Final", accessor: "FechaFinal", width: "20%" },
    { label: "Peso Inicial", accessor: "PesoInicial", width: "12%" },
    { label: "Peso Final", accessor: "PesoFinal", width: "12%" },
    { label: "Ganancia", accessor: "Ganancia", width: "12%" },
  ];

  const [filtros, setFiltros] = useState({
    filtroBuscar: "",
    filtroExacto: true,
    selectedOption: "cabezas",
  });
  const [gridData, setGridData] = useState([]);
  const [hisPesajes, setHisPesajes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      setFiltros((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleCheckboxChange = useCallback(
    (event) => {
      setFiltros((prev) => ({
        ...prev,
        filtroExacto: event.target.checked,
      }));
    },
    []
  );

  const handleOptionChange = useCallback(
    (event) => {
      setFiltros((prev) => ({
        ...prev,
        selectedOption: event.target.value,
      }));
    },
    []
  );

  const refreshData = useCallback(
    (allPesajes) => {
      if (!allPesajes?.length) return;

      let filteredData = allPesajes;
      if (filtros.filtroBuscar.length > 1) {
        filteredData = filteredGData(
          filteredData,
          filtros.filtroBuscar,
          "Peso",
          filtros.filtroExacto
        );
      }

      const inventario = getInventario(filteredData);
      setGridData(inventario);
    },
    [filtros]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = dataService.getCachedData();
      if (data) {
        refreshData(data);
        setHisPesajes(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    refreshData(hisPesajes);
  }, [refreshData, hisPesajes]);

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
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <section className="filter-section">
        <div className="filters-row">
          <div className="radio-container">
            <label className="radio-label">
              <input
                type="radio"
                name="selectedOption"
                value="movimientos"
                checked={filtros.selectedOption === "movimientos"}
                onChange={handleOptionChange}
              />
              Movimientos
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="selectedOption"
                value="cabezas"
                checked={filtros.selectedOption === "cabezas"}
                onChange={handleOptionChange}
              />
              Inventario Actual
            </label>
          </div>
          <div className="filter-group">
            <label>Buscar</label>
            <input
              className="freeinput"
              name="filtroBuscar"
              onChange={handleFilterChange}
              value={filtros.filtroBuscar}
            />
          </div>
          <label className="center-label">
            Exacto
            <input
              type="checkbox"
              onChange={handleCheckboxChange}
              checked={filtros.filtroExacto}
            />
          </label>
        </div>
      </section>

      <section className="totals">
        <label>
          {filtros.selectedOption === "movimientos"
            ? ""
            : `Total: ${gridData.length}`}
        </label>
      </section>

      <section className="table-container">
        <Table data={gridData} columns={columns} />
      </section>
    </div>
  );
};

export default Inventario;