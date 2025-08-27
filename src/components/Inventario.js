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

  // State for immediate input changes
  const [filtros, setFiltros] = useState({
    filtroMarca: "",
    filtroExacto: false,
    selectedOption: "cabezas",
    projectionDate: new Date().toISOString().split("T")[0],
    filtroPeso: "",
    filtroCodigo: "",
    filtroChapeta: ""
  });

  // --- START: LOCAL STYLING FIX ---
  // Define style objects locally to avoid global CSS conflicts.
  const styles = {
    filtersRow: {
      display: 'flex',
      alignItems: 'flex-end', // Aligns all filter groups to their bottom edge
      gap: '5px',            // Sets a gap between controls, both horizontally and vertically
      flexWrap: 'wrap',      // THIS IS THE FIX: Allows controls to wrap onto new lines on smaller screens
    },
    radioContainer: {
      display: 'flex',
      flexDirection: 'column', // Stacks the radio buttons vertically
      paddingBottom: '3px',    // Fine-tunes vertical alignment with other inputs
    },
  };
  // --- END: LOCAL STYLING FIX ---

  // This state will hold the filter values after the user has stopped typing.
  const [debouncedFiltros, setDebouncedFiltros] = useState(filtros);
  const [gridMovimientos, setGridMovimientos] = useState([]);
  const [gridInventario, setGridInventario] = useState([]);
  const [avgProjection, setAvgProjection] = useState(0);
  const [hisPesajes, setHisPesajes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gananciaDiaria, setGananciaDiaria] = useState(350);

  // This effect debounces the filter inputs.
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFiltros(filtros);
    }, 500); // Wait 500ms after the user stops typing

    return () => {
      clearTimeout(handler); // Reset the timer if the user types again
    };
  }, [filtros]);

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
      if (!filter.includes('*')) {
        return field.includes(filter);
      }
      const escapedFilter = filter.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      const regexPattern = escapedFilter.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(field);
    };

    // Use the debounced filters for all filtering logic
    if (debouncedFiltros.filtroCodigo?.length > 0) {
      filteredData = filteredData.filter(w => matchesFilter(w.Codigo, debouncedFiltros.filtroCodigo));
    }
    if (debouncedFiltros.filtroMarca?.length > 1) {
      filteredData = filteredData.filter(w => matchesFilter(w.Marca, debouncedFiltros.filtroMarca));
    }
    if (debouncedFiltros.filtroChapeta?.length > 1) {
      filteredData = filteredData.filter(w => matchesFilter(w.Chapeta, debouncedFiltros.filtroChapeta));
    }

    let movimientos = filteredData
      .filter((w) => w.Operacion?.toUpperCase() !== "CONTROL" )
      .sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

    if (movimientos?.length) {
      let movimientosByFecha = groupByFechaOperacion(movimientos);
      setGridMovimientos(movimientosByFecha);

      let inventario = getInventario(filteredData, debouncedFiltros.projectionDate, gananciaDiaria);

      const pesoFilter = debouncedFiltros.filtroPeso.trim();
      if (pesoFilter && pesoFilter !== "*") {
        const array = pesoFilter.split("-");
        // Only filter if we have a valid range with two numbers
        if (array.length === 2 && !isNaN(parseInt(array[0])) && array[1].trim() !== "" && !isNaN(parseInt(array[1]))) {
          const minPeso = parseInt(array[0]);
          const maxPeso = parseInt(array[1]);
          inventario = inventario.filter(item => {
            const ultimoPeso = parseInt(item.PesoFinal); // Use PesoFinal as per columnsInventario
            return ultimoPeso >= minPeso && ultimoPeso <= maxPeso;
          });
        }
      }

      setGridInventario(inventario);

      // Calculate and set the average projection
      if (inventario.length > 0) {
        const totalProjection = inventario.reduce((acc, item) => {
          const projectionValue = parseInt(item.Proyeccion, 10);
          return acc + (isNaN(projectionValue) ? 0 : projectionValue);
        }, 0);
        setAvgProjection(Math.round(totalProjection / inventario.length));
      } else {
        setAvgProjection(0);
      }

      if (debouncedFiltros.selectedOption === "movimientos") {
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
  }, [debouncedFiltros, gananciaDiaria, eventEmitter]);

  const handleGananciaChange = (e) => {
    const value = e.target.value;
    if (value.length <= 3 && !value.includes('.')) {
      setGananciaDiaria(value);
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = dataService.getCachedData();
      if (data) {
        setHisPesajes(data);
      }
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

  useEffect(() => {
    if (debouncedFiltros.selectedOption === "movimientos" && gridMovimientos.length > 0) {
      eventEmitter.emit('tableDataUpdate', {
        data: gridMovimientos,
        columns: columns,
        title: 'Inventario - Movimientos'
      });
    } else if (debouncedFiltros.selectedOption === "cabezas" && gridInventario.length > 0) {
      eventEmitter.emit('tableDataUpdate', {
        data: gridInventario,
        columns: columnsInventario,
        title: 'Inventario - Actual'
      });
    }
  }, [debouncedFiltros.selectedOption, gridMovimientos, gridInventario, eventEmitter, columns, columnsInventario]);

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div>
      {/* Apply the local styles using the 'style' prop */}
      <section className="filter-section">
        <div className="filters-row" style={styles.filtersRow}>
          <div className="filter-group radio-filter-group">
            <label>Vista</label>
            <div className="radio-container-compact" style={styles.radioContainer} onChange={handleChange}>
              <label className="radio-label-compact">
                <input
                  type="radio"
                  name="details"
                  value="cabezas"
                  checked={filtros.selectedOption === "cabezas"}
                  readOnly
                />
                Inventario
              </label>
              <label className="radio-label-compact">
                <input
                  type="radio"
                  name="details"
                  value="movimientos"
                  checked={filtros.selectedOption === "movimientos"}
                  readOnly
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
            <label>F. Proyección</label>
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
         <div className="filter-group">
          <label>Rango Peso</label>
          <input
            className="freeinputsmall"
            name="filtroPeso"
            onChange={handleFilterChange}
            value={filtros.filtroPeso}
          />
        </div>
        </div>
      </section>

      <section className="totals">
        <label>
          {debouncedFiltros.selectedOption === "movimientos"
            ? `Movimientos: ${gridMovimientos.length}`
            : `Total: ${gridInventario.length}, Prom PRY: ${avgProjection}`}
        </label>
      </section>

      <section className="table-container">
        {debouncedFiltros.selectedOption === "movimientos" ? (
          <Table data={gridMovimientos} columns={columns} />
        ) : (
          <Table data={gridInventario} columns={columnsInventario} />
        )}
      </section>
    </div>
  );
};

export default Inventario;