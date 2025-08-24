import React, { useState, useEffect, useCallback } from "react";
import Table from "./Table"
import {cleanData, captionCabezas,captionGanancia,captionMedia,captionUltPeso,captionDias,  ganancias} from "./Helpers"
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

const Ganancias = ({ eventEmitter }) => {
    const [filtros, setFiltros] = useState({
        filtroCodigo: "",
        filtroMarca: "",
        filtroPeso: "",
        filtroChapeta: "",
        fechaInicial:  new Date('2020-01-01T00:00:00'),
        fechaFinal: new Date(),
        fiComparator: '>=', // Replaces fiExacta
        ffComparator: '<=', // Replaces ffExacta
        filtroVentas: false,
      });

    const [gridData,setGridData] = useState([])
    const [hisPesajes,setHispesajes] = useState([])
    const [fechasPesaje,setFechasPesaje] = useState([])
    const [fechasPesajeDesc,setFechasPesajeDesc] = useState([])
    const [isLoading, setIsLoading] = useState(false);

    const [captions,setCaptions] = useState({
        resultCabezas : "",
        resultGanancia : "",
        resultMedia : "",
        resultUltPeso : "",
        resultDias : "",
      })

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
            fechaInicial: allFechasSorted[0] ?? new Date('2020-01-01T00:00:00'),
            fechaFinal : fechasPesajeDesc[0] ?? new Date(),
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
        // Convert text inputs to uppercase
        const upperValue = (event.target.type === 'text' || event.target.tagName === 'INPUT') &&
                          event.target.type !== 'checkbox' &&
                          event.target.type !== 'radio' ?
                          value.toUpperCase() : value;
        setFiltros({
          ...filtros,
          [name]: upperValue,
        });
     };

   const handleFilterMarcaChange = (event) => {
      const { name, value } = event.target;
      const upperValue = value.toUpperCase();
      setFiltros({
        ...filtros,
        [name]: upperValue,
      });
      if (upperValue!=="*" && upperValue.trim()!=="")
      {
      let allFechas = [...new Set(hisPesajes.filter(w=>w.Marca===upperValue.trim()).map(obj => obj.Fecha))];
      setFechasPesaje(allFechas);
    }
    else{
      let allFechas = [...new Set(hisPesajes.map(obj => obj.Fecha))];
      setFechasPesaje(allFechas);
    }
    };

    const handleCheckboxChange = (event) => {
        const { name } = event.target;
        setFiltros({
          ...filtros,
          [name]: event.target.checked,
        });
      };

    const applyFilters = (event) => {
  // Helper function for enhanced filtering with wildcard support
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

  // Start with fresh data each time
  let hispesajesFiltered = [...hisPesajes].filter(pesaje => 
    !['CORRECCION', 'MUERTE'].includes(pesaje.Operacion?.toUpperCase())
  );

  // Apply marca filter with enhanced logic
  if (filtros.filtroMarca.startsWith("~")) {
    hispesajesFiltered = hispesajesFiltered.filter(pesaje => 
      pesaje.Marca !== filtros.filtroMarca.trim().substring(1)
    );
  } else if (filtros.filtroMarca !== "*" && filtros.filtroMarca.trim() !== "") {
    hispesajesFiltered = hispesajesFiltered.filter(pesaje => 
      matchesFilter(pesaje.Marca, filtros.filtroMarca.trim())
    );
  }

  // Apply codigo filter with enhanced logic
  if (filtros.filtroCodigo.trim() !== "") {
    hispesajesFiltered = hispesajesFiltered.filter(pesaje => 
      matchesFilter(pesaje.Codigo, filtros.filtroCodigo.trim())
    );
  }

  // Apply chapeta filter with enhanced logic
  if (filtros.filtroChapeta.trim() !== "") {
    hispesajesFiltered = hispesajesFiltered.filter(pesaje => 
      matchesFilter(pesaje.Chapeta, filtros.filtroChapeta.trim())
    );
  }

  // Calculate ganancias with filtered data
  let gridDataResults = ganancias(
    hispesajesFiltered,
    filtros.fechaInicial,
    filtros.fiComparator, // Pass the new comparator
    filtros.fechaFinal,
    filtros.ffComparator, // Pass the new comparator
    filtros.filtroVentas
  );

  // Add IDs
  gridDataResults = gridDataResults.map((obj, index) => ({ ...obj, id: index }));

  // Apply peso filter if needed
  if (filtros.filtroPeso !== "*" && filtros.filtroPeso.trim() !== "") {
      const array = filtros.filtroPeso.split("-");
      if (array.length === 2) {
          gridDataResults = gridDataResults.filter(pesaje => 
              parseInt(pesaje.PesoInicial) >= parseInt(array[0]) && 
              parseInt(pesaje.PesoInicial) <= parseInt(array[1])
          );
      }
  }

  // Clean data and update state
  const cleanDataRange = localStorage.getItem('cleanDataRange') || '-0200/1750';
  const [minValue, maxValue] = cleanDataRange.split('/').map(val => parseInt(val.trim()));
  let scrubbedData = cleanData(gridDataResults, minValue, maxValue);
  setGridData(gridDataResults);
  
  // Update captions
  setCaptions({
      resultGanancia: captionGanancia(scrubbedData),
      resultCabezas: captionCabezas(scrubbedData.length, gridDataResults.length),
      resultUltPeso: captionUltPeso(scrubbedData),
      resultDias: captionDias(scrubbedData),
      resultMedia: captionMedia(scrubbedData)
  });

  // Emit table data for export functionality
  eventEmitter.emit('tableDataUpdate', {
    data: scrubbedData,
    columns: columns,
    title: 'Ganancias'
  });
};

      const columns = [
        { label: "Codigo", accessor: "Codigo",width:"12%" },
        { label: "Chapeta", accessor: "Chapeta",width:"12%" },
        { label: "Marca", accessor: "Marca",width:"6%" },
        { label: "F. Inicial", accessor: "FechaInicial",width:"15%" },
        { label: "F. Final", accessor: "FechaFinal",width:"15%" },
        { label: "P. Inicial", accessor: "PesoInicial",width:"13%" },
        { label: "P. Final", accessor: "PesoFinal",width:"13%" },
        { label: "Ganancia", accessor: "Ganancia",width:"12%" },
       ];

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
      </div>

      <div className="date-filters">
        <div className="date-control-pair">
            <div className="filter-group">
              <label>Fecha Inicial</label>
              <select name="fechaInicial" onChange={handleFilterChange}>
                  {fechasPesaje.map(val => <option key={val} value={val}>{val}</option>)}
              </select>
            </div>
            {/* Replace checkbox with select */}
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

        <div className="date-control-pair">
            <div className="filter-group">
              <label>Fecha Final</label>
              <select name="fechaFinal" onChange={handleFilterChange} value={filtros.fechaFinal}>
                  {fechasPesajeDesc.map(val => <option key={val} value={val}>{val}</option>)}
              </select>
            </div>
            {/* Replace checkbox with select */}
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

        <div className="filter-group checkbox-group">
          <label>Ventas</label>
          <input type="checkbox" name="filtroVentas" onChange={handleCheckboxChange}/>
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
      <Table data={gridData} columns={columns} />
    </section>
  </div>
    
    );
  };
  
  export default Ganancias;