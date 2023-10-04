import React, { useState, useEffect } from "react";
import Table from "./Table";
import {filteredGData} from "./helpers"

const Pesajes = (props) => {
  const columns = [
    { label: "Codigo", accessor: "Codigo",width:"15%" },
    { label: "Fecha", accessor: "Fecha",width:"20%" },
    { label: "Peso", accessor: "Peso",width:"15%" },
    { label: "Marca", accessor: "Marca",width:"15%" },
    { label: "Lote", accessor: "Lote",width:"15%" },
    { label: "Operacion", accessor: "Operacion",width:"20%" },
   ];

   const [filtros, setFiltros] = useState({});
   const [gridData,setGridData] = useState([])
   const [hisPesajes,setHispesajes] = useState([])
   const [fechasPesaje,setFechasPesaje] = useState([])

   const initializeData = (allPesajes) => {
    setHispesajes(allPesajes);
    let allFechas = [...new Set(allPesajes.map(obj => obj.Fecha.trim()))];
    allFechas.unshift(null);    
    setFechasPesaje(allFechas);
    setFiltros({
      fechaControl : null,
      filtroGeneral: "",
      filtroExacto: true
      });
      setGridData(allPesajes.filter(w=>w.Lote.toLowerCase!='muerto')); 
    }  

   useEffect(()=>{
     let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
     initializeData(allPesajes)
   },[]);
 
   const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFiltros({
      ...filtros,
      [name]: value,
    })
  };

  const handleCheckboxChange = (event) => {
    const { name } = event.target;
    setFiltros({
      ...filtros,
      [name]: event.target.checked,
    });
  };

  const applyFilters = (event) => {
    let filteredData = filteredGData(hisPesajes,filtros.filtroGeneral,"Peso",filtros.filtroExacto)
    if (filtros.fechaControl)
    {
      filteredData = filteredData.filter(w=>w.Fecha===filtros.fechaControl)    
    }
    setGridData(filteredData);  
  }

  return (
    <div className="container">
      <section>
       <label style={{marginLeft:'30px'}}>Fecha Control
          <select style={{display:'block', width:'120px', height:'25px'}} className="freeinput" name="fechaControl" onChange={handleFilterChange} value={filtros.fechaControl}>
          {fechasPesaje.map(val => <option key={val} style={{background:"lightgrey"}} value={val}>{val}</option>)}
          </select>
        </label>
        <label input="query">Buscar
        <input className="freeinput" style={{display:'block'}} name="filtroGeneral" onChange={handleFilterChange}/>
        </label>
        <label style={{display:'block'}}>Exacto
               <input style={{display:'block'}} type="checkbox" id="checkboxFE" name= "filtroExacto" onChange={handleCheckboxChange} defaultChecked={true}/>
       </label>
        <button  style={{marginTop:'15px'}} type="submit" onClick={applyFilters}>Ok</button>
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