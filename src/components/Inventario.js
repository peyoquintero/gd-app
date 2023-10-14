import React, { useState, useEffect } from "react";
import Table from "./Table";
import {getInventario,groupByFechaOperacion} from "./HelperInventario";
import {filteredGData} from "./Helpers"

const Inventario = () => {
  const columns = [
    { label: "Fecha", accessor: "Fecha",width:"25%" },
    { label: "Operacion", accessor: "Operacion",width:"25%" },
    { label: "Marca", accessor: "Marca",width:"20%" },
    { label: "Total", accessor: "Total",width:"15%" },
    { label: "Vendidos", accessor: "Vendidos",width:"15%" },
   ];

   const [selectedOption, setSelectedOption] = useState("movimientos");
   const [filtroBuscar, setFiltroBuscar] = useState("");

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFiltroBuscar(event.target.value);
  };


   const [gridData,setGridData] = useState([])
   const [gridInventario,setGridInventario] = useState([])

   const columnsInventario = [
    { label: "Codigo", accessor: "Codigo",width:"20%" },
    { label: "Marca", accessor: "Marca",width:"10%" },
    { label: "Lote", accessor: "Lote",width:"10%" },
    { label: "Fecha Compra", accessor: "FechaCompra",width:"20%" },
    { label: "Peso Inicial", accessor: "PesoInicial",width:"10%" },
    { label: "Ultimo Control", accessor: "FechaUltimoControl",width:"20%" },
    { label: "Ultimo Peso", accessor: "PesoFinal",width:"10%" },
   ];

   useEffect(()=>{
    let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
    let movimientos =  allPesajes.filter(w=>w.Operacion.toUpperCase() !== "CONTROL")
                                 .sort(function(a,b){ return new Date(a.Fecha) - new Date(b.Fecha);});
    if (movimientos?.length)                             
    {let movimientosByFecha = groupByFechaOperacion(movimientos);
    setGridData(movimientosByFecha); 

    let filteredData = allPesajes
    if (filtroBuscar.length>1)
    {
      filteredData = filteredGData(filteredData,filtroBuscar,"Peso",false)
    }
    let inventario = getInventario(filteredData);
    setGridInventario(inventario);
    }
  },[filtroBuscar]);

  return (
    <>
    <div>
    <section  >
    <label input="query">Buscar
        <input className="freeinput" style={{display:'block'}} name="filtroGeneral" onChange={handleFilterChange}/>
        </label>
    <div className="radio-container" onChange={handleChange}>
      <input type="radio" name="details" value="movimientos" checked={selectedOption === "movimientos"} />Movimientos
      <input type="radio" name="details" value="cabezas" checked={selectedOption === "cabezas"} /> Inventario Actual
    </div>
      <label style={{marginLeft:'20px'}}>{selectedOption === "movimientos" ? "" : `Total: ${gridInventario.length}`}</label>
    </section>
  
    <section>
    {selectedOption === "movimientos" ?  
    <div className="container">
      <Table
        data={gridData}
        columns={columns}></Table>
    </div> :
    <div className="container">
    <Table
      data={gridInventario}
      columns={columnsInventario}></Table>
  </div>}    
    </section>
    </div>
  </>

  );
}

export default Inventario;