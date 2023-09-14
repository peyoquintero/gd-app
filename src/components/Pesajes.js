import React, { useState, useEffect } from "react";
import Table from "./Table";
import {filteredGData,transform} from "./helpers"

const Pesajes = (props) => {
  const columns = [
    { label: "Codigo", accessor: "Codigo",width:"15%" },
    { label: "Fecha", accessor: "Fecha",width:"20%" },
    { label: "Peso", accessor: "Peso",width:"15%" },
    { label: "Marca", accessor: "Marca",width:"15%" },
    { label: "Lote", accessor: "Lote",width:"15%" },
    { label: "Operacion", accessor: "Operacion",width:"20%" },
   ];

   const [filtro, setFiltro] = useState("");
   const [gridData,setGridData] = useState([])
   const [hisPesajes,setHispesajes] = useState([])


   useEffect(()=>{
     let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
     setHispesajes(allPesajes);
     setFiltro("");
   },[]);
 
   const handleFilterChange = (event) => {
    setFiltro(event.target.value);
  };

  const applyFilters = (event) => {
    let filteredData = filteredGData(hisPesajes,filtro,"Peso")
    setGridData(filteredData);  
  }

  return (
    <div className="container">
      <section>
        <label input="query">Search</label>
        <input name="query" onChange={handleFilterChange}/>
        <button  style={{marginTop:'4px'}} type="submit" onClick={applyFilters}>Ok</button>
        <label style={{marginLeft:'40px'}} > {gridData.length>0?`Total:${gridData.length}`:''}</label>
      </section>
      <Table
        caption="Pesajes"
        data={gridData}
        columns={columns}></Table>
    </div>
  );
};

export default Pesajes;