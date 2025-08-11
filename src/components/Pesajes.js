import React, { useState, useEffect, useCallback } from "react";
import Table from "./Table";
import { filteredGData } from "./Helpers";
import { dataService } from "../services/DataService";
import "../App.css";

const Pesajes = ({ eventEmitter }) => {
  const columns = [
    { label: "Codigo", accessor: "Codigo", width: "15%" },
    { label: "Chapeta", accessor: "Chapeta", width: "15%" },
    { label: "Fecha", accessor: "Fecha", width: "20%" },
    { label: "Peso", accessor: "Peso", width: "15%" },
    { label: "Marca", accessor: "Marca", width: "15%" },
    { label: "Operacion", accessor: "Operacion", width: "20%" },
  ];

  const [filtros, setFiltros] = useState({
    fechaControl: null,
    filtroGeneral: "",
    filtroCodigo: "",
    filtroChapeta: "",
    filtroExacto: true,
  });
  const [gridData, setGridData] = useState([]);
  const [hisPesajes, setHispesajes] = useState([]);
  const [fechasPesaje, setFechasPesaje] = useState([]);
  const [captions, setCaptions] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const initializeData = useCallback(() => {
    let allPesajes = dataService.getCachedData();
    if (!allPesajes) return;

    allPesajes = allPesajes.filter(
      (w) => w.Codigo && w.Marca && w.Operacion && w.Fecha && !w.Codigo.includes("?")
    );
    setHispesajes(allPesajes);
    let allFechas = [...new Set(allPesajes.map((obj) => obj.Fecha.trim()))];
    allFechas.sort((a, b) => new Date(b) - new Date(a));
    allFechas.unshift(null);
    setFechasPesaje(allFechas);
    setGridData(allPesajes.slice(0, 100));
    setCaptions(`Ultimos 100 - Total: ${allPesajes.length}`);
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
    const refreshHandler = () => {
      loadData();
    };
    eventEmitter.on("refresh", refreshHandler);
    return () => {
      eventEmitter.off("refresh", refreshHandler);
    };
  }, [eventEmitter, loadData]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = (event) => {
    let filteredData = filteredGData(
      hisPesajes,
      filtros.filtroGeneral,
      "Peso",
      filtros.filtroExacto
    );
    if (filtros.filtroCodigo.trim() !== "") {
      const codeFilter = filtros.filtroCodigo.trim().toUpperCase();
      switch (filtros.filtroExacto) {
        case "starts":
          filteredData = filteredData.filter(
            (w) => w.Codigo?.toUpperCase().startsWith(codeFilter)
          );
          break;
        case "ends":
          filteredData = filteredData.filter(
            (w) => w.Codigo?.toUpperCase().endsWith(codeFilter)
          );
          break;
        case "contains":
          filteredData = filteredData.filter(
            (w) => w.Codigo?.toUpperCase().includes(codeFilter)
          );
          break;
        case "none":
        default:
          filteredData = filteredData.filter(
            (w) => w.Codigo?.toUpperCase() === codeFilter
          );
          break;
      }
    }
    if (filtros.filtroChapeta.trim() !== "") {
      filteredData = filteredData.filter(
        (w) =>
          (filtros.filtroExacto === "none" &&
            w.Chapeta?.toUpperCase() ===
              filtros.filtroChapeta?.trim().toUpperCase()) ||
          (filtros.filtroExacto === "starts" &&
            w.Chapeta?.toUpperCase().startsWith(filtros.filtroChapeta?.trim().toUpperCase())) ||
          (filtros.filtroExacto === "ends" &&
            w.Chapeta?.toUpperCase().endsWith(filtros.filtroChapeta?.trim().toUpperCase())) ||
          (filtros.filtroExacto === "contains" &&
            w.Chapeta?.toUpperCase().includes(filtros.filtroChapeta?.trim().toUpperCase()))
      );
    }
    if (filtros.fechaControl) {
      filteredData = filteredData.filter(
        (w) => w.Fecha === filtros.fechaControl
      );
    }

    setGridData(filteredData);
    let comment = `Total: ${filteredData.length}`;

    if (
      filtros.fechaControl &&
      filteredData.length &&
      filteredData.every((w) => w.Peso > 0)
    ) {
      const average =
        filteredData.reduce((acc, cur) => acc + parseInt(cur.Peso), 0) /
        filteredData.length;
      comment = comment + ` Promedio: ${average.toFixed(2)}`;
    }

    setCaptions(comment);
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <section className="filter-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Codigo</label>
            <input
              className="freeinputsmall"
              name="filtroCodigo"
              onChange={handleFilterChange}
              value={filtros.filtroCodigo}
            />
          </div>
          <div className="filter-group">
            <label>Chapeta</label>
            <input
              className="freeinputsmall"
              name="filtroChapeta"
              onChange={handleFilterChange}
              value={filtros.filtroChapeta}
            />
          </div>
          <div className="filter-group">
            <label>General</label>
            <input
              className="freeinputsmall"
              name="filtroGeneral"
              onChange={handleFilterChange}
              value={filtros.filtroGeneral}
            />
          </div>
          <div className="filter-group">
            <label>Fecha</label>
            <select
              name="fechaControl"
              onChange={handleFilterChange}
              value={filtros.fechaControl || ""}
            >
              {fechasPesaje.map((fecha) => (
                <option key={fecha} value={fecha}>
                  {fecha || "Todas"}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
        <label>Comparación</label>
          <select
            name="filtroExacto"
            onChange={handleFilterChange}
            value={filtros.filtroExacto ?? "none"}
          >
            <option value="none">Ninguno</option>
            <option value="starts">Empieza con</option>
            <option value="ends">Termina con</option>
            <option value="contains">Contiene</option>
          </select>
        </div>
         <button onClick={applyFilters}>Ok</button>
        </div>
      </section>

      <section className="totals">
        <label>{captions}</label>
      </section>

      <section className="table-container">
        <Table data={gridData} columns={columns} />
      </section>
    </div>
  );
};

export default Pesajes;