import React, { useState, useEffect, useCallback, useMemo } from "react";
import Table from "./Table";
import { filteredGData } from "./Helpers";
import { dataService } from "../services/DataService";
import "../App.css";

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    let date;
    if (dateString.includes('\\') || dateString.includes('/')) {
      // Handle MM\DD\YYYY or MM/DD/YYYY format
      const [month, day, year] = dateString.split(/[\\/]/);
      date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    return date.toISOString().split('T')[0];
  } catch {
    return dateString; // Return original if parsing fails
  }
};

const Pesajes = ({ eventEmitter }) => {
  const [filtros, setFiltros] = useState({
    fechaControl: null,
    filtroOperacion: "",
    filtroMarca: "",
    filtroCodigo: "",
    filtroChapeta: "",
    filtroExacto: "contains",
  });
  const [showComentario, setShowComentario] = useState(false); // <-- ADD new state for the checkbox
  const [gridData, setGridData] = useState([]);
  const [hisPesajes, setHispesajes] = useState([]);
  const [fechasPesaje, setFechasPesaje] = useState([]);
  const [captions, setCaptions] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dynamically build columns based on the checkbox state
  const columns = useMemo(() => {
    const baseColumns = [
      { label: "Codigo", accessor: "Codigo", width: "15%" },
      { label: "Chapeta", accessor: "Chapeta", width: "10%" },
      { label: "Marca", accessor: "Marca", width: "10%" },
      { label: "Fecha", accessor: "Fecha", width: "15%" },
      { label: "Peso", accessor: "Peso", width: "10%" },
      { label: "Operacion", accessor: "Operacion", width: "15%" },
    ];

    if (showComentario) {
      return [...baseColumns, { label: "Comentario", accessor: "Comentario", width: "25%" }];
    }

    return baseColumns;
  }, [showComentario]);

  const initializeData = useCallback(() => {
    let allPesajes = dataService.getCachedData();
    if (!allPesajes) return;

    allPesajes = allPesajes
      .filter(w => w.Codigo && w.Marca && w.Operacion && w.Fecha)
      .map(pesaje => ({
        ...pesaje,
        Fecha: formatDate(pesaje.Fecha)
      }));

    setHispesajes(allPesajes);
    let allFechas = [...new Set(allPesajes.map(obj => obj.Fecha.trim()))]
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a));
    
    allFechas.unshift(null);
    setFechasPesaje(allFechas);
    setGridData(allPesajes.slice(0, 200));
    setCaptions(
      allPesajes.length > 0
        ? `Ultimos 200 - Total: ${allPesajes.length}`
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

  // Emit table data when gridData changes (for export functionality)
  useEffect(() => {
    if (gridData.length > 0) {
      eventEmitter.emit('tableDataUpdate', {
        data: gridData,
        columns: columns,
        title: 'Pesajes'
      });
    }
  }, [gridData, eventEmitter, columns]); // <-- ADD 'columns' to dependency array

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    // Convert text inputs to uppercase
    const upperValue = (event.target.type === 'text' || event.target.tagName === 'INPUT') &&
                      event.target.type !== 'checkbox' &&
                      event.target.type !== 'radio' ?
                      value.toUpperCase() : value;
    setFiltros((prev) => ({
      ...prev,
      [name]: upperValue,
    }));
  };

  const applyFilters = useCallback(() => {
    // Helper function to apply consistent filtering logic (contains, starts, ends, exact)
    const matches = (field, filter, comparison) => {
      if (!field || !filter) return false;
      const f = field.toUpperCase();
      const v = filter.toUpperCase().trim();
      switch (comparison) {
        case "starts": return f.startsWith(v);
        case "ends": return f.endsWith(v);
        case "none": return f === v;
        case "contains":
        default: return f.includes(v);
      }
    };

    let filteredData = [...hisPesajes];

    // Apply all text filters consistently
    if (filtros.filtroCodigo.trim()) {
      filteredData = filteredData.filter(w => matches(w.Codigo, filtros.filtroCodigo, filtros.filtroExacto));
    }
    if (filtros.filtroChapeta.trim()) {
      filteredData = filteredData.filter(w => matches(w.Chapeta, filtros.filtroChapeta, filtros.filtroExacto));
    }
    if (filtros.filtroMarca.trim() && filtros.filtroMarca !== "*") {
      filteredData = filteredData.filter(w => matches(w.Marca, filtros.filtroMarca, filtros.filtroExacto));
    }
    if (filtros.filtroOperacion.trim() && filtros.filtroOperacion !== "*") {
      filteredData = filteredData.filter(w => matches(w.Operacion, filtros.filtroOperacion, filtros.filtroExacto));
    }

    // Apply date filter
    if (filtros.fechaControl && filtros.fechaControl !== "Todas") {
      filteredData = filteredData.filter(w => w.Fecha === filtros.fechaControl);
    }

    // Apply comment filter
    if (showComentario) {
      filteredData = filteredData.filter(w => w.Comentario && w.Comentario.trim() !== "");
    }

    setGridData(filteredData);
    let comment = `Total: ${filteredData.length}`;

    eventEmitter.emit('tableDataUpdate', {
      data: filteredData,
      columns: columns,
      title: 'Pesajes'
    });

    if (filteredData.length && filteredData.every(w => w.Peso > 0)) {
      const average = filteredData.reduce((acc, cur) => acc + parseInt(cur.Peso), 0) / filteredData.length;
      comment += ` Promedio: ${average.toFixed(2)}`;
    }

    setCaptions(comment);
  }, [hisPesajes, filtros, showComentario, columns, eventEmitter]);


  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <section className="filter-section pesajes-filters">
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
            <label>Marca</label>
            <input
              className="freeinputtiny"
              name="filtroMarca"
              onChange={handleFilterChange}
              value={filtros.filtroMarca}
            />
          </div>
          <div className="filter-group">
            <label>Operacion</label>
            <input
              className="freeinputsmall"
              name="filtroOperacion"
              onChange={handleFilterChange}
              value={filtros.filtroOperacion}
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
            value={filtros.filtroExacto ?? "contains"}
          >
            <option value="none">Exacto</option>
            <option value="starts">Empieza con</option>
            <option value="ends">Termina con</option>
            <option value="contains">Contiene</option>
          </select>
        </div>
        <div className="filter-group checkbox-group">
          <label>Comentario</label>
          <input
            type="checkbox"
            name="showComentario"
            checked={showComentario}
            onChange={(e) => setShowComentario(e.target.checked)}
          />
        </div>
         <button className="filter-button" onClick={applyFilters}>Ok</button>
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