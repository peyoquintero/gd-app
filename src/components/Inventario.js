import React, { useState, useEffect, useCallback } from "react";
import Table from "./Table";
import { getInventario, groupByFechaOperacion } from "./HelperInventario";
import { dataService } from "../services/DataService";
import "../App.css"; 

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    return date.toISOString().split('T')[0];
  } catch {
    return dateString; // Return original if parsing fails
  }
};

const Inventario = ({ eventEmitter }) => {
  const columns = [
    { label: "Fecha", accessor: "Fecha", width: "20%" },
    { label: "Operacion", accessor: "Operacion", width: "25%" },
    { label: "Chapeta", accessor: "Chapeta", width: "15%" },
    { label: "Marca", accessor: "Marca", width: "10%" },
    { label: "Total", accessor: "Total", width: "15%" },
    { label: "Sacados", accessor: "Vendidos", width: "15%" },
  ];

  const columnsInventario = [
    { label: "Codigo", accessor: "Codigo", width: "18%" },
    { label: "Marca", accessor: "Marca", width: "8%" },
    { label: "Chapeta", accessor: "Chapeta", width: "10%" },
    { label: "F.Compra", accessor: "FechaCompra", width: "16%" },
    { label: "Peso Inicial", accessor: "PesoInicial", width: "10%" },
    { label: "Ult. Control", accessor: "FechaUltimoControl", width: "16%" },
    { label: "Ultimo Peso", accessor: "PesoFinal", width: "10%" },
    { label: "PRY", accessor: "Proyeccion", width: "12%" },
  ];

  const [filtros, setFiltros] = useState({
    filtroMarca: "",
    filtroExacto: false,
    selectedOption: "cabezas",
    projectionDate: new Date().toISOString().split("T")[0],
  });
  const [gridMovimientos, setGridMovimientos] = useState([]);
  const [gridInventario, setGridInventario] = useState([]);
  const [hisPesajes, setHisPesajes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gananciaDiaria, setGananciaDiaria] = useState(350); // New state for daily gain


  const handleChange = useCallback((event) => {
    setFiltros((prev) => ({ ...prev, selectedOption: event.target.value }));
  }, []);

  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({ ...prev, [name]: value.toUpperCase() }));
  }, []);

  const refreshData = useCallback((allPesajes) => {
    if (!allPesajes?.length) return;

    let filteredData = allPesajes.map(pesaje => ({
      ...pesaje,
      Fecha: formatDate(pesaje.Fecha),
      FechaCompra: formatDate(pesaje.FechaCompra),
      FechaUltimoControl: formatDate(pesaje.FechaUltimoControl)
    }));

    const matchesFilter = (fieldValue, filterValue) => {
      if (!filterValue) return true;
      
      const field = (fieldValue || '').toUpperCase();
      const filter = filterValue.toUpperCase();
      
      // If no wildcards, use substring matching (contains)
      if (!filter.includes('*')) {
        return field.includes(filter);
      }
      
      // Convert wildcard pattern to regex
      // Escape special regex characters except *
      const escapedFilter = filter.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      // Replace * with .* (match any characters)
      const regexPattern = escapedFilter.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      
      return regex.test(field);
    };

    if (filtros.filtroCodigo?.length > 0) {
      filteredData = filteredData.filter(w => matchesFilter(w.Codigo, filtros.filtroCodigo));
    }
    if (filtros.filtroMarca?.length > 1) {
      filteredData = filteredData.filter(w => matchesFilter(w.Marca, filtros.filtroMarca));
    }
    if (filtros.filtroChapeta?.length > 1) {
      filteredData = filteredData.filter(w => matchesFilter(w.Chapeta, filtros.filtroChapeta));
    }

    let movimientos = filteredData
      .filter((w) => w.Operacion?.toUpperCase() !== "CONTROL" )
      .sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

    if (movimientos?.length) {
      let movimientosByFecha = groupByFechaOperacion(movimientos);
      setGridMovimientos(movimientosByFecha);

      // Pass projection date into getInventario
      const inventario = getInventario(filteredData, filtros.projectionDate,gananciaDiaria);
      setGridInventario(inventario);

      // Emit table data for export functionality based on selected option
      if (filtros.selectedOption === "movimientos") {
        eventEmitter.emit('tableDataUpdate', {
          data: movimientosByFecha,
          columns: columns,
          title: 'Inventario - Movimientos'
        });
      } else {
        eventEmitter.emit('tableDataUpdate', {
          data: inventario,
          columns: columnsInventario,
          title: 'Inventario - Actual'
        });
      }
    }
  }, [filtros,gananciaDiaria]);

    const handleGananciaChange = (e) => {
    const value = e.target.value;
    // Enforce max 3 digits
    if (value.length <= 3 && !value.includes('.')) {
      setGananciaDiaria(value);
    }
  };


  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = dataService.getCachedData();
      if (data) {
        refreshData(data);
        setHisPesajes(data);
        console.log(data);
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

  // Emit table data when selected option changes
  useEffect(() => {
    if (filtros.selectedOption === "movimientos" && gridMovimientos.length > 0) {
      eventEmitter.emit('tableDataUpdate', {
        data: gridMovimientos,
        columns: columns,
        title: 'Inventario - Movimientos'
      });
    } else if (filtros.selectedOption === "cabezas" && gridInventario.length > 0) {
      eventEmitter.emit('tableDataUpdate', {
        data: gridInventario,
        columns: columnsInventario,
        title: 'Inventario - Actual'
      });
    }
  }, [filtros.selectedOption, gridMovimientos, gridInventario, eventEmitter]);

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div>
      <section className="filter-section">
        <div className="filters-row">
          <div className="filter-group radio-filter-group">
            <label>Vista</label>
            <div className="radio-container-compact" onChange={handleChange}>
              <label className="radio-label-compact">
                <input
                  type="radio"
                  name="details"
                  value="cabezas"
                  checked={filtros.selectedOption === "cabezas"}
                />
                Inventario
              </label>
              <label className="radio-label-compact">
                <input
                  type="radio"
                  name="details"
                  value="movimientos"
                  checked={filtros.selectedOption === "movimientos"}
                />
                Movimientos
              </label>
            </div>
          </div>
          <div className="filter-group">
            <label>Codigo</label>
            <input
              className="freeinputsmall"
              name="filtroCodigo"
              onChange={handleFilterChange}
              value={filtros.filtroCodigo}
              maxLength={10}
            />
          </div>
          <div className="filter-group">
            <label>Chapeta</label>
            <input
              className="freeinputsmall"
              name="filtroChapeta"
              onChange={handleFilterChange}
              value={filtros.filtroChapeta}
              maxLength={10}
            />
          </div>
          <div className="filter-group">          
            <label>Marca</label>
            <input
              className="freeinputtiny"
              name="filtroMarca"
              onChange={handleFilterChange}
              value={filtros.filtroMarca}
              maxLength={3}
            />
          </div>
          <div className="filter-group">
            <label>Fecha Proyección</label>
            <input
              type="date"
              name="projectionDate"
              value={filtros.projectionDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>G. Dia (grs)</label>
            <input
              type="number"
              value={gananciaDiaria}
              onChange={handleGananciaChange}
              style={{ width: '70px', textAlign: 'right' }}
            />
          </div>
        </div>
      </section>

      <section className="totals">
        <label>
          {filtros.selectedOption === "movimientos"
            ? `Movimientos: ${gridMovimientos.length}`
            : `Total Inventario: ${gridInventario.length}`}
        </label>
      </section>

      <section className="table-container">
        {filtros.selectedOption === "movimientos" ? (
          <Table data={gridMovimientos} columns={columns} />
        ) : (
          <Table data={gridInventario} columns={columnsInventario} />
        )}
      </section>
    </div>
  );
};

export default Inventario;