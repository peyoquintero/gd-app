import React, { useState, useEffect, useMemo } from "react";
import Table from "./Table";
import {captionCabezas,validLoteOptions} from "./Helpers"
import { getPesajesByCodigo } from './HelperInventario'


const Codigos = ({ eventEmitter }) => {
  const columns = [
    { label: "Codigo", accessor: "Codigo",width:"15%" },
    { label: "Fecha Entrada", accessor: "FechaInicial",width:"20%" },
    { label: "Fecha Salida", accessor: "FechaFinal",width:"15%" },
    { label: "Marca", accessor: "Marca",width:"15%" },
   ];

   const [filtros, setFiltros] = useState({
    filtroCodigo: '', // Or whatever your input's 'name' attribute is
    filtroChapeta: '',
    // Add any other properties bound to input fields here
  });
   const [gridData,setGridData] = useState([])
   const [fechasPesaje,setFechasPesaje] = useState([])
   const [hisPesajes,setHispesajes] = useState([])
   const [captions,setCaptions] = useState({
    resultCabezas : "",
   })

   const initializeData = () => {
    let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
    allPesajes = allPesajes.filter(w=>w.Codigo && w.Marca && w.Operacion && w.Fecha)
    let allFechas = [...new Set(allPesajes.map(obj => obj.Fecha))];
    setFechasPesaje(allFechas);
    setHispesajes(allPesajes);
    setFiltros({
     filtroMarca: '*',
     filtroCodigo: '',
     sinEntrada: false,
     todasLasVentas: false,
     fechaSalida: allFechas[allFechas.length-1] ?? new Date(),
    });
   }

   useEffect(()=>{
    initializeData();
   },[]);

   useEffect(() => {
    const refreshHandler = () => {
      initializeData();
    };

    eventEmitter.on('refresh', refreshHandler);

    return () => {
      eventEmitter.off('refresh', refreshHandler);
    };
  }, [eventEmitter]);

 
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

  const handleCheckboxChange = (event) => {
    const { name } = event.target;
    setFiltros({
      ...filtros,
      [name]: event.target.checked,
    });
  };

  const massageData = (hispesajes) =>
  {
    let groupedData = getPesajesByCodigo(hispesajes);
    let results = Object.values(groupedData);

    var datos = [];
    results.forEach(result => {
      let datafilter = result.Pesajes;
      let minP = datafilter[0];
      let fechaSalida = datafilter.length > 1 ? datafilter[datafilter.length-1].Fecha : null;
      let objresult = {Codigo: result.Codigo, FechaInicial:minP.Fecha,FechaFinal:fechaSalida,Marca:minP.Marca,Activo:!['CORRECCION','MUERTE'].includes(minP.Operacion?.toUpperCase())};
      datos.push(objresult);
    });

    return datos
  }

  const applyFilters = (event) => {

    let hispesajesFiltered = hisPesajes; 

    if (filtros.filtroMarca!=="*" && filtros.filtroMarca!=="") 
    {
      hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Marca===filtros.filtroMarca); 
    }

    if (filtros.filtroCodigo!=="")
    {
      hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Codigo.startsWith(filtros.filtroCodigo)); 
    }

    if (filtros.sinEntrada && !filtros.todasLasVentas)
    {
      hispesajesFiltered = hispesajesFiltered.filter(pesaje=>!['VENTA','CORRECCION'].includes(pesaje.Operacion?.toUpperCase()))
      let ultimoPesaje = [];
       ultimoPesaje = hispesajesFiltered.filter(pesaje=>pesaje.Operacion?.toUpperCase !== 'COMPRA' && pesaje.Fecha === filtros.fechaSalida);
      let otrasOperaciones = hispesajesFiltered.filter(pesaje=>(!['VENTA','CORRECCION'].includes(pesaje.Operacion?.toUpperCase())) && pesaje.Fecha < filtros.fechaSalida);
      hispesajesFiltered =  ultimoPesaje.filter(function(element) {
      for (var j = 0; j < otrasOperaciones.length; j++) {
        if (element.Codigo === otrasOperaciones[j].Codigo) {
          return false;
        }
      }
       return true;
      });
    }

    if (filtros.todasLasVentas)
    {
      setFiltros({
        ...filtros,
        fechaSalida: ''
      });
  
      let codigosVendidos = hispesajesFiltered.filter(pesaje=>pesaje.Operacion?.toUpperCase() === 'VENTA').map(w=>w.Codigo);
      let codigosMuertos = hispesajesFiltered.filter(pesaje=>pesaje.Operacion?.toUpperCase() === 'MUERTE').map(w=>w.Codigo);
      let codigosComprados = hispesajesFiltered.filter(pesaje=>pesaje.Operacion?.toUpperCase() === 'COMPRA').map(w=>w.Codigo).filter(x => !codigosMuertos.includes(x));
      let codigosEnLimbo = codigosVendidos.filter(x => !codigosComprados.includes(x));
      hispesajesFiltered = hispesajesFiltered.filter(x => codigosEnLimbo.includes(x.Codigo));  
    }

    let gridDataResults = massageData(hispesajesFiltered);

    gridDataResults = gridDataResults.map((obj,index) => ({ ...obj, id: index }));

    if (filtros.fechaSalida !== '' && !filtros.sinEntrada)
    {
      gridDataResults = gridDataResults.filter(w=> w.FechaFinal === filtros.fechaSalida);      
    }

    setGridData(gridDataResults);  

    setCaptions({
      resultCabezas : captionCabezas(gridDataResults.length,gridDataResults.length),
      })
  }

  return ( 
    <div className="container codigos-root" style={{ width: '100%' }}>
      <section className="filter-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Codigo</label>
            <input
              className="freeinputsmall"
              name="filtroCodigo"
              placeholder="Codigo"
              onChange={handleFilterChange}
              value={filtros.filtroCodigo}
              maxLength={10}
            />
          </div>
          <div className="filter-group tiny">
            <label>Marca</label>
            <input
              id="filtroMarca"
              className="freeinputtiny"
              name="filtroMarca"
              onChange={handleFilterChange}
              value={filtros.filtroMarca}
              maxLength={4}
            />
          </div>
          <label className="center-label">
            Revisar
            <input
              type="checkbox"
              id="checkboxVx"
              name="sinEntrada"
              onChange={handleCheckboxChange}
              checked={!!filtros.sinEntrada}
            />
          </label>
          <div className="filter-group">
            <label>Fecha Control</label>
            <select
              name="fechaSalida"
              onChange={handleFilterChange}
              value={filtros.fechaSalida}
            >
              {fechasPesaje.map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
          <label className="center-label">
            Ventas
            <input
              type="checkbox"
              id="checkboxVentas"
              name="todasLasVentas"
              onChange={handleCheckboxChange}
              checked={!!filtros.todasLasVentas}
            />
          </label>
          <button className="filter-button" onClick={applyFilters}>Ok</button>
        </div>
      </section>
      <section className="totals">
        <label >{captions.resultCabezas} </label> 
        </section>
        <Table
          caption="Pesajes"
          data={gridData}
          columns={columns}></Table>
    </div>
  );
};

export default Codigos;