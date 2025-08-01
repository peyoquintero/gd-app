import React, { useState, useEffect } from "react";
import Table from "./Table";
import { filteredGData } from "./Helpers";

const Pesajes = ({ eventEmitter }) => {
  const columns = [
    { label: "Codigo", accessor: "Codigo", width: "15%" },
    { label: "Fecha", accessor: "Fecha", width: "20%" },
    { label: "Peso", accessor: "Peso", width: "15%" },
    { label: "Marca", accessor: "Marca", width: "15%" },
    { label: "Lote", accessor: "Lote", width: "15%" },
    { label: "Operacion", accessor: "Operacion", width: "20%" },
  ];

  const [filtros, setFiltros] = useState({});
  const [gridData, setGridData] = useState([]);
  const [hisPesajes, setHispesajes] = useState([]);
  const [fechasPesaje, setFechasPesaje] = useState([]);
  const [captions, setCaptions] = useState("");

  const initializeData = () => {
    let allPesajes = JSON.parse(localStorage.getItem("spreadsheetData"));
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
      filtroExacto: true,
    });
    setGridData(allPesajes.slice(0, 100));
    setCaptions(
      allPesajes.length > 0
        ? `Ultimos 100 - Total: ${allPesajes.length} `
        : "No hay datos disponibles"
    );
  };

  useEffect(() => {
    initializeData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const refreshHandler = () => {
      initializeData();
    };
    eventEmitter.on("refresh", refreshHandler);

    return () => {
      eventEmitter.off("refresh", refreshHandler);
    };
  }, [eventEmitter]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFiltros({
      ...filtros,
      [name]: value,
    });
  };

  const handleCheckboxChange = (event) => {
    const { name } = event.target;
    setFiltros({
      ...filtros,
      [name]: event.target.checked,
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
      filteredData = filteredData.filter(
        (w) =>
          (filtros.filtroExacto &&
            w.Codigo?.toUpperCase() ===
              filtros.filtroCodigo?.trim().toUpperCase()) ||
          (!filtros.filtroExacto &&
            w.Codigo.startsWith(filtros.filtroCodigo?.trim()))
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
          Exacto
          <input
            style={{ display: "block" }}
            type="checkbox"
            id="checkboxFE"
            name="filtroExacto"
            onChange={handleCheckboxChange}
            checked={!!filtros.filtroExacto}
          />
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