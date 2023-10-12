import React, { useState, useEffect } from "react";
import Table from "./Table";
import {getInventario,groupByFechaOperacion} from "./HelperInventario";

const Inventario = () => {
  const columns = [
    { label: "Fecha", accessor: "Fecha",width:"25%" },
    { label: "Operacion", accessor: "Operacion",width:"25%" },
    { label: "Marca", accessor: "Marca",width:"20%" },
    { label: "Total", accessor: "Total",width:"15%" },
    { label: "Vendidos", accessor: "Vendidos",width:"15%" },
   ];

   const [selectedOption, setSelectedOption] = useState("movimientos");

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

   const [gridData,setGridData] = useState([])
   const [gridInventario,setGridInventario] = useState([])

   const columnsInventario = [
    { label: "Codigo", accessor: "Codigo",width:"20%" },
    { label: "Marca", accessor: "Marca",width:"10%" },
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
    setGridInventario(getInventario(allPesajes));
    }
  },[]);

  return (
    <>
    <div>
    <section  >
    <div className="radio-container" onChange={handleChange}>
      <input type="radio" name="details" value="movimientos" checked={selectedOption === "movimientos"} />Movimientos
      <input type="radio" name="details" value="cabezas" checked={selectedOption === "cabezas"} /> Inventario Actual
      <span>{selectedOption === "movimientos" ? "" : `Total: ${gridInventario.length}`}</span>
    </div>
    
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