import React, { useState, useEffect } from "react";
import Table from "./Table";
import {getInventario,groupByFechaLoteOperacion as groupByFechaLoteOperacion} from "./HelperInventario";
import {filteredGData} from "./Helpers"

const Inventario = () => {
  const columns = [
    { label: "Fecha", accessor: "Fecha",width:"20%" },
    { label: "Operacion", accessor: "Operacion",width:"25%" },
    { label: "Lote", accessor: "Lote",width:"15%" },
    { label: "Marca", accessor: "Marca",width:"10%" },
    { label: "Total", accessor: "Total",width:"15%" },
    { label: "Vendidos", accessor: "Vendidos",width:"15%" },
   ];

   const [selectedOption, setSelectedOption] = useState("cabezas");
   const [filtroBuscar, setFiltroBuscar] = useState("");
   const [filtroExacto, setFiltroExacto] = useState(true);

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFiltroBuscar(event.target.value);
  };

  const handleCheckboxChange = (event) => {
    setFiltroExacto(event.target.checked);
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
    let filteredData = allPesajes
    if (filtroBuscar.length>1)
    {
      filteredData = filteredGData(filteredData,filtroBuscar,"Peso",filtroExacto)
    }

    let movimientos =  filteredData.filter(w=>w.Operacion.toUpperCase() !== "CONTROL")
                                 .sort(function(a,b){ return new Date(a.Fecha) - new Date(b.Fecha);});
    if (movimientos?.length)                             
    {let movimientosByFecha = groupByFechaLoteOperacion(movimientos);
    setGridData(movimientosByFecha); 

    let inventario = getInventario(filteredData);
    setGridInventario(inventario);
    }
  },[filtroBuscar,filtroExacto]);

  return (
    <>
    <div >
    <section className="main-container">
      <div className="radio-container" onChange={handleChange}>
        <label className="ayudaLabel"> <input type="radio" name="details" value="movimientos" checked={selectedOption === "movimientos"} />Movimientos</label>
        <label className="ayudaLabel"><input type="radio" name="details" value="cabezas" checked={selectedOption === "cabezas"} /> Inventario Actual</label>
      </div>
      <label input="query">Buscar
        <input className="freeinput" style={{display:'block', marginLeft: '10px'}} name="filtroGeneral" onChange={handleFilterChange}/>
      </label>
      <label style={{display:'block'}}>Exacto
               <input style={{display:'block'}} type="checkbox" id="checkboxFE" name= "filtroExacto" onChange={handleCheckboxChange} defaultChecked={true}/>
       </label>
       <label  style={{marginLeft:'30px', marginTop:'20px'}}>{selectedOption === "movimientos" ? "" : `Total: ${gridInventario.length}`}</label>
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