import React, { useState, useEffect } from "react";
import axios from "axios";
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

   const url = "https://sheets.googleapis.com/v4/spreadsheets/1ZfXM4qnajw8QSaxrx6aXKa_xbMDZe3ryWt8E3alSyEE/values/PesajesPorCodigo?key=AIzaSyCGW3gRbBisLX950bZJDylH-_QJTR7ogd8";

   useEffect(()=>{
     axios.get(url)
     .then((response)=>{
       let allPesajes = transform(response.data); 
       setHispesajes(allPesajes);
       setFiltro("");
     }
     )
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
        <label for input="query">Search</label>
        <input name="query" onChange={handleFilterChange}/>
        <button style={{marginTop:"2px"}} type="submit" onClick={applyFilters}>Ok</button>
      </section>
      <Table
        caption="Pesajes"
        data={gridData}
        columns={columns}></Table>
    </div>
  );
};

export default Pesajes;