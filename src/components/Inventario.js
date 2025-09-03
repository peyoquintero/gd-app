import React, { useState, useEffect, useCallback, useMemo } from "react"; // Add useMemo
import Table from "./Table";
import { getInventario, groupByFechaOperacion } from "./HelperInventario";
import { compareNumAlphas } from "./Helpers"; 
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
  // Memoize the column definitions to prevent re-creation on every render.
  // This breaks the infinite loop caused by the useEffect that depends on them.
  const columns = useMemo(() => [
    { label: "Fecha", accessor: "Fecha", width: "20%" },
    { label: "Operacion", accessor: "Operacion", width: "25%" },
    { label: "Chapeta", accessor: "Chapeta", width: "15%" },
    { label: "Marca", accessor: "Marca", width: "10%" },
    { label: "Total", accessor: "Total", width: "15%" },
    { label: "Sacados", accessor: "Vendidos", width: "15%" },
  ], []);

  const columnsInventario = useMemo(() => [
    { label: "Codigo", accessor: "Codigo", width: "18%" },
    { label: "Marca", accessor: "Marca", width: "8%" },
    { label: "Chapeta", accessor: "Chapeta", width: "10%" },
    { label: "F.Compra", accessor: "FechaCompra", width: "16%" },
    { label: "Peso Inicial", accessor: "PesoInicial", width: "10%" },
    { label: "Ult. Control", accessor: "FechaUltimoControl", width: "16%" },
    { label: "Ultimo Peso", accessor: "PesoFinal", width: "10%" },
    { label: "PRY", accessor: "Proyeccion", width: "12%" },
  ], []);

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

  // This state will hold the filter values after the user has stopped typing.
  const [debouncedFiltros, setDebouncedFiltros] = useState(filtros);
  const [gridMovimientos, setGridMovimientos] = useState([]);
  const [gridInventario, setGridInventario] = useState([]);
  const [hisPesajes, setHisPesajes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gananciaDiaria, setGananciaDiaria] = useState(350);
  
  const [topX, setTopX] = useState(''); // State for the "Top X" input
  const [sortConfig, setSortConfig] = useState({ key: 'Codigo', direction: 'ascending' }); // State for sorting
  const [showPesoDistribution, setShowPesoDistribution] = useState(false); // State for the popup
  const [unidentifiedSalidasCount, setUnidentifiedSalesCount] = useState(0); // State for sales with '?' in Codigo
  const [correccionCount, setCorreccionCount] = useState(0); // State for CORRECCION operations

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

  const handleSort = useCallback((key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // This hook creates the final data to be displayed in the table.
  // It runs only when the underlying data, sort config, or topX value changes.
  const processedGridData = useMemo(() => {
    let sortedData = [...gridInventario];

    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        // Use a smart sort function that handles numbers and text
        const comparison = compareNumAlphas(String(aVal), String(bVal));
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }

    // Apply the "Top X" slice AFTER sorting
    const topXValue = parseInt(topX, 10);
    if (!isNaN(topXValue) && topXValue > 0) {
      return sortedData.slice(0, topXValue);
    }

    return sortedData;
  }, [gridInventario, sortConfig, topX]);

  // This hook calculates the weight distribution for the popup.
  // It uses gridInventario to reflect the filtered data before the "Top X" slice.
  const pesoDistribution = useMemo(() => {
    if (!gridInventario.length) return [];

    const distribution = gridInventario.reduce((acc, animal) => {
      const peso = parseInt(animal.Proyeccion, 10); // Changed from PesoFinal
      if (isNaN(peso)) return acc;

      // Group by 25kg slots
      const slot = Math.floor(peso / 25) * 25;
      acc[slot] = (acc[slot] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution)
      .map(([slot, count]) => ({
        // Create the range string for 25kg slots
        range: `${slot} - ${parseInt(slot, 10) + 24} kg`,
        count,
      }))
      .sort((a, b) => parseInt(a.range) - parseInt(b.range));
  }, [gridInventario]);

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

    const marcaFilterValue = debouncedFiltros.filtroMarca?.trim();
    if (marcaFilterValue) {
      // Check if the filter is a comma-separated list
      if (marcaFilterValue.includes(',')) {
        const marcas = marcaFilterValue.split(',').map(m => m.trim().toUpperCase()).filter(m => m);
        if (marcas.length > 0) {
          filteredData = filteredData.filter(w => w.Marca && marcas.includes(w.Marca.toUpperCase()));
        }
      } else {
        // Fallback to single value filtering (supports wildcards)
        filteredData = filteredData.filter(w => matchesFilter(w.Marca, marcaFilterValue));
      }
    }

    if (debouncedFiltros.filtroChapeta?.length > 1) {
      filteredData = filteredData.filter(w => matchesFilter(w.Chapeta, debouncedFiltros.filtroChapeta));
    }

    // --- START: MINIMAL CHANGE ---
    // From the already-filtered data, count sales and deaths where Codigo is unknown ('?').
    // This count is then used in the totalsCaption.
    const unidentifiedOperations = ['VENTA', 'MUERTE'];
    const unidentifiedExits = filteredData.filter(p =>
      unidentifiedOperations.includes(p.Operacion?.toUpperCase()) &&
      p.Codigo?.includes('?')
    );
    setUnidentifiedSalesCount(unidentifiedExits.length);
    
    // Count CORRECCION operations from the same filtered data.
    const correcciones = filteredData.filter(p =>
      p.Operacion?.toUpperCase() === 'CORRECCION'
    );
    setCorreccionCount(correcciones.length);
    // --- END: MINIMAL CHANGE ---

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
            const proyeccion = parseInt(item.Proyeccion, 10); // Changed from PesoFinal
            return proyeccion >= minPeso && proyeccion <= maxPeso;
          });
        }
      }

      // IMPORTANT: We set the FULL unfiltered inventory here.
      // The sorting and slicing will happen later.
      setGridInventario(inventario);

    }
  }, [debouncedFiltros, gananciaDiaria]); // Dependencies updated

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

  const totalsCaption = useMemo(() => {
    if (debouncedFiltros.selectedOption === "movimientos") {
      return `Movimientos: ${gridMovimientos.length}`;
    }
    
    const data = processedGridData;
    let caption = `Total: ${data.length}`;

    if (data.length > 0) {
      const totalProjection = data.reduce((acc, item) => {
        const projectionValue = parseInt(item.Proyeccion, 10);
        return acc + (isNaN(projectionValue) ? 0 : projectionValue);
      }, 0);
      const avgProj = Math.round(totalProjection / data.length);
      caption += `, Prom PRY: ${avgProj}`;
    }

    // Append the count of unidentified exits if there are any
    if (unidentifiedSalidasCount > 0) {
      caption += ` (Salidas s/ID: ${unidentifiedSalidasCount})`;
    }

    // Append the count of corrections if there are any
    if (correccionCount > 0) {
      caption += ` (Correcciones: ${correccionCount})`;
    }
    
    return caption;
  }, [debouncedFiltros.selectedOption, gridMovimientos, processedGridData, unidentifiedSalidasCount, correccionCount]);

  // This effect ensures the exported data always matches the data on screen for either view.
  useEffect(() => {
    if (debouncedFiltros.selectedOption === "movimientos") {
      eventEmitter.emit('tableDataUpdate', {
        data: gridMovimientos,
        columns: columns,
        title: 'Inventario - Movimientos'
      });
    } else {
      eventEmitter.emit('tableDataUpdate', {
        data: processedGridData,
        columns: columnsInventario,
        title: 'Inventario - Actual'
      });
    }
  }, [debouncedFiltros.selectedOption, gridMovimientos, processedGridData, columns, columnsInventario, eventEmitter]);

  useEffect(() => {
    const refreshHandler = () => {
      loadData();
    };
    // Listen for the correct event name: 'dataRefreshed'
    eventEmitter.on("dataRefreshed", refreshHandler);
    return () => {
      // Make sure to clean up the correct event name as well
      eventEmitter.off("dataRefreshed", refreshHandler);
    };
  }, [eventEmitter, loadData]);

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
            <label>Marcas</label>
            <input
              className="freeinputsmall"
              name="filtroMarca"
              onChange={handleFilterChange}
              value={filtros.filtroMarca}
              maxLength={15}
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
          <label>Rango PRY</label>
          <input
            className="freeinputsmall"
            name="filtroPeso"
            onChange={handleFilterChange}
            value={filtros.filtroPeso}
          />
        </div>
        <div className="filter-group">
          <label>Top</label>
          <input
            type="number"
            value={topX}
            onChange={(e) => setTopX(e.target.value)}
            style={{ width: '60px' }}
            placeholder="N°"
          />
        </div>
        </div>
      </section>
      <section className="totals">
        <label>
          {totalsCaption}
        </label>
        <button onClick={() => setShowPesoDistribution(!showPesoDistribution)} style={{ marginLeft: '15px', minHeight:'15px',minWidth:'80px' }}>
          {showPesoDistribution ? 'x' : 'Distribución'}
        </button>
      </section>
      {showPesoDistribution && (
        <section className="table-container" style={{ marginBottom: '20px' }}>
          <h2>Distribución por Proyección</h2>
          <table>
            <thead>
              <tr>
                <th>Rango de Peso</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {pesoDistribution.map(item => (
                <tr key={item.range}>
                  <td>{item.range}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="table-container">
        {debouncedFiltros.selectedOption === "movimientos" ? (
          <Table data={gridMovimientos} columns={columns} onSort={() => {}} />
        ) : (
          <Table 
            data={processedGridData} // Use the final processed data here
            columns={columnsInventario} 
            onSort={handleSort} // Pass the sort handler function
            sortConfig={sortConfig} // Pass the current sort configuration
          />
        )}
      </section>
    </div>
  );
};

export default Inventario;