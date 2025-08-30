import React, { useState, useEffect, useCallback, useMemo } from "react";
import Table from "./Table"
import {cleanData, captionCabezas,captionGanancia,captionMedia,captionUltPeso,captionDias,  ganancias, compareNumAlphas} from "./Helpers"
import { dataService } from "../services/DataService";
import "../App.css"; 

// --- START: FIX ---
// Define default dates as constants outside the component to prevent re-creation on every render.
const defaultStartDate = new Date('2020-01-01T00:00:00');
const defaultEndDate = new Date();
// --- END: FIX ---

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

const Ganancias = ({ eventEmitter }) => {
    const [filtros, setFiltros] = useState({
        filtroCodigo: "",
        filtroMarca: "",
        filtroPeso: "",
        filtroChapeta: "",
        fechaInicial:  defaultStartDate, // Use constant
        fechaFinal: defaultEndDate, // Use constant
        fiComparator: '>=', // Replaces fiExacta
        ffComparator: '<=', // Replaces ffExacta
        filtroVentas: false,
      });

    const [gridData,setGridData] = useState([])
    const [hisPesajes,setHispesajes] = useState([])
    const [fechasPesaje,setFechasPesaje] = useState([])
    const [fechasPesajeDesc,setFechasPesajeDesc] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'Codigo', direction: 'ascending' });

    // Define style objects locally to avoid global CSS conflicts.
    const styles = {
      filtersRow: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '5px', // Small gap for the top row of filters
        flexWrap: 'wrap',
        marginBottom: '10px', // Adds space between the two filter rows
      },
      dateFiltersContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2px', // REDUCED: Makes the gap between all date controls very small
        flexWrap: 'wrap',
        justifyContent: 'flex-start', // THIS IS THE FIX: Aligns all controls to the left.
      },
      dateControlPair: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '4px', // Controls the small space between a date and its comparator
      },
      checkboxGroup: {
        // This style arranges the label and checkbox into a horizontal unit
        // and then pushes the entire unit down to align with the other controls.
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '5px',
        // This paddingTop simulates the space taken up by the labels in the other
        // filter groups, pushing this group down into perfect alignment.
        paddingTop: '15px' 
      }
    };
    // --- END: LOCAL STYLING FIX ---

    const [captions,setCaptions] = useState({
        resultCabezas : "",
        resultGanancia : "",
        resultMedia : "",
        resultUltPeso : "",
        resultDias : "",
      })

    const handleSort = useCallback((key) => {
      let direction = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    }, [sortConfig]);

    // --- START: REORDERED AND FIXED LOGIC ---

    // 1. Declare columns first and memoize them to prevent re-creation on every render.
    const columns = useMemo(() => [
      { label: "Codigo", accessor: "Codigo",width:"12%" },
      { label: "Chapeta", accessor: "Chapeta",width:"12%" },
      { label: "Marca", accessor: "Marca",width:"6%" },
      { label: "F. Inicial", accessor: "FechaInicial",width:"15%" },
      { label: "F. Final", accessor: "FechaFinal",width:"15%" },
      { label: "P. Inicial", accessor: "PesoInicial",width:"13%" },
      { label: "P. Final", accessor: "PesoFinal",width:"13%" },
      { label: "Ganancia", accessor: "Ganancia",width:"12%" },
    ], []); // The empty dependency array is the key to the fix.

    // 2. Declare processedGridData, which depends on gridData and sortConfig.
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

    // 3. Now, the useEffect hook can safely access both 'processedGridData' and 'columns'.
    useEffect(() => {
      if (processedGridData) {
        eventEmitter.emit('tableDataUpdate', { 
          data: processedGridData, 
          columns, 
          title: 'Ganancias' 
        });
      }
    }, [processedGridData, columns, eventEmitter]);

    const initializeData = useCallback(() => {
        let allPesajes = dataService.getCachedData();
        if (!allPesajes) return;
        
        // Filter valid pesajes and normalize the 'Fecha' property immediately
        allPesajes = allPesajes
            .filter(w=>w.Codigo && w.Marca && w.Operacion && w.Fecha && !w.Codigo.includes("?"))
            .map(pesaje => ({ ...pesaje, Fecha: formatDate(pesaje.Fecha) }));

        // Get unique dates and sort them chronologically for the dropdowns
        const allFechasSorted = [...new Set(allPesajes.map(obj => obj.Fecha))]
            .sort((a, b) => new Date(a) - new Date(b));
        
        const fechasPesajeDesc = [...allFechasSorted].reverse();

        setHispesajes(allPesajes);
        setFechasPesaje(allFechasSorted); // Use sorted dates for FechaInicial
        setFechasPesajeDesc(fechasPesajeDesc); // Use reverse sorted for FechaFinal

        // Reset filters and set default date range from the available data
        setFiltros({
            fechaInicial: allFechasSorted[0] ?? defaultStartDate, // Use constant
            fechaFinal : fechasPesajeDesc[0] ?? defaultEndDate, // Use constant
            filtroCodigo: "",
            filtroMarca: "",
            filtroPeso: "",
            filtroChapeta: "",
            fiComparator: '>=', // Replaces fiExacta
            ffComparator: '<=', // Replaces ffExacta
            filtroVentas: false,
        });
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
        eventEmitter.on('refresh', refreshHandler);
        return () => {
            eventEmitter.off('refresh', refreshHandler);
        };
    }, [eventEmitter, loadData]);

      
      const handleFilterChange = (event) => {
        const { name, value } = event.target;
        const upperValue = (event.target.type === 'text' || event.target.tagName === 'INPUT') &&
                          event.target.type !== 'checkbox' &&
                          event.target.type !== 'radio' ?
                          value.toUpperCase() : value;
        
        // Use the functional update form to prevent infinite loops
        setFiltros(prevFiltros => ({
          ...prevFiltros,
          [name]: upperValue,
        }));
     };

   const handleFilterMarcaChange = (event) => {
      const { name, value } = event.target;
      const upperValue = value.toUpperCase();

      // Use the functional update form
      setFiltros(prevFiltros => ({
        ...prevFiltros,
        [name]: upperValue,
      }));

      const trimmedValue = upperValue.trim();

      if (trimmedValue !== "*" && trimmedValue !== "") {
        let filteredPesajes;
        if (trimmedValue.startsWith("~")) {
          const brandToExclude = trimmedValue.substring(1);
          filteredPesajes = hisPesajes.filter(w => w.Marca !== brandToExclude);
        } else {
          filteredPesajes = hisPesajes.filter(w => w.Marca === trimmedValue);
        }
        let allFechas = [...new Set(filteredPesajes.map(obj => obj.Fecha))];
        setFechasPesaje(allFechas);
      } else {
        let allFechas = [...new Set(hisPesajes.map(obj => obj.Fecha))];
        setFechasPesaje(allFechas);
      }
    };

    const handleCheckboxChange = (event) => {
      const { name, checked } = event.target;
      
      // Use the functional update form
      setFiltros(prevFiltros => ({
        ...prevFiltros,
        [name]: checked,
      }));
  
      if (name === 'filtroVentas') {
        if (checked) {
          const ventaDates = hisPesajes
            .filter(p => p.Operacion?.toUpperCase() === 'VENTA')
            .map(p => p.Fecha);
          const uniqueVentaDates = [...new Set(ventaDates)]
            .sort((a, b) => new Date(b) - new Date(a));
          setFechasPesajeDesc(uniqueVentaDates);
        } else {
          const allFechasDesc = [...new Set(hisPesajes.map(obj => obj.Fecha))]
            .sort((a, b) => new Date(b) - new Date(a));
          setFechasPesajeDesc(allFechasDesc);
        }
      }
    };
    // --- END: REFACTORED HANDLERS ---

    const applyFilters = (event) => {
  // Helper function for enhanced filtering with wildcard support
  const matchesFilter = (fieldValue, filterValue) => {
    // If filterValue is null, undefined, or an empty string, it's always a match.
    if (!filterValue || filterValue.trim() === "") {
      return true;
    }
    
    const field = (fieldValue || '').toUpperCase();
    const filter = filterValue.toUpperCase().trim();
    
    // Handle negation with '~'
    if (filter.startsWith("~")) {
      return field !== filter.substring(1);
    }

    // If no wildcards, use substring matching (contains)
    if (!filter.includes('*')) {
      return field.includes(filter);
    }
    
    // Convert wildcard pattern to regex
    const escapedFilter = filter.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = escapedFilter.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    
    return regex.test(field);
  };

  // 1. Identify and exclude any animal codes that have a 'CORRECCION' / 'MUERTE' record.
  const codigosToExclude = new Set(
    hisPesajes
      .filter(p => p.Operacion?.toUpperCase() === 'CORRECCION' || p.Operacion?.toUpperCase() === 'MUERTE')
      .map(p => p.Codigo)
  );

  let hispesajesToProcess = hisPesajes.filter(pesaje => !codigosToExclude.has(pesaje.Codigo));

  // 2. Calculate gains based on date criteria and Ventas filter ONLY.
  let gridDataResults = ganancias(
    hispesajesToProcess,
    filtros.fechaInicial,
    filtros.fiComparator,
    filtros.fechaFinal,
    filtros.ffComparator,
    filtros.filtroVentas
  );

  // 3. Apply all text and weight filters to the results from the ganancias function.
  gridDataResults = gridDataResults.filter(res => 
    matchesFilter(res.Marca, filtros.filtroMarca) &&
    matchesFilter(res.Codigo, filtros.filtroCodigo) &&
    matchesFilter(res.Chapeta, filtros.filtroChapeta)
  );
  
  // Apply peso filter separately as it has different logic
  if (filtros.filtroPeso && filtros.filtroPeso.trim() !== "" && filtros.filtroPeso !== "*") {
      const array = filtros.filtroPeso.split("-");
      if (array.length === 2 && !isNaN(parseInt(array[0])) && array[1].trim() !== "" && !isNaN(parseInt(array[1]))) {
          const minPeso = parseInt(array[0]);
          const maxPeso = parseInt(array[1]);
          gridDataResults = gridDataResults.filter(pesaje => 
              parseInt(pesaje.PesoInicial) >= minPeso && 
              parseInt(pesaje.PesoInicial) <= maxPeso
          );
      }
  }

  // Add IDs
  gridDataResults = gridDataResults.map((obj, index) => ({ ...obj, id: index }));

  // Exclude dubious data and update state
  const cleanDataRange = localStorage.getItem('cleanDataRange') || '-0100/1250';
  const [minValue, maxValue] = cleanDataRange.split('/').map(val => parseInt(val.trim()));
  let scrubbedData = cleanData(gridDataResults, minValue, maxValue);
  
  console.log(scrubbedData); 
  setGridData(scrubbedData);
  
  // Update captions
  setCaptions({
      resultGanancia: captionGanancia(scrubbedData),
      resultCabezas: captionCabezas(scrubbedData.length, gridDataResults.length),
      resultUltPeso: captionUltPeso(scrubbedData),
      resultDias: captionDias(scrubbedData),
      resultMedia: captionMedia(scrubbedData)
  });
};

   if (isLoading) {
        return <div>Cargando...</div>;
    }

 return (
  <div>
    <section className="filter-section">
      <div className="filters-row" style={styles.filtersRow}>
        <div className="filter-group">
          <label>Codigo</label>
          <input 
            className="freeinputsmall" 
            name="filtroCodigo" 
            placeholder="Codigo" 
            onChange={handleFilterChange}
            maxLength={10}
          />
        </div>
        <div className="filter-group">
          <label>Chapeta</label>
          <input 
            id="chapeta" 
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
            id="marca" 
            className="freeinputtiny" 
            name="filtroMarca" 
            onChange={handleFilterMarcaChange} 
            value={filtros.filtroMarca}
            maxLength={4}
          />
        </div>
        <div className="filter-group">
          <label>Rango Peso</label>
          <input 
            id="pesoI" 
            className="freeinputsmall" 
            name="filtroPeso" 
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group checkbox-group">
          <label>Ventas</label>
          <input type="checkbox" name="filtroVentas" onChange={handleCheckboxChange}/>
        </div>

      </div>

      <div className="date-filters" style={styles.dateFiltersContainer}>
        <div className="date-control-pair" style={styles.dateControlPair}>
            <div className="filter-group">
              <label>Fecha Inicial</label>
              <select name="fechaInicial" onChange={handleFilterChange} value={filtros.fechaInicial}>
                  {fechasPesaje.map(val => <option key={val} value={val}>{val}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>&nbsp;</label> {/* Spacer label */}
              <select
                  name="fiComparator"
                  className="date-comparator"
                  onChange={handleFilterChange}
                  value={filtros.fiComparator}
                  style={{ width: '50px', textAlign: 'center' }}
              >
                  <option value=">=">&gt;=</option>
                  <option value="=">=</option>
                  <option value="<=">&lt;=</option>
              </select>
            </div>
        </div>

        <div className="date-control-pair" style={styles.dateControlPair}>
            <div className="filter-group">
              <label>Fecha Final</label>
              <select name="fechaFinal" onChange={handleFilterChange} value={filtros.fechaFinal}>
                  {fechasPesajeDesc.map(val => <option key={val} value={val}>{val}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>&nbsp;</label> {/* Spacer label */}
              <select
                  name="ffComparator"
                  className="date-comparator"
                  onChange={handleFilterChange}
                  value={filtros.ffComparator}
                  style={{ width: '50px', textAlign: 'center' }}
              >
                  <option value="<=">&lt;=</option>
                  <option value="=">=</option>
                  <option value=">=">&gt;=</option>
              </select>
            </div>
        </div>

        <button className="filter-button" onClick={applyFilters}>Ok</button>
      </div>
    </section>

    <section className="totals">
      <label>{captions.resultCabezas}</label> 
      <label>{captions.resultGanancia}</label> 
      <label>{captions.resultMedia}</label>   
      <label>{captions.resultUltPeso}</label>
      <label>{captions.resultDias}</label> 
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
  
  export default Ganancias;