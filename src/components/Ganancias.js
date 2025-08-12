import React, { useState, useEffect, useCallback } from "react";
import Table from "./Table"
import {cleanData, captionCabezas,captionGanancia,captionMedia,captionUltPeso,captionDias,  ganancias} from "./Helpers"
import { dataService } from "../services/DataService";
import "../App.css"; 

const Ganancias = ({ eventEmitter }) => {
    const [filtros, setFiltros] = useState({
        filtroCodigo: "",
        filtroMarca: "",
        filtroPeso: "",
        filtroLote: "",
        fechaInicial:  new Date('2020-01-01T00:00:00'),
        fechaFinal: new Date(),
        fiExacta: false,
        ffExacta: false,
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
        
        allPesajes = allPesajes.filter(w=>w.Codigo && w.Marca && w.Operacion && w.Fecha && !w.Codigo.includes("?"))
        let allFechas = [...new Set(allPesajes.map(obj => obj.Fecha))];
        setHispesajes(allPesajes);
        setFechasPesaje(allFechas);
        let fechasPesajeDes = Array.from(allFechas).sort(function(a,b){return new Date(b) - new Date(a);})
        setFechasPesajeDesc(fechasPesajeDes);

        setFiltros({
            fechaInicial: allFechas[0] ?? new Date('2020-01-01T00:00:00'),
            fechaFinal : fechasPesajeDes[0] ?? new Date(),
            filtroCodigo: "",
            filtroMarca: "",
            filtroPeso: "",
            filtroChapeta: "",
            fiExacta: false,
            ffExacta: false,
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
          // Start with fresh data each time
          let hispesajesFiltered = [...hisPesajes].filter(pesaje => 
              !['CORRECCION', 'MUERTE'].includes(pesaje.Operacion?.toUpperCase())
          );

          // Apply marca filter
          if (filtros.filtroMarca.startsWith("~")) {
              hispesajesFiltered = hispesajesFiltered.filter(pesaje => 
                  pesaje.Marca !== filtros.filtroMarca.trim().substring(1)
              );
          }
          else {
            if (filtros.filtroMarca !== "*" && filtros.filtroMarca !== "") {
                hispesajesFiltered = hispesajesFiltered.filter(pesaje => 
                    pesaje.Marca === filtros.filtroMarca.trim()
                );
            }
          }


          // Apply codigo filter
          if (filtros.filtroCodigo !== "") {
              hispesajesFiltered = hispesajesFiltered.filter(pesaje => 
                  pesaje.Codigo.startsWith(filtros.filtroCodigo.trim())
              );
          }

          // Apply chapeta filter
          if (filtros.filtroChapeta !== "") {
              hispesajesFiltered = hispesajesFiltered.filter(pesaje => 
                  pesaje.Chapeta.startsWith(filtros.filtroChapeta.trim())
              );
          }

          // Calculate ganancias with filtered data
          let gridDataResults = ganancias(
              hispesajesFiltered,
              filtros.fechaInicial,
              filtros.fiExacta,
              filtros.fechaFinal,
              filtros.ffExacta,
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
     };

      const columns = [
        { label: "Codigo", accessor: "Codigo",width:"12%" },
        { label: "Chapeta", accessor: "Chapeta",width:"12%" },
        { label: "Fecha Inicial", accessor: "FechaInicial",width:"20%" },
        { label: "Fecha Final", accessor: "FechaFinal",width:"20%" },
        { label: "Peso Inicial", accessor: "PesoInicial",width:"12%" },
        { label: "Peso Final", accessor: "PesoFinal",width:"12%" },
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
          />
        </div>
        <div className="filter-group">
          <label>Marca</label>
          <input 
            id="marca" 
            className="freeinputsmall" 
            name="filtroMarca" 
            onChange={handleFilterMarcaChange} 
            value={filtros.filtroMarca}
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
        <div className="filter-group">
          <label>Fecha Inicial</label>
          <select 
            name="fechaInicial" 
            onChange={handleFilterChange}
          >
            {fechasPesaje.map(val => <option key={val} value={val}>{val}</option>)}
          </select>
        </div>
        <div className="filter-group checkbox-group">
          <label>=</label>
          <input type="checkbox" name="fiExacta" onChange={handleCheckboxChange}/>
        </div>
        <div className="filter-group">
          <label>Fecha Final</label>
          <select
            name="fechaFinal"
            onChange={handleFilterChange}
            value={filtros.fechaFinal}
          >
            {fechasPesajeDesc.map(val => <option key={val} value={val}>{val}</option>)}
          </select>
        </div>
        <div className="filter-group checkbox-group">
          <label>=</label>
          <input type="checkbox" name="ffExacta" onChange={handleCheckboxChange}/>
        </div>
        <div className="filter-group checkbox-group">
          <label>Ventas</label>
          <input type="checkbox" name="filtroVentas" onChange={handleCheckboxChange}/>
        </div>
        <button onClick={applyFilters}>Ok</button>
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