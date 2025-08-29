import React, { useState, useEffect, useMemo, useCallback } from "react";
import Table from "./Table";
import { dataService } from "../services/DataService";
import { compareNumAlphas } from "./Helpers"; // Assuming this helper is available
import "../App.css";

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
};

const Pesajes = ({ eventEmitter }) => {
  const [hisPesajes, setHisPesajes] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [fechasPesaje, setFechasPesaje] = useState([]);
  const [showComentario, setShowComentario] = useState(false);
  const [captions, setCaptions] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State for immediate input changes
  const [filtros, setFiltros] = useState({
    fechaControl: null,
    filtroOperacion: "",
    filtroMarca: "",
    filtroCodigo: "",
    filtroChapeta: "",
    filtroExacto: "contains",
  });

  // State for debounced filters and sorting
  const [debouncedFiltros, setDebouncedFiltros] = useState(filtros);
  const [sortConfig, setSortConfig] = useState({ key: 'Fecha', direction: 'descending' });

  // Local styles for responsive filter layout
  const styles = {
    filtersRow: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '5px',
      flexWrap: 'wrap',
    },
  };

  // Debounce filter inputs to improve performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFiltros(filtros);
    }, 500);
    return () => clearTimeout(handler);
  }, [filtros]);

  // Memoized columns definition
  const columns = useMemo(() => {
    const baseColumns = [
      { label: "Fecha", accessor: "Fecha", width: "15%" },
      { label: "Codigo", accessor: "Codigo", width: "15%" },
      { label: "Chapeta", accessor: "Chapeta", width: "15%" },
      { label: "Marca", accessor: "Marca", width: "10%" },
      { label: "Operacion", accessor: "Operacion", width: "15%" },
      { label: "Peso", accessor: "Peso", width: "10%" },
    ];
    if (showComentario) {
      baseColumns.push({ label: "Comentario", accessor: "Comentario", width: "20%" });
    }
    return baseColumns;
  }, [showComentario]);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    const upperValue = type === 'text' ? value.toUpperCase() : value;

    if (type === 'checkbox' && name === 'showComentario') {
      setShowComentario(checked);
      return;
    }

    setFiltros((prev) => ({ ...prev, [name]: upperValue }));

    if (name === 'filtroOperacion') {
      const targetOperations = ['COMPRA', 'CONTROL', 'VENTA', 'CORRECCION', 'MUERTE'];
      const trimmedValue = upperValue.trim();
      let relevantPesajes = hisPesajes;

      if (targetOperations.includes(trimmedValue)) {
        relevantPesajes = hisPesajes.filter(p => p.Operacion?.toUpperCase() === trimmedValue);
      }
      
      let allFechas = [...new Set(relevantPesajes.map(obj => obj.Fecha.trim()))]
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a));
      
      allFechas.unshift(null);
      setFechasPesaje(allFechas);
    }

    // When the 'filtroMarca' input changes, update the available dates.
    if (name === 'filtroMarca') {
      const trimmedValue = upperValue.trim();
      let relevantPesajes = hisPesajes;

      // If the brand filter has a value, filter the data.
      if (trimmedValue) {
        relevantPesajes = hisPesajes.filter(p => p.Marca?.toUpperCase() === trimmedValue);
      }
      
      // Get unique dates from the (potentially filtered) list of pesajes.
      let allFechas = [...new Set(relevantPesajes.map(obj => obj.Fecha.trim()))]
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a));
      
      allFechas.unshift(null); // Add the "Todas" option to the top.
      setFechasPesaje(allFechas);
    }
  };

  const applyFilters = useCallback(() => {
    // --- START: NEW LOGIC ---
    // Check if any filter has a value.
    const hasActiveFilter = 
      (debouncedFiltros.filtroCodigo && debouncedFiltros.filtroCodigo.trim() !== "") ||
      (debouncedFiltros.filtroChapeta && debouncedFiltros.filtroChapeta.trim() !== "") ||
      (debouncedFiltros.filtroMarca && debouncedFiltros.filtroMarca.trim() !== "") ||
      (debouncedFiltros.filtroOperacion && debouncedFiltros.filtroOperacion.trim() !== "") ||
      debouncedFiltros.fechaControl ||
      showComentario;

    // If no filters are active, clear the grid and captions, then exit.
    if (!hasActiveFilter) {
      setGridData([]);
      setCaptions("Establezca un filtro para ver los resultados.");
      eventEmitter.emit('tableDataUpdate', { data: [], columns, title: 'Pesajes' });
      return;
    }
    // --- END: NEW LOGIC ---

    const matches = (field, filter, comparison) => {
      if (!field || !filter) return false;
      const f = String(field).toUpperCase();
      const v = String(filter).toUpperCase().trim();
      switch (comparison) {
        case "starts": return f.startsWith(v);
        case "ends": return f.endsWith(v);
        case "none": return f === v;
        case "contains": default: return f.includes(v);
      }
    };

    let filteredData = [...hisPesajes];

    if (debouncedFiltros.filtroCodigo.trim()) {
      filteredData = filteredData.filter(w => matches(w.Codigo, debouncedFiltros.filtroCodigo, debouncedFiltros.filtroExacto));
    }
    if (debouncedFiltros.filtroChapeta.trim()) {
      filteredData = filteredData.filter(w => matches(w.Chapeta, debouncedFiltros.filtroChapeta, debouncedFiltros.filtroExacto));
    }
    if (debouncedFiltros.filtroMarca.trim()) {
      filteredData = filteredData.filter(w => matches(w.Marca, debouncedFiltros.filtroMarca, debouncedFiltros.filtroExacto));
    }
    if (debouncedFiltros.filtroOperacion.trim()) {
      filteredData = filteredData.filter(w => matches(w.Operacion, debouncedFiltros.filtroOperacion, debouncedFiltros.filtroExacto));
    }
    if (debouncedFiltros.fechaControl) {
      filteredData = filteredData.filter(w => w.Fecha === debouncedFiltros.fechaControl);
    }
    if (showComentario) {
      filteredData = filteredData.filter(w => w.Comentario && w.Comentario.trim() !== "");
    }

    setGridData(filteredData);
    let comment = `Total: ${filteredData.length}`;
    if (filteredData.length > 0 && filteredData.every(w => w.Peso > 0)) {
      const average = filteredData.reduce((acc, cur) => acc + parseInt(cur.Peso), 0) / filteredData.length;
      comment += ` Promedio: ${average.toFixed(2)}`;
    }
    setCaptions(comment);

    // REMOVE THE LINE BELOW
    // eventEmitter.emit('tableDataUpdate', { data: filteredData, columns, title: 'Pesajes' });
  }, [hisPesajes, debouncedFiltros, showComentario]); // Dependencies updated

  const handleSort = useCallback((key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const processedGridData = useMemo(() => {
    let sortedData = [...gridData];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const comparison = compareNumAlphas(String(aVal), String(bVal));
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortedData;
  }, [gridData, sortConfig]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const allPesajes = dataService.getCachedData().map(p => ({ ...p, Fecha: formatDate(p.Fecha) }));
      setHisPesajes(allPesajes);
      let allFechas = [...new Set(allPesajes.map(obj => obj.Fecha.trim()))]
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a));
      allFechas.unshift(null);
      setFechasPesaje(allFechas);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    applyFilters();
  }, [debouncedFiltros, showComentario, applyFilters]);

  // --- START: NEW EXPORT LOGIC ---
  // This effect ensures the exported data always matches the sorted/processed data on screen.
  useEffect(() => {
    if (processedGridData) {
      eventEmitter.emit('tableDataUpdate', { 
        data: processedGridData, 
        columns, 
        title: 'Pesajes' 
      });
    }
  }, [processedGridData, columns, eventEmitter]);
  // --- END: NEW EXPORT LOGIC ---

  useEffect(() => {
    const refreshHandler = () => loadData();
    eventEmitter.on("refresh", refreshHandler);
    return () => eventEmitter.off("refresh", refreshHandler);
  }, [eventEmitter, loadData]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <section className="filter-section pesajes-filters">
        <div className="filters-row" style={styles.filtersRow}>
          <div className="filter-group">
            <label>Codigo</label>
            <input className="freeinputsmall" name="filtroCodigo" onChange={handleFilterChange} value={filtros.filtroCodigo} />
          </div>
          <div className="filter-group">
            <label>Chapeta</label>
            <input className="freeinputsmall" name="filtroChapeta" onChange={handleFilterChange} value={filtros.filtroChapeta} />
          </div>
          <div className="filter-group">
            <label>Marca</label>
            <input className="freeinputtiny" name="filtroMarca" onChange={handleFilterChange} value={filtros.filtroMarca} />
          </div>
          {/* --- START: REFACTORED INPUT --- */}
          <div className="filter-group">
            <label>Operacion</label>
            <input
              className="freeinputsmall"
              name="filtroOperacion"
              onChange={handleFilterChange}
              value={filtros.filtroOperacion}
              list="operacion-options"
            />
            <datalist id="operacion-options">
              <option value="COMPRA" />
              <option value="CONTROL" />
              <option value="VENTA" />
              <option value="MUERTE" />
              <option value="CORRECCION" />
            </datalist>
          </div>
          {/* --- END: REFACTORED INPUT --- */}
          <div className="filter-group">
            <label>Fecha</label>
            <select name="fechaControl" onChange={handleFilterChange} value={filtros.fechaControl || ""}>
              {fechasPesaje.map((fecha) => (
                <option key={fecha || 'all'} value={fecha || ""}>
                  {fecha || "Todas"}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Comparación</label>
            <select name="filtroExacto" onChange={handleFilterChange} value={filtros.filtroExacto ?? "contains"}>
              <option value="none">Exacto</option>
              <option value="starts">Empieza con</option>
              <option value="ends">Termina con</option>
              <option value="contains">Contiene</option>
            </select>
          </div>
          <div className="filter-group checkbox-group">
            <label>Comentario</label>
            <input type="checkbox" name="showComentario" checked={showComentario} onChange={handleFilterChange} />
          </div>
        </div>
      </section>

      <section className="totals">
        <label>{captions}</label>
      </section>

      <section className="table-container">
        <Table 
          data={processedGridData} 
          columns={columns} 
          onSort={handleSort}
          sortConfig={sortConfig}
        />
      </section>
    </div>
  );
};

export default Pesajes;