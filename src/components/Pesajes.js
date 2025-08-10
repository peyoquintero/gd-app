import React, { useState, useEffect, useCallback } from "react";
import Table from "./Table";
import { filteredGData } from "./Helpers";
import { dataService } from "../services/DataService";

const Pesajes = ({ eventEmitter }) => {
  const columns = [
    { label: "Codigo", accessor: "Codigo", width: "15%" },
    { label: "Chapeta", accessor: "Chapeta", width: "15%" },
    { label: "Fecha", accessor: "Fecha", width: "20%" },
    { label: "Peso", accessor: "Peso", width: "15%" },
    { label: "Marca", accessor: "Marca", width: "15%" },
    { label: "Operacion", accessor: "Operacion", width: "20%" },
  ];

  const [filtros, setFiltros] = useState({});
  const [gridData, setGridData] = useState([]);
  const [hisPesajes, setHispesajes] = useState([]);
  const [fechasPesaje, setFechasPesaje] = useState([]);
  const [captions, setCaptions] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const initializeData = useCallback(() => {
    let allPesajes = dataService.getCachedData();
    if (!allPesajes) return;

    allPesajes = allPesajes.filter(
      (w) =>
        w.Codigo &&
        w.Marca &&
        w.Operacion &&
        w.Fecha &&
        w.Operacion?.toUpperCase() !== "MUERTE" 
    );
    setHispesajes(allPesajes);
    let allFechas = [...new Set(allPesajes.map((obj) => obj.Fecha.trim()))];
    allFechas.sort(function (a, b) {
      return new Date(b) - new Date(a);
    });
    allFechas.unshift(null);
    setFechasPesaje(allFechas);
    setFiltros({
      fechaControl: null,
      filtroGeneral: "",
      filtroCodigo: "",
      filtroChapeta: "",
      filtroExacto: true,
    });
    setGridData(allPesajes.slice(0, 100));
    setCaptions(
      allPesajes.length > 0
        ? `Ultimos 100 - Total: ${allPesajes.length} `
        : "No hay datos disponibles"
    );
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
    setFiltros({
      ...filtros,
      [name]: value,
    });
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
        case "exact":
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
          (filtros.filtroExacto === "exact" &&
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
    <div className="container">
      <section className="main-container">
        <label input="codigo">
          Codigo
          <input
            className="freeinput"
            style={{ display: "block" }}
            name="filtroCodigo"
            onChange={handleFilterChange}
            value={filtros.filtroCodigo ?? ""}
          />
        </label>
        <label input="chapeta">
         Chapeta
         <input
            className="freeinput"
            style={{ display: "block" }}
            name="filtroChapeta"
            onChange={handleFilterChange}
            value={filtros.filtroChapeta ?? ""}
          />
        </label>
        <label>
          Fecha Control
          <select
            style={{ display: "block", width: "120px", height: "25px" }}
            className="freeinput"
            name="fechaControl"
            onChange={handleFilterChange}
            value={filtros.fechaControl ?? ""}
          >
            {fechasPesaje.map((val) => (
              <option
                key={val}
                style={{ background: "lightgrey" }}
                value={val}
              >
                {val}
              </option>
            ))}
          </select>
        </label>
        <label input="query">
          Buscar
          <input
            className="freeinput"
            style={{ display: "block" }}
            name="filtroGeneral"
            onChange={handleFilterChange}
            value={filtros.filtroGeneral ?? ""}
          />
        </label>
        <label style={{ display: "block" }}>
          Código/Chapeta
          <select
            style={{ display: "block", width: "120px", height: "25px" }}
            name="filtroExacto"
            onChange={handleFilterChange}
            value={filtros.filtroExacto ?? ""}
          >
            <option value="exacto">Exacto</option>
            <option value="starts">Empieza con</option>
            <option value="ends">Termina con</option>
            <option value="contains">Contiene</option>
          </select>
        </label>
        <button style={{ marginTop: "15px" }} type="submit" onClick={applyFilters}>
          Ok
        </button>
        <label style={{ marginTop: "20px" }}>{captions}</label>
      </section>
      <Table caption="Pesajes" data={gridData} columns={columns}></Table>
    </div>
  );
};

export default Pesajes;