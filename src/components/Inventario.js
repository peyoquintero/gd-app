import React, { useState, useEffect, useCallback } from "react";
import Table from "./Table";
import { getInventario, groupByFechaOperacion } from "./HelperInventario";
import { filteredGData } from "./Helpers";
import { dataService } from "../services/DataService";
import { useNetwork } from "../hooks/useNetwork";
import "../App.css"; 

const Inventario = ({ eventEmitter }) => {
  const columns = [
    { label: "Fecha", accessor: "Fecha", width: "20%" },
    { label: "Operacion", accessor: "Operacion", width: "25%" },
    { label: "Chapeta", accessor: "Chapeta", width: "15%" },
    { label: "Marca", accessor: "Marca", width: "10%" },
    { label: "Total", accessor: "Total", width: "15%" },
    { label: "Vendidos", accessor: "Vendidos", width: "15%" },
  ];

  const columnsInventario = [
    { label: "Codigo", accessor: "Codigo", width: "15%" },
    { label: "Marca", accessor: "Marca", width: "10%" },
    { label: "Chapeta", accessor: "Chapeta", width: "10%" },
    { label: "F.Compra", accessor: "FechaCompra", width: "18%" },
    { label: "Peso Inicial", accessor: "PesoInicial", width: "10%" },
    { label: "Ult. Control", accessor: "FechaUltimoControl", width: "17%" },
    { label: "Ultimo Peso", accessor: "PesoFinal", width: "10%" },
    { label: "PRY", accessor: "Proyeccion", width: "10%" },
  ];

  const [selectedOption, setSelectedOption] = useState("cabezas");
  const [filtroBuscar, setFiltroBuscar] = useState("");
  const [filtroExacto, setFiltroExacto] = useState(true);
  const [gridMovimientos, setGridMovimientos] = useState([]);
  const [gridInventario, setGridInventario] = useState([]);
  const [hisPesajes, setHisPesajes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { online } = useNetwork();

  const handleChange = useCallback((event) => {
    setSelectedOption(event.target.value);
  }, []);

  const handleFilterChange = useCallback((event) => {
    setFiltroBuscar(event.target.value);
  }, []);

  const handleCheckboxChange = useCallback((event) => {
    setFiltroExacto(event.target.checked);
  }, []);

  const refreshData = useCallback((allPesajes) => {
    if (!allPesajes?.length) return;

    let filteredData = allPesajes;
    if (filtroBuscar.length > 1) {
      filteredData = filteredGData(filteredData, filtroBuscar, "Peso", filtroExacto);
    }

    let movimientos = filteredData
      .filter((w) => w.Operacion?.toUpperCase() !== "CONTROL")
      .sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

    if (movimientos?.length) {
      let movimientosByFecha = groupByFechaOperacion(movimientos);
      setGridMovimientos(movimientosByFecha);

      let inventario = getInventario(filteredData);
      setGridInventario(inventario);
    }
  }, [filtroBuscar, filtroExacto]);

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
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div>
      <section className="main-container">
        <div className="radio-container" onChange={handleChange}>
          <label className="ayudaLabel">
            <input
              type="radio"
              name="details"
              value="movimientos"
              checked={selectedOption === "movimientos"}
            />
            Movimientos
          </label>
          <label className="ayudaLabel">
            <input
              type="radio"
              name="details"
              value="cabezas"
              checked={selectedOption === "cabezas"}
            />
            Inventario Actual
          </label>
        </div>
        <label input="query">
          Buscar
          <input
            className="freeinput"
            style={{ display: "block", marginLeft: "10px" }}
            name="filtroGeneral"
            onChange={handleFilterChange}
            value={filtroBuscar}
          />
        </label>
        <label style={{ display: "block" }}>
          Exacto
          <input
            style={{ display: "block" }}
            type="checkbox"
            id="checkboxFE"
            name="filtroExacto"
            onChange={handleCheckboxChange}
            checked={filtroExacto}
          />
        </label>
        <label style={{ marginLeft: "30px", marginTop: "20px" }}>
          {selectedOption === "movimientos" ? "" : `Total: ${gridInventario.length}`}
        </label>
        <div className="connection-status">
          {online ? "🟢 En línea" : "🔴 Fuera de línea"}
        </div>
      </section>

      <section>
        {selectedOption === "movimientos" ? (
          <div className="container">
            <Table data={gridMovimientos} columns={columns} />
          </div>
        ) : (
          <div className="container">
            <Table data={gridInventario} columns={columnsInventario} />
          </div>
        )}
      </section>
    </div>
  );
};

export default Inventario;