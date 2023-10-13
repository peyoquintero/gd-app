import React, { useState, useEffect } from "react";
import Table from "./Table";
import {captionCabezas,validLoteOptions} from "./Helpers"
import {getPesajesByCodigo} from "./HelperInventario"

const Codigos = (props) => {
  const columns = [
    { label: "Codigo", accessor: "Codigo",width:"15%" },
    { label: "Fecha Entrada", accessor: "FechaInicial",width:"20%" },
    { label: "Fecha Salida", accessor: "FechaFinal",width:"15%" },
    { label: "Marca", accessor: "Marca",width:"15%" },
   ];

   const [filtros, setFiltros] = useState({});
   const [gridData,setGridData] = useState([])
   const [fechasPesaje,setFechasPesaje] = useState([])
   const [hisPesajes,setHispesajes] = useState([])
   const [lotes,setLotes] = useState([])

   const [captions,setCaptions] = useState({
    resultCabezas : "",
   })

   const initializeData = (allPesajes) => {
    let allFechas = [...new Set(allPesajes.map(obj => obj.Fecha))];
    setFechasPesaje(allFechas);
    setHispesajes(allPesajes);
    setLotes(validLoteOptions([...new Set( allPesajes.map(obj => obj.Lote))]));
    setFiltros({
     filtroMarca: '*',
     filtroCodigo: '',
     filtroLote: '',
     sinEntrada: false,
     todasLasVentas: false,
     fechaSalida: allFechas[allFechas.length-1] ?? new Date(),
    });
   }

   useEffect(()=>{
    let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
    initializeData(allPesajes);
   },[]);
 
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

  const massageData = (hispesajes) =>
  {
    var results = hispesajes.reduce(function(h, obj) {
      h[obj.Codigo] = (h[obj.Codigo] || []).concat(obj);
      return h; 
    }, {});

    results = Object.keys(results).map(key => {
      return {
          Codigo: key, 
          pesajes : hispesajes.filter(pesaje=>pesaje.Codigo===key).sort(function(a,b){
                    return new Date(a.Fecha) - new Date(b.Fecha);
                              })}
      }
    );

    var datos = [];
    results.forEach(result => {
      let datafilter = result.pesajes;
      let minP = datafilter[0];
      let fechaSalida = datafilter.length > 1 ? datafilter[datafilter.length-1].Fecha : null;
      let objresult = {Codigo: result.Codigo, FechaInicial:minP.Fecha,FechaFinal:fechaSalida,Marca:minP.Marca,Activo:minP.Operacion.toUpperCase()!=='MUERTE'};
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

    if (filtros.filtroLote!=="*" && filtros.filtroLote!=="")
    {
      hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Lote===filtros.filtroLote.trim()) 
    }

    if (filtros.sinEntrada && !filtros.todasLasVentas)
    {
      hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Operacion.toUpperCase() !== 'MUERTE')
      let ultimoPesaje = [];
       ultimoPesaje = hispesajesFiltered.filter(pesaje=>pesaje.Operacion.toUpperCase !== 'COMPRA' && pesaje.Fecha === filtros.fechaSalida);
      let otrasOperaciones = hispesajesFiltered.filter(pesaje=>pesaje.Operacion.toUpperCase() !== 'VENTA' && pesaje.Fecha < filtros.fechaSalida);
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
  
      let codigosVendidos = hispesajesFiltered.filter(pesaje=>pesaje.Operacion.toUpperCase() === 'VENTA').map(w=>w.Codigo);
      let codigosMuertos = hispesajesFiltered.filter(pesaje=>pesaje.Operacion.toUpperCase() === 'MUERTE').map(w=>w.Codigo);
      let codigosComprados = hispesajesFiltered.filter(pesaje=>pesaje.Operacion.toUpperCase() === 'COMPRA').map(w=>w.Codigo).filter(x => !codigosMuertos.includes(x));
      let codigosEnLimbo = codigosVendidos.filter(x => !codigosComprados.includes(x));
      hispesajesFiltered = hispesajesFiltered.filter(x => codigosEnLimbo.includes(x.Codigo));  
    }

    let gridDataResults = massageData(hispesajesFiltered);

    gridDataResults = gridDataResults.map((obj,index) => ({ ...obj, id: index }));

    if (filtros.fechaSalida != '' && !filtros.sinEntrada)
    {
      gridDataResults = gridDataResults.filter(w=> w.FechaFinal === filtros.fechaSalida);      
    }

    setGridData(gridDataResults);  

    setCaptions({
      resultCabezas : captionCabezas(gridDataResults.length,gridDataResults.length),
      })
  }

  return ( 
    <>
  <div className="container">
    <section>
      <label style={{display:'block'}}>Codigo
        <input style={{display:'block'}} name="filtroCodigo" className="freeinput"  placeholder="Codigo" onChange={handleFilterChange}/>
      </label>
      <label>Marca 
       <input style={{display:'block'}} id="filtroMarca" className="freeinputsmall" name="filtroMarca"  onChange={handleFilterChange}/>
       </label>
       <label>Lote
        <select style={{display:'block', width:'80px', height:'25px'}} className="freeinput" name="filtroLote" value={filtros.filtroLote} onChange={handleFilterChange}>
          {lotes.map(val => <option key={val} style={{background:"lightgrey"}} value={val}>{val}</option>)}
          </select>
        </label>
       <label style={{display:'block'}}>Revisar
               <input style={{display:'block'}} type="checkbox" id="checkboxVx" name= "sinEntrada" onChange={handleCheckboxChange} />
       </label>
       <label style={{marginLeft:'30px'}}>Fecha Control
          <select style={{display:'block', width:'120px', height:'25px'}} className="freeinput" name="fechaSalida" onChange={handleFilterChange} value={filtros.fechaSalida}>
          {fechasPesaje.map(val => <option key={val} style={{background:"lightgrey"}} value={val}>{val}</option>)}
          </select>
        </label>
        <label style={{display:'block'}}> Ventas
               <input style={{display:'block'}} type="checkbox" id="checkboxVentas" name= "todasLasVentas" onChange={handleCheckboxChange} />
       </label>
      <button onClick={applyFilters} >Ok</button>
    </section>
    <section className="totals">
      <label >{captions.resultCabezas} </label> 
      </section>
      <Table
        caption="Pesajes"
        data={gridData}
        columns={columns}></Table>
      </div>
    </>
  );
};

export default Codigos;